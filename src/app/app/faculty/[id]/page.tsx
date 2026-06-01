import { createClient, createAdminClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import {
  GraduationCap, Globe, MapPin, Award,
  Briefcase, BookOpen, ExternalLink, FileText,
  CheckCircle2, ShieldCheck, ChevronRight,
  Languages, Building2, Sparkles, Lock, Zap,
  MessageCircle, Phone, AtSign, Link2, CalendarCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ContactModalWrapper } from "@/components/dashboard/ContactModalWrapper";
import { FavoriteButton } from "@/components/dashboard/FavoriteButton";

const AVAIL: Record<string, { label: string; color: string; bg: string }> = {
  open:          { label: "Disponible ahora",     color: "#059669", bg: "#DCFCE7" },
  next_semester: { label: "Próximo semestre",      color: "#0891B2", bg: "#E0F7FA" },
  occasional:    { label: "Asignaturas puntuales", color: "#7C3AED", bg: "#EDE9FE" },
  weekends:      { label: "Fines de semana",       color: "#D97706", bg: "#FEF3C7" },
  online_only:   { label: "Solo online",           color: "#1B4FD8", bg: "#DBEAFE" },
  limited:       { label: "En 6 meses",            color: "#6B7280", bg: "#F3F4F6" },
  invite_only:   { label: "Solo por invitación",   color: "#0D2240", bg: "#EEF4FF" },
  available:     { label: "Abierto a propuestas",  color: "#059669", bg: "#DCFCE7" },
};

// ── Section wrapper ──────────────────────────────────────────────────────────
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h2 className="flex items-center gap-2.5 text-base font-black text-navy uppercase tracking-widest mb-5">
      <span className="text-talentia-blue">{icon}</span>
      {title}
    </h2>
  );
}

