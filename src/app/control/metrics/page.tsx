import { createAdminClient } from "@/lib/supabase-server";
import Stripe from "stripe";
import {
  AlertTriangle, DollarSign, Users, Eye, TrendingUp,
  GraduationCap, Award, Linkedin,
  ChevronRight, MessageSquare, Star, Globe,
} from "lucide-react";

// ── Stripe MRR Helper ──────────────────────────────────────────────────────

async function getMRR(): Promise<{ mrr: number; activeSubscriptions: number }> {
  if (!process.env.STRIPE_SECRET_KEY) return { mrr: 0, activeSubscriptions: 0 };
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
      expand: ["data.items.data.price"],
    });
    let mrr = 0;
    for (const sub of subscriptions.data) {
      const price = sub.items.data[0]?.price;
      if (price && "unit_amount" in price && price.unit_amount) {
        mrr += price.unit_amount;
      }
    }
    return { mrr: mrr / 100, activeSubscriptions: subscriptions.data.length };
  } catch {
    return { mrr: 0, activeSubscriptions: 0 };
  }
}

// ── Profile Completeness Calculator ───────────────────────────────────────

function calculateCompleteness(fp: any, avatarUrl?: string | null): number {
  const fields = [
    fp.headline,
    fp.bio,
    fp.country,
    fp.linkedin_url,
    fp.is_phd,
    fp.aneca_accreditation,
    fp.faculty_areas && Array.isArray(fp.faculty_areas) && fp.faculty_areas.length > 0,
    fp.levels && Array.isArray(fp.levels) && fp.levels.length > 0,
    fp.languages && Array.isArray(fp.languages) && fp.languages.length > 0,
    avatarUrl,                          // avatar en user_profiles, no en faculty_profiles
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

// ── ───────────────────────────────────────────────────────────────────────

export default async function MetricsPage() {
  const admin = createAdminClient();

  // ── Section 1: Alerts data ─────────────────────────────────────────────

  const { count: totalFaculty } = await admin
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "faculty");

  // Faculty without email (check auth.users, not user_profiles.email)
  const { data: facultyNoEmailCheck } = await admin
    .from("user_profiles")
    .select("id")
    .eq("role", "faculty");
  const facultyIds = (facultyNoEmailCheck ?? []).map((u: any) => u.id);
  let facultyNoEmail = 0;
  if (facultyIds.length > 0) {
    const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (authUsers?.users) {
      const authUserIds = new Set(authUsers.users.map((u) => u.id));
      facultyNoEmail = facultyIds.filter((id: string) => !authUserIds.has(id)).length;
    }
  }

  // Faculty profiles for completeness check
  const { data: allFacultyProfiles } = await admin
    .from("faculty_profiles")
    .select("user_id, profile_completeness, headline, bio, country, linkedin_url, is_phd, aneca_accreditation, faculty_areas, levels, languages")
    .limit(500);

  // Fetch user_profiles.avatar_url for completeness calculation
  let avatarMap: Record<string, string | null> = {};
  const fpUserIds = (allFacultyProfiles ?? []).map((fp: any) => fp.user_id).filter(Boolean);
  if (fpUserIds.length > 0) {
    const { data: avatarProfiles } = await admin
      .from("user_profiles")
      .select("id, avatar_url")
      .in("id", fpUserIds);
    if (avatarProfiles) {
      avatarProfiles.forEach((u: any) => { avatarMap[u.id] = u.avatar_url; });
    }
  }

  let completenessZeroCount = 0;
  if (allFacultyProfiles && allFacultyProfiles.length > 0) {
    const hasStoredCompleteness = allFacultyProfiles.some(
      (fp: any) => fp.profile_completeness !== null && fp.profile_completeness !== 0
    );
    if (!hasStoredCompleteness) {
      completenessZeroCount = allFacultyProfiles.filter(
        (fp: any) => calculateCompleteness(fp, avatarMap[fp.user_id]) === 0
      ).length;
    } else {
      completenessZeroCount = allFacultyProfiles.filter(
        (fp: any) => fp.profile_completeness === null || fp.profile_completeness === 0
      ).length;
    }
  }
  const completenessPct =
    allFacultyProfiles?.length
      ? (completenessZeroCount / allFacultyProfiles.length) * 100
      : 0;

  const { mrr, activeSubscriptions } = await getMRR();

  const alerts: { message: string; type: "warning" | "danger" | "info" }[] = [];
  if (facultyNoEmail > 0) {
    alerts.push({
      message: `${facultyNoEmail} docente${facultyNoEmail !== 1 ? "s" : ""} sin email — no contactable${facultyNoEmail !== 1 ? "s" : ""}`,
      type: "warning",
    });
  }
  if (activeSubscriptions === 0) {
    alerts.push({
      message: "0 suscripciones Pro activas — prioridad: convertir instituciones",
      type: "danger",
    });
  }
  if (completenessPct > 80) {
    alerts.push({
      message: "Completeness no calculado — ejecutar actualización SQL",
      type: "info",
    });
  }

  // ── Section 2: KPIs ────────────────────────────────────────────────────

  const { count: activeFaculty } = await admin
    .from("faculty_profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  // Distinct faculty who have received at least one contact
  const { data: contactFacultyIds } = await admin
    .from("contacts")
    .select("faculty_id")
    .limit(5000);
  const uniqueContactFaculty = new Set(
    (contactFacultyIds ?? []).map((c: any) => c.faculty_id)
  ).size;
  const activationRate =
    totalFaculty && totalFaculty > 0
      ? Math.round((uniqueContactFaculty / totalFaculty) * 100)
      : 0;

  const { data: viewData } = await admin
    .from("faculty_profiles")
    .select("view_count")
    .limit(1000);
  const totalViews = (viewData ?? []).reduce(
    (sum: number, fp: any) => sum + (fp.view_count || 0),
    0
  );

  // ── Section 3: Funnel ──────────────────────────────────────────────────

  const { count: funnelProfileOver50 } = await admin
    .from("faculty_profiles")
    .select("*", { count: "exact", head: true })
    .gt("profile_completeness", 50);

  const { count: funnelVisited } = await admin
    .from("faculty_profiles")
    .select("*", { count: "exact", head: true })
    .gt("view_count", 0);

  const { count: funnelPro } = await admin
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .eq("subscription_status", "active");

  const funnelSteps = [
    { label: "Total registrados", value: totalFaculty ?? 0, prev: totalFaculty ?? 0 },
    { label: "Perfil > 50%", value: funnelProfileOver50 ?? 0, prev: totalFaculty ?? 0 },
    { label: "Han recibido visita", value: funnelVisited ?? 0, prev: funnelProfileOver50 ?? 0 },
    { label: "Han recibido contacto", value: uniqueContactFaculty, prev: funnelVisited ?? 0 },
    { label: "Suscripción Pro", value: funnelPro ?? 0, prev: uniqueContactFaculty },
  ];

  // ── Section 3: Institution Signals ────────────────────────────────────

  const { data: institutions } = await admin
    .from("institutions")
    .select("id, name")
    .limit(200);

  const institutionIds = (institutions ?? []).map((inst: any) => inst.id);
  const [{ data: allContactRows }, { data: allFavoriteRows }] = await Promise.all([
    institutionIds.length > 0
      ? admin.from("contacts").select("institution_id").in("institution_id", institutionIds)
      : Promise.resolve({ data: [] as { institution_id: string }[] }),
    institutionIds.length > 0
      ? admin.from("favorites").select("institution_id").in("institution_id", institutionIds)
      : Promise.resolve({ data: [] as { institution_id: string }[] }),
  ]);
  const contactCounts = new Map<string, number>();
  (allContactRows ?? []).forEach((r: any) => contactCounts.set(r.institution_id, (contactCounts.get(r.institution_id) ?? 0) + 1));
  const favoriteCounts = new Map<string, number>();
  (allFavoriteRows ?? []).forEach((r: any) => favoriteCounts.set(r.institution_id, (favoriteCounts.get(r.institution_id) ?? 0) + 1));

  const institutionSignals = (institutions ?? []).map((inst: any) => {
    const contactCount = contactCounts.get(inst.id) ?? 0;
    const favCount = favoriteCounts.get(inst.id) ?? 0;

    let intention: "Alta" | "Media" | "Baja" = "Baja";
    if (contactCount > 0) intention = "Alta";
    else if (favCount > 0) intention = "Media";

    return {
      name: inst.name || "Sin nombre",
      contacts: contactCount,
      favorites: favCount,
      intention,
    };
  });
  institutionSignals.sort((a, b) => {
    const order = { Alta: 3, Media: 2, Baja: 1 };
    return (order[b.intention] ?? 0) - (order[a.intention] ?? 0);
  });

  // ── Section 4: Acquisition Channels ───────────────────────────────────

  const { data: acqData } = await admin
    .from("user_profiles")
    .select("acquisition_channel");

  const acqCounts: Record<string, number> = {};
  let hasChannels = false;
  (acqData ?? []).forEach((r: any) => {
    if (r.acquisition_channel) {
      hasChannels = true;
      acqCounts[r.acquisition_channel] = (acqCounts[r.acquisition_channel] ?? 0) + 1;
    }
  });
  const acqEntries = Object.entries(acqCounts).sort((a, b) => b[1] - a[1]);
  const acqTotal = acqEntries.reduce((s, [, c]) => s + c, 0);

  const CHANNEL_LABELS: Record<string, string> = {
    direct: "Directo",
    organic_search: "Búsqueda orgánica",
    linkedin: "LinkedIn",
    social: "Redes sociales",
    referral: "Referral",
    google: "Google",
    email: "Email",
  };

  // ── Section 4: Academic Profile ───────────────────────────────────────

  const { count: phdCount } = await admin
    .from("faculty_profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_phd", true);

  const { count: anecaCount } = await admin
    .from("faculty_profiles")
    .select("*", { count: "exact", head: true })
    .not("aneca_accreditation", "is", null)
    .neq("aneca_accreditation", "");

  const { count: linkedinCount } = await admin
    .from("faculty_profiles")
    .select("*", { count: "exact", head: true })
    .not("linkedin_url", "is", null)
    .neq("linkedin_url", "");

  const { count: profileOver80 } = await admin
    .from("faculty_profiles")
    .select("*", { count: "exact", head: true })
    .gt("profile_completeness", 80);

  // ── ────────────────────────────────────────────────────────────────────

  function pctOf(part: number, total: number): string {
    if (!total) return "—";
    return `${Math.round((part / total) * 100)}%`;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-navy tracking-tight">Dashboard de negocio</h1>
        <p className="text-gray-500 font-medium mt-1">Métricas accionables en tiempo real.</p>
      </div>

      {/* ── SECTION 1: Alertas automáticas ───────────────────────────── */}
      {alerts.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600" />
            <h2 className="text-xs font-black uppercase tracking-widest text-amber-800">
              Alertas automáticas
            </h2>
          </div>
          <div className="space-y-2">
            {alerts.map((alert, i) => {
              const colors = {
                warning: "bg-amber-100 text-amber-800 border-amber-300",
                danger: "bg-red-100 text-red-800 border-red-300",
                info: "bg-blue-100 text-blue-800 border-blue-300",
              };
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-bold ${colors[alert.type]}`}
                >
                  <div className="w-2 h-2 rounded-full bg-current flex-shrink-0" />
                  {alert.message}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── SECTION 2: KPIs principales ──────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">KPIs principales</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* MRR */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${mrr === 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
              <DollarSign size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">MRR</p>
              <p className={`text-2xl lg:text-3xl font-black mt-0.5 ${mrr === 0 ? "text-red-600" : "text-navy"}`}>
                {mrr.toLocaleString("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 0 })}
              </p>
              <p className="text-xs font-medium mt-0.5">
                {activeSubscriptions > 0
                  ? `${activeSubscriptions} suscripción${activeSubscriptions !== 1 ? "es" : ""} activa${activeSubscriptions !== 1 ? "s" : ""}`
                  : <span className="text-red-500 font-bold">Sin suscripciones activas</span>}
              </p>
            </div>
          </div>

          {/* Docentes activos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-talentia-blue flex items-center justify-center flex-shrink-0">
              <Users size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">Docentes activos</p>
              <p className="text-2xl lg:text-3xl font-black text-navy mt-0.5">{activeFaculty ?? 0}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{pctOf(activeFaculty ?? 0, totalFaculty ?? 0)} del total</p>
            </div>
          </div>

          {/* Tasa de activación */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">Tasa de activación</p>
              <p className="text-2xl lg:text-3xl font-black text-navy mt-0.5">{activationRate}%</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{uniqueContactFaculty} han recibido contacto</p>
            </div>
          </div>

          {/* Visitas totales */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-energy-orange flex items-center justify-center flex-shrink-0">
              <Eye size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">Visitas totales</p>
              <p className="text-2xl lg:text-3xl font-black text-navy mt-0.5">{totalViews.toLocaleString()}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Acumuladas</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Funnel + Institution Signals ──────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-black text-navy">Funnel de docentes</h3>
          </div>
          <div className="p-5 space-y-5">
            {funnelSteps.map((step, i) => {
              const pctOverPrev =
                step.prev > 0 ? Math.round((step.value / step.prev) * 100) : 0;
              const isLow = pctOverPrev < 20 && i > 0;
              const barColor = isLow
                ? "bg-red-400"
                : pctOverPrev < 50 && i > 0
                  ? "bg-orange-400"
                  : "bg-talentia-blue";
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {i > 0 && <ChevronRight size={14} className="text-gray-300" />}
                      <span className="text-sm font-bold text-navy">{step.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-navy">{step.value}</span>
                      {i > 0 && (
                        <span className={`text-xs font-bold ${isLow ? "text-red-500" : "text-gray-400"}`}>
                          ({pctOverPrev}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${Math.max(4, pctOverPrev)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Institution Signals */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-black text-navy">Señales de intención — Instituciones</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
            {institutionSignals.length > 0 ? (
              institutionSignals.map((inst, i) => {
                const badgeColors: Record<string, string> = {
                  Alta: "bg-green-100 text-green-700",
                  Media: "bg-amber-100 text-amber-700",
                  Baja: "bg-gray-100 text-gray-500",
                };
                return (
                  <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-navy truncate">{inst.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MessageSquare size={12} />
                          {inst.contacts} contactos
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Star size={12} />
                          {inst.favorites} favoritos
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full flex-shrink-0 ${badgeColors[inst.intention]}`}
                    >
                      {inst.intention}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                No hay instituciones registradas
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SECTION 4: Acquisition Channels + Academic Profile ────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Acquisition Channels */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-black text-navy">Canales de adquisición</h3>
          </div>
          <div className="p-5">
            {hasChannels ? (
              <div className="space-y-3">
                {acqEntries.map(([channel, count]) => {
                  const pct = Math.round((count / acqTotal) * 100);
                  return (
                    <div key={channel} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-navy">{CHANNEL_LABELS[channel] || channel}</span>
                        <span className="text-gray-400">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-talentia-blue"
                          style={{ width: `${Math.max(4, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-400 text-center py-8">
                Sin datos aún — se llenará con próximos registros
              </div>
            )}
          </div>
        </div>

        {/* Academic Profile */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-black text-navy">Perfil académico del directorio</h3>
          </div>
          <div className="p-5 space-y-4">
            {[
              {
                icon: GraduationCap,
                label: "PhD / Doctores",
                value: phdCount ?? 0,
                pct: pctOf(phdCount ?? 0, totalFaculty ?? 0),
                color: "bg-blue-50 text-talentia-blue",
              },
              {
                icon: Award,
                label: "Acred. ANECA",
                value: anecaCount ?? 0,
                pct: pctOf(anecaCount ?? 0, totalFaculty ?? 0),
                color: "bg-purple-50 text-purple-600",
              },
              {
                icon: Linkedin,
                label: "Con LinkedIn",
                value: linkedinCount ?? 0,
                pct: pctOf(linkedinCount ?? 0, totalFaculty ?? 0),
                color: "bg-sky-50 text-sky-600",
              },
              {
                icon: Globe,
                label: "Perfil > 80%",
                value: profileOver80 ?? 0,
                pct: pctOf(profileOver80 ?? 0, totalFaculty ?? 0),
                color: "bg-green-50 text-green-600",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}
                >
                  <item.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-400">{item.label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-navy">{item.value}</span>
                    <span className="text-xs text-gray-400 font-medium">{item.pct}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}