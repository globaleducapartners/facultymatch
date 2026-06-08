import { createClient, createAdminClient } from "@/lib/supabase-server";
import {
  CheckCircle2,
  ShieldCheck,
  Mail,
  Plus,
  ArrowRight,
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  MapPin,
  Clock,
  Briefcase,
  AlertCircle,
  XCircle,
  Sparkles,
  CalendarDays,
  Gift,
  Globe,
  Zap,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// ─── Resource articles ────────────────────────────────────────────────────────

const RESOURCES = [
  {
    slug: "optimiza-perfil-docente",
    title: "Cómo optimizar tu perfil docente para conseguir más oportunidades",
    category: "Perfil",
    emoji: "🚀",
    color: "blue",
  },
  {
    slug: "acreditacion-aneca-guia",
    title: "Guía completa sobre la acreditación ANECA: requisitos y proceso",
    category: "Carrera",
    emoji: "🎓",
    color: "amber",
  },
  {
    slug: "tendencias-educacion-superior",
    title: "Las tendencias que transforman la educación superior en 2025",
    category: "Tendencias",
    emoji: "📈",
    color: "green",
  },
  {
    slug: "como-destacar-directorio",
    title: "5 elementos clave que miran las instituciones al buscar docentes",
    category: "Consejos",
    emoji: "💡",
    color: "purple",
  },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  blue:   { bg: "bg-blue-50",   text: "text-talentia-blue", border: "border-blue-100" },
  amber:  { bg: "bg-amber-50",  text: "text-amber-600",     border: "border-amber-100" },
  green:  { bg: "bg-green-50",  text: "text-green-600",     border: "border-green-100" },
  purple: { bg: "bg-purple-50", text: "text-purple-600",    border: "border-purple-100" },
};

// ─────────────────────────────────────────────────────────────────────────────

export default async function EducatorDashboard() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Institution-only accounts go to institution dashboard
  if (profile?.role === "institution") {
    const { redirect } = await import("next/navigation");
    redirect("/app/institution/home");
  }
  if (profile?.can_switch_role && profile?.active_mode === "institution") {
    const { redirect } = await import("next/navigation");
    redirect("/app/institution/home");
  }

  const [
    { data: facultyProfile },
    { data: recentRequests },
    { data: expertiseData },
    { count: favoritesCount },
    { count: contactsCount },
  ] = await Promise.all([
    supabase.from("faculty_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("contacts")
      .select("*, institution:institutions(name, country)")
      .eq("faculty_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase.from("faculty_expertise").select("id").eq("faculty_id", user.id).limit(1),
    admin.from("favorites").select("*", { count: "exact", head: true }).eq("faculty_id", user.id),
    admin.from("contacts").select("*", { count: "exact", head: true }).eq("faculty_id", user.id),
  ]);

  const userMeta = user.user_metadata || {};
  const verificationStatus: string = profile?.verification_status || "pending";
  const verificationNotes: string | null = profile?.verification_notes || null;

  const languages: any[] = facultyProfile?.languages || [];
  const history: any[] = facultyProfile?.institutions_taught || [];
  const rawAreas: string[] = facultyProfile?.faculty_areas?.length > 0
    ? facultyProfile.faculty_areas
    : (userMeta.knowledge_areas || []);
  const areas: any[] = rawAreas.map((a: string) => ({ id: a, area: a }));

  const hasExpertise = (expertiseData?.length ?? 0) > 0;
  const hasAreas = hasExpertise || (facultyProfile?.faculty_areas || []).length > 0;

  // Checklist
  const checklist = [
    { id: "info",     label: "Titular y ubicación",  href: "/app/faculty/profile",    completed: !!facultyProfile?.headline && !!facultyProfile?.location },
    { id: "areas",    label: "Especialidades",        href: "/app/faculty/specialties", completed: hasAreas },
    { id: "langs",    label: "Idiomas",               href: "/app/faculty/profile",    completed: (facultyProfile?.languages || []).length > 0 },
    { id: "history",  label: "Historial docente",     href: "/app/faculty/profile",    completed: (facultyProfile?.institutions_taught || []).length > 0 },
    { id: "bio",      label: "Biografía profesional", href: "/app/faculty/profile",    completed: !!facultyProfile?.bio },
    { id: "avail",    label: "Disponibilidad",        href: "/app/faculty/profile",    completed: !!facultyProfile?.availability },
  ];

  const completedCount = checklist.filter((i) => i.completed).length;
  const progress = Math.round((completedCount / checklist.length) * 100);
  const pendingItems = checklist.filter((i) => !i.completed);

  const isPro = profile?.plan === "faculty-pro" && profile?.subscription_status === "active";

  const rawReferralStats = (facultyProfile?.referral_stats as Record<string, number>) || {};
  const successfulReferrals = typeof rawReferralStats.successful_referrals === "number"
    ? rawReferralStats.successful_referrals
    : 0;

  const firstName = profile?.full_name?.split(" ")[0] || userMeta?.full_name?.split(" ")[0] || user.email?.split("@")[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 lg:pb-0">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D2240] via-[#1B4FD8] to-[#2563EB] p-8 text-white">
        {/* Decorative dots */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {Array.from({ length: 8 }).map((_, r) =>
              Array.from({ length: 8 }).map((_, c) => (
                <circle key={`${r}-${c}`} cx={c * 28 + 14} cy={r * 28 + 14} r="3" fill="white" />
              ))
            )}
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div>
              <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-1">Panel docente</p>
              <h1 className="text-3xl font-black tracking-tight mb-1">Hola, {firstName} 👋</h1>
              <p className="text-blue-100 font-medium text-sm">
                {progress === 100
                  ? "Tu perfil está completo. Las instituciones pueden encontrarte fácilmente."
                  : `Completa tu perfil para maximizar tu visibilidad ante instituciones.`}
              </p>
            </div>
            <Button
              asChild
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 font-bold rounded-xl h-10 px-5 backdrop-blur-sm whitespace-nowrap flex-shrink-0"
            >
              <Link href="/app/faculty/profile" className="flex items-center gap-2">
                Editar perfil <ArrowRight size={15} />
              </Link>
            </Button>
          </div>

          {/* Progress */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm font-bold text-blue-100">
              <span>Perfil completado</span>
              <span className="text-white font-black">{progress}%</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${progress === 100 ? "bg-green-400" : "bg-white"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            {pendingItems.length > 0 && (
              <p className="text-blue-200 text-xs font-medium">
                Faltan {pendingItems.length} sección{pendingItems.length !== 1 ? "es" : ""}:{" "}
                {pendingItems.map((i) => i.label).join(", ")}.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Verification banners ── */}
      {verificationStatus === "approved" && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-4">
          <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={18} className="text-green-600" />
          </div>
          <div>
            <p className="font-black text-green-800 text-sm">Perfil verificado</p>
            <p className="text-sm text-green-600 font-medium">Tu perfil es visible para instituciones de todo el mundo.</p>
          </div>
        </div>
      )}
      {verificationStatus === "pending" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-4">
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="font-black text-amber-800 text-sm">Perfil en revisión</p>
            <p className="text-sm text-amber-600 font-medium">
              Nuestro equipo está revisando tu perfil. Recibirás un email en 24-48 horas laborables.
            </p>
          </div>
        </div>
      )}
      {verificationStatus === "requires_info" && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-4">
          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="font-black text-blue-800 text-sm">Necesitamos más información</p>
            {verificationNotes && <p className="text-sm text-blue-600 font-medium">{verificationNotes}</p>}
            <Link href="/app/faculty/profile" className="text-sm font-black text-blue-700 hover:underline mt-1 inline-block">
              Completar mi perfil →
            </Link>
          </div>
        </div>
      )}
      {verificationStatus === "rejected" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-4">
          <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <XCircle size={18} className="text-red-600" />
          </div>
          <div>
            <p className="font-black text-red-800 text-sm">Perfil no aprobado</p>
            {verificationNotes && <p className="text-sm text-red-600 font-medium">{verificationNotes}</p>}
            <Link href="/app/faculty/profile" className="text-sm font-black text-red-700 hover:underline mt-1 inline-block">
              Mejorar mi perfil →
            </Link>
          </div>
        </div>
      )}

      {/* ── Visibility & Completeness Alerts ── */}
      {(progress < 100 || !facultyProfile?.visibility || facultyProfile?.visibility === "hidden" || facultyProfile?.visibility === "private") && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-talentia-blue" />
            <h3 className="font-black text-navy text-sm">Avisos importantes sobre tu perfil</h3>
          </div>
          <div className="grid gap-3">
            {progress < 100 && (
              <div className="flex items-start gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle size={14} className="text-amber-700" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-amber-900">Perfil incompleto ({progress}% completado)</p>
                  <p className="text-xs text-amber-700 font-medium mt-0.5">
                    Faltan completar las siguientes secciones: <strong className="font-bold">{pendingItems.map((i) => i.label).join(", ")}</strong>. Completa tu perfil para que sea más atractivo y fácil de encontrar por las universidades.
                  </p>
                  <Link href="/app/faculty/profile" className="text-xs font-black text-amber-800 hover:underline mt-1.5 inline-block">
                    Completar secciones faltantes →
                  </Link>
                </div>
              </div>
            )}

            {facultyProfile?.visibility === "hidden" && (
              <div className="flex items-start gap-3 p-3 bg-red-50/60 rounded-xl border border-red-100">
                <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <EyeOff size={14} className="text-red-700" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-red-900">Perfil Oculto</p>
                  <p className="text-xs text-red-700 font-medium mt-0.5">
                    Tu visibilidad está configurada como <strong className="font-bold">Oculto</strong>. Ninguna institución podrá encontrarte en el buscador ni en el directorio.
                  </p>
                  <Link href="/app/faculty/privacy" className="text-xs font-black text-red-800 hover:underline mt-1.5 inline-block">
                    Modificar visibilidad del perfil →
                  </Link>
                </div>
              </div>
            )}

            {facultyProfile?.visibility === "private" && (
              <div className="flex items-start gap-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lock size={14} className="text-blue-700" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-blue-900">Perfil privado (Solo instituciones)</p>
                  <p className="text-xs text-blue-700 font-medium mt-0.5">
                    Tu visibilidad está configurada para mostrarse <strong className="font-bold">solo a instituciones verificadas</strong>. Los visitantes públicos no registrados no pueden ver tu información.
                  </p>
                  <Link href="/app/faculty/privacy" className="text-xs font-black text-blue-800 hover:underline mt-1.5 inline-block">
                    Gestionar privacidad del perfil →
                  </Link>
                </div>
              </div>
            )}

            {!facultyProfile?.visibility && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle size={14} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-gray-800">Visibilidad no configurada</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    No has configurado tu preferencia de privacidad. Por defecto tu perfil es público en la plataforma.
                  </p>
                  <Link href="/app/faculty/privacy" className="text-xs font-black text-gray-700 hover:underline mt-1.5 inline-block">
                    Configurar privacidad →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left / main column ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Pending checklist */}
          {pendingItems.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-navy">Completa tu perfil</h2>
                  <p className="text-sm text-gray-400 font-medium">{completedCount} de {checklist.length} secciones listas</p>
                </div>
                <Badge className="bg-blue-50 text-talentia-blue border-none font-black text-xs px-3 py-1">
                  {progress}%
                </Badge>
              </div>
              <div className="space-y-2">
                {pendingItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 hover:border-talentia-blue hover:bg-blue-50/50 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 group-hover:border-talentia-blue flex items-center justify-center flex-shrink-0 transition-colors">
                      <Plus size={13} className="text-gray-300 group-hover:text-talentia-blue transition-colors" />
                    </div>
                    <span className="text-sm font-bold text-gray-500 group-hover:text-navy transition-colors flex-1">{item.label}</span>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-talentia-blue transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Personal stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Star, label: "En favoritos", value: (favoritesCount ?? 0).toString(), color: "text-energy-orange", bg: "bg-orange-50" },
              { icon: Mail, label: "Solicitudes recibidas", value: (contactsCount ?? 0).toString(), color: "text-talentia-blue", bg: "bg-blue-50" },
              { icon: Globe, label: "Idiomas", value: languages.length > 0 ? languages.map((l: any) => (typeof l === "string" ? l : l.lang ?? "")).filter(Boolean).join(", ") : "—", color: "text-purple-600", bg: "bg-purple-50" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
                <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon size={16} className={stat.color} />
                </div>
                <p className="text-lg font-black text-navy leading-tight truncate">{stat.value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-navy">Recursos para docentes</h2>
                <p className="text-sm text-gray-400 font-medium">Consejos y guías para impulsar tu carrera académica.</p>
              </div>
              <a
                href="https://www.facultymatch.app/resources"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-black text-talentia-blue hover:underline flex items-center gap-1"
              >
                Ver todos <ArrowRight size={12} />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {RESOURCES.map((r) => {
                const c = COLOR_MAP[r.color] ?? COLOR_MAP.blue;
                return (
                  <a
                    key={r.slug}
                    href={`https://www.facultymatch.app/resources/${r.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group bg-white rounded-2xl border ${c.border} hover:shadow-md transition-all p-5 flex flex-col gap-3`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${c.text} ${c.bg} px-2.5 py-1 rounded-full`}>
                        {r.category}
                      </span>
                      <span className="text-2xl">{r.emoji}</span>
                    </div>
                    <p className="text-sm font-bold text-navy leading-snug group-hover:text-talentia-blue transition-colors line-clamp-2">
                      {r.title}
                    </p>
                    <span className={`text-xs font-black ${c.text} flex items-center gap-1 mt-auto`}>
                      Leer artículo <ArrowRight size={11} />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Recent requests */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-navy">Solicitudes recientes</h2>
              <Button variant="ghost" size="sm" className="text-talentia-blue font-black text-xs rounded-xl hover:bg-blue-50" asChild>
                <Link href="/app/faculty/requests">Ver todas →</Link>
              </Button>
            </div>
            {recentRequests && recentRequests.length > 0 ? (
              <div className="space-y-3">
                {recentRequests.map((req: any) => (
                  <div key={req.id} className="flex items-start gap-3 p-4 bg-gray-50/60 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Mail size={15} className="text-talentia-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-black text-navy text-sm truncate">{req.institution?.name ?? "Institución"}</p>
                        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
                          {new Date(req.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      {req.message && (
                        <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">{req.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Mail size={20} className="text-talentia-blue" />
                </div>
                <p className="font-bold text-navy text-sm">Aún no tienes solicitudes</p>
                <p className="text-gray-400 text-xs mt-1 max-w-xs mx-auto">
                  Cuando una institución quiera contactarte, aparecerá aquí. Completa tu perfil para aparecer primero.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-6">

          {/* Profile status card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-navy text-sm">Estado del perfil</h3>
              <Badge className={`font-black text-[10px] px-2.5 py-1 rounded-full border-none ${progress >= 80 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                {progress >= 80 ? "PUBLICADO" : "BORRADOR"}
              </Badge>
            </div>
            {/* Mini profile preview */}
            <div className="rounded-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-navy to-[#1B4FD8] h-10 relative">
                <div className="absolute -bottom-5 left-4">
                  <div className="w-10 h-10 rounded-xl bg-white border-2 border-white shadow flex items-center justify-center text-navy font-black text-xs">
                    {profile?.full_name
                      ? profile.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")
                      : "?"}
                  </div>
                </div>
              </div>
              <div className="bg-white px-4 pt-8 pb-4 space-y-1">
                <p className="font-black text-navy text-sm leading-tight">{profile?.full_name || "Tu nombre"}</p>
                <p className="text-xs text-talentia-blue font-medium leading-tight truncate">
                  {facultyProfile?.headline || <span className="text-gray-300 italic">Sin titular</span>}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400 font-medium flex-wrap">
                  {facultyProfile?.location && (
                    <span className="flex items-center gap-0.5"><MapPin size={9} />{facultyProfile.location}</span>
                  )}
                  {(facultyProfile?.years_experience ?? 0) > 0 && (
                    <span className="flex items-center gap-0.5"><Briefcase size={9} />{facultyProfile.years_experience}a exp.</span>
                  )}
                </div>
                {areas.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {areas.slice(0, 3).map((a) => (
                      <span key={a.id} className="bg-blue-50 text-talentia-blue text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {a.area}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <span>Completado</span>
                <span className={progress === 100 ? "text-green-600 font-black" : "text-talentia-blue font-black"}>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${progress === 100 ? "bg-green-500" : "bg-talentia-blue"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <Button asChild className="w-full bg-talentia-blue hover:bg-navy text-white font-bold h-10 rounded-xl text-sm">
              <Link href="/app/faculty/profile">Editar perfil</Link>
            </Button>
          </div>

          {/* Privacy */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-talentia-blue" />
              <h3 className="font-black text-navy text-sm">Privacidad</h3>
            </div>
            <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${facultyProfile?.visibility === "public" ? "bg-blue-50 border-blue-100" : "bg-gray-50 border-gray-100"}`}>
              <div className="flex items-center gap-2">
                {facultyProfile?.visibility === "public"
                  ? <Eye size={15} className="text-talentia-blue" />
                  : <EyeOff size={15} className="text-gray-400" />}
                <div>
                  <p className="text-xs font-black text-navy">{facultyProfile?.visibility === "public" ? "Pública" : "Privada"}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Visibilidad</p>
                </div>
              </div>
              <Link href="/app/faculty/privacy" className="text-xs font-black text-talentia-blue hover:underline">
                Cambiar
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-xl font-black text-navy">{languages.length}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Idiomas</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-xl font-black text-navy">{history.length}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Cargos</p>
              </div>
            </div>
          </div>

          {/* Plan card */}
          {isPro ? (
            <div className="bg-gradient-to-br from-navy to-[#1a3a6b] text-white rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-energy-orange" />
                <span className="text-[10px] font-black uppercase tracking-widest text-energy-orange">Plan Professional</span>
              </div>
              <p className="text-xs font-medium text-white/80 leading-relaxed">
                Tu perfil aparece <strong className="text-white">prioritario</strong> en búsquedas y tienes privacidad avanzada.
              </p>
              {profile?.subscription_current_period_end && (() => {
                const end = new Date(profile.subscription_current_period_end);
                const daysLeft = Math.max(0, Math.round((end.getTime() - Date.now()) / 86400000));
                return (
                  <div className="bg-white/10 rounded-2xl p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                      <CalendarDays size={11} /> Renovación
                    </div>
                    <p className="text-white font-black text-xs">
                      {end.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-energy-orange rounded-full"
                          style={{ width: `${Math.max(5, 100 - Math.round(daysLeft / 3.65))}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-white/60">{daysLeft}d</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-dashed border-energy-orange/30 p-5 space-y-4 text-center">
              <div className="flex items-center justify-center gap-2 text-energy-orange">
                <Zap size={15} />
                <span className="text-[10px] font-black uppercase tracking-widest">Plan Professional</span>
              </div>
              <p className="text-xs font-medium text-gray-600 leading-relaxed">
                Aparece primero en búsquedas, bloquea instituciones y controla tu privacidad avanzada.
              </p>
              <div className="text-xl font-black text-navy">29€ <span className="text-xs text-gray-400 font-bold">/ año</span></div>
              <Link
                href="/checkout?plan=faculty-pro"
                className="inline-flex items-center gap-2 w-full justify-center bg-energy-orange hover:bg-orange-600 text-white font-black py-2.5 px-5 rounded-xl text-xs transition-colors"
              >
                <Sparkles size={13} /> Activar Plan Professional
              </Link>
            </div>
          )}

          {/* Referral widget */}
          {successfulReferrals < 10 && (
            <div className="bg-white rounded-3xl border border-dashed border-energy-orange/40 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Gift size={14} className="text-energy-orange" />
                <p className="text-[10px] font-black text-energy-orange uppercase tracking-widest">Invita y Gana</p>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Invita compañeros a FacultyMatch y desbloquea meses gratis de Plan Professional.
              </p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span>Invitaciones exitosas</span>
                  <span className="text-navy font-black">{successfulReferrals}/10</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-energy-orange rounded-full transition-all"
                    style={{ width: `${Math.min(100, (successfulReferrals / 10) * 100)}%` }}
                  />
                </div>
              </div>
              <Link
                href="/app/faculty/referrals"
                className="inline-flex items-center gap-1.5 text-xs font-black text-energy-orange hover:underline"
              >
                Ver mis invitaciones <ArrowRight size={11} />
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