export default async function FacultyProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const [{ data: institution }, { data: viewerProfile }] = await Promise.all([
    supabase.from("institutions").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_profiles").select("plan, subscription_status").eq("id", user.id).single(),
  ]);

  const { data: facultyUserProfile } = await admin
    .from("user_profiles")
    .select("full_name, avatar_url")
    .eq("id", id)
    .single();

  const isPro =
    (viewerProfile?.plan === "institution-pro" || viewerProfile?.plan === "institution-growth") &&
    (viewerProfile?.subscription_status === "active" || viewerProfile?.subscription_status === "trialing");

  const { data: faculty } = await admin
    .from("faculty_profiles")
    .select(`*, expertise:faculty_expertise(*), documents:faculty_documents(*), links:faculty_links(*)`)
    .eq("id", id)
    .maybeSingle();

  if (!facultyUserProfile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6 p-8">
        <div className="bg-red-50 p-5 rounded-full"><ShieldCheck size={40} className="text-red-400" /></div>
        <div><h1 className="text-xl font-black text-navy">Perfil no encontrado</h1></div>
        <Button asChild variant="outline" className="rounded-xl font-bold">
          <Link href={institution ? "/app/institution/search" : "/app/faculty/directory"}>Volver</Link>
        </Button>
      </div>
    );
  }

  if (faculty?.visibility === "hidden") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6 p-8">
        <div className="bg-gray-50 p-5 rounded-full"><ShieldCheck size={40} className="text-gray-300" /></div>
        <div><h1 className="text-xl font-black text-navy">Perfil oculto</h1></div>
        <Button asChild variant="outline" className="rounded-xl font-bold">
          <Link href={institution ? "/app/institution/search" : "/app/faculty/directory"}>Volver</Link>
        </Button>
      </div>
    );
  }

  const facultyId   = faculty?.id ?? id;
  const facultyName = facultyUserProfile?.full_name || faculty?.full_name || "Docente";
  const initials    = facultyName.substring(0, 2).toUpperCase();
  const availInfo   = AVAIL[faculty?.availability ?? ""] ?? null;
  // Handle both field names (experience_years = legacy, years_experience = current)
  const yearsExp    = (faculty as any)?.years_experience ?? (faculty as any)?.experience_years ?? 0;

  let isFavorite = false;
  if (institution) {
    const { data: fav } = await supabase
      .from("favorites").select("id")
      .eq("institution_id", institution.id).eq("faculty_id", facultyId).single();
    isFavorite = !!fav;
  }

  const hasExpertise      = (faculty?.expertise?.length ?? 0) > 0;
  const hasFacultyAreas   = Array.isArray(faculty?.faculty_areas) && (faculty?.faculty_areas?.length ?? 0) > 0;
  const hasDegrees        = Array.isArray(faculty?.degrees) && (faculty?.degrees?.length ?? 0) > 0;
  const hasInstitutions   = Array.isArray(faculty?.institutions_taught) && (faculty?.institutions_taught?.length ?? 0) > 0;
  const hasLanguages      = Array.isArray(faculty?.languages) && (faculty?.languages?.length ?? 0) > 0;
  const hasResearch       = !!(faculty?.google_scholar_id || faculty?.orcid_id || faculty?.research_publications);
  const hasDocs           = (faculty?.documents?.length ?? 0) > 0 || !!faculty?.cv_url;
  const hasLinks          = (faculty?.links?.length ?? 0) > 0 || !!faculty?.linkedin_url || !!faculty?.website;

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-6">
        <Link
          href={institution ? "/app/institution/search" : "/app/faculty/directory"}
          className="hover:text-talentia-blue transition-colors"
        >
          {institution ? "Buscar docentes" : "Directorio"}
        </Link>
        <ChevronRight size={14} />
        <span className="text-navy truncate max-w-[200px]">{facultyName}</span>
      </nav>

      {/* ── HEADER CARD ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        {/* Banner */}
        <div className="relative h-40 sm:h-52">
          {faculty?.banner_url ? (
            <img
              src={faculty.banner_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0D2240] via-[#1B4FD8] to-[#4F7FE8]" />
          )}
        </div>

        {/* Identity */}
        <div className="px-6 sm:px-10 pb-8">
          {/* Avatar */}
          <div className="-mt-14 mb-4 flex items-end justify-between">
            <div className="relative">
              {facultyUserProfile?.avatar_url ? (
                <img
                  src={facultyUserProfile.avatar_url}
                  alt={facultyName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-talentia-blue text-white flex items-center justify-center text-3xl font-black border-4 border-white shadow-xl">
                  {initials}
                </div>
              )}
              {faculty?.verified === "verified" && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1 border-2 border-white">
                  <CheckCircle2 size={14} />
                </div>
              )}
            </div>
            {/* Availability badge — visible on desktop in header */}
            {availInfo && (
              <span
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black px-4 py-1.5 rounded-full"
                style={{ color: availInfo.color, background: availInfo.bg }}
              >
                <CalendarCheck size={13} /> {availInfo.label}
              </span>
            )}
          </div>

          {/* Name + badges */}
          <div className="space-y-1 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-navy leading-tight">{facultyName}</h1>
              {faculty?.is_phd && (
                <Badge className="bg-purple-50 text-purple-700 border-none text-[10px] font-black px-2.5 py-1 rounded-full">PhD</Badge>
              )}
              {faculty?.aneca_accreditation && (
                <Badge className="bg-blue-50 text-talentia-blue border-none text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Award size={10} /> ANECA
                </Badge>
              )}
            </div>
            {faculty?.headline && (
              <p className="text-base sm:text-lg font-semibold text-gray-600 leading-snug">{faculty.headline}</p>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-gray-500">
            {faculty?.current_institution && (
              <span className="flex items-center gap-1.5">
                <Building2 size={15} className="text-talentia-blue shrink-0" />
                {faculty.current_institution}
                {faculty?.academic_level && <span className="text-gray-400 font-medium">· {faculty.academic_level}</span>}
              </span>
            )}
            {(faculty?.city || faculty?.country) && (
              <span className="flex items-center gap-1.5">
                <MapPin size={15} className="text-talentia-blue shrink-0" />
                {faculty?.city ? `${faculty.city}, ${faculty.country}` : faculty?.country}
              </span>
            )}
            {yearsExp > 0 && (
              <span className="flex items-center gap-1.5">
                <Briefcase size={15} className="text-talentia-blue shrink-0" />
                {yearsExp}+ años exp.
              </span>
            )}
            {hasLanguages && (
              <span className="flex items-center gap-1.5">
                <Languages size={15} className="text-talentia-blue shrink-0" />
                {faculty!.languages
                  .map((l: any) => typeof l === "string" ? l : l.lang ?? l.language ?? l.name ?? "")
                  .filter(Boolean).join(" · ")}
              </span>
            )}
            {/* Mobile availability */}
            {availInfo && (
              <span
                className="sm:hidden inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full"
                style={{ color: availInfo.color, background: availInfo.bg }}
              >
                {availInfo.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── TWO COLUMN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* ── LEFT: Main content ── */}
        <div className="lg:col-span-8 space-y-4">

          {/* About */}
          {faculty?.bio && (
            <Section>
              <SectionTitle icon={<FileText size={18} />} title="Sobre mí" />
              <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {faculty.bio}
              </p>
            </Section>
          )}

          {/* Especialidades */}
          {(hasExpertise || hasFacultyAreas) && (
            <Section>
              <SectionTitle icon={<Sparkles size={18} />} title="Especialidades" />
              {hasExpertise ? (
                <div className="space-y-3">
                  {faculty!.expertise.map((exp: any) => (
                    <div key={exp.id} className="flex gap-4 items-start p-4 bg-gray-50 rounded-2xl">
                      <div className="w-2 h-2 rounded-full bg-talentia-blue mt-2 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-talentia-blue uppercase tracking-widest">{exp.area}</p>
                        <p className="font-bold text-navy text-sm">{exp.subarea}</p>
                        {exp.topics?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {exp.topics.map((t: string) => (
                              <span key={t} className="text-[10px] font-bold px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-500">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {faculty!.faculty_areas!.map((area: string) => (
                    <Badge key={area} className="bg-blue-50 text-talentia-blue border-blue-100 px-3 py-1.5 rounded-xl text-xs font-bold">{area}</Badge>
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* Formación */}
          {(hasDegrees || faculty?.aneca_accreditation) && (
            <Section>
              <SectionTitle icon={<GraduationCap size={18} />} title="Formación y Acreditaciones" />
              <div className="space-y-5">
                {hasDegrees && faculty!.degrees!.map((deg: any, i: number) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-navy text-sm sm:text-base">
                        {deg.type || deg.title || deg.degree || "Titulación"}
                      </p>
                      {deg.field && <p className="text-sm font-semibold text-talentia-blue">{deg.field}</p>}
                      <p className="text-sm text-gray-500 font-medium">
                        {deg.university || deg.institution || deg.school || ""}
                        {deg.year && <span className="ml-1.5 text-gray-400">({deg.year})</span>}
                      </p>
                    </div>
                  </div>
                ))}
                {faculty?.aneca_accreditation && (
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <Award size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-navy text-sm sm:text-base">{faculty.aneca_accreditation}</p>
                      <p className="text-sm text-gray-500 font-medium">Acreditación ANECA</p>
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Idiomas */}
          {hasLanguages && (
            <Section>
              <SectionTitle icon={<Languages size={18} />} title="Idiomas" />
              <div className="flex flex-wrap gap-2">
                {faculty!.languages.map((l: any, i: number) => {
                  const name  = typeof l === "string" ? l : (l.lang || l.language || l.name || "");
                  const level = typeof l === "object" ? l.level : null;
                  return name ? (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl">
                      <span className="font-bold text-navy text-sm">{name}</span>
                      {level && <span className="text-xs text-gray-400 font-medium">· {level}</span>}
                    </div>
                  ) : null;
                })}
              </div>
            </Section>
          )}

          {/* Experiencia */}
          {(faculty?.current_institution || hasInstitutions || yearsExp > 0) && (
            <Section>
              <SectionTitle icon={<Building2 size={18} />} title="Experiencia Docente" />
              <div className="space-y-5">
                {faculty?.current_institution && (
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-blue-50 text-talentia-blue rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-navy text-sm sm:text-base">{faculty.current_institution}</p>
                      {faculty?.academic_level && (
                        <p className="text-sm font-semibold text-talentia-blue">{faculty.academic_level}</p>
                      )}
                      {yearsExp > 0 && (
                        <p className="text-sm text-gray-500 font-medium">{yearsExp} años de experiencia docente</p>
                      )}
                    </div>
                  </div>
                )}
                {hasInstitutions && (
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      También ha impartido en
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {faculty!.institutions_taught!.map((inst: string, i: number) => (
                        <Badge key={i} className="bg-gray-50 text-navy border border-gray-100 px-3 py-1.5 rounded-xl text-xs font-bold">{inst}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Disponibilidad */}
          {(availInfo || (Array.isArray(faculty?.modalities) && (faculty?.modalities?.length ?? 0) > 0)) && (
            <Section>
              <SectionTitle icon={<CalendarCheck size={18} />} title="Disponibilidad" />
              <div className="flex flex-wrap gap-4">
                {availInfo && (
                  <div
                    className="flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm"
                    style={{ color: availInfo.color, background: availInfo.bg }}
                  >
                    <Sparkles size={16} /> {availInfo.label}
                  </div>
                )}
                {Array.isArray(faculty?.modalities) && faculty!.modalities!.map((mod: string) => (
                  <div key={mod} className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-navy font-bold text-sm capitalize">
                    <Globe size={16} className="text-talentia-blue" /> {mod}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Investigación */}
          {hasResearch && (
            <Section>
              <SectionTitle icon={<BookOpen size={18} />} title="Perfil Investigador" />
              <div className="space-y-4">
                {faculty?.aneca_accreditation && (
                  <div className="flex items-center gap-3">
                    <Award size={16} className="text-amber-500 shrink-0" />
                    <span className="font-bold text-navy text-sm">{faculty.aneca_accreditation}</span>
                  </div>
                )}
                {faculty?.google_scholar_id && (
                  <div className="flex items-center gap-3">
                    <BookOpen size={16} className="text-talentia-blue shrink-0" />
                    <div>
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest block">Google Scholar</span>
                      <a
                        href={`https://scholar.google.com/citations?user=${faculty.google_scholar_id}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-sm font-bold text-talentia-blue hover:underline flex items-center gap-1"
                      >
                        {faculty.google_scholar_id} <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}
                {faculty?.orcid_id && (
                  <div className="flex items-center gap-3">
                    <Globe size={16} className="text-green-600 shrink-0" />
                    <div>
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest block">ORCID iD</span>
                      <a
                        href={`https://orcid.org/${faculty.orcid_id}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-sm font-bold text-green-700 hover:underline flex items-center gap-1"
                      >
                        {faculty.orcid_id} <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}
                {faculty?.research_publications && (
                  <div className="pt-4 border-t border-gray-50">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Publicaciones destacadas</p>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed whitespace-pre-line">
                      {faculty.research_publications}
                    </p>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Documentos */}
          {hasDocs && (
            <Section>
              <SectionTitle icon={<FileText size={18} />} title="Documentos" />
              <div className="space-y-2">
                {faculty?.documents?.map((doc: any) => (
                  <a
                    key={doc.id}
                    href={doc.file_url}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white text-gray-400 rounded-xl group-hover:text-talentia-blue transition-colors">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-navy">{doc.name || doc.file_name || "Documento"}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase">{doc.type || "PDF"}</p>
                      </div>
                    </div>
                    <ExternalLink size={15} className="text-gray-300 group-hover:text-talentia-blue transition-colors" />
                  </a>
                ))}
                {faculty?.cv_url && (
                  <a
                    href={faculty.cv_url}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white text-gray-400 rounded-xl group-hover:text-talentia-blue transition-colors">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-navy">Curriculum Vitae</p>
                        <p className="text-xs font-bold text-gray-400 uppercase">PDF</p>
                      </div>
                    </div>
                    <ExternalLink size={15} className="text-gray-300 group-hover:text-talentia-blue transition-colors" />
                  </a>
                )}
              </div>
            </Section>
          )}

          {/* Redes y enlaces */}
          {hasLinks && (
            <Section>
              <SectionTitle icon={<Link2 size={18} />} title="Redes y Enlaces" />
              <div className="space-y-2">
                {faculty?.links?.map((link: any) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors group"
                  >
                    <span className="text-sm font-bold text-navy group-hover:text-talentia-blue capitalize">{link.platform || link.label || "Enlace"}</span>
                    <ExternalLink size={15} className="text-gray-300 group-hover:text-talentia-blue transition-colors" />
                  </a>
                ))}
                {faculty?.linkedin_url && (
                  <a
                    href={faculty.linkedin_url}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-[#0A66C2] rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-black">in</span>
                    </div>
                    <span className="text-sm font-bold text-navy group-hover:text-talentia-blue flex-1 truncate">LinkedIn</span>
                    <ExternalLink size={15} className="text-gray-300 group-hover:text-talentia-blue transition-colors shrink-0" />
                  </a>
                )}
                {faculty?.website && (
                  <a
                    href={faculty.website}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center shrink-0">
                      <Globe size={15} className="text-gray-600" />
                    </div>
                    <span className="text-sm font-bold text-navy group-hover:text-talentia-blue flex-1 truncate">
                      {faculty.website.replace(/^https?:\/\//, "")}
                    </span>
                    <ExternalLink size={15} className="text-gray-300 group-hover:text-talentia-blue transition-colors shrink-0" />
                  </a>
                )}
              </div>
            </Section>
          )}
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-24 self-start">

          {/* Contact card — Pro institution */}
          {institution && isPro ? (
            <div className="bg-navy rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
              <div>
                <h3 className="text-xl font-black mb-1">¿Interesado?</h3>
                <p className="text-blue-200 text-sm font-medium">Contacta a este docente para explorar una colaboración.</p>
              </div>

              <div className="space-y-3">
                <ContactModalWrapper
                  facultyId={facultyId}
                  facultyName={facultyName}
                  institutionId={institution.id}
                />
                {faculty?.contact_whatsapp && (
                  <a
                    href={`https://wa.me/${faculty.contact_whatsapp.replace(/\D/g, "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bd5b] text-white font-bold h-12 rounded-xl text-sm transition-colors"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                )}
                <div className="flex gap-3">
                  <FavoriteButton facultyId={facultyId} institutionId={institution.id} initialIsFavorite={isFavorite} />
                  {faculty?.cv_url && (
                    <Button variant="outline" asChild className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold h-12 rounded-xl text-sm">
                      <a href={faculty.cv_url} target="_blank" rel="noopener noreferrer">Ver CV</a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Contact details */}
              {(faculty?.contact_email || faculty?.contact_linkedin || faculty?.phone) && (
                <div className="space-y-2.5 pt-5 border-t border-white/10">
                  <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Contacto directo</p>
                  {faculty?.contact_email && (
                    <a href={`mailto:${faculty.contact_email}`} className="flex items-center gap-2.5 text-sm font-semibold text-white/90 hover:text-white transition-colors">
                      <AtSign size={15} className="text-blue-300 shrink-0" />
                      <span className="truncate">{faculty.contact_email}</span>
                    </a>
                  )}
                  {faculty?.contact_whatsapp && (
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-white/90">
                      <Phone size={15} className="text-blue-300 shrink-0" />
                      <span>{faculty.contact_whatsapp}</span>
                    </div>
                  )}
                  {faculty?.contact_linkedin && (
                    <a href={faculty.contact_linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm font-semibold text-white/90 hover:text-white transition-colors">
                      <Link2 size={15} className="text-blue-300 shrink-0" />
                      <span className="truncate">LinkedIn profesional</span>
                    </a>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-blue-300 uppercase tracking-widest">
                <span>{faculty?.view_count ?? 0} visitas</span>
                {availInfo && <span style={{ color: availInfo.color }}>{availInfo.label}</span>}
              </div>
            </div>

          ) : institution && !isPro ? (
            <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm p-6 space-y-5 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                <Lock size={22} className="text-gray-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-navy mb-1">Contacto bloqueado</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  Activa el Plan Professional para acceder a los datos de contacto.
                </p>
              </div>
              <Link
                href="/app/institution/billing"
                className="flex items-center justify-center gap-2 w-full bg-talentia-blue hover:bg-blue-700 text-white font-black py-3 rounded-xl text-sm transition-colors"
              >
                <Zap size={14} /> Activar Plan Professional
              </Link>
              <FavoriteButton facultyId={facultyId} institutionId={institution.id} initialIsFavorite={isFavorite} />
            </div>

          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-center space-y-3">
              <div className="bg-blue-50 p-3.5 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto text-talentia-blue">
                <Building2 size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-navy mb-1">Vista de docente</h3>
                <p className="text-sm text-gray-500 font-medium">
                  Solo las instituciones pueden contactar o guardar favoritos.
                </p>
              </div>
            </div>
          )}

          {/* Public profile link */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enlace público</p>
            <a
              href={faculty?.profile_slug
                ? `https://facultymatch.app/faculty/${faculty.profile_slug}`
                : `https://facultymatch.app/faculty/${id}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-bold text-talentia-blue hover:underline break-all"
            >
              <Globe size={13} className="shrink-0" />
              {faculty?.profile_slug
                ? `facultymatch.app/faculty/${faculty.profile_slug}`
                : `facultymatch.app/faculty/${id.slice(0, 8)}…`}
            </a>
          </div>

        </aside>
      </div>
    </div>
  );
}
