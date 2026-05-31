import { createClient, createAdminClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import {
  Search, Star, Mail, ArrowRight, TrendingUp, Users,
  Building2, Clock, AlertTriangle, CheckCircle2, Zap,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function InstitutionHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: institution } = await admin
    .from("institutions")
    .select("id, name, type, country, city, description, logo_url, website, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!institution) redirect("/app/institution");

  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("plan, subscription_status")
    .eq("id", user.id)
    .single();

  const isPro = userProfile?.plan === "institution-pro" && userProfile?.subscription_status === "active";

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [year, monthNum] = currentMonth.split("-").map(Number);
  const nextMonthStr = monthNum === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(monthNum + 1).padStart(2, "0")}-01`;

  const [
    { count: totalContacts },
    { count: monthlyContacts },
    { count: favoritesCount },
    { data: recentContacts },
    { data: usageData },
  ] = await Promise.all([
    supabase.from("contacts").select("*", { count: "exact", head: true }).eq("institution_id", institution.id),
    supabase.from("contacts").select("*", { count: "exact", head: true })
      .eq("institution_id", institution.id)
      .gte("created_at", `${currentMonth}-01`)
      .lt("created_at", nextMonthStr),
    supabase.from("favorites").select("*", { count: "exact", head: true }).eq("institution_id", institution.id),
    supabase.from("contacts")
      .select("*, faculty:faculty_profiles(id, headline, user:user_profiles(full_name, avatar_url))")
      .eq("institution_id", institution.id)
      .order("created_at", { ascending: false })
      .limit(4),
    !isPro
      ? admin.from("search_usage").select("search_count").eq("institution_id", institution.id).eq("month", currentMonth).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const searchesUsed = (usageData as any)?.search_count ?? 0;
  const isPending = institution.status === "pending";
  const isBlocked = institution.status === "blocked";

  // Profile completion
  const profileFields = [institution.name, (institution as any).type, institution.country, institution.description, institution.website];
  const profileCompletion = Math.round(profileFields.filter(Boolean).length / profileFields.length * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D2240] via-[#1B4FD8] to-[#2563EB] p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {Array.from({ length: 8 }).map((_, r) =>
              Array.from({ length: 8 }).map((_, c) => (
                <circle key={`${r}-${c}`} cx={c * 28 + 14} cy={r * 28 + 14} r="3" fill="white" />
              ))
            )}
          </svg>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-1">Panel de institución</p>
            <h1 className="text-2xl font-black tracking-tight leading-tight">
              {institution.name || "Mi Institución"}
            </h1>
            <p className="text-blue-100 text-sm font-medium mt-1">
              {[institution.city, institution.country].filter(Boolean).join(", ") || "Completa tu perfil para aparecer mejor"}
            </p>
          </div>
          <Link
            href="/app/institution/search"
            className="inline-flex items-center gap-2 bg-white text-[#1B4FD8] font-black px-5 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors whitespace-nowrap flex-shrink-0"
          >
            <Search size={15} /> Buscar docentes
          </Link>
        </div>
      </div>

      {/* ── Status banners ── */}
      {isPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Clock size={15} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-black text-amber-800">Cuenta en revisión</p>
            <p className="text-xs text-amber-600 font-medium mt-0.5">
              Nuestro equipo revisará tu cuenta en 24-48 horas hábiles. Mientras tanto puedes completar tu perfil.
            </p>
          </div>
        </div>
      )}
      {isBlocked && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={15} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm font-black text-red-800">Cuenta suspendida</p>
            <p className="text-xs text-red-600 font-medium mt-0.5">
              Contacta con soporte para más información: support@facultymatch.app
            </p>
          </div>
        </div>
      )}

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Mail, label: "Contactos totales", value: totalContacts ?? 0, color: "text-talentia-blue", bg: "bg-blue-50", href: "/app/institution/contacts" },
          { icon: TrendingUp, label: "Contactos este mes", value: monthlyContacts ?? 0, color: "text-green-600", bg: "bg-green-50", href: "/app/institution/contacts" },
          { icon: Star, label: "Shortlists", value: favoritesCount ?? 0, color: "text-energy-orange", bg: "bg-orange-50", href: "/app/institution/favorites" },
          {
            icon: Search,
            label: isPro ? "Búsquedas ilimitadas" : `Búsquedas este mes`,
            value: isPro ? "∞" : `${searchesUsed}/5`,
            color: isPro ? "text-purple-600" : (searchesUsed >= 5 ? "text-red-500" : "text-purple-600"),
            bg: isPro ? "bg-purple-50" : (searchesUsed >= 5 ? "bg-red-50" : "bg-purple-50"),
            href: "/app/institution/search",
          },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 hover:shadow-md hover:border-gray-200 transition-all"
          >
            <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center`}>
              <stat.icon size={16} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-black text-navy">{stat.value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight mt-0.5">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Upgrade banner (mobile only, freemium) ── */}
      {!isPro && (
        <Link
          href="/app/institution/billing"
          className="lg:hidden flex items-center justify-between gap-3 bg-gradient-to-r from-energy-orange to-orange-500 text-white rounded-2xl px-5 py-4 shadow-lg shadow-orange-200 hover:shadow-xl transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Mejora tu plan</p>
              <p className="text-sm font-black leading-tight">Más búsquedas, más contactos, sin límites</p>
            </div>
          </div>
          <span className="text-xs font-black bg-white/20 px-3 py-1.5 rounded-xl whitespace-nowrap flex-shrink-0">
            Desde 35€/mes →
          </span>
        </Link>
      )}

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left: recent contacts + search CTA ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Search CTA */}
          <Link href="/app/institution/search" className="group block">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy to-[#1B4FD8] p-5 flex items-center justify-between gap-4 hover:shadow-lg hover:shadow-blue-200 transition-all">
              <div className="absolute right-0 top-0 w-48 h-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle at 80% 50%, #fff 0%, transparent 70%)" }} />
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Search size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Directorio de docentes</p>
                  <h3 className="text-white font-black">Buscar profesorado para tus programas</h3>
                </div>
              </div>
              <span className="relative flex items-center gap-2 bg-white text-[#1B4FD8] font-black px-4 py-2 rounded-xl text-sm group-hover:bg-blue-50 transition-colors flex-shrink-0">
                Buscar <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>

          {/* Recent contacts */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-navy">Contactos recientes</h2>
              <Link href="/app/institution/contacts" className="text-xs font-black text-talentia-blue hover:underline flex items-center gap-1">
                Ver todos <ArrowRight size={11} />
              </Link>
            </div>
            {recentContacts && recentContacts.length > 0 ? (
              <div className="space-y-3">
                {recentContacts.map((contact: any) => {
                  const fp = contact.faculty;
                  const userObj = Array.isArray(fp?.user) ? fp?.user[0] : fp?.user;
                  const name = userObj?.full_name || "Docente";
                  const initials = name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <div key={contact.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                      {userObj?.avatar_url ? (
                        <img src={userObj.avatar_url} alt={name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-talentia-blue font-black text-sm flex-shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-navy text-sm truncate">{name}</p>
                        {fp?.headline && (
                          <p className="text-xs text-gray-400 font-medium truncate">{fp.headline}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">
                        {new Date(contact.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Mail size={20} className="text-talentia-blue" />
                </div>
                <p className="font-bold text-navy text-sm">Aún no has contactado docentes</p>
                <p className="text-gray-400 text-xs mt-1 max-w-xs mx-auto">
                  Busca en el directorio y envía propuestas a los profesores que encajen con tus programas.
                </p>
                <Link
                  href="/app/institution/search"
                  className="inline-flex items-center gap-2 bg-talentia-blue text-white font-black px-5 py-2.5 rounded-xl text-xs mt-4 hover:bg-navy transition-colors"
                >
                  <Search size={13} /> Explorar directorio
                </Link>
              </div>
            )}
          </div>

          {/* Quick links grid */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Star,     label: "Shortlists",  sub: `${favoritesCount ?? 0} guardados`, href: "/app/institution/favorites", color: "text-energy-orange", bg: "bg-orange-50" },
              { icon: Mail,     label: "Contactos",   sub: `${totalContacts ?? 0} enviados`,   href: "/app/institution/contacts",  color: "text-talentia-blue", bg: "bg-blue-50" },
              { icon: Building2,label: "Mi perfil",   sub: `${profileCompletion}% completo`,   href: "/app/institution",           color: "text-green-600",     bg: "bg-green-50" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2 hover:shadow-md hover:border-gray-200 transition-all group"
              >
                <div className={`w-9 h-9 ${item.bg} rounded-xl flex items-center justify-center`}>
                  <item.icon size={16} className={item.color} />
                </div>
                <p className="font-black text-navy text-sm group-hover:text-talentia-blue transition-colors">{item.label}</p>
                <p className="text-[10px] text-gray-400 font-bold">{item.sub}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-6">

          {/* Profile completion */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-navy text-sm">Perfil de institución</h3>
              <Badge className={`font-black text-[10px] px-2.5 py-1 rounded-full border-none ${profileCompletion >= 80 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                {profileCompletion}%
              </Badge>
            </div>
            <div className="space-y-1.5">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${profileCompletion >= 80 ? "bg-green-500" : "bg-talentia-blue"}`}
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              {profileCompletion < 100 && (
                <p className="text-xs text-gray-400 font-medium">
                  Completa tu perfil para mejorar tu visibilidad.
                </p>
              )}
            </div>
            {/* Checklist items */}
            <div className="space-y-2">
              {[
                { label: "Nombre", done: !!institution.name },
                { label: "Tipo de institución", done: !!(institution as any).type },
                { label: "País y ciudad", done: !!institution.country },
                { label: "Descripción", done: !!institution.description },
                { label: "Web oficial", done: !!institution.website },
              ].map((item) => (
                <div key={item.label} className={`flex items-center gap-2.5 text-xs font-bold ${item.done ? "text-gray-600" : "text-gray-300"}`}>
                  {item.done
                    ? <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" />
                    : <div className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-gray-200 flex-shrink-0" />}
                  {item.label}
                </div>
              ))}
            </div>
            <Link
              href="/app/institution"
              className="inline-flex items-center gap-2 w-full justify-center bg-gray-50 hover:bg-gray-100 text-navy font-black py-2.5 rounded-xl text-xs transition-colors border border-gray-100"
            >
              Editar perfil <ArrowRight size={11} />
            </Link>
          </div>

          {/* Plan card */}
          {isPro ? (
            <div className="bg-gradient-to-br from-navy to-[#1a3a6b] text-white rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-energy-orange" />
                <span className="text-[10px] font-black uppercase tracking-widest text-energy-orange">Plan Professional</span>
              </div>
              <p className="text-xs font-medium text-white/80 leading-relaxed">
                Búsquedas ilimitadas, contactos ilimitados y acceso completo al directorio.
              </p>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-green-400" />
                <span className="text-xs font-bold text-white/80">Activo</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-dashed border-energy-orange/30 p-5 space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 text-energy-orange">
                <Zap size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Plan Professional</span>
              </div>
              <p className="text-xs font-medium text-gray-600 leading-relaxed">
                Búsquedas y contactos ilimitados. Encuentra el profesorado ideal para todos tus programas.
              </p>
              <div className="text-lg font-black text-navy">99€ <span className="text-xs text-gray-400 font-bold">/ mes</span></div>
              <Link
                href="/app/institution/billing"
                className="inline-flex items-center gap-2 w-full justify-center bg-energy-orange hover:bg-orange-600 text-white font-black py-2.5 px-4 rounded-xl text-xs transition-colors"
              >
                <Zap size={12} /> Activar Plan Professional
              </Link>
              {searchesUsed >= 5 && (
                <p className="text-[10px] text-red-500 font-bold">
                  Has alcanzado el límite de búsquedas gratuitas este mes.
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
