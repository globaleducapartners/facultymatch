import { createAdminClient } from "@/lib/supabase-server";
import {
  Users, Building2, GraduationCap, Clock, CheckCircle2, XCircle,
  TrendingUp, Mail, UserPlus, Repeat2, Award, Globe, MapPin,
  BookOpen, Eye, Send,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "blue",
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  color?: "blue" | "green" | "orange" | "red" | "purple" | "gray";
}) {
  const colors = {
    blue:   "bg-blue-50 text-talentia-blue",
    green:  "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-energy-orange",
    red:    "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    gray:   "bg-gray-50 text-gray-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{label}</p>
        <p className="text-2xl lg:text-3xl font-black text-navy mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default async function MetricsPage() {
  const admin = createAdminClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    { count: totalFaculty },
    { count: totalInstitutions },
    { count: pendingInstitutions },
    { count: activeInstitutions },
    { count: totalContacts },
    { count: contactsMonth },
    { count: facultyThisWeek },
    { count: facultyThisMonth },
    { count: instThisMonth },
    { count: dualModeUsers },
    { count: totalUsers },
    { count: phdCount },
    { count: anecaCount },
  ] = await Promise.all([
    admin.from("user_profiles").select("*", { count: "exact", head: true }).eq("role", "faculty"),
    admin.from("institutions").select("*", { count: "exact", head: true }),
    admin.from("institutions").select("*", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("institutions").select("*", { count: "exact", head: true }).or("status.eq.active,status.eq.approved"),
    admin.from("contacts").select("*", { count: "exact", head: true }),
    admin.from("contacts").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()),
    admin.from("user_profiles").select("*", { count: "exact", head: true }).eq("role", "faculty").gte("created_at", last7.toISOString()),
    admin.from("user_profiles").select("*", { count: "exact", head: true }).eq("role", "faculty").gte("created_at", startOfMonth.toISOString()),
    admin.from("institutions").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()),
    admin.from("user_profiles").select("*", { count: "exact", head: true }).eq("can_switch_role", true),
    admin.from("user_profiles").select("*", { count: "exact", head: true }),
    admin.from("user_profiles").select("*", { count: "exact", head: true }).eq("role", "faculty").eq("is_phd", true),
    admin.from("user_profiles").select("*", { count: "exact", head: true }).eq("role", "faculty").eq("aneca_accreditation", true),
  ]);

  // View count from faculty_profiles
  const { data: viewData } = await admin
    .from("faculty_profiles")
    .select("view_count")
    .limit(1000);
  const totalViews = (viewData ?? []).reduce((sum, fp: any) => sum + (fp.view_count || 0), 0);

  // Email logs count
  const { count: emailLogCount } = await admin
    .from("email_logs")
    .select("*", { count: "exact", head: true });

  // Top viewed profiles
  const { data: topProfiles } = await admin
    .from("faculty_profiles")
    .select("user_id, view_count, headline")
    .order("view_count", { ascending: false })
    .limit(5);

  let topNames: Record<string, string> = {};
  if (topProfiles?.length) {
    const ids = topProfiles.map((p: any) => p.user_id);
    const { data: users } = await admin
      .from("user_profiles")
      .select("id, full_name")
      .in("id", ids);
    if (users) {
      users.forEach((u: any) => { topNames[u.id] = u.full_name || "Sin nombre"; });
    }
  }

  // Recent signups
  const [{ data: recentFaculty }, { data: recentInstitutions }] = await Promise.all([
    admin.from("user_profiles").select("id, full_name, created_at, role").eq("role", "faculty")
      .order("created_at", { ascending: false }).limit(10),
    admin.from("institutions").select("id, name, country, created_at, status")
      .order("created_at", { ascending: false }).limit(10),
  ]);

  // Richer analytics: faculty profiles for areas/countries
  const { data: facultyProfiles } = await admin
    .from("faculty_profiles")
    .select("faculty_areas, country")
    .limit(500);

  // Count by area
  const areaCounts: Record<string, number> = {};
  (facultyProfiles ?? []).forEach((fp: any) => {
    (fp.faculty_areas ?? []).forEach((area: string) => {
      if (area) areaCounts[area] = (areaCounts[area] ?? 0) + 1;
    });
  });
  const topAreas = Object.entries(areaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Count by country
  const countryCounts: Record<string, number> = {};
  (facultyProfiles ?? []).forEach((fp: any) => {
    if (fp.country) countryCounts[fp.country] = (countryCounts[fp.country] ?? 0) + 1;
  });
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  function fmtDate(iso: string | null | undefined) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  }

  const instStatusBadge = (s: string | null) => {
    if (s === "active" || s === "approved") return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700">Activa</span>;
    if (s === "blocked") return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700">Bloqueada</span>;
    if (s === "rejected") return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Rechazada</span>;
    return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Pendiente</span>;
  };

  const conversionRate = totalFaculty
    ? `${Math.round(((dualModeUsers ?? 0) / (totalFaculty ?? 1)) * 100)}%`
    : "—";
  const phdPct = totalFaculty && totalFaculty > 0
    ? `${Math.round(((phdCount ?? 0) / totalFaculty) * 100)}%`
    : "—";
  const anecaPct = totalFaculty && totalFaculty > 0
    ? `${Math.round(((anecaCount ?? 0) / totalFaculty) * 100)}%`
    : "—";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-navy tracking-tight">Panel operacional</h1>
        <p className="text-gray-500 font-medium mt-1">Métricas y actividad de la plataforma en tiempo real.</p>
      </div>

      {/* Platform overview */}
      <section className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Resumen global</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users}        label="Usuarios totales"       value={totalUsers ?? 0}        color="blue" />
          <StatCard icon={GraduationCap} label="Docentes registrados"  value={totalFaculty ?? 0}      color="purple" />
          <StatCard icon={Building2}    label="Instituciones"          value={totalInstitutions ?? 0} color="orange" sub={`${activeInstitutions ?? 0} activas`} />
          <StatCard icon={Mail}         label="Contactos totales"      value={totalContacts ?? 0}     color="green" sub={`${contactsMonth ?? 0} este mes`} />
        </div>
      </section>

      {/* Growth */}
      <section className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Crecimiento</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={UserPlus}   label="Docentes esta semana"     value={facultyThisWeek ?? 0}      color="blue" />
          <StatCard icon={TrendingUp} label="Docentes este mes"        value={facultyThisMonth ?? 0}     color="purple" />
          <StatCard icon={Building2}  label="Instituciones este mes"   value={instThisMonth ?? 0}        color="orange" />
          <StatCard icon={Clock}      label="Pendientes aprobación"    value={pendingInstitutions ?? 0}  color="red" sub="Instituciones" />
        </div>
      </section>

      {/* Academic credentials */}
      <section className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Perfil académico del directorio</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={GraduationCap} label="Doctores / PhD"           value={phdCount ?? 0}      color="blue"   sub={`${phdPct} del total`} />
          <StatCard icon={Award}         label="Acreditación ANECA"       value={anecaCount ?? 0}    color="purple" sub={`${anecaPct} del total`} />
          <StatCard icon={Repeat2}       label="Usuarios dual-mode"       value={dualModeUsers ?? 0} color="green"  sub="Docente + institución" />
          <StatCard icon={TrendingUp}    label="Tasa de conversión"       value={conversionRate}      color="orange" sub="Docentes → institución" />
        </div>
      </section>

      {/* Engagement */}
      <section className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Engagement & comunicación</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Eye}   label="Visitas a perfiles"   value={totalViews}          color="blue"   sub="Totales acumuladas" />
          <StatCard icon={Send}  label="Emails enviados"      value={emailLogCount ?? 0}  color="purple" sub="Desde el panel admin" />
          <StatCard icon={Mail}  label="Contactos totales"    value={totalContacts ?? 0}  color="green"  sub={`${contactsMonth ?? 0} este mes`} />
          <StatCard icon={Users} label="Docentes registrados" value={totalFaculty ?? 0}   color="orange" sub={`${facultyThisMonth ?? 0} este mes`} />
        </div>
      </section>

      {/* Top viewed profiles */}
      {topProfiles && topProfiles.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Eye size={16} className="text-talentia-blue" />
            <h3 className="text-sm font-black text-navy">Perfiles más vistos</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {topProfiles.map((fp: any, i: number) => (
              <div key={fp.user_id} className="flex items-center gap-3 px-5 py-3">
                <span className="w-6 text-center text-xs font-black text-gray-400">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-navy truncate">{topNames[fp.user_id] || "Sin nombre"}</p>
                  {fp.headline && <p className="text-[11px] text-gray-400 truncate">{fp.headline}</p>}
                </div>
                <div className="flex items-center gap-1 text-sm font-black text-talentia-blue">
                  <Eye size={14} />
                  {fp.view_count ?? 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Areas & Nationalities */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Top knowledge areas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <BookOpen size={16} className="text-talentia-blue" />
            <h3 className="text-sm font-black text-navy">Áreas de conocimiento (top 8)</h3>
          </div>
          <div className="p-5 space-y-3">
            {topAreas.length > 0 ? topAreas.map(([area, count]) => {
              const pct = facultyProfiles?.length ? Math.round((count / facultyProfiles.length) * 100) : 0;
              return (
                <div key={area} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-navy truncate flex-1 mr-3">{area}</span>
                    <span className="text-gray-400 flex-shrink-0">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-talentia-blue rounded-full" style={{ width: `${Math.max(4, pct)}%` }} />
                  </div>
                </div>
              );
            }) : <p className="text-sm text-gray-400 text-center py-4">Sin datos aún</p>}
          </div>
        </div>

        {/* Top nationalities */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Globe size={16} className="text-talentia-blue" />
            <h3 className="text-sm font-black text-navy">Principales países (top 8)</h3>
          </div>
          <div className="p-5 space-y-3">
            {topCountries.length > 0 ? topCountries.map(([country, count]) => {
              const pct = facultyProfiles?.length ? Math.round((count / facultyProfiles.length) * 100) : 0;
              return (
                <div key={country} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-navy flex items-center gap-1.5 flex-1 mr-3 truncate">
                      <MapPin size={10} className="text-gray-400 flex-shrink-0" />
                      {country}
                    </span>
                    <span className="text-gray-400 flex-shrink-0">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-energy-orange rounded-full" style={{ width: `${Math.max(4, pct)}%` }} />
                  </div>
                </div>
              );
            }) : <p className="text-sm text-gray-400 text-center py-4">Sin datos aún</p>}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent faculty */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-navy">Últimos docentes registrados</h3>
            <span className="text-xs font-black text-gray-300 uppercase tracking-widest">10 recientes</span>
          </div>
          <div className="divide-y divide-gray-50">
            {(recentFaculty || []).map(f => (
              <div key={f.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-talentia-blue flex items-center justify-center font-black text-xs flex-shrink-0">
                  {(f.full_name || "?").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-navy truncate">{f.full_name || "Sin nombre"}</p>
                  <p className="text-xs text-gray-400">{fmtDate(f.created_at)}</p>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-talentia-blue">Docente</span>
              </div>
            ))}
            {!recentFaculty?.length && <p className="px-5 py-4 text-sm text-gray-400">Sin datos</p>}
          </div>
        </div>

        {/* Recent institutions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-navy">Últimas instituciones registradas</h3>
            <span className="text-xs font-black text-gray-300 uppercase tracking-widest">10 recientes</span>
          </div>
          <div className="divide-y divide-gray-50">
            {(recentInstitutions || []).map(inst => (
              <div key={inst.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-energy-orange flex items-center justify-center font-black text-xs flex-shrink-0">
                  {(inst.name || "?").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-navy truncate">{inst.name || "Sin nombre"}</p>
                  <p className="text-xs text-gray-400">{inst.country || "—"} · {fmtDate(inst.created_at)}</p>
                </div>
                {instStatusBadge(inst.status)}
              </div>
            ))}
            {!recentInstitutions?.length && <p className="px-5 py-4 text-sm text-gray-400">Sin datos</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
