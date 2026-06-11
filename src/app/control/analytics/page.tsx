import { createAdminClient } from "@/lib/supabase-server";
import Link from "next/link";
import { Eye, Mail, Heart, TrendingUp, Users, GraduationCap } from "lucide-react";
import { BarChart, SimpleLine, MiniStat, ActivityFeed } from "@/components/control/AnalyticsCharts";

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const rangeDays = parseInt(params.range || "30", 10);
  const admin = createAdminClient();

  const now = new Date();
  const startDate = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Total view count from faculty_profiles
  const { data: viewData } = await admin
    .from("faculty_profiles")
    .select("view_count")
    .limit(1000);
  const totalViews = (viewData ?? []).reduce((sum, fp: any) => sum + (fp.view_count || 0), 0);

  // Top viewed profiles
  const { data: topProfiles } = await admin
    .from("faculty_profiles")
    .select("user_id, view_count, headline")
    .order("view_count", { ascending: false })
    .limit(10);

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

  // Contacts counts
  const { count: totalContacts } = await admin
    .from("contacts")
    .select("*", { count: "exact", head: true });
  const { count: contactsThisPeriod } = await admin
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startDate.toISOString());
  const { count: contactsToday } = await admin
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayStart.toISOString());
  const { count: contactsThisWeek } = await admin
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .gte("created_at", weekStart.toISOString());

  // Favorites
  const { count: totalFavorites } = await admin
    .from("favorites")
    .select("*", { count: "exact", head: true });
  const { count: favoritesThisPeriod } = await admin
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startDate.toISOString());

  // Daily signups (faculty)
  const { data: facultySignups } = await admin
    .from("user_profiles")
    .select("created_at")
    .eq("role", "faculty")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true })
    .limit(1000);

  // Daily contacts chart
  const { data: contactsTimeline } = await admin
    .from("contacts")
    .select("created_at")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true })
    .limit(1000);

  // Build daily charts
  const dayLabels: string[] = [];
  const signupCounts: number[] = [];
  const contactCounts: number[] = [];

  for (let i = 0; i < rangeDays; i++) {
    const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    const nextDate = new Date(d.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    dayLabels.push(dateStr.slice(5)); // MM-DD

    const signups = (facultySignups ?? []).filter((s: any) => {
      const sd = s.created_at?.slice(0, 10);
      return sd === dateStr;
    }).length;
    signupCounts.push(signups);

    const contacts = (contactsTimeline ?? []).filter((c: any) => {
      const cd = c.created_at?.slice(0, 10);
      return cd >= dateStr && cd < nextDate;
    }).length;
    contactCounts.push(contacts);
  }

  const signupChart = dayLabels.map((l, i) => ({ label: l, value: signupCounts[i] }));
  const contactChart = dayLabels.map((l, i) => ({ label: l, value: contactCounts[i] }));

  // Recent activity (combined from contacts, favorites, signups)
  const recentContacts = await admin
    .from("contacts")
    .select("created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  const recentSignups = await admin
    .from("user_profiles")
    .select("created_at, full_name")
    .eq("role", "faculty")
    .order("created_at", { ascending: false })
    .limit(10);

  const activityItems: { time: string; text: string; type: string }[] = [];

  (recentSignups?.data ?? []).forEach((s: any) => {
    activityItems.push({
      time: fmtDateTime(s.created_at),
      text: `${s.full_name || "Nuevo usuario"} se registró como docente`,
      type: "signup",
    });
  });

  (recentContacts?.data ?? []).forEach((c: any) => {
    activityItems.push({
      time: fmtDateTime(c.created_at),
      text: "Nuevo contacto entre institución y docente",
      type: "contact",
    });
  });

  activityItems.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 20);

  const ranges = [
    { label: "7 días", value: "7" },
    { label: "30 días", value: "30" },
    { label: "90 días", value: "90" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-navy tracking-tight">Analytics</h1>
          <p className="text-gray-500 font-medium mt-1">Visitas, contactos y actividad de la plataforma.</p>
        </div>
        {/* Date range selector */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1">
          {ranges.map((r) => (
            <Link
              key={r.value}
              href={`/control/analytics?range=${r.value}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                String(rangeDays) === r.value
                  ? "bg-navy text-white"
                  : "text-gray-500 hover:text-navy"
              }`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <MiniStat label="Visitas totales" value={totalViews} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <MiniStat label="Contactos totales" value={totalContacts ?? 0} change={`${contactsThisPeriod ?? 0} en período`} positive />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <MiniStat label="Contactos hoy" value={contactsToday ?? 0} change={`${contactsThisWeek ?? 0} esta semana`} positive />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <MiniStat label="Favoritos" value={totalFavorites ?? 0} change={`${favoritesThisPeriod ?? 0} en período`} positive />
        </div>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Signups chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-black text-navy flex items-center gap-2 mb-4">
            <Users size={16} className="text-talentia-blue" />
            Nuevos docentes por día
          </h3>
          <div className="h-48">
            <BarChart
              data={signupChart}
              color="bg-talentia-blue"
              height={160}
              emptyLabel="No hay registros en este período"
            />
          </div>
          <SimpleLine data={signupChart} color="text-talentia-blue" height={60} />
        </div>

        {/* Contacts chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-black text-navy flex items-center gap-2 mb-4">
            <Mail size={16} className="text-green-600" />
            Contactos por día
          </h3>
          <div className="h-48">
            <BarChart
              data={contactChart}
              color="bg-green-500"
              height={160}
              emptyLabel="No hay contactos en este período"
            />
          </div>
          <SimpleLine data={contactChart} color="text-green-600" height={60} />
        </div>
      </div>

      {/* Bottom row: Top profiles + Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top viewed profiles */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Eye size={16} className="text-talentia-blue" />
            <h3 className="text-sm font-black text-navy">Perfiles más vistos</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {(topProfiles ?? []).length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-400 text-center">Sin datos de visitas aún</p>
            ) : (
              (topProfiles ?? []).map((fp: any, i: number) => {
                const name = topNames[fp.user_id] || "Sin nombre";
                const views = fp.view_count ?? 0;
                return (
                  <Link
                    key={fp.user_id}
                    href={`/control/faculty/${fp.user_id}`}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50/50 transition-colors"
                  >
                    <span className="w-6 text-center text-xs font-black text-gray-400">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-navy truncate">{name}</p>
                      {fp.headline && <p className="text-[11px] text-gray-400 truncate">{fp.headline}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-black text-talentia-blue">
                      <Eye size={14} />
                      {views}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <TrendingUp size={16} className="text-energy-orange" />
            <h3 className="text-sm font-black text-navy">Actividad reciente</h3>
          </div>
          <div className="px-6 py-2">
            <ActivityFeed items={activityItems} emptyLabel="Sin actividad reciente en este período" />
          </div>
        </div>
      </div>
    </div>
  );
}