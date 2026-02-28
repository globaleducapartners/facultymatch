import { createClient } from "@/lib/supabase-server";
import { 
  CheckCircle2, 
  ShieldCheck, 
  Mail, 
  Award, 
  ChevronRight, 
  Plus, 
  Building2,
  Clock,
  ArrowRight
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function EducatorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: facultyProfile } = await supabase
    .from("faculty_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: expertise } = await supabase
    .from("faculty_expertise")
    .select("*")
    .eq("faculty_id", facultyProfile?.id);

  const { data: documents } = await supabase
    .from("faculty_documents")
    .select("*")
    .eq("faculty_id", facultyProfile?.id);

  const { data: blockedCount } = await supabase
    .from("visibility_rules")
    .select("*", { count: "exact", head: true })
    .eq("faculty_id", facultyProfile?.id)
    .eq("rule", "block");

  const { data: recentRequests } = await supabase
    .from("contacts")
    .select("*, institution:institutions(name, country)")
    .eq("faculty_id", facultyProfile?.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const profileScore = facultyProfile?.profile_score || 0;
  
  // Checklist logic
    const checklist = [
      { label: "Añadir áreas de conocimiento", completed: (expertise?.length || 0) > 0 },
      { label: "Subir curriculum", completed: (documents?.length || 0) > 0 },
      { label: "Añadir disponibilidad", completed: facultyProfile?.availability !== 'open' }, 
      { label: "Configurar visibilidad", completed: facultyProfile?.visibility !== 'public' },
      { label: "Acreditación ANECA", completed: !!facultyProfile?.aneca_accreditation },
      { label: "Publicaciones & ORCID", completed: !!facultyProfile?.research_publications },
    ];


  const completedCount = checklist.filter(i => i.completed).length;
  const calculatedProgress = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">Bienvenido de nuevo, {facultyProfile?.full_name?.split(' ')[0]}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-1.5"><Building2 size={16} /> 50,000+</span>
            <span className="flex items-center gap-1.5"><Building2 size={16} /> 1,200+ Instituciones</span>
            <span className="flex items-center gap-1.5"><Globe size={16} /> 90+ Países</span>
            <span className="flex items-center gap-1.5"><Award size={16} /> 15,000+ Programas</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bloque A - Estado del perfil */}
        <Card className="lg:col-span-8 border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-navy">
                Estado del perfil
              </CardTitle>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-gray-100"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={175.9}
                    strokeDashoffset={175.9 - (175.9 * calculatedProgress) / 100}
                    className="text-talentia-blue transition-all duration-1000"
                  />
                </svg>
                <span className="absolute text-sm font-bold text-navy">{calculatedProgress}%</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {checklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm font-medium">
                  {item.completed ? (
                    <CheckCircle2 size={18} className="text-tech-cyan" />
                  ) : (
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-200" />
                  )}
                  <span className={item.completed ? "text-gray-900" : "text-gray-500"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
              <Button asChild className="w-full md:w-auto bg-energy-orange hover:bg-orange-600 text-white font-bold rounded-xl h-12 px-8 transition-all hover:scale-[1.02]">
                <Link href="/dashboard/educator/profile">Completar perfil</Link>
              </Button>
              <p className="text-xs text-gray-400 font-medium">
                Tú decides qué instituciones pueden verte.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bloque B - Visibilidad & Protección */}
        <Card className="lg:col-span-4 border-none shadow-sm rounded-2xl bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
              <ShieldCheck className="text-talentia-blue" size={20} />
              Visibilidad & Protección
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-talentia-blue" />
                  <span className="text-sm font-bold text-navy capitalize">{facultyProfile?.visibility?.replace('_', ' ') || 'Público'}</span>
                </div>
                <Badge variant="outline" className="bg-white text-[10px] font-bold uppercase tracking-wider border-blue-200 text-talentia-blue">Activo</Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">Instituciones bloqueadas:</span>
                <span className="font-bold text-navy">{blockedCount || 0}</span>
              </div>

              <div className="space-y-3 pt-2">
                <Button asChild variant="default" className="w-full bg-talentia-blue hover:bg-blue-700 text-white font-bold rounded-xl h-11">
                  <Link href="/dashboard/educator/privacy">Gestionar visibilidad</Link>
                </Button>
                <Button variant="outline" className="w-full border-gray-200 text-gray-600 font-bold rounded-xl h-11 hover:bg-gray-50">
                  <Plus size={18} className="mr-2" />
                  Añadir
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-medium text-center italic">
              Tú decides qué instituciones pueden verte.
            </p>
          </CardContent>
        </Card>

        {/* Bloque C - Solicitudes recientes */}
        <Card className="lg:col-span-8 border-none shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold text-navy">Solicitudes recientes</CardTitle>
            <Button variant="link" asChild className="text-talentia-blue font-bold text-sm h-auto p-0 hover:no-underline">
              <Link href="/dashboard/educator/requests" className="flex items-center gap-1">
                Ver todas <ChevronRight size={16} />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentRequests && recentRequests.length > 0 ? (
              <div className="divide-y divide-gray-50">
                  {recentRequests.map((req: { 
                    id: string; 
                    created_at: string; 
                    message?: string; 
                    status?: string;
                    institution?: { 
                      name?: string; 
                      country?: string;
                    } 
                  }) => (
                    <div key={req.id} className="py-4 flex items-center justify-between group cursor-pointer hover:bg-gray-50/50 -mx-6 px-6 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-100 p-2.5 rounded-xl group-hover:bg-white transition-colors">
                          <Building2 size={20} className="text-gray-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-navy">{req.institution?.name}</h4>
                          <p className="text-xs text-gray-500 font-medium">{req.message?.substring(0, 30)}... · {new Date(req.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-orange-50 text-orange-600 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 border-orange-100">
                        {req.status === 'sent' ? 'Pendiente' : req.status}
                      </Badge>
                    </div>
                  ))}

              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail size={24} className="text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm font-medium">No has recibido solicitudes todavía.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bloque D - Estado de verificación */}
        <Card className="lg:col-span-4 border-none shadow-sm rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-lg font-bold text-navy">Estado de verificación</CardTitle>
              <Badge className="bg-gray-100 text-gray-500 font-bold border-none capitalize">{facultyProfile?.verified || 'Básico'}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 flex-1 flex flex-col">
            <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3 text-sm font-medium">
                <CheckCircle2 size={18} className="text-tech-cyan" />
                <span className="text-gray-900">Básico</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                {(documents?.length || 0) > 0 ? (
                  <CheckCircle2 size={18} className="text-tech-cyan" />
                ) : (
                  <ArrowRight size={18} className="text-talentia-blue" />
                )}
                <span className={(documents?.length || 0) > 0 ? "text-gray-900" : "text-gray-500"}>Subir CV</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <Plus size={18} className="text-gray-300" />
                <span className="text-gray-400 italic">Añadir prueba de doctorado (si aplica)</span>
              </div>
            </div>

            <div className="pt-2 mt-auto">
              <Button asChild className="w-full bg-talentia-blue hover:bg-blue-700 text-white font-bold rounded-xl h-11 mb-3">
                <Link href="/dashboard/educator/verification">Solicitar verificación</Link>
              </Button>
              <p className="text-[10px] text-gray-400 font-medium text-center">
                Aumenta la visibilidad y confianza institucional.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Logos footer placeholder */}
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 py-8 opacity-20 grayscale filter pointer-events-none">
        <span className="font-bold text-xl text-navy">Universidad Global</span>
        <span className="font-bold text-xl text-navy">Tech University</span>
        <span className="font-bold text-xl text-navy">Business School</span>
        <span className="font-bold text-xl text-navy">European University</span>
      </div>
    </div>
  );
}

function Globe({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
