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
  Briefcase,
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

  // Institution users should not be on the faculty dashboard home
  if (profile?.role === "institution") {
    const { redirect } = await import("next/navigation");
    redirect("/app/institution");
  }

  const { data: facultyProfile } = await supabase
      .from("faculty_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

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
    { id: 'info', label: "Titular y ubicación", completed: !!facultyProfile?.headline && !!facultyProfile?.location },
    { id: 'areas', label: "Áreas de conocimiento", completed: (facultyProfile?.faculty_areas || []).length > 0 },
    { id: 'langs', label: "Idiomas", completed: (facultyProfile?.languages || []).length > 0 },
    { id: 'history', label: "Historial docente", completed: (facultyProfile?.institutions_taught || []).length > 0 },
    { id: 'bio', label: "Biografía profesional", completed: !!facultyProfile?.bio },
    { id: 'availability', label: "Disponibilidad", completed: !!facultyProfile?.availability },
  ];

  const completedCount = checklist.filter(i => i.completed).length;
  const calculatedProgress = Math.round((completedCount / checklist.length) * 100);
  const isPublished = calculatedProgress >= 80;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 lg:pb-0">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-navy tracking-tight">
            Hola, {profile?.full_name?.split(' ')[0] || userMeta?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
          </h1>
          <p className="text-gray-500 font-medium mt-1">Gestiona tu presencia académica y recibe oportunidades.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="bg-talentia-blue hover:bg-navy text-white font-black rounded-2xl h-14 px-8 shadow-xl shadow-blue-100 transition-all">
            <Link href="/app/faculty/profile" className="flex items-center gap-2">
              <User size={20} />
              Editar Perfil
            </Link>
          </Button>
        </div>
      </div>

      {verificationStatus === "approved" && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 lg:p-6 mb-6 flex items-start gap-4">
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
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 lg:p-6 mb-6 flex items-start gap-4">
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
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 lg:p-6 mb-6 flex items-start gap-4">
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
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 lg:p-6 mb-6 flex items-start gap-4">
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
                  <CardTitle className="text-xl font-black text-navy">Estado del Perfil</CardTitle>
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
                <div>
                  <CardTitle className="text-xl font-black text-navy flex items-center gap-2">
                    <Eye size={22} className="text-talentia-blue" />
                    Vista previa del perfil
                  </CardTitle>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">Así verán tu ficha los centros e instituciones</p>
                </div>
                <Button size="sm" variant="ghost" className="text-talentia-blue font-black text-xs rounded-xl hover:bg-blue-50" asChild>
                  <Link href="/app/faculty/profile">Editar →</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-8">
              {/* Simulated institution card */}
              <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                {/* Header band */}
                <div className="bg-gradient-to-r from-navy to-[#0f2c5a] h-16 relative">
                  <div className="absolute -bottom-8 left-6">
                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-white shadow-lg flex items-center justify-center text-navy font-black text-xl">
                      {profile?.full_name
                        ? profile.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")
                        : "?"}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="bg-white px-6 pt-12 pb-6 space-y-4">
                  {/* Name + badges */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-navy text-lg leading-tight">{profile?.full_name || 'Tu Nombre'}</h3>
                      {facultyProfile?.is_phd && (
                        <span className="px-2 py-0.5 bg-talentia-blue text-white text-[10px] font-black rounded-full uppercase tracking-widest">PhD</span>
                      )}
                      {facultyProfile?.aneca_accreditation?.includes("ANECA") && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full uppercase tracking-widest">ANECA</span>
                      )}
                    </div>
                    <p className="text-talentia-blue text-sm font-bold mt-0.5">{facultyProfile?.headline || <span className="text-gray-300 italic font-normal">Sin titular — añádelo en tu perfil</span>}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 font-medium">
                      {facultyProfile?.location && <span className="flex items-center gap-1"><MapPin size={11} />{facultyProfile.location}</span>}
                      {facultyProfile?.years_experience ? <span className="flex items-center gap-1"><Briefcase size={11} />{facultyProfile.years_experience} años exp.</span> : null}
                    </div>
                  </div>

                  {/* Bio snippet */}
                  {facultyProfile?.bio ? (
                    <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2 border-l-2 border-gray-100 pl-3">
                      {facultyProfile.bio}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-300 italic border-l-2 border-dashed border-gray-100 pl-3">Sin biografía — añádela para generar más confianza</p>
                  )}

                  {/* Areas */}
                  <div className="flex flex-wrap gap-1.5">
                    {areas.slice(0, 4).map(a => (
                      <span key={a.id} className="bg-blue-50 border border-blue-100 text-talentia-blue text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">{a.area}</span>
                    ))}
                    {areas.length === 0 && <span className="text-[10px] text-gray-300 italic">Sin áreas de conocimiento</span>}
                  </div>

                  {/* Footer stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs font-bold text-gray-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1"><GraduationCap size={12} />{levels?.[0]?.level || '—'}</span>
                      <span className="flex items-center gap-1"><Target size={12} />{languages.length} idioma{languages.length !== 1 ? 's' : ''}</span>
                    </div>
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      facultyProfile?.availability === 'open' ? 'bg-green-50 text-green-600' :
                      facultyProfile?.availability === 'online_only' ? 'bg-blue-50 text-talentia-blue' :
                      'bg-orange-50 text-orange-600'
                    }`}>
                      <Clock size={10} />
                      {facultyProfile?.availability === 'open' ? 'Disponible' :
                       facultyProfile?.availability === 'next_semester' ? 'Próx. semestre' :
                       facultyProfile?.availability === 'occasional' ? 'Asig. puntuales' :
                       facultyProfile?.availability === 'online_only' ? 'Solo online' :
                       facultyProfile?.availability === 'weekends' ? 'Fines de semana' :
                       facultyProfile?.availability === 'limited' ? 'En 6 meses' :
                       facultyProfile?.availability === 'invite_only' ? 'Por invitación' :
                       'Sin disponibilidad'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar below card */}
              <div className="mt-5 space-y-2">
                <div className="flex justify-between text-xs font-black text-navy uppercase tracking-widest">
                  <span>Perfil completado</span>
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
                  <Link href="/app/faculty/privacy"><Plus size={16} /></Link>
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
