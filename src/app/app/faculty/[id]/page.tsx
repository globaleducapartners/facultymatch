import { createClient } from "@/lib/supabase-server";
import { notFound, redirect } from "next/navigation";
import { 
  GraduationCap, Globe, MapPin, Award, Star, Mail, 
  Briefcase, BookOpen, ExternalLink, FileText, 
  Calendar, CheckCircle2, ShieldCheck, ChevronRight,
  Languages, Building2, Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toggleFavorite } from "@/app/auth/actions";
import Link from "next/link";
import { ContactModalWrapper } from "@/components/dashboard/ContactModalWrapper";
import { FavoriteButton } from "@/components/dashboard/FavoriteButton";

export default async function FacultyProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get current institution profile
  const { data: institution } = await supabase
    .from("institutions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Fetch faculty profile with related data
  // RLS will automatically filter this out if blocked
  const { data: faculty, error } = await supabase
    .from("faculty_profiles")
    .select(`
      *,
      expertise:faculty_expertise(*),
      documents:faculty_documents(*),
      links:faculty_links(*)
    `)
    .eq("id", id)
    .single();

  if (error || !faculty) {
    // If not found, it might be blocked or hidden
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="bg-red-50 p-6 rounded-full text-red-500">
          <ShieldCheck size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-navy">Perfil no disponible</h1>
          <p className="text-gray-500 max-w-md">
            Este perfil no está disponible en este momento. Puede que el docente haya cambiado su visibilidad o no tengas permisos para verlo.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-xl font-bold">
          <Link href="/app/institution">Volver al buscador</Link>
        </Button>
      </div>
    );
  }

  // Check if favorite
  let isFavorite = false;
  if (institution) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("id")
      .eq("institution_id", institution.id)
      .eq("faculty_id", faculty.id)
      .single();
    isFavorite = !!fav;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm font-bold text-gray-400">
        <Link href="/app/institution" className="hover:text-talentia-blue transition-colors">Buscador</Link>
        <ChevronRight size={14} />
        <span className="text-navy">Perfil de {faculty.full_name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header Card */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 lg:p-12 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10"></div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-24 h-24 bg-talentia-blue text-white rounded-3xl flex items-center justify-center text-3xl font-black shrink-0 shadow-xl shadow-blue-100">
                {faculty.full_name?.substring(0, 2).toUpperCase()}
              </div>
              
              <div className="space-y-4 flex-1">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-black text-navy">{faculty.full_name}</h1>
                    {faculty.verified === 'verified' && (
                      <Badge className="bg-green-50 text-green-600 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 size={12} className="mr-1" /> Verificado
                      </Badge>
                    )}
                    {faculty.aneca_accreditation && (
                      <Badge className="bg-blue-50 text-talentia-blue border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <Award size={12} className="mr-1" /> {faculty.aneca_accreditation}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xl font-bold text-gray-500">{faculty.headline}</p>
                </div>

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                    <MapPin size={16} className="text-talentia-blue" />
                    {faculty.city ? `${faculty.city}, ${faculty.country}` : faculty.country}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                    <Briefcase size={16} className="text-talentia-blue" />
                    {faculty.years_teaching}+ años docencia
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                    <Languages size={16} className="text-talentia-blue" />
                    {faculty.languages?.join(', ')}
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

            <TabsContent value="profile" className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 lg:p-10 shadow-sm space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-navy flex items-center gap-2">
                    <FileText size={20} className="text-talentia-blue" /> Sobre mí
                  </h3>
                  <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-line">
                    {faculty.bio || "No se ha proporcionado biografía."}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Especialidades</h4>
                    <div className="space-y-4">
                      {faculty.expertise?.length > 0 ? (
                        faculty.expertise.map((exp: any) => (
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
                      ) : (
                        <p className="text-sm text-gray-400 font-medium italic">No se han especificado áreas.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Formación y Acreditación</h4>
                    <div className="space-y-4">
                      <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 bg-blue-50 text-talentia-blue rounded-xl flex items-center justify-center shrink-0">
                          <GraduationCap size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-navy">{faculty.degree_level || "Grado Académico"}</p>
                          <p className="text-sm font-medium text-gray-500">Nivel de estudios superior</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 bg-blue-50 text-talentia-blue rounded-xl flex items-center justify-center shrink-0">
                          <Award size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-navy">{faculty.aneca_accreditation || "Sin acreditar ANECA"}</p>
                          <p className="text-sm font-medium text-gray-500 italic">Acreditación para docencia en España</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="experience" className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 lg:p-10 shadow-sm space-y-8">
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-navy flex items-center gap-2">
                      <Briefcase size={20} className="text-talentia-blue" /> Trayectoria
                    </h3>
                    <div className="space-y-6">
                      <div className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100">
                        <div className="absolute left-[-4px] top-2 w-2.5 h-2.5 rounded-full bg-talentia-blue border-2 border-white shadow-sm"></div>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-talentia-blue uppercase tracking-widest">Experiencia Docente</p>
                          <p className="text-2xl font-black text-navy">{faculty.years_teaching} años</p>
                          <p className="text-sm font-medium text-gray-500">En instituciones de educación superior.</p>
                        </div>
                      </div>

                      <div className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100">
                        <div className="absolute left-[-4px] top-2 w-2.5 h-2.5 rounded-full bg-tech-cyan border-2 border-white shadow-sm"></div>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-tech-cyan uppercase tracking-widest">Experiencia Profesional</p>
                          <p className="text-2xl font-black text-navy">{faculty.years_professional} años</p>
                          <p className="text-sm font-medium text-gray-500">En sectores relacionados con su especialidad.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-navy flex items-center gap-2">
                      <Building2 size={20} className="text-talentia-blue" /> Niveles Impartidos
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {faculty.levels?.map((level: string) => (
                        <Badge key={level} className="bg-gray-50 text-navy border border-gray-100 px-4 py-2 rounded-xl text-sm font-bold">
                          {level}
                        </Badge>
                      )) || <p className="text-sm text-gray-400 italic">No especificado</p>}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="evidence" className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 lg:p-10 shadow-sm space-y-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-navy flex items-center gap-2">
                    <BookOpen size={20} className="text-talentia-blue" /> Investigación y Documentos
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Publicaciones y ORCID</h4>
                      <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-500 uppercase">Google Scholar ID</p>
                          <p className="font-bold text-navy break-all">{faculty.google_scholar_id || "No proporcionado"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-500 uppercase">Investigación Destacada</p>
                          <p className="text-sm font-medium text-gray-600 line-clamp-3">
                            {faculty.research_publications || "No se han listado publicaciones."}
                          </p>
                        </div>
                        {faculty.google_scholar_id && (
                          <Button variant="link" className="p-0 h-auto text-talentia-blue font-bold text-xs" asChild>
                            <a href={`https://scholar.google.com/citations?user=${faculty.google_scholar_id}`} target="_blank" rel="noopener noreferrer">
                              Ver perfil en Scholar <ExternalLink size={12} className="ml-1" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Archivos Adjuntos</h4>
                      <div className="space-y-3">
                        {faculty.documents?.map((doc: any) => (
                          <div key={doc.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-talentia-blue transition-colors group">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-blue-50 group-hover:text-talentia-blue transition-colors">
                                <FileText size={18} />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-sm font-bold text-navy">{doc.name}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{doc.type}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 text-gray-400 hover:text-talentia-blue" asChild>
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink size={16} />
                              </a>
                            </Button>
                          </div>
                        )) || <p className="text-sm text-gray-400 italic">No hay documentos públicos.</p>}
                        
                        {/* Placeholder for CV if exists in faculty profile but not in documents table yet */}
                        {faculty.cv_url && (
                          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-talentia-blue transition-colors group">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-blue-50 group-hover:text-talentia-blue transition-colors">
                                <FileText size={18} />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-sm font-bold text-navy">Curriculum Vitae</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PDF</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 text-gray-400 hover:text-talentia-blue" asChild>
                              <a href={faculty.cv_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink size={16} />
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="availability" className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 lg:p-10 shadow-sm space-y-8">
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-navy flex items-center gap-2">
                      <Calendar size={20} className="text-talentia-blue" /> Preferencias
                    </h3>
                    <div className="space-y-6">
                      <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 bg-orange-50 text-energy-orange rounded-xl flex items-center justify-center shrink-0">
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Estado de disponibilidad</p>
                          <p className="font-bold text-navy text-lg">{faculty.availability === 'available' ? 'Abierto a propuestas' : faculty.availability === 'limited' ? 'Disponibilidad limitada' : 'Solo por invitación'}</p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 bg-blue-50 text-talentia-blue rounded-xl flex items-center justify-center shrink-0">
                          <Globe size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Modalidad preferida</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {faculty.modalities?.map((mod: string) => (
                              <Badge key={mod} className="bg-white text-gray-600 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold capitalize">
                                {mod}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
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

        {/* Sidebar Actions (Fixed position on large screens) */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {institution ? (
            <div className="bg-navy p-8 rounded-[2.5rem] shadow-2xl text-white space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black">¿Interesado?</h3>
                <p className="text-blue-200 font-medium">Inicia una conversación para explorar una colaboración académica.</p>
              </div>

              <div className="flex flex-col gap-4">
                <ContactModalWrapper 
                  facultyId={faculty.id}
                  facultyName={faculty.full_name}
                  institutionId={institution.id}
                />
                
                <div className="flex gap-4">
                  <FavoriteButton 
                    facultyId={faculty.id}
                    institutionId={institution.id}
                    initialIsFavorite={isFavorite}
                  />
                  
                  <Button variant="outline" className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold h-12 rounded-xl">
                    Descargar CV
                  </Button>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-bold text-blue-200 uppercase tracking-widest">
                <span>Visitas totales: 12</span>
                  <span>Respuesta: &lt; 24h</span>
              </div>
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

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h4 className="text-sm font-black text-navy uppercase tracking-widest">Enlaces y Redes</h4>
            <div className="space-y-4">
              {faculty.links?.map((link: any) => (
                <a 
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-50 hover:border-talentia-blue transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-navy group-hover:text-talentia-blue transition-colors capitalize">{link.platform}</p>
                  </div>
                  <ExternalLink size={14} className="text-gray-300 group-hover:text-talentia-blue transition-colors" />
                </a>
              ))}
              
              {/* Fallback if no specific links table entry but profile fields exist */}
              {faculty.linkedin_url && (
                <a 
                  href={faculty.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-50 hover:border-talentia-blue transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-navy group-hover:text-talentia-blue transition-colors">LinkedIn</p>
                  </div>
                  <ExternalLink size={14} className="text-gray-300 group-hover:text-talentia-blue transition-colors" />
                </a>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
