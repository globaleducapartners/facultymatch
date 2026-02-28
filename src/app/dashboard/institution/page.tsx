import { createClient } from "@/lib/supabase-server";
import { EducatorCard } from "@/components/dashboard/EducatorCard";
import { Search, UserCircle, Briefcase, Filter, Star, ChevronRight, GraduationCap, Globe, MapPin, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function InstitutionDashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const query = params.query as string || "";
  const area = params.area as string || "";

  const { data: { user } } = await supabase.auth.getUser();

  const { data: institution } = await supabase
    .from("institutions")
    .select("*")
    .eq("user_id", user!.id)
    .single();

    // Search logic
    let educatorQuery = supabase
      .from("faculty_profiles")
      .select(`
        *,
        expertise:faculty_expertise(*)
      `);

    // Visibility filter: Exclude profiles that have blocked this institution
    if (institution?.id) {
      educatorQuery = educatorQuery.not('hidden_from_institutions', 'cs', `{${institution.id}}`);
    }


  if (query) {
    educatorQuery = educatorQuery.or(`full_name.ilike.%${query}%,headline.ilike.%${query}%,bio.ilike.%${query}%`);
  }

  const { data: educators } = await educatorQuery.limit(20);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">Buscar docentes</h1>
          <p className="text-gray-500 font-medium">Encuentra el profesorado adecuado para tus programas.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 text-talentia-blue border-blue-100 font-bold px-4 py-1.5 rounded-full">
            Plan Starter: 10 contactos/mes
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Filters */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-2 text-navy">
              <Filter size={20} className="text-talentia-blue" />
              <h2 className="font-bold">Filtros académicos</h2>
            </div>
            
            <form action="/dashboard/institution" method="get" className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Búsqueda rápida</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    name="query"
                    defaultValue={query}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all text-sm font-medium"
                    placeholder="Nombre, cargo, bio..."
                  />
                </div>
              </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Área Académica</label>
                  <select 
                    name="area"
                    defaultValue={area}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all text-sm font-medium appearance-none"
                  >
                    <option value="">Todas las áreas</option>
                    <option value="business">Business & Management</option>
                    <option value="tech">Ingeniería & Tech</option>
                    <option value="health">Salud & Ciencias</option>
                    <option value="humanities">Artes & Humanidades</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Acreditación ANECA</label>
                  <select 
                    name="aneca"
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all text-sm font-medium appearance-none"
                  >
                    <option value="">Cualquier acreditación</option>
                    <option value="ayudante">Ayudante Doctor</option>
                    <option value="contratado">Contratado Doctor</option>
                    <option value="titular">Titular de Universidad</option>
                    <option value="catedratico">Catedrático</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Docencia</label>

                <div className="space-y-2">
                  {['Online', 'Presencial', 'Híbrida'].map((m) => (
                    <label key={m} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="rounded border-gray-300 text-talentia-blue focus:ring-talentia-blue" />
                      <span className="text-sm font-medium text-gray-600 group-hover:text-navy transition-colors">{m}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full bg-talentia-blue hover:bg-blue-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-blue-100 transition-all">
                Aplicar filtros
              </Button>
              <Button variant="ghost" className="w-full text-gray-400 font-bold text-xs uppercase tracking-widest h-10">
                Resetear filtros
              </Button>
            </form>
          </div>

          <div className="bg-navy rounded-2xl p-6 text-white space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-tech-cyan">
              <GraduationCap size={20} />
              <h3 className="font-bold">Plan Institucional</h3>
            </div>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              Desbloquea filtros avanzados por publicaciones, experiencia docente certificada y acceso a perfiles premium.
            </p>
            <Button className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
              Mejorar plan
            </Button>
          </div>
        </aside>

        {/* Right Content: Educator List */}
        <div className="lg:col-span-9 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy">{educators?.length || 0} Docentes encontrados</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ordenar por:</span>
              <select className="text-xs font-bold text-navy bg-transparent outline-none cursor-pointer">
                <option>Relevancia</option>
                <option>Score de perfil</option>
                <option>Verificados primero</option>
              </select>
            </div>
          </div>

            <div className="grid gap-6">
              {educators && educators.length > 0 ? (
                educators.map((educator) => (
                  <EducatorCard 
                    key={educator.id} 
                    educator={educator} 
                    institutionId={institution?.id} 
                  />
                ))
              ) : (

              <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center text-center">
                <div className="bg-gray-50 p-6 rounded-full text-gray-200 mb-6">
                  <Search size={48} />
                </div>
                <h3 className="text-xl font-bold text-navy mb-2">No se han encontrado docentes</h3>
                <p className="text-gray-500 max-w-xs mx-auto font-medium">
                  Prueba a ajustar los filtros de búsqueda o explora otras áreas de conocimiento.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
