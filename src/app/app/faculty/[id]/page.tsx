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
import { ProfileViewTracker } from "@/components/profile/ProfileViewTracker";
import { getDocumentUrl } from "@/lib/utils";
import { matchesBlockedDomain, extractDomainFromEmail } from "@/lib/domain";
import { switchActiveMode } from "@/app/auth/actions";

const AVAIL: Record<string, { label: string; color: string; bg: string }> = {
  open:          { label: "Disponible ahora",     color: "#059669", bg: "#F0FDF4" },
  next_semester: { label: "Próximo semestre",      color: "#0891B2", bg: "#ECFEFF" },
  occasional:    { label: "Asignaturas puntuales", color: "#7C3AED", bg: "#F5F3FF" },
  weekends:      { label: "Fines de semana",       color: "#D97706", bg: "#FFFBEB" },
  online_only:   { label: "Solo online",           color: "#1B4FD8", bg: "#EFF6FF" },
  limited:       { label: "En 6 meses",            color: "#6B7280", bg: "#F3F4F6" },
  invite_only:   { label: "Solo por invitación",   color: "#0D2240", bg: "#F0F4F8" },
  available:     { label: "Abierto a propuestas",  color: "#059669", bg: "#F0FDF4" },
};

// ── Section wrapper ──────────────────────────────────────────────────────────
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h2 className="flex items-center gap-3 text-lg font-bold text-[#0D2240] tracking-tight mb-6">
      <div className="p-2 bg-blue-50 text-[#1B4FD8] rounded-xl shrink-0">
        {icon}
      </div>
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
    supabase.from("user_profiles").select("plan, subscription_status, can_switch_role, active_mode").eq("id", user.id).single(),
  ]);

  const isPro =
    (viewerProfile?.plan === "institution-pro" || viewerProfile?.plan === "institution-growth") &&
    (viewerProfile?.subscription_status === "active" || viewerProfile?.subscription_status === "trialing");

  const canSwitchRole = viewerProfile?.can_switch_role === true;
  const activeMode = viewerProfile?.active_mode;

  // Fetch faculty profile user, documents, and auth user details
  const [facultyUserProfileResult, facultyResult, facultyDocsResult, facultyAuthUserResult] = await Promise.all([
    admin.from("user_profiles").select("full_name, avatar_url").eq("id", id).single(),
    admin.from("faculty_profiles").select(`*, expertise:faculty_expertise(*)`).eq("id", id).maybeSingle(),
    admin.from("faculty_documents").select("*").eq("faculty_id", id),
    admin.auth.admin.getUserById(id).catch(() => ({ data: { user: null } })),
  ]);

  const facultyUserProfile = facultyUserProfileResult.data;
  const faculty = facultyResult.data;
  const facultyDocs = facultyDocsResult.data;
  const facultyAuthUser = facultyAuthUserResult?.data?.user;

  const registeredEmail = facultyAuthUser?.email || null;
  const registeredPhone = facultyAuthUser?.phone || null;

  const emailToShow = faculty?.contact_email || registeredEmail || null;
  const phoneToShow = faculty?.phone || registeredPhone || null;
  const whatsappToShow = faculty?.contact_whatsapp || phoneToShow || null;
  const linkedinToShow = faculty?.contact_linkedin || faculty?.linkedin_url || null;

  if (!facultyUserProfile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6 p-8">
        <div className="bg-red-50 p-5 rounded-full"><ShieldCheck size={40} className="text-red-400" /></div>
        <div><h1 className="text-xl font-bold text-[#0D2240]">Perfil no encontrado</h1></div>
        <Button asChild variant="outline" className="rounded-xl font-bold">
          <Link href={institution ? "/app/institution/search" : "/app/faculty/directory"}>Volver</Link>
        </Button>
      </div>
    );
  }

  // Domain-based blocking check: if the viewer is from an institution whose email
  // domain matches a blocked domain for this faculty member, treat as hidden.
  let isDomainBlocked = false;
  if (institution && user.email) {
    const viewerEmailDomain = extractDomainFromEmail(user.email);
    if (viewerEmailDomain) {
      const { data: domainBlockRules } = await admin
        .from("visibility_rules")
        .select("domain")
        .eq("faculty_id", faculty?.id ?? id)
        .eq("rule", "block")
        .not("domain", "is", "null");
      if (domainBlockRules) {
        isDomainBlocked = domainBlockRules.some(
          (rule: any) => matchesBlockedDomain(viewerEmailDomain, rule.domain)
        );
      }
    }
  }

  if (faculty?.visibility === "hidden" || isDomainBlocked) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6 p-8">
        <div className={`p-5 rounded-full ${isDomainBlocked ? 'bg-red-50' : 'bg-gray-50'}`}>
          <ShieldCheck size={40} className={isDomainBlocked ? 'text-red-400' : 'text-gray-300'} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#0D2240]">
            {isDomainBlocked ? 'Acceso bloqueado' : 'Perfil oculto'}
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-2 max-w-sm">
            {isDomainBlocked
              ? 'Has sido bloqueado por este docente. No puedes ver su perfil porque tu institución está en su lista de bloqueo.'
              : 'Este perfil no está visible actualmente.'}
          </p>
        </div>
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
  const hasDocs           = (facultyDocs?.length ?? 0) > 0 || !!faculty?.cv_url;
  const hasLinks          = !!faculty?.linkedin_url || !!faculty?.website;

  return (
    <>
      <ProfileViewTracker facultyId={facultyId} />
      <div className="animate-in fade-in duration-500 pb-12 font-sans">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-6">
        <Link
          href={institution ? "/app/institution/search" : "/app/faculty/directory"}
          className="hover:text-[#1B4FD8] transition-colors"
        >
          {institution ? "Buscar docentes" : "Directorio"}
        </Link>
        <ChevronRight size={14} />
        <span className="text-[#0D2240] truncate max-w-[200px] font-bold">{facultyName}</span>
      </nav>

      {/* ── HEADER CARD ── */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs overflow-hidden mb-5">
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
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#1B4FD8] text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg">
                  {initials}
                </div>
              )}
              {faculty?.verified === "verified" && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1.5 border-2 border-white shadow-md">
                  <CheckCircle2 size={13} className="stroke-[2.5]" />
                </div>
              )}
            </div>
            {/* Availability badge — visible on desktop in header */}
            {availInfo && (
              <span
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full shadow-xs"
                style={{ color: availInfo.color, background: availInfo.bg }}
              >
                <CalendarCheck size={13} /> {availInfo.label}
              </span>
            )}
          </div>

          {/* Name + badges */}
          <div className="space-y-1.5 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0D2240] tracking-tight leading-tight">{facultyName}</h1>
              {faculty?.is_phd && (
                <Badge className="bg-purple-50 text-purple-700 border-purple-100 text-[10px] font-bold px-2.5 py-1 rounded-full">PhD</Badge>
              )}
              {faculty?.aneca_accreditation && (
                <Badge className="bg-blue-50 text-[#1B4FD8] border-blue-100 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Award size={10} /> ANECA
                </Badge>
              )}
            </div>
            {faculty?.headline && (
              <p className="text-base sm:text-lg font-medium text-slate-600 leading-snug">{faculty.headline}</p>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-slate-500">
            {faculty?.current_institution && (
              <span className="flex items-center gap-1.5">
                <Building2 size={15} className="text-[#1B4FD8] shrink-0" />
                <span className="text-[#0D2240] font-semibold">{faculty.current_institution}</span>
                {faculty?.academic_level && <span className="text-slate-400 font-normal">· {faculty.academic_level}</span>}
              </span>
            )}
            {(faculty?.city || faculty?.country) && (
              <span className="flex items-center gap-1.5">
                <MapPin size={15} className="text-[#1B4FD8] shrink-0" />
                <span>{faculty?.city ? `${faculty.city}, ${faculty.country}` : faculty?.country}</span>
              </span>
            )}
            {yearsExp > 0 && (
              <span className="flex items-center gap-1.5">
                <Briefcase size={15} className="text-[#1B4FD8] shrink-0" />
                <span>{yearsExp}+ años exp.</span>
              </span>
            )}
            {hasLanguages && (
              <span className="flex items-center gap-1.5">
                <Languages size={15} className="text-[#1B4FD8] shrink-0" />
                <span>
                  {faculty!.languages
                    .map((l: any) => typeof l === "string" ? l : l.lang ?? l.language ?? l.name ?? "")
                    .filter(Boolean).join(" · ")}
                </span>
              </span>
            )}
            {/* Mobile availability */}
            {availInfo && (
              <span
                className="sm:hidden inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full"
                style={{ color: availInfo.color, background: availInfo.bg }}
              >
                {availInfo.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── TWO COLUMN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── LEFT: Main content ── */}
        <div className="lg:col-span-8 space-y-5">

          {/* About */}
          {faculty?.bio && (
            <Section>
              <SectionTitle icon={<FileText size={18} />} title="Sobre mí" />
              <p className="text-slate-600 font-normal leading-relaxed text-sm sm:text-base break-words whitespace-pre-line">
                {faculty.bio}
              </p>
            </Section>
          )}

          {/* Especialidades */}
          {(hasExpertise || hasFacultyAreas) && (
            <Section>
              <SectionTitle icon={<Sparkles size={18} />} title="Especialidades" />
              {hasExpertise ? (
                <div className="grid grid-cols-1 gap-3.5">
                  {faculty!.expertise.map((exp: any) => (
                    <div key={exp.id} className="flex gap-4 items-start p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl hover:border-slate-300 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1B4FD8] mt-2 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-[#1B4FD8] uppercase tracking-wider">{exp.area}</p>
                        <p className="font-bold text-[#0D2240] text-sm sm:text-base">{exp.subarea}</p>
                        {exp.topics?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {exp.topics.map((t: string) => (
                              <span key={t} className="text-[10px] font-semibold px-2.5 py-1 bg-white border border-[#E2E8F0] rounded-lg text-slate-500 shadow-3xs">{t}</span>
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
                    <Badge key={area} className="bg-blue-50 text-[#1B4FD8] border-blue-100 px-3 py-1.5 rounded-xl text-xs font-bold">{area}</Badge>
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* Formación */}
          {(hasDegrees || faculty?.aneca_accreditation) && (
            <Section>
              <SectionTitle icon={<GraduationCap size={18} />} title="Formación y Acreditaciones" />
              <div className="space-y-6">
                {hasDegrees && faculty!.degrees!.map((deg: any, i: number) => (
                  <div key={i} className="flex gap-4 items-start p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0 border border-purple-100 shadow-3xs">
                      <GraduationCap size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#0D2240] text-sm sm:text-base">
                        {deg.type || deg.title || deg.degree || "Titulación"}
                      </p>
                      {deg.field && <p className="text-sm font-semibold text-[#1B4FD8]">{deg.field}</p>}
                      <p className="text-sm text-slate-500 font-medium">
                        {deg.university || deg.institution || deg.school || ""}
                        {deg.year && <span className="ml-1.5 text-slate-400">({deg.year})</span>}
                      </p>
                    </div>
                  </div>
                ))}
                {faculty?.aneca_accreditation && (
                  <div className="flex gap-4 items-start p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 border border-amber-100 shadow-3xs">
                      <Award size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#0D2240] text-sm sm:text-base">{faculty.aneca_accreditation}</p>
                      <p className="text-sm text-slate-500 font-medium">Acreditación oficial certificada</p>
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
              <div className="flex flex-wrap gap-2.5">
                {faculty!.languages.map((l: any, i: number) => {
                  const name  = typeof l === "string" ? l : (l.lang || l.language || l.name || "");
                  const level = typeof l === "object" ? l.level : null;
                  return name ? (
                    <div key={i} className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-2.5 rounded-xl shadow-3xs">
                      <span className="font-bold text-[#0D2240] text-sm">{name}</span>
                      {level && <span className="text-xs text-slate-400 font-medium bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0]">{level}</span>}
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
              <div className="space-y-6">
                {faculty?.current_institution && (
                  <div className="flex gap-4 items-start p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                    <div className="w-10 h-10 bg-blue-50 text-[#1B4FD8] rounded-xl flex items-center justify-center shrink-0 border border-blue-100 shadow-3xs">
                      <Building2 size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#0D2240] text-sm sm:text-base">{faculty.current_institution}</p>
                      {faculty?.academic_level && (
                        <p className="text-sm font-semibold text-[#1B4FD8]">{faculty.academic_level}</p>
                      )}
                      {yearsExp > 0 && (
                        <p className="text-sm text-slate-500 font-medium">{yearsExp} años de experiencia docente</p>
                      )}
                    </div>
                  </div>
                )}
                {hasInstitutions && (
                  <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Otras instituciones impartidas
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {faculty!.institutions_taught!.map((inst: string, i: number) => (
                        <Badge key={i} className="bg-white text-[#0D2240] border border-[#E2E8F0] px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-3xs">{inst}</Badge>
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
              <SectionTitle icon={<CalendarCheck size={18} />} title="Disponibilidad y Preferencias" />
              <div className="flex flex-wrap gap-3">
                {availInfo && (
                  <div
                    className="flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm shadow-3xs"
                    style={{ color: availInfo.color, background: availInfo.bg, border: `1px solid ${availInfo.color}22` }}
                  >
                    <Sparkles size={16} /> {availInfo.label}
                  </div>
                )}
                {Array.isArray(faculty?.modalities) && faculty!.modalities!.map((mod: string) => (
                  <div key={mod} className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0D2240] font-bold text-sm capitalize shadow-3xs">
                    <Globe size={16} className="text-[#1B4FD8]" /> {mod}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Investigación */}
          {hasResearch && (
            <Section>
              <SectionTitle icon={<BookOpen size={18} />} title="Perfil Investigador" />
              <div className="space-y-5">
                {faculty?.google_scholar_id && (
                  <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                    <div className="w-10 h-10 bg-blue-50 text-[#1B4FD8] rounded-xl flex items-center justify-center shrink-0 border border-blue-100 shadow-3xs">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Google Scholar</span>
                      <a
                        href={`https://scholar.google.com/citations?user=${faculty.google_scholar_id}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-sm font-bold text-[#1B4FD8] hover:underline flex items-center gap-1"
                      >
                        {faculty.google_scholar_id} <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}
                {faculty?.orcid_id && (
                  <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100 shadow-3xs">
                      <Globe size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">ORCID iD</span>
                      <a
                        href={`https://orcid.org/${faculty.orcid_id}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-sm font-bold text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        {faculty.orcid_id} <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}
                {faculty?.research_publications && (
                  <div className="pt-5 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Publicaciones destacadas</p>
                    <div className="space-y-3">
                      {faculty.research_publications
                        .split("\n")
                        .map((line: string) => line.trim())
                        .filter(Boolean)
                        .map((pub: string, idx: number) => (
                          <div key={idx} className="flex gap-3.5 items-start p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm text-slate-600 leading-relaxed hover:border-slate-300 transition-colors">
                            <div className="p-1.5 bg-white border border-[#E2E8F0] rounded-lg text-slate-400 shrink-0 mt-0.5">
                              <BookOpen size={14} className="text-[#1B4FD8]" />
                            </div>
                            <span className="flex-1 min-w-0 break-words font-medium">{pub}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Documentos */}
          {hasDocs && (
            <Section>
              <SectionTitle icon={<FileText size={18} />} title="Documentos" />
              <div className="space-y-3">
                {facultyDocs?.map((doc: any) => (
                  <a
                    key={doc.id}
                    href={getDocumentUrl(doc.file_path)}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl hover:bg-blue-50/50 hover:border-[#1B4FD8]/30 transition-all group shadow-3xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white text-slate-400 border border-[#E2E8F0] rounded-xl group-hover:text-[#1B4FD8] transition-colors shadow-3xs">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0D2240]">{doc.name || doc.file_name || "Documento"}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{doc.doc_type || "PDF"}</p>
                      </div>
                    </div>
                    <ExternalLink size={15} className="text-slate-300 group-hover:text-[#1B4FD8] transition-colors mr-1" />
                  </a>
                ))}
                {faculty?.cv_url && (
                  <a
                    href={faculty.cv_url}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl hover:bg-blue-50/50 hover:border-[#1B4FD8]/30 transition-all group shadow-3xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white text-slate-400 border border-[#E2E8F0] rounded-xl group-hover:text-[#1B4FD8] transition-colors shadow-3xs">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0D2240]">Curriculum Vitae</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">PDF</p>
                      </div>
                    </div>
                    <ExternalLink size={15} className="text-slate-300 group-hover:text-[#1B4FD8] transition-colors mr-1" />
                  </a>
                )}
              </div>
            </Section>
          )}

          {/* Redes y enlaces */}
          {hasLinks && (
            <Section>
              <SectionTitle icon={<Link2 size={18} />} title="Redes y Enlaces" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {faculty?.linkedin_url && (
                  <a
                    href={faculty.linkedin_url}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3.5 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl hover:bg-blue-50/50 hover:border-[#1B4FD8]/30 transition-all group shadow-3xs"
                  >
                    <div className="w-9 h-9 bg-[#0A66C2] rounded-xl flex items-center justify-center shrink-0 border border-blue-700 shadow-3xs">
                      <span className="text-white text-sm font-black">in</span>
                    </div>
                    <span className="text-sm font-bold text-[#0D2240] group-hover:text-[#1B4FD8] flex-1 truncate">LinkedIn</span>
                    <ExternalLink size={15} className="text-slate-300 group-hover:text-[#1B4FD8] transition-colors shrink-0 mr-1" />
                  </a>
                )}
                {faculty?.website && (
                  <a
                    href={faculty.website}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3.5 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl hover:bg-blue-50/50 hover:border-[#1B4FD8]/30 transition-all group shadow-3xs"
                  >
                    <div className="w-9 h-9 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-center shrink-0 shadow-3xs">
                      <Globe size={16} className="text-slate-500" />
                    </div>
                    <span className="text-sm font-bold text-[#0D2240] group-hover:text-[#1B4FD8] flex-1 truncate">
                      {faculty.website.replace(/^https?:\/\//, "")}
                    </span>
                    <ExternalLink size={15} className="text-slate-300 group-hover:text-[#1B4FD8] transition-colors shrink-0 mr-1" />
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
            <div className="bg-[#0D2240] rounded-3xl p-6 sm:p-8 shadow-xl text-white space-y-6 relative overflow-hidden border border-[#1B4FD8]/30">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-xl" />
              <div>
                <h3 className="text-xl font-bold mb-1 tracking-tight">¿Interesado?</h3>
                <p className="text-blue-200 text-sm font-medium">Contacta a este docente para explorar una colaboración.</p>
              </div>

              <div className="space-y-3">
                <ContactModalWrapper
                  facultyId={facultyId}
                  facultyName={facultyName}
                  institutionId={institution.id}
                />
                {whatsappToShow && (
                  <a
                    href={`https://wa.me/${whatsappToShow.replace(/\D/g, "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bd5b] text-white font-bold h-12 rounded-xl text-sm transition-colors shadow-sm"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                )}
                <div className="flex gap-3">
                  <FavoriteButton facultyId={facultyId} institutionId={institution.id} initialIsFavorite={isFavorite} />
                  {faculty?.cv_url && (
                    <Button variant="outline" asChild className="flex-1 bg-white/10 border-white/10 text-white hover:bg-white/20 font-bold h-12 rounded-xl text-sm shadow-3xs">
                      <a href={faculty.cv_url} target="_blank" rel="noopener noreferrer">Ver CV</a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Contact details */}
              {(emailToShow || linkedinToShow || phoneToShow || whatsappToShow) && (
                <div className="space-y-3 pt-5 border-t border-white/10">
                  <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Contacto directo</p>
                  {emailToShow && (
                    <a href={`mailto:${emailToShow}`} className="flex items-center gap-3 text-sm font-semibold text-white/90 hover:text-white transition-colors">
                      <div className="p-1.5 bg-white/10 rounded-lg shrink-0">
                        <AtSign size={14} className="text-blue-200" />
                      </div>
                      <span className="truncate flex-1">{emailToShow}</span>
                    </a>
                  )}
                  {phoneToShow && (
                    <a href={`tel:${phoneToShow}`} className="flex items-center gap-3 text-sm font-semibold text-white/90 hover:text-white transition-colors">
                      <div className="p-1.5 bg-white/10 rounded-lg shrink-0">
                        <Phone size={14} className="text-blue-200" />
                      </div>
                      <span className="truncate flex-1">{phoneToShow}</span>
                    </a>
                  )}
                  {whatsappToShow && (
                    <div className="flex items-center gap-3 text-sm font-semibold text-white/90">
                      <div className="p-1.5 bg-white/10 rounded-lg shrink-0">
                        <MessageCircle size={14} className="text-blue-200" />
                      </div>
                      <span className="flex-1">{whatsappToShow} (WhatsApp)</span>
                    </div>
                  )}
                  {linkedinToShow && (
                    <a href={linkedinToShow} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-semibold text-white/90 hover:text-white transition-colors">
                      <div className="p-1.5 bg-white/10 rounded-lg shrink-0">
                        <Link2 size={14} className="text-blue-200" />
                      </div>
                      <span className="truncate flex-1">LinkedIn profesional</span>
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
                <h3 className="text-base font-bold text-[#0D2240] mb-1">Contacto bloqueado</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Activa el Plan Professional para acceder a los datos de contacto.
                </p>
              </div>
              <Link
                href="/app/institution/billing"
                className="flex items-center justify-center gap-2 w-full bg-[#1B4FD8] hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
              >
                <Zap size={14} /> Activar Plan Professional
              </Link>
              <FavoriteButton facultyId={facultyId} institutionId={institution.id} initialIsFavorite={isFavorite} />
            </div>

          ) : canSwitchRole && activeMode !== "institution" ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto">
                <Building2 size={28} className="text-[#1B4FD8]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0D2240] mb-1">Tienes acceso como institución</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  Cambia al modo institución para contactar docentes, guardar favoritos y acceder a todas las funcionalidades.
                </p>
              </div>
              <form action={switchActiveMode}>
                <input type="hidden" name="mode" value="institution" />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 w-full bg-[#1B4FD8] hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
                >
                  <Building2 size={14} /> Cambiar a modo institución
                </button>
              </form>
            </div>

          ) : (
            <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-6 text-center space-y-3">
              <div className="bg-blue-50 p-3.5 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto text-[#1B4FD8]">
                <Building2 size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0D2240] mb-1">Vista de docente</h3>
                <p className="text-sm text-slate-500 font-medium">
                  Solo las instituciones pueden contactar o guardar favoritos.
                </p>
              </div>
            </div>
          )}

          {/* Public profile link — compact (only when the profile actually has a public URL) */}
          {faculty?.profile_slug ? (
            <a
              href={`https://facultymatch.app/docentes/${faculty.profile_slug}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#1B4FD8] transition-colors group shadow-3xs"
            >
              <Globe size={13} className="text-slate-400 group-hover:text-[#1B4FD8] shrink-0 transition-colors" />
              <span className="text-xs font-semibold text-slate-400 group-hover:text-[#1B4FD8] transition-colors truncate">
                {`facultymatch.app/docentes/${faculty.profile_slug}`}
              </span>
              <ExternalLink size={11} className="text-slate-300 group-hover:text-[#1B4FD8] shrink-0 transition-colors ml-auto" />
            </a>
          ) : (
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl border border-[#E2E8F0] text-slate-400">
              <Globe size={13} className="shrink-0" />
              <span className="text-xs font-semibold">Este docente aún no tiene enlace público generado</span>
            </div>
          )}

        </aside>
      </div>
    </div>
    </>
  );
}
