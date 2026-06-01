import { createClient, createAdminClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import {
    GraduationCap, Globe, MapPin, Award,
    Briefcase, BookOpen, ExternalLink, FileText,
    Calendar, CheckCircle2, ShieldCheck, ChevronRight,
    Languages, Building2, Sparkles, Lock, Zap, MessageCircle,
    Phone
  } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ContactModalWrapper } from "@/components/dashboard/ContactModalWrapper";
import { FavoriteButton } from "@/components/dashboard/FavoriteButton";

const AVAIL_LABELS: Record<string, { label: string; color: string }> = {
  open:          { label: "Disponible ahora",       color: "text-green-600" },
  available:     { label: "Disponible ahora",       color: "text-green-600" },
  next_semester: { label: "Próximo semestre",        color: "text-cyan-600" },
  occasional:    { label: "Asignaturas puntuales",  color: "text-purple-600" },
  weekends:      { label: "Fines de semana",         color: "text-amber-600" },
  online_only:   { label: "Solo online",             color: "text-blue-600" },
  limited:       { label: "Disponibilidad limitada", color: "text-gray-500" },
  invite_only:   { label: "Solo por invitación",     color: "text-navy" },
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // Get current institution profile + plan
  const [{ data: institution }, { data: institutionUserProfile }] = await Promise.all([
    supabase.from("institutions").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_profiles").select("plan, subscription_status").eq("id", user.id).single(),
  ]);

  // Fetch faculty profile with all related data (admin bypasses RLS)
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

  // Resolve the auth user ID: prefer faculty.user_id (the actual auth UUID),
  // fall back to URL id (for profiles where id == user.id set by profile editor)
  const authUserId = faculty?.user_id || id;

  // Get faculty name + avatar from user_profiles using the auth user ID
  const { data: facultyUserProfile } = await admin
    .from("user_profiles")
    .select("full_name, avatar_url")
    .eq("id", authUserId)
    .single();

  const activeStatus = institutionUserProfile?.subscription_status;
  const institutionIsPro =
    (institutionUserProfile?.plan === "institution-pro" || institutionUserProfile?.plan === "institution-growth") &&
    (activeStatus === "active" || activeStatus === "trialing");

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

  // faculty_profiles.id (used for favorites, expertise, documents)
  const facultyId = faculty?.id ?? id;
  const facultyName = facultyUserProfile?.full_name || (faculty as any)?.full_name || "Docente";

  // Years of experience: profile editor saves years_experience; onboarding saves years_teaching
  const yearsExp: number = (faculty as any)?.years_teaching || (faculty as any)?.years_experience || 0;

  // Availability label
  const availKey = (faculty as any)?.availability || "";
  const availInfo = AVAIL_LABELS[availKey] || { label: "Estado no especificado", color: "text-gray-400" };

  // Documents: compute public URL from file_path
  const documents = ((faculty as any)?.documents || []).map((doc: any) => ({
    ...doc,
    displayUrl: doc.file_url ||
      (doc.file_path ? `${supabaseUrl}/storage/v1/object/public/faculty_documents/${doc.file_path}` : null),
    displayType: doc.doc_type || doc.type || "documento",
    displayName: doc.name || doc.file_name || "Documento",
  }));

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

  // Links: merge faculty_links table entries + direct profile fields (deduped)
  const profileLinks: { label: string; url: string }[] = [];
  if ((faculty as any)?.linkedin_url) profileLinks.push({ label: "LinkedIn", url: (faculty as any).linkedin_url });
  if ((faculty as any)?.website) profileLinks.push({ label: "Web personal", url: (faculty as any).website });
  if ((faculty as any)?.google_scholar_id) {
    profileLinks.push({
      label: "Google Scholar",
      url: `https://scholar.google.com/citations?user=${(faculty as any).google_scholar_id}`,
    });
  }
  if ((faculty as any)?.orcid_id) {
    profileLinks.push({
      label: "ORCID",
      url: `https://orcid.org/${(faculty as any).orcid_id}`,
    });
  }

  const fullName = facultyUserProfile?.full_name || (faculty as any)?.full_name || "Docente";
  const initials = fullName.substring(0, 2).toUpperCase();
  const cvDoc = documents.find((d: any) => d.displayType === 'cv' || d.displayType === 'CV');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm font-bold text-gray-400">
        <Link href={institution ? "/app/institution/search" : "/app/faculty/directory"} className="hover:text-talentia-blue transition-colors">Buscador</Link>
        <ChevronRight size={14} />
        <span className="text-navy">{fullName}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header Card */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            {/* Banner */}
            <div className="relative h-36 sm:h-48">
              {(faculty as any)?.banner_url ? (
                <img src={(faculty as any).banner_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#0D2240] via-[#1B4FD8] to-[#4F7FE8]" />
              )}
            </div>

            <div className="px-8 lg:px-12 pb-10 -mt-12 relative">
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
                      {(faculty as any)?.is_phd && (
                        <Badge className="bg-purple-50 text-purple-600 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          PhD
                        </Badge>
                      )}
                      {(faculty as any)?.verified === 'verified' && (
                        <Badge className="bg-green-50 text-green-600 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle2 size={12} className="mr-1" /> Verificado
                        </Badge>
                      )}
                      {(faculty as any)?.aneca_accreditation && (
                        <Badge className="bg-blue-50 text-talentia-blue border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          <Award size={12} className="mr-1" /> {(faculty as any).aneca_accreditation}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xl font-bold text-gray-500">{(faculty as any)?.headline}</p>
                    {(faculty as any)?.current_institution && (
                      <p className="text-sm font-bold text-talentia-blue flex items-center gap-1.5">
                        <Building2 size={14} /> {(faculty as any).current_institution}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-6">
                    {((faculty as any)?.city || (faculty as any)?.country) && (
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                        <MapPin size={16} className="text-talentia-blue" />
                        {(faculty as any)?.city ? `${(faculty as any).city}, ${(faculty as any).country}` : (faculty as any)?.country}
                      </div>
                    )}
                    {yearsExp > 0 && (
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                        <Briefcase size={16} className="text-talentia-blue" />
                        {yearsExp}+ años experiencia
                      </div>
                    )}
                    {Array.isArray((faculty as any)?.languages) && (faculty as any).languages.length > 0 && (
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                        <Languages size={16} className="text-talentia-blue" />
                        {(faculty as any).languages
                          .map((l: any) => typeof l === 'string' ? l : l.lang ?? l.language ?? '')
                          .filter(Boolean).join(', ')}
                      </div>
                    )}
                    {availKey && (
                      <div className={`flex items-center gap-2 text-sm font-bold ${availInfo.color}`}>
                        <Sparkles size={16} />
                        {availInfo.label}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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

            {/* ── PERFIL TAB ── */}
            <TabsContent value="profile" className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 lg:p-10 shadow-sm space-y-8">
                {/* Bio */}
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-navy flex items-center gap-2">
                    <FileText size={20} className="text-talentia-blue" /> Sobre mí
                  </h3>
                  <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-line">
                    {(faculty as any)?.bio || "No se ha proporcionado biografía."}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                  {/* Specialties */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Especialidades</h4>
                    <div className="space-y-4">
                      {(faculty as any)?.expertise?.length > 0 ? (
                        (faculty as any)?.expertise.map((exp: any) => (
                          <div key={exp.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-xs font-black text-talentia-blue uppercase tracking-widest mb-1">{exp.area}</p>
                            {exp.subarea && <p className="font-bold text-navy">{exp.subarea}</p>}
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
                      ) : Array.isArray((faculty as any)?.faculty_areas) && (faculty as any)?.faculty_areas.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {(faculty as any)?.faculty_areas.map((area: string) => (
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
                      {Array.isArray((faculty as any)?.degrees) && (faculty as any)?.degrees.length > 0 ? (
                        (faculty as any)?.degrees.map((deg: any, i: number) => (
                          <div key={i} className="flex gap-4 items-start">
                            <div className="w-10 h-10 bg-blue-50 text-talentia-blue rounded-xl flex items-center justify-center shrink-0">
                              <GraduationCap size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-navy">{deg.type || deg.title || deg.degree || "Titulación"}</p>
                              {deg.field && <p className="text-sm font-medium text-talentia-blue">{deg.field}</p>}
                              <p className="text-sm font-medium text-gray-500">
                                {deg.university || deg.institution || ""}
                                {deg.year && <span className="ml-2 text-gray-400">({deg.year})</span>}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (faculty as any)?.academic_level ? (
                        <div className="flex gap-4 items-start">
                          <div className="w-10 h-10 bg-blue-50 text-talentia-blue rounded-xl flex items-center justify-center shrink-0">
                            <GraduationCap size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-navy">{(faculty as any).academic_level}</p>
                            <p className="text-sm font-medium text-gray-500">Nivel académico máximo</p>
                          </div>
                        </div>
                      ) : null}

                      {(faculty as any)?.aneca_accreditation && (
                        <div className="flex gap-4 items-start">
                          <div className="w-10 h-10 bg-blue-50 text-talentia-blue rounded-xl flex items-center justify-center shrink-0">
                            <Award size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-navy">{(faculty as any).aneca_accreditation}</p>
                            <p className="text-sm font-medium text-gray-500 italic">Acreditación ANECA</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modalities */}
                {Array.isArray((faculty as any)?.modalities) && (faculty as any).modalities.length > 0 && (
                  <div className="pt-8 border-t border-gray-50 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Modalidades de enseñanza</h4>
                    <div className="flex flex-wrap gap-2">
                      {(faculty as any).modalities.map((mod: string) => (
                        <Badge key={mod} className="bg-gray-50 text-navy border border-gray-100 px-4 py-2 rounded-xl text-sm font-bold">
                          {mod}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Levels */}
                {Array.isArray((faculty as any)?.levels) && (faculty as any).levels.length > 0 && (
                  <div className="pt-8 border-t border-gray-50 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Niveles educativos</h4>
                    <div className="flex flex-wrap gap-2">
                      {(faculty as any).levels.map((level: string) => (
                        <Badge key={level} className="bg-gray-50 text-navy border border-gray-100 px-4 py-2 rounded-xl text-sm font-bold">
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── EXPERIENCIA TAB ── */}
            <TabsContent value="experience" className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 lg:p-10 shadow-sm space-y-8">
                <div className="grid md:grid-cols-2 gap-12">
                  {/* Left: Timeline */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-navy flex items-center gap-2">
                      <Briefcase size={20} className="text-talentia-blue" /> Trayectoria
                    </h3>
                    <div className="space-y-6">
                      {(faculty as any)?.current_institution && (
                        <div className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100">
                          <div className="absolute left-[-4px] top-2 w-2.5 h-2.5 rounded-full bg-energy-orange border-2 border-white shadow-sm"></div>
                          <div className="space-y-1">
                            <p className="text-sm font-black text-energy-orange uppercase tracking-widest">Institución Actual</p>
                            <p className="text-lg font-black text-navy">{(faculty as any).current_institution}</p>
                          </div>
                        </div>
                      )}

                      {yearsExp > 0 && (
                        <div className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100">
                          <div className="absolute left-[-4px] top-2 w-2.5 h-2.5 rounded-full bg-talentia-blue border-2 border-white shadow-sm"></div>
                          <div className="space-y-1">
                            <p className="text-sm font-black text-talentia-blue uppercase tracking-widest">Años de Experiencia</p>
                            <p className="text-2xl font-black text-navy">{yearsExp} años</p>
                            <p className="text-sm font-medium text-gray-500">En instituciones de educación superior.</p>
                          </div>
                        </div>
                      )}

                      {!yearsExp && !(faculty as any)?.current_institution && (
                        <p className="text-sm text-gray-400 italic">Sin datos de experiencia profesional.</p>
                      )}

                      {Array.isArray((faculty as any)?.institutions_taught) && (faculty as any).institutions_taught.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <p className="text-sm font-black text-gray-400 uppercase tracking-widest">También ha impartido en</p>
                          <div className="flex flex-wrap gap-2">
                            {(faculty as any).institutions_taught.map((inst: string, i: number) => (
                              <span key={i} className="text-xs font-bold px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-gray-600">
                                {inst}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Academic + Levels + Modalities */}
                  <div className="space-y-6">
                    {(faculty as any)?.academic_level && (
                      <div className="space-y-3">
                        <h3 className="text-xl font-black text-navy flex items-center gap-2">
                          <GraduationCap size={20} className="text-talentia-blue" /> Nivel Académico
                        </h3>
                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                          <p className="font-bold text-navy text-lg">{(faculty as any).academic_level}</p>
                        </div>
                      </div>
                    )}

                    {Array.isArray((faculty as any)?.levels) && (faculty as any).levels.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xl font-black text-navy flex items-center gap-2">
                          <BookOpen size={20} className="text-talentia-blue" /> Niveles Impartidos
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {(faculty as any).levels.map((level: string) => (
                            <Badge key={level} className="bg-gray-50 text-navy border border-gray-100 px-4 py-2 rounded-xl text-sm font-bold">
                              {level}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {Array.isArray((faculty as any)?.modalities) && (faculty as any).modalities.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xl font-black text-navy flex items-center gap-2">
                          <Globe size={20} className="text-talentia-blue" /> Modalidades
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {(faculty as any).modalities.map((mod: string) => (
                            <Badge key={mod} className="bg-white text-gray-600 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold capitalize">
                              {mod}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── EVIDENCIAS TAB ── */}
            <TabsContent value="evidence" className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 lg:p-10 shadow-sm space-y-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-navy flex items-center gap-2">
                    <BookOpen size={20} className="text-talentia-blue" /> Investigación y Documentos
                  </h3>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Research IDs & Publications */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Publicaciones e Identidad</h4>
                      <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
                        {(faculty as any)?.google_scholar_id && (
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-500 uppercase">Google Scholar</p>
                            <a
                              href={`https://scholar.google.com/citations?user=${(faculty as any).google_scholar_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-talentia-blue hover:underline break-all text-sm flex items-center gap-1"
                            >
                              {(faculty as any).google_scholar_id} <ExternalLink size={12} />
                            </a>
                          </div>
                        )}
                        {(faculty as any)?.orcid_id && (
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-500 uppercase">ORCID</p>
                            <a
                              href={`https://orcid.org/${(faculty as any).orcid_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-talentia-blue hover:underline break-all text-sm flex items-center gap-1"
                            >
                              {(faculty as any).orcid_id} <ExternalLink size={12} />
                            </a>
                          </div>
                        )}
                        {!(faculty as any)?.google_scholar_id && !(faculty as any)?.orcid_id && (
                          <p className="text-sm text-gray-400 italic">Sin perfiles de investigación enlazados.</p>
                        )}
                        {(faculty as any)?.research_publications && (
                          <div className="space-y-1 pt-3 border-t border-blue-100">
                            <p className="text-xs font-bold text-gray-500 uppercase">Publicaciones Destacadas</p>
                            <p className="text-sm font-medium text-gray-600 leading-relaxed whitespace-pre-line">
                              {(faculty as any).research_publications}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Archivos Adjuntos</h4>
                      <div className="space-y-3">
                        {documents.length > 0 ? (
                          documents.map((doc: any) => (
                            <div key={doc.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-talentia-blue transition-colors group">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-blue-50 group-hover:text-talentia-blue transition-colors">
                                  <FileText size={18} />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-sm font-bold text-navy">{doc.displayName}</p>
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{doc.displayType}</p>
                                </div>
                              </div>
                              {doc.displayUrl && (
                                <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 text-gray-400 hover:text-talentia-blue" asChild>
                                  <a href={doc.displayUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink size={16} />
                                  </a>
                                </Button>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400 italic">No hay documentos públicos.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── DISPONIBILIDAD TAB ── */}
            <TabsContent value="availability" className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 lg:p-10 shadow-sm space-y-8">
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-navy flex items-center gap-2">
                      <Calendar size={20} className="text-talentia-blue" /> Preferencias
                    </h3>
                    <div className="space-y-6">
                      {availKey && (
                        <div className="flex gap-4 items-start">
                          <div className="w-10 h-10 bg-orange-50 text-energy-orange rounded-xl flex items-center justify-center shrink-0">
                            <Sparkles size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Estado de disponibilidad</p>
                            <p className={`font-bold text-lg ${availInfo.color}`}>{availInfo.label}</p>
                          </div>
                        </div>
                      )}

                      {Array.isArray((faculty as any)?.modalities) && (faculty as any).modalities.length > 0 && (
                        <div className="flex gap-4 items-start">
                          <div className="w-10 h-10 bg-blue-50 text-talentia-blue rounded-xl flex items-center justify-center shrink-0">
                            <Globe size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Modalidad preferida</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {(faculty as any).modalities.map((mod: string) => (
                                <Badge key={mod} className="bg-white text-gray-600 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold capitalize">
                                  {mod}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {Array.isArray((faculty as any)?.levels) && (faculty as any).levels.length > 0 && (
                        <div className="flex gap-4 items-start">
                          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                            <GraduationCap size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Niveles educativos</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {(faculty as any).levels.map((level: string) => (
                                <Badge key={level} className="bg-gray-50 text-navy border border-gray-100 px-3 py-1 rounded-full text-xs font-bold">
                                  {level}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {!availKey && !(faculty as any)?.modalities?.length && !(faculty as any)?.levels?.length && (
                        <p className="text-sm text-gray-400 italic">Sin datos de disponibilidad especificados.</p>
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
                        El docente está interesado en colaboraciones académicas para el próximo semestre/cuatrimestre.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {institution && institutionIsPro ? (
            <div className="bg-navy p-8 rounded-[2.5rem] shadow-2xl text-white space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black">¿Interesado?</h3>
                <p className="text-blue-200 font-medium">Inicia una conversación para explorar una colaboración académica.</p>
              </div>

              <div className="flex flex-col gap-4">
                <ContactModalWrapper
                  facultyId={facultyId}
                  facultyName={facultyName}
                  institutionId={institution.id}
                />

                {(faculty as any)?.contact_whatsapp && (
                  <a
                    href={`https://wa.me/${(faculty as any).contact_whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bd5b] text-white font-bold h-12 rounded-xl text-sm transition-colors"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                )}

                <div className="flex gap-4">
                  <FavoriteButton
                    facultyId={facultyId}
                    institutionId={institution.id}
                    initialIsFavorite={isFavorite}
                  />

                  {cvDoc?.displayUrl && (
                    <Button variant="outline" asChild className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold h-12 rounded-xl">
                      <a href={cvDoc.displayUrl} target="_blank" rel="noopener noreferrer">Descargar CV</a>
                    </Button>
                  )}
                </div>
              </div>

              {(faculty as any)?.contact_email && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-2">Contacto directo</p>
                  <a href={`mailto:${(faculty as any).contact_email}`} className="text-sm font-bold text-white hover:text-blue-200 transition-colors break-all">
                    {(faculty as any).contact_email}
                  </a>
                </div>
              )}

              {(faculty as any)?.phone && (
                <div className="pt-4 border-t border-white/10 flex items-center gap-2">
                  <Phone size={14} className="text-blue-200 shrink-0" />
                  <a href={`tel:${(faculty as any).phone}`} className="text-sm font-bold text-white hover:text-blue-200 transition-colors">
                    {(faculty as any).phone}
                  </a>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-blue-200 uppercase tracking-widest">
                <span>Visitas: {(faculty as any)?.view_count ?? 0}</span>
                {availKey && <span>{availInfo.label}</span>}
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

          {/* Links & Networks */}
          {(profileLinks.length > 0 || (faculty as any)?.links?.length > 0) && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <h4 className="text-sm font-black text-navy uppercase tracking-widest">Enlaces y Redes</h4>
              <div className="space-y-3">
                {/* Dynamic links from faculty_links table */}
                {(faculty as any)?.links?.map((link: any) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-50 hover:border-talentia-blue transition-all group"
                  >
                    <p className="text-sm font-bold text-navy group-hover:text-talentia-blue transition-colors capitalize">{link.platform || link.label}</p>
                    <ExternalLink size={14} className="text-gray-300 group-hover:text-talentia-blue transition-colors" />
                  </a>
                ))}
                {/* Profile field links */}
                {profileLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-50 hover:border-talentia-blue transition-all group"
                  >
                    <p className="text-sm font-bold text-navy group-hover:text-talentia-blue transition-colors">{link.label}</p>
                    <ExternalLink size={14} className="text-gray-300 group-hover:text-talentia-blue transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
