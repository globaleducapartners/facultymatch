import { createClient, createAdminClient } from "@/lib/supabase-server";
import { notFound, redirect } from "next/navigation";
import {
    GraduationCap, Globe, MapPin, Award, Star, Mail,
    Briefcase, BookOpen, ExternalLink, FileText,
    Calendar, CheckCircle2, ShieldCheck, ChevronRight,
    Languages, Building2, Search, Sparkles, Lock, Zap, MessageCircle,
    Phone, AtSign, Link2
  } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ContactModalWrapper } from "@/components/dashboard/ContactModalWrapper";
import { FavoriteButton } from "@/components/dashboard/FavoriteButton";

// Availability labels — must match profile editor values
const AVAIL_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  open:          { label: "Disponible ahora",     color: "#059669", bg: "#F0FDF4" },
  next_semester: { label: "Próximo semestre",      color: "#0891B2", bg: "#EFF9FF" },
  occasional:    { label: "Asignaturas puntuales", color: "#7C3AED", bg: "#F5F3FF" },
  weekends:      { label: "Fines de semana",       color: "#D97706", bg: "#FFFBEB" },
  online_only:   { label: "Solo online",           color: "#1B4FD8", bg: "#EFF6FF" },
  limited:       { label: "En 6 meses",            color: "#6B7280", bg: "#F3F4F6" },
  invite_only:   { label: "Solo por invitación",   color: "#0D2240", bg: "#EEF4FF" },
  // legacy values
  available:     { label: "Abierto a propuestas",  color: "#059669", bg: "#F0FDF4" },
};

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

  // Get current institution profile + plan
  const [{ data: institution }, { data: institutionUserProfile }] = await Promise.all([
    supabase.from("institutions").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_profiles").select("plan, subscription_status").eq("id", user.id).single(),
  ]);

  // Get faculty name + avatar from user_profiles (admin to bypass RLS)
  const { data: facultyUserProfile } = await admin
    .from("user_profiles")
    .select("full_name, avatar_url")
    .eq("id", id)
    .single();

  const activeStatus = institutionUserProfile?.subscription_status;
  const institutionIsPro =
    (institutionUserProfile?.plan === "institution-pro" || institutionUserProfile?.plan === "institution-growth") &&
    (activeStatus === "active" || activeStatus === "trialing");

  // Fetch faculty profile with all joined tables — admin bypasses RLS
  const { data: faculty } = await admin
    .from("faculty_profiles")
    .select(`
      *,
      expertise:faculty_expertise(*),
      documents:faculty_documents(*),
      links:faculty_links(*)
    `)
    .eq("id", id)
    .maybeSingle();

  // If no user_profiles row → truly not found
  if (!facultyUserProfile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="bg-red-50 p-6 rounded-full text-red-500">
          <ShieldCheck size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-navy">Perfil no encontrado</h1>
          <p className="text-gray-500 max-w-md">Este docente no existe o ha sido eliminado.</p>
        </div>
        <Button asChild variant="outline" className="rounded-xl font-bold">
          <Link href={institution ? "/app/institution/search" : "/app/faculty/directory"}>Volver al buscador</Link>
        </Button>
      </div>
    );
  }

  // Hidden profiles → not available
  if (faculty?.visibility === "hidden") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="bg-gray-50 p-6 rounded-full text-gray-400">
          <ShieldCheck size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-navy">Perfil oculto</h1>
          <p className="text-gray-500 max-w-md">Este docente ha ocultado su perfil.</p>
        </div>
        <Button asChild variant="outline" className="rounded-xl font-bold">
          <Link href={institution ? "/app/institution/search" : "/app/faculty/directory"}>Volver al buscador</Link>
        </Button>
      </div>
    );
  }

  const facultyId = faculty?.id ?? id;
  const facultyName = facultyUserProfile?.full_name || faculty?.full_name || "Docente";
  const availInfo = AVAIL_LABELS[faculty?.availability ?? ""] ?? null;

  // Check if favorite
  let isFavorite = false;
  if (institution) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("id")
      .eq("institution_id", institution.id)
      .eq("faculty_id", facultyId)
      .single();
    isFavorite = !!fav;
  }

  const publicProfileUrl = faculty?.profile_slug
    ? `https://facultymatch.app/faculty/${faculty.profile_slug}`
    : `https://facultymatch.app/faculty/${id}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm font-bold text-gray-400">
        <Link href={institution ? "/app/institution/search" : "/app/faculty/directory"} className="hover:text-talentia-blue transition-colors">
          Buscador
        </Link>
        <ChevronRight size={14} />
        <span className="text-navy">{facultyName}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Main Content ── */}
        <div className="lg:col-span-8 space-y-8">

          {/* Header Card */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            {/* Banner */}
            <div className="relative h-36 sm:h-48">
              {faculty?.banner_url ? (
                <img src={faculty.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#0D2240] via-[#1B4FD8] to-[#4F7FE8]" />
              )}
            </div>

            <div className="px-8 lg:px-12 pb-10 -mt-12 relative">
              {(() => {
                const fullName = facultyName;
                const initials = fullName.substring(0, 2).toUpperCase();
                return (
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {facultyUserProfile?.avatar_url ? (
                      <img
                        src={facultyUserProfile.avatar_url}
                        alt={fullName}
                        className="w-24 h-24 rounded-3xl object-cover shrink-0 shadow-xl shadow-blue-100 border-4 border-white"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-talentia-blue text-white rounded-3xl flex items-center justify-center text-3xl font-black shrink-0 shadow-xl shadow-blue-100 border-4 border-white">
                        {initials}
                      </div>
                    )}

                    <div className="space-y-4 flex-1 mt-12">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h1 className="text-3xl font-black text-navy">{fullName}</h1>
                          {faculty?.verified === 'verified' && (
                            <Badge className="bg-green-50 text-green-600 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                              <CheckCircle2 size={12} className="mr-1" /> Verificado
                            </Badge>
                          )}
                          {faculty?.is_phd && (
                            <Badge className="bg-purple-50 text-purple-700 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                              PhD
                            </Badge>
                          )}
                          {faculty?.aneca_accreditation && (
                            <Badge className="bg-blue-50 text-talentia-blue border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                              <Award size={12} className="mr-1" /> {faculty?.aneca_accreditation}
                            </Badge>
                          )}
                          {availInfo && (
                            <span className="text-[10px] font-black px-3 py-1 rounded-full" style={{ color: availInfo.color, background: availInfo.bg }}>
                              {availInfo.label}
                            </span>
                          )}
                        </div>
                        <p className="text-xl font-bold text-gray-500">{faculty?.headline}</p>
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {faculty?.current_institution && (
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                            <Building2 size={16} className="text-talentia-blue" />
                            {faculty.current_institution}
                            {faculty?.academic_level && <span className="text-gray-400 font-medium">· {faculty.academic_level}</span>}
                          </div>
                        )}
                        {(faculty?.city || faculty?.country) && (
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                            <MapPin size={16} className="text-talentia-blue" />
                            {faculty?.city ? `${faculty.city}, ${faculty.country}` : faculty?.country}
                          </div>
                        )}
                        {(faculty?.years_experience ?? 0) > 0 && (
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                            <Briefcase size={16} className="text-talentia-blue" />
                            {faculty?.years_experience}+ años de experiencia
                          </div>
                        )}
                        {Array.isArray(faculty?.languages) && faculty.languages.length > 0 && (
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                            <Languages size={16} className="text-talentia-blue" />
                            {faculty.languages
                              .map((l: any) => typeof l === 'string' ? l : l.lang ?? l.language ?? l.name ?? '')
                              .filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="bg-white p-1.5 rounded-2xl border border-gray-100 h-14 w-full justify-start gap-2 mb-8">
              <TabsTrigger value="profile" className="rounded-xl font-bold px-6 data-[state=active]:bg-navy data-[state=active]:text-white transition-all h-full">Perfil</TabsTrigger>
              <TabsTrigger value="experience" className="rounded-xl font-bold px-6 data-[state=active]:bg-navy data-[state=active]:text-white transition-all h-full">Experiencia</TabsTrigger>
              <TabsTrigger value="evidence" className="rounded-xl font-bold px-6 data-[state=active]:bg-navy data-[state=active]:text-white transition-all h-full">Evidencias</TabsTrigger>
              <TabsTrigger value="availability" className="rounded-xl font-bold px-6 data-[state=active]:bg-navy data-[state=active]:text-white transition-all h-full">Disponibilidad</TabsTrigger>
            </TabsList>

            {/* ── TAB: PERFIL ── */}
            <TabsContent value="profile" className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 lg:p-10 shadow-sm space-y-8">

                {/* Sobre mí */}
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-navy flex items-center gap-2">
                    <FileText size={20} className="text-talentia-blue" /> Sobre mí
                  </h3>
                  <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-line">
                    {faculty?.bio || "No se ha proporcionado biografía."}
                  </p>
                </div>

                {/* Especialidades | Formación */}
                <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                  {/* Especialidades */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Especialidades</h4>
                    <div className="space-y-4">
                      {faculty?.expertise?.length > 0 ? (
                        faculty?.expertise.map((exp: any) => (
                          <div key={exp.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-xs font-black text-talentia-blue uppercase tracking-widest mb-1">{exp.area}</p>
                            <p className="font-bold text-navy">{exp.subarea}</p>
                            {exp.topics?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {exp.topics.map((topic: string) => (
                                  <span key={topic} className="text-[10px] font-bold px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-400">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : Array.isArray(faculty?.faculty_areas) && faculty?.faculty_areas.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {faculty?.faculty_areas.map((area: string) => (
                            <Badge key={area} className="bg-blue-50 text-talentia-blue border-blue-100 px-3 py-1 rounded-xl text-xs font-bold">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 font-medium italic">No se han especificado áreas.</p>
                      )}
                    </div>
                  </div>

                  {/* Formación y Acreditación */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Formación y Acreditación</h4>
                    <div className="space-y-4">
                      {Array.isArray(faculty?.degrees) && faculty?.degrees.length > 0 ? (
                        faculty?.degrees.map((deg: any, i: number) => (
                          <div key={i} className="flex gap-4 items-start">
                            <div className="w-10 h-10 bg-blue-50 text-talentia-blue rounded-xl flex items-center justify-center shrink-0">
                              <GraduationCap size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-navy">{deg.type || deg.title || deg.degree || "Titulación"}</p>
                              {deg.field && <p className="text-sm font-medium text-talentia-blue">{deg.field}</p>}
                              <p className="text-sm font-medium text-gray-500">
                                {deg.university || deg.institution || deg.school || ""}
                                {deg.year && <span className="ml-2 text-gray-400">({deg.year})</span>}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : faculty?.degree_level ? (
                        <div className="flex gap-4 items-start">
                          <div className="w-10 h-10 bg-blue-50 text-talentia-blue rounded-xl flex items-center justify-center shrink-0">
                            <GraduationCap size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-navy">{faculty?.degree_level}</p>
                            <p className="text-sm font-medium text-gray-500">Nivel de estudios</p>
                          </div>
                        </div>
                      ) : null}

                      {faculty?.aneca_accreditation && (
                        <div className="flex gap-4 items-start">
                          <div className="w-10 h-10 bg-blue-50 text-talentia-blue rounded-xl flex items-center justify-center shrink-0">
                            <Award size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-navy">{faculty?.aneca_accreditation}</p>
                            <p className="text-sm font-medium text-gray-500 italic">Acreditación ANECA</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Idiomas */}
                {Array.isArray(faculty?.languages) && faculty.languages.length > 0 && (
                  <div className="pt-8 border-t border-gray-50 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Idiomas</h4>
                    <div className="flex flex-wrap gap-2">
                      {faculty.languages.map((l: any, i: number) => {
                        const name = typeof l === 'string' ? l : (l.lang || l.language || l.name || '');
                        const level = typeof l === 'object' ? l.level : null;
                        return (
                          <Badge key={i} className="bg-gray-50 text-navy border border-gray-100 px-3 py-1.5 rounded-xl text-xs font-bold">
                            {name}{level ? ` · ${level}` : ''}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── TAB: EXPERIENCIA ── */}
            <TabsContent value="experience" className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 lg:p-10 shadow-sm space-y-8">

                {/* Institución actual */}
                {(faculty?.current_institution || faculty?.academic_level) && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-navy flex items-center gap-2">
                      <Building2 size={20} className="text-talentia-blue" /> Posición Actual
                    </h3>
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 bg-blue-50 text-talentia-blue rounded-2xl flex items-center justify-center shrink-0">
                        <Building2 size={24} />
                      </div>
                      <div>
                        {faculty?.current_institution && (
                          <p className="font-bold text-navy text-lg">{faculty.current_institution}</p>
                        )}
                        {faculty?.academic_level && (
                          <p className="text-sm font-bold text-talentia-blue">{faculty.academic_level}</p>
                        )}
                        {(faculty?.years_experience ?? 0) > 0 && (
                          <p className="text-sm font-medium text-gray-500 mt-1">{faculty?.years_experience} años de experiencia docente</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Años de experiencia (si no hay institución actual) */}
                {!faculty?.current_institution && (faculty?.years_experience ?? 0) > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-navy flex items-center gap-2">
                      <Briefcase size={20} className="text-talentia-blue" /> Experiencia
                    </h3>
                    <div className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100">
                      <div className="absolute left-[-4px] top-2 w-2.5 h-2.5 rounded-full bg-talentia-blue border-2 border-white shadow-sm" />
                      <div className="space-y-1">
                        <p className="text-sm font-black text-talentia-blue uppercase tracking-widest">Experiencia Docente</p>
                        <p className="text-2xl font-black text-navy">{faculty?.years_experience} años</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Instituciones anteriores */}
                {Array.isArray(faculty?.institutions_taught) && faculty.institutions_taught.length > 0 && (
                  <div className={(faculty?.current_institution || (faculty?.years_experience ?? 0) > 0) ? "pt-8 border-t border-gray-50 space-y-4" : "space-y-4"}>
                    <h3 className="text-xl font-black text-navy flex items-center gap-2">
                      <Search size={20} className="text-talentia-blue" /> También ha impartido en
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {faculty.institutions_taught.map((inst: string, i: number) => (
                        <Badge key={i} className="bg-gray-50 text-navy border border-gray-100 px-4 py-2 rounded-xl text-sm font-bold">
                          {inst}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Niveles impartidos (legacy field) */}
                {Array.isArray(faculty?.levels) && faculty.levels.length > 0 && (
                  <div className="pt-8 border-t border-gray-50 space-y-4">
                    <h3 className="text-xl font-black text-navy flex items-center gap-2">
                      <BookOpen size={20} className="text-talentia-blue" /> Niveles Impartidos
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {faculty.levels.map((level: string) => (
                        <Badge key={level} className="bg-gray-50 text-navy border border-gray-100 px-4 py-2 rounded-xl text-sm font-bold">
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!faculty?.current_institution && !faculty?.academic_level && !(faculty?.years_experience ?? 0) && !(Array.isArray(faculty?.institutions_taught) && faculty.institutions_taught.length) && !(Array.isArray(faculty?.levels) && faculty.levels.length) && (
                  <p className="text-sm text-gray-400 italic text-center py-8">No se ha indicado información de experiencia.</p>
                )}
              </div>
            </TabsContent>

            {/* ── TAB: EVIDENCIAS ── */}
            <TabsContent value="evidence" className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 lg:p-10 shadow-sm space-y-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-navy flex items-center gap-2">
                    <BookOpen size={20} className="text-talentia-blue" /> Investigación y Documentos
                  </h3>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Publicaciones e IDs */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Publicaciones y perfiles académicos</h4>
                      <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
                        {faculty?.google_scholar_id && (
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-500 uppercase">Google Scholar</p>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-navy break-all">{faculty.google_scholar_id}</p>
                              <a href={`https://scholar.google.com/citations?user=${faculty.google_scholar_id}`} target="_blank" rel="noopener noreferrer" className="text-talentia-blue hover:text-blue-700 shrink-0">
                                <ExternalLink size={14} />
                              </a>
                            </div>
                          </div>
                        )}
                        {faculty?.orcid_id && (
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-500 uppercase">ORCID iD</p>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-navy">{faculty.orcid_id}</p>
                              <a href={`https://orcid.org/${faculty.orcid_id}`} target="_blank" rel="noopener noreferrer" className="text-talentia-blue hover:text-blue-700 shrink-0">
                                <ExternalLink size={14} />
                              </a>
                            </div>
                          </div>
                        )}
                        {!faculty?.google_scholar_id && !faculty?.orcid_id && (
                          <p className="text-sm text-gray-400 italic">No se han indicado IDs académicos.</p>
                        )}
                        {faculty?.research_publications && (
                          <div className="space-y-1 pt-2 border-t border-blue-100">
                            <p className="text-xs font-bold text-gray-500 uppercase">Publicaciones destacadas</p>
                            <p className="text-sm font-medium text-gray-600 whitespace-pre-line">
                              {faculty.research_publications}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Archivos adjuntos */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Archivos Adjuntos</h4>
                      <div className="space-y-3">
                        {faculty?.documents?.map((doc: any) => (
                          <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-talentia-blue transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-blue-50 group-hover:text-talentia-blue transition-colors">
                                <FileText size={18} />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-sm font-bold text-navy">{doc.name || doc.file_name || "Documento"}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{doc.type || "PDF"}</p>
                              </div>
                            </div>
                            <ExternalLink size={16} className="text-gray-300 group-hover:text-talentia-blue transition-colors" />
                          </a>
                        ))}

                        {faculty?.cv_url && (
                          <a href={faculty.cv_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-talentia-blue transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-blue-50 group-hover:text-talentia-blue transition-colors">
                                <FileText size={18} />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-sm font-bold text-navy">Curriculum Vitae</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PDF</p>
                              </div>
                            </div>
                            <ExternalLink size={16} className="text-gray-300 group-hover:text-talentia-blue transition-colors" />
                          </a>
                        )}

                        {!(faculty?.documents?.length) && !faculty?.cv_url && (
                          <p className="text-sm text-gray-400 italic">No hay documentos públicos.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── TAB: DISPONIBILIDAD ── */}
            <TabsContent value="availability" className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 lg:p-10 shadow-sm space-y-8">
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-navy flex items-center gap-2">
                      <Calendar size={20} className="text-talentia-blue" /> Disponibilidad
                    </h3>
                    <div className="space-y-6">
                      {availInfo ? (
                        <div className="flex gap-4 items-start">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: availInfo.bg }}>
                            <Sparkles size={20} style={{ color: availInfo.color }} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Estado</p>
                            <p className="font-bold text-navy text-lg">{availInfo.label}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No especificado</p>
                      )}

                      {Array.isArray(faculty?.modalities) && faculty.modalities.length > 0 && (
                        <div className="flex gap-4 items-start">
                          <div className="w-10 h-10 bg-blue-50 text-talentia-blue rounded-xl flex items-center justify-center shrink-0">
                            <Globe size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Modalidad preferida</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {faculty.modalities.map((mod: string) => (
                                <Badge key={mod} className="bg-white text-gray-600 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold capitalize">
                                  {mod}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 flex flex-col justify-center items-center text-center space-y-4">
                    <div className="bg-white p-4 rounded-full shadow-sm text-talentia-blue">
                      <Building2 size={32} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-navy">Interés en Proyectos</h4>
                      <p className="text-sm font-medium text-gray-500">
                        El docente está interesado en colaboraciones académicas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Sidebar ── */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">

          {/* Contact / Action card */}
          {institution && institutionIsPro ? (
            <div className="bg-navy p-8 rounded-[2.5rem] shadow-2xl text-white space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="space-y-2">
                <h3 className="text-2xl font-black">¿Interesado?</h3>
                <p className="text-blue-200 font-medium">Inicia una conversación para explorar una colaboración académica.</p>
              </div>

              <div className="flex flex-col gap-3">
                <ContactModalWrapper
                  facultyId={facultyId}
                  facultyName={facultyName}
                  institutionId={institution.id}
                />

                {faculty?.contact_whatsapp && (
                  <a
                    href={`https://wa.me/${faculty.contact_whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bd5b] text-white font-bold h-12 rounded-xl text-sm transition-colors"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                )}

                <div className="flex gap-3">
                  <FavoriteButton
                    facultyId={facultyId}
                    institutionId={institution.id}
                    initialIsFavorite={isFavorite}
                  />
                  {faculty?.cv_url && (
                    <Button variant="outline" asChild className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold h-12 rounded-xl">
                      <a href={faculty.cv_url} target="_blank" rel="noopener noreferrer">Descargar CV</a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Contact details (pro) */}
              {(faculty?.contact_email || faculty?.contact_linkedin || faculty?.phone) && (
                <div className="space-y-3 pt-6 border-t border-white/10">
                  <p className="text-xs font-black text-blue-200 uppercase tracking-widest">Datos de contacto</p>
                  {faculty?.contact_email && (
                    <a href={`mailto:${faculty.contact_email}`} className="flex items-center gap-3 text-sm font-bold text-white hover:text-blue-200 transition-colors">
                      <AtSign size={16} className="shrink-0 text-blue-300" />
                      <span className="truncate">{faculty.contact_email}</span>
                    </a>
                  )}
                  {faculty?.contact_whatsapp && (
                    <div className="flex items-center gap-3 text-sm font-bold text-white">
                      <Phone size={16} className="shrink-0 text-blue-300" />
                      {faculty.contact_whatsapp}
                    </div>
                  )}
                  {faculty?.contact_linkedin && (
                    <a href={faculty.contact_linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-bold text-white hover:text-blue-200 transition-colors">
                      <Link2 size={16} className="shrink-0 text-blue-300" />
                      <span className="truncate">LinkedIn</span>
                    </a>
                  )}
                </div>
              )}

              <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-bold text-blue-200 uppercase tracking-widest">
                <span>Visitas: {faculty?.view_count ?? 0}</span>
                <span>{availInfo?.label ?? "—"}</span>
              </div>
            </div>

          ) : institution && !institutionIsPro ? (
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-sm space-y-6 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                <Lock size={24} className="text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-navy">Datos de contacto bloqueados</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  Activa el Plan Professional para acceder a los datos de contacto de docentes verificados.
                </p>
              </div>
              <Link
                href="/app/institution/billing"
                className="inline-flex items-center justify-center gap-2 w-full bg-[#1d4ed8] hover:bg-blue-700 text-white font-black py-3 rounded-xl text-sm transition-colors"
              >
                <Zap size={15} /> Activar Plan Professional
              </Link>
              <FavoriteButton
                facultyId={facultyId}
                institutionId={institution.id}
                initialIsFavorite={isFavorite}
              />
            </div>

          ) : (
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center space-y-4">
              <div className="bg-blue-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-talentia-blue">
                <Building2 size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-navy">Vista de Institución</h3>
                <p className="text-sm text-gray-500 font-medium">
                  Solo las cuentas de institución pueden contactar o guardar favoritos.
                </p>
              </div>
            </div>
          )}

          {/* Links y Redes */}
          {(faculty?.links?.length || faculty?.linkedin_url || faculty?.website) && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <h4 className="text-sm font-black text-navy uppercase tracking-widest">Enlaces y Redes</h4>
              <div className="space-y-3">
                {faculty?.links?.map((link: any) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-50 hover:border-talentia-blue transition-all group"
                  >
                    <p className="text-sm font-bold text-navy group-hover:text-talentia-blue transition-colors capitalize">{link.platform || link.label || "Enlace"}</p>
                    <ExternalLink size={14} className="text-gray-300 group-hover:text-talentia-blue transition-colors" />
                  </a>
                ))}

                {faculty?.linkedin_url && (
                  <a
                    href={faculty.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-50 hover:border-talentia-blue transition-all group"
                  >
                    <p className="text-sm font-bold text-navy group-hover:text-talentia-blue transition-colors">LinkedIn</p>
                    <ExternalLink size={14} className="text-gray-300 group-hover:text-talentia-blue transition-colors" />
                  </a>
                )}

                {faculty?.website && (
                  <a
                    href={faculty.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-50 hover:border-talentia-blue transition-all group"
                  >
                    <p className="text-sm font-bold text-navy group-hover:text-talentia-blue transition-colors truncate">
                      {faculty.website.replace(/^https?:\/\//, '')}
                    </p>
                    <ExternalLink size={14} className="text-gray-300 group-hover:text-talentia-blue transition-colors shrink-0" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Enlace público del perfil */}
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-3">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Enlace público</h4>
            <a
              href={publicProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-bold text-talentia-blue hover:underline break-all"
            >
              <Globe size={14} className="shrink-0" />
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
