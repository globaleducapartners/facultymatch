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
  ArrowRight,
  Languages,
  History,
  Target,
  GraduationCap,
  Eye,
  EyeOff,
  User,
  MapPin,
  ExternalLink
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
    .eq("id", user.id)
    .single();

  const { data: languages } = await supabase.from("faculty_languages").select("*").eq("faculty_id", user.id);
  const { data: history } = await supabase.from("faculty_teaching_history").select("*").eq("faculty_id", user.id);
  const { data: areas } = await supabase.from("faculty_areas").select("*").eq("faculty_id", user.id);
  const { data: levels } = await supabase.from("faculty_levels").select("*").eq("faculty_id", user.id);
  
  const { data: recentRequests } = await supabase
    .from("contacts")
    .select("*, institution:institutions(name, country)")
    .eq("faculty_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  // Checklist logic enriched
  const checklist = [
    { id: 'info', label: "Titular y Ubicación", completed: !!facultyProfile?.headline && !!facultyProfile?.location },
    { id: 'areas', label: "Áreas / Facultades", completed: (areas?.length || 0) > 0 },
    { id: 'levels', label: "Niveles Docentes", completed: (levels?.length || 0) > 0 },
    { id: 'langs', label: "Idiomas", completed: (languages?.length || 0) > 0 },
    { id: 'history', label: "Historial Docente", completed: (history?.length || 0) > 0 },
    { id: 'bio', label: "Biografía Profesional", completed: !!facultyProfile?.bio },
  ];

  const completedCount = checklist.filter(i => i.completed).length;
  const calculatedProgress = Math.round((completedCount / checklist.length) * 100);
  const isPublished = calculatedProgress >= 80;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-navy tracking-tight">
            Hola, {profile?.full_name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 font-medium mt-1">Gestiona tu presencia académica y recibe oportunidades.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="bg-talentia-blue hover:bg-navy text-white font-black rounded-2xl h-14 px-8 shadow-xl shadow-blue-100 transition-all">
            <Link href="/onboarding" className="flex items-center gap-2">
              <User size={20} />
              Editar Perfil
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Status & Preview Card */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="pb-4 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-navy">Estado de Completitud</CardTitle>
                  <CardDescription className="font-medium">Completa el 100% para maximizar visibilidad.</CardDescription>
                </div>
                <div className="flex flex-col items-end">
                  <Badge className={`font-black px-4 py-1.5 rounded-full border-none ${isPublished ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {isPublished ? 'PERFIL PUBLICADO' : 'PERFIL EN BORRADOR'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 w-full space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-black text-navy uppercase tracking-widest">
                      <span>Progreso Total</span>
                      <span>{calculatedProgress}%</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-talentia-blue transition-all duration-1000 ease-out"
                        style={{ width: `${calculatedProgress}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {checklist.map((item) => (
                      <div key={item.id} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${item.completed ? 'bg-white border-gray-100' : 'bg-gray-50/50 border-transparent opacity-60'}`}>
                        {item.completed ? (
                          <div className="bg-green-100 p-1 rounded-full"><CheckCircle2 size={16} className="text-green-600" /></div>
                        ) : (
                          <div className="bg-gray-200 p-1 rounded-full"><Plus size={16} className="text-gray-400" /></div>
                        )}
                        <span className={`text-sm font-bold ${item.completed ? 'text-navy' : 'text-gray-400'}`}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Preview Mockup */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-black text-navy flex items-center gap-2">
                <Eye size={22} className="text-talentia-blue" />
                Vista previa de tarjeta
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="max-w-md mx-auto p-6 rounded-3xl border-2 border-gray-100 bg-white shadow-lg space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-talentia-blue/10 flex items-center justify-center">
                    <User size={32} className="text-talentia-blue" />
                  </div>
                  <div>
                    <h3 className="font-black text-navy text-lg leading-tight">{profile?.full_name}</h3>
                    <p className="text-sm font-bold text-talentia-blue truncate max-w-[200px]">{facultyProfile?.headline || 'PhD en Especialidad Académica'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {areas?.slice(0, 2).map(a => (
                    <Badge key={a.id} variant="secondary" className="bg-blue-50 text-talentia-blue font-bold text-[10px] uppercase border-none">{a.area}</Badge>
                  ))}
                  {areas && areas.length > 2 && <span className="text-[10px] font-bold text-gray-400">+{areas.length - 2} más</span>}
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {facultyProfile?.location || 'Mundo'}</span>
                  <span className="flex items-center gap-1"><GraduationCap size={12} /> {levels?.[0]?.level || 'Nivel...'}</span>
                </div>
                <Button variant="ghost" className="w-full justify-between text-talentia-blue font-black hover:bg-blue-50 rounded-xl group">
                  Ver Perfil Completo
                  <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Blocks */}
        <div className="lg:col-span-4 space-y-8">
          {/* Visibilidad Card */}
          <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-black text-navy flex items-center gap-2">
                <ShieldCheck className="text-talentia-blue" size={20} />
                Privacidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${facultyProfile?.visibility === 'public' ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  {facultyProfile?.visibility === 'public' ? (
                    <Eye size={20} className="text-talentia-blue" />
                  ) : (
                    <EyeOff size={20} className="text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-black text-navy capitalize">{facultyProfile?.visibility === 'public' ? 'Pública' : 'Privada'}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Visibilidad actual</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" asChild>
                  <Link href="/onboarding"><Plus size={16} /></Link>
                </Button>
              </div>

              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-black text-navy uppercase tracking-widest">Resumen de Datos</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50/50 rounded-xl border border-transparent">
                    <p className="text-xl font-black text-navy">{languages?.length || 0}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Idiomas</p>
                  </div>
                  <div className="p-3 bg-gray-50/50 rounded-xl border border-transparent">
                    <p className="text-xl font-black text-navy">{history?.length || 0}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Cargos</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Requests Card */}
          <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-black text-navy">Oportunidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentRequests && recentRequests.length > 0 ? (
                recentRequests.map(req => (
                  <div key={req.id} className="p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all cursor-pointer group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-talentia-blue uppercase tracking-widest">Nueva Solicitud</span>
                      <span className="text-[10px] font-bold text-gray-400">{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                    <h5 className="font-black text-navy text-sm leading-tight group-hover:text-talentia-blue transition-colors">{req.institution?.name}</h5>
                    <p className="text-xs text-gray-500 font-medium mt-1 truncate">{req.message}</p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center bg-gray-50/30 rounded-2xl border border-dashed border-gray-100">
                  <Mail className="mx-auto text-gray-300 mb-2" size={24} />
                  <p className="text-xs font-bold text-gray-400 px-4">Recibirás notificaciones cuando una institución quiera contactarte.</p>
                </div>
              )}
              <Button variant="outline" className="w-full border-gray-200 text-gray-600 font-black rounded-2xl h-12" asChild>
                <Link href="/app/faculty/requests">Ver Todo</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
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
