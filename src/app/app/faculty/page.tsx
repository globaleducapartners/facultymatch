import { createClient } from "@/lib/supabase-server";
import {
  CheckCircle2,
  ShieldCheck,
  Mail,
  Plus,
  Building2,
  ArrowRight,
  Target,
  GraduationCap,
  Eye,
  EyeOff,
  User,
  MapPin,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";
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

  // Merge faculty_profiles with user_metadata as fallback
  const userMeta = user.user_metadata || {};
  const verificationStatus: string = profile?.verification_status || "pending";
  const verificationNotes: string | null = profile?.verification_notes || null;

  // Data lives in JSONB columns on faculty_profiles; fall back to user_metadata from signup form
  const languages: any[] = facultyProfile?.languages || [];
  const history: any[] = facultyProfile?.institutions_taught || [];
  const rawAreas: string[] = facultyProfile?.faculty_areas?.length > 0
    ? facultyProfile.faculty_areas
    : (userMeta.knowledge_areas || []);
  const areas: any[] = rawAreas.map((a: string) => ({ id: a, area: a }));
  const levels: any[] = (facultyProfile?.levels || []).map((l: string) => ({ id: l, level: l }));
  
  const { data: recentRequests } = await supabase
    .from("contacts")
    .select("*, institution:institutions(name, country)")
    .eq("faculty_id", facultyProfile?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(3);

  // Checklist logic enriched
  const checklist = [
    { id: 'info', label: "Titular y Ubicación", completed: !!facultyProfile?.headline && !!facultyProfile?.location },
    { id: 'areas', label: "Áreas / Facultades", completed: areas.length > 0 },
    { id: 'levels', label: "Niveles Docentes", completed: levels.length > 0 },
    { id: 'langs', label: "Idiomas", completed: languages.length > 0 },
    { id: 'history', label: "Historial Docente", completed: history.length > 0 },
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

      {verificationStatus === "approved" && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={20} className="text-green-600" />
          </div>
          <div>
            <p className="font-black text-green-800">✓ Perfil verificado</p>
            <p className="text-sm text-green-600 mt-0.5">Tu perfil es visible para instituciones de todo el mundo.</p>
          </div>
        </div>
      )}
      {verificationStatus === "pending" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="font-black text-amber-800">Perfil en revisión</p>
            <p className="text-sm text-amber-600 mt-0.5">
              Nuestro equipo está revisando tu perfil. Recibirás un email de confirmación en 24-48 horas laborables.
            </p>
          </div>
        </div>
      )}
      {verificationStatus === "requires_info" && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="font-black text-blue-800">Necesitamos más información</p>
            {verificationNotes && (
              <p className="text-sm text-blue-600 mt-0.5">{verificationNotes}</p>
            )}
            <Link href="/app/faculty/profile" className="inline-flex items-center gap-1 text-sm font-bold text-blue-700 hover:underline mt-2">
              Completar mi perfil →
            </Link>
          </div>
        </div>
      )}
      {verificationStatus === "rejected" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <XCircle size={20} className="text-red-600" />
          </div>
          <div>
            <p className="font-black text-red-800">Perfil no verificado</p>
            {verificationNotes && (
              <p className="text-sm text-red-600 mt-0.5">{verificationNotes}</p>
            )}
            <Link href="/app/faculty/profile" className="inline-flex items-center gap-1 text-sm font-bold text-red-700 hover:underline mt-2">
              Mejorar mi perfil →
            </Link>
          </div>
        </div>
      )}

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
                  <div className="text-center py-4">
                    <span className="text-5xl font-black text-talentia-blue">{calculatedProgress}%</span>
                    <p className="text-sm font-bold text-gray-400 mt-1">Perfil completado</p>
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-black text-navy flex items-center gap-2">
                  <Eye size={22} className="text-talentia-blue" />
                  Tu perfil, bajo tu control
                </CardTitle>
                <Button size="sm" variant="ghost" className="text-talentia-blue font-black text-xs rounded-xl hover:bg-blue-50" asChild>
                  <Link href="/onboarding">Editar →</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-8">
              {/* Card preview */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-navy via-[#0f2c5a] to-talentia-blue p-8 shadow-2xl shadow-blue-900/20">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-bl-[5rem]"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-tech-cyan/10 rounded-tr-[4rem]"></div>

                {/* Top row */}
                <div className="relative z-10 flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                      <User size={28} className="text-white/80" />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-base leading-tight">{profile?.full_name || 'Tu Nombre'}</h3>
                      <p className="text-tech-cyan text-xs font-bold mt-0.5 truncate max-w-[180px]">{facultyProfile?.headline || 'Añade tu titulación'}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isPublished ? 'bg-green-400/20 border-green-400/30 text-green-300' : 'bg-orange-400/20 border-orange-400/30 text-orange-300'}`}>
                    {isPublished ? 'Publicado' : 'Borrador'}
                  </div>
                </div>

                {/* Areas */}
                <div className="relative z-10 flex flex-wrap gap-2 mb-6">
                  {areas?.slice(0, 3).map(a => (
                    <span key={a.id} className="bg-white/10 border border-white/20 text-white/80 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">{a.area}</span>
                  ))}
                  {(!areas || areas.length === 0) && (
                    <span className="bg-white/5 border border-dashed border-white/20 text-white/30 text-[10px] font-bold px-3 py-1 rounded-full">Añade tus áreas →</span>
                  )}
                </div>

                {/* Stats row */}
                <div className="relative z-10 grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: "Idiomas", value: languages.length || "—" },
                    { label: "Cargos", value: history.length || "—" },
                    { label: "Áreas", value: areas.length || "—" },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                      <p className="text-xl font-black text-white">{stat.value}</p>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Location & Level */}
                <div className="relative z-10 flex items-center justify-between text-xs font-bold text-white/50">
                  <span className="flex items-center gap-1.5"><MapPin size={12} /> {facultyProfile?.location || 'Sin ubicación'}</span>
                  <span className="flex items-center gap-1.5"><GraduationCap size={12} /> {levels?.[0]?.level || 'Nivel pendiente'}</span>
                </div>
              </div>

              {/* Progress bar below card */}
              <div className="mt-5 space-y-2">
                <div className="flex justify-between text-xs font-black text-navy uppercase tracking-widest">
                  <span>Completitud del perfil</span>
                  <span className={calculatedProgress === 100 ? 'text-green-600' : 'text-talentia-blue'}>{calculatedProgress}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${calculatedProgress === 100 ? 'bg-green-500' : 'bg-talentia-blue'}`}
                    style={{ width: `${calculatedProgress}%` }}
                  />
                </div>
                {calculatedProgress < 100 && (
                  <p className="text-xs text-gray-400 font-medium">
                    Completa {checklist.filter(i => !i.completed).length} sección{checklist.filter(i => !i.completed).length !== 1 ? 'es' : ''} más para maximizar tu visibilidad.
                  </p>
                )}
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
                      <p className="text-xl font-black text-navy">{languages.length}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Idiomas</p>
                    </div>
                    <div className="p-3 bg-gray-50/50 rounded-xl border border-transparent">
                      <p className="text-xl font-black text-navy">{history.length}</p>
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
                <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Mail size={20} className="text-talentia-blue" />
                  </div>
                  <p className="font-bold text-navy text-sm">Aún no tienes contactos</p>
                  <p className="text-gray-400 text-xs mt-1 max-w-xs mx-auto">
                    Cuando una institución quiera contactarte, aparecerá aquí.
                    Completa tu perfil al 100% para aparecer primero.
                  </p>
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
