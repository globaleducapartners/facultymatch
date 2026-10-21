import { createClient, createAdminClient, getCurrentUser, getCurrentProfile } from "@/lib/supabase-server";
import { calcFacultyCompleteness, completenessInputFromRows } from "@/lib/faculty-completeness";
import {
  ArrowRight,
  MapPin,
  ExternalLink,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DismissNotificationButton from "@/components/profile/DismissNotificationButton";
import { formatDateTZ, formatDateTimeTZ } from "@/lib/utils";

// ─── Resource articles ────────────────────────────────────────────────────────

// Estos slugs deben existir en src/app/resources/*/ — antes 3 de los 4
// apuntaban a artículos que no existían (404) y uno tenía "2025" en el título.
const RESOURCES = [
  {
    slug: "optimiza-perfil-docente",
    title: "Cómo optimizar tu perfil docente para conseguir más oportunidades",
    category: "Perfil",
  },
  {
    slug: "estandares-verificacion",
    title: "Estándares de verificación: cómo validamos cada perfil",
    category: "Verificación",
  },
  {
    slug: "docencia-online-microcredenciales",
    title: "El futuro de la docencia online y las microcredenciales",
    category: "Tendencias",
  },
  {
    slug: "taxonomia-academica",
    title: "Cómo clasificamos el conocimiento para que te encuentren",
    category: "Estructura",
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default async function EducatorDashboard() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await getCurrentProfile(user.id);

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
    { data: expertiseData },
    { data: adminNotifications },
  ] = await Promise.all([
    supabase.from("faculty_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("faculty_expertise").select("id").eq("faculty_id", user.id).limit(1),
    supabase
      .from("admin_notifications")
      .select("*")
      .eq("faculty_id", user.id)
      .is("read_at", null)
      .order("sent_at", { ascending: false })
      .limit(5),
  ]);

  // Use the faculty_profiles PK (id) for FK lookups — it's the correct join key for
  // favorites.faculty_id and contacts.faculty_id (references faculty_profiles.id, not auth.users.id)
  const facultyProfileId = facultyProfile?.id || user.id;

  const [
    { data: recentRequests },
    { count: favoritesCount },
    { count: contactsCount },
  ] = await Promise.all([
    admin
      .from("contacts")
      .select("*, institution:institutions(name, country)")
      .eq("faculty_id", facultyProfileId)
      .order("created_at", { ascending: false })
      .limit(3),
    admin.from("favorites").select("*", { count: "exact", head: true }).eq("faculty_id", facultyProfileId),
    admin.from("contacts").select("*", { count: "exact", head: true }).eq("faculty_id", facultyProfileId),
  ]);

  const userMeta = user.user_metadata || {};
  const verificationStatus: string = facultyProfile?.estado_perfil || "incompleto";
  const verificationNotes: string | null = facultyProfile?.verification_notes || null;

  const languages: any[] = facultyProfile?.languages || [];
  const history: any[] = facultyProfile?.institutions_taught || [];
  const rawAreas: string[] = facultyProfile?.faculty_areas?.length > 0
    ? facultyProfile.faculty_areas
    : (userMeta.knowledge_areas || []);
  const areas: any[] = rawAreas.map((a: string) => ({ id: a, area: a }));

  const hasExpertise = (expertiseData?.length ?? 0) > 0;
  const hasAreas = hasExpertise || (facultyProfile?.faculty_areas || []).length > 0;

  // Completitud — cálculo unificado (src/lib/faculty-completeness.ts), el
  // mismo número que ve el docente en el editor y el admin en /control.
  const { score: progress, missing } = calcFacultyCompleteness(
    completenessInputFromRows(facultyProfile, profile, hasAreas)
  );
  // `pendingItems` conserva la forma { label, href } que espera la UI de
  // "secciones que faltan"; el href lleva a la pantalla donde se rellena.
  const MISSING_HREF: Record<string, string> = {
    "Área de especialidad": "/app/faculty/specialties",
    "Foto de perfil": "/app/faculty/profile",
  };
  const pendingItems = missing.map((label) => ({
    label,
    href: MISSING_HREF[label] || "/app/faculty/profile",
  }));

  const isPro = profile?.plan === "faculty-pro" && profile?.subscription_status === "active";

  const rawReferralStats = (facultyProfile?.referral_stats as Record<string, number>) || {};
  const successfulReferrals = typeof rawReferralStats.successful_referrals === "number"
    ? rawReferralStats.successful_referrals
    : 0;

  const firstName = profile?.full_name?.split(" ")[0] || userMeta?.full_name?.split(" ")[0] || user.email?.split("@")[0];

  const STATUS: Record<string, { dot: string; title: string; body: string }> = {
    verificado: { dot: "bg-fm-gold", title: "Perfil verificado", body: "Tu perfil es visible para instituciones de todo el mundo." },
    en_revision: { dot: "bg-amber-500", title: "Tu perfil está en revisión", body: "Nuestro equipo está revisando tu perfil. Recibirás un email en 24-48 horas laborables." },
    incompleto: { dot: "bg-fm-blue", title: "Perfil incompleto", body: verificationNotes || "Completa tu perfil para enviarlo a revisión y empezar a recibir propuestas." },
    rechazado: { dot: "bg-red-600", title: "Perfil no aprobado", body: verificationNotes || "Revisa la información de tu perfil y vuelve a enviarlo." },
  };
  const status = STATUS[verificationStatus] ?? STATUS.incompleto;
  const visibility = facultyProfile?.visibility;
  const isPublic = visibility === "public";

  const cardCls = "rounded-xl border border-fm-border bg-white";

  return (
    <div className="space-y-6 pb-20 lg:pb-0">

      {/* ── Cabecera ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-extrabold tracking-[-0.035em] text-fm-ink">Hola, {firstName}.</h1>
          <p className="mt-1 text-[#5B6B85]">
            {progress === 100
              ? "Tu perfil está completo. Las instituciones pueden encontrarte fácilmente."
              : "Esto es lo que necesita tu atención."}
          </p>
        </div>
        <Button asChild className="h-11 rounded-[10px] bg-fm-blue px-6 font-bold text-white hover:opacity-90">
          <Link href="/app/faculty/profile">{progress === 100 ? "Editar perfil" : "Completar perfil"}</Link>
        </Button>
      </div>

      {/* ── Estado y progreso ── */}
      <div className={`${cardCls} p-6`}>
        {verificationStatus === "verificado" && (
          <>
            <div className="mb-5 flex items-center gap-2.5 text-[15px] font-semibold text-fm-ink">
              <span className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`} aria-hidden />
              {status.title}
              <span className="font-normal text-[#5B6B85]">{status.body}</span>
            </div>
          </>
        )}
        {verificationStatus === "rechazado" && (
          <Link href="/app/faculty/profile" className="mb-5 inline-block text-sm font-bold text-fm-blue hover:underline">
            Mejorar mi perfil
          </Link>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-fm-ink">Perfil completado</span>
          <span className="font-extrabold tabular-nums text-fm-ink">{progress}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E6ECF7]" role="img" aria-label={`Perfil completado al ${progress}%`}>
          <div className="h-full rounded-full bg-fm-blue transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>
        {pendingItems.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
            {pendingItems.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="font-semibold text-fm-blue hover:underline">
                  Añadir {item.label.charAt(0).toLowerCase() + item.label.slice(1)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Avisos del equipo ── */}
      {adminNotifications && adminNotifications.length > 0 && adminNotifications.map((notif: any) => (
        <div key={notif.id} className={`${cardCls} flex items-start gap-3 p-5`}>
          <Bell size={18} className="mt-0.5 shrink-0 text-fm-blue" />
          <div className="flex-1">
            <p className="text-sm font-bold text-fm-ink">{notif.subject}</p>
            {notif.body && <p className="mt-0.5 text-sm text-[#5B6B85]">{notif.body}</p>}
            <p className="mt-1 text-xs text-[#5E6F8E]">{formatDateTimeTZ(notif.sent_at)}</p>
          </div>
          <DismissNotificationButton notificationId={notif.id} />
        </div>
      ))}

      {/* ── Importar de ORCID ── */}
      {!facultyProfile?.orcid_import_data && (
        <div className={`${cardCls} flex flex-wrap items-center justify-between gap-3 p-5`}>
          <div>
            <p className="text-sm font-bold text-fm-ink">Tráete tu perfil de ORCID</p>
            <p className="mt-0.5 text-sm text-[#5B6B85]">Afiliaciones, publicaciones y citas, todo desde tu ORCID en segundos.</p>
          </div>
          <Link href="/app/faculty/profile?tab=research" className="text-sm font-bold text-fm-blue hover:underline">
            Ir a importar
          </Link>
        </div>
      )}

      {/* ── Cifras ── */}
      <div className={`${cardCls} grid grid-cols-1 divide-y divide-fm-border min-[480px]:grid-cols-3 min-[480px]:divide-x min-[480px]:divide-y-0`}>
        {[
          { label: "En favoritos", value: (favoritesCount ?? 0).toString() },
          { label: "Solicitudes recibidas", value: (contactsCount ?? 0).toString() },
          { label: "Idiomas", value: languages.length > 0 ? languages.map((l: any) => (typeof l === "string" ? l : l.lang ?? "")).filter(Boolean).join(", ") : "—" },
        ].map((stat) => (
          <div key={stat.label} className="min-w-0 px-6 py-5">
            <p className="truncate text-[1.6rem] font-extrabold leading-none tracking-[-0.03em] text-fm-ink tabular-nums">{stat.value}</p>
            <p className="mt-2 text-sm text-[#5B6B85]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">

        {/* ── Columna principal ── */}
        <div className="min-w-0 space-y-6">

          {/* Solicitudes recientes */}
          <div className={cardCls}>
            <div className="flex items-center justify-between px-6 pb-2 pt-5">
              <h2 className="text-base font-bold tracking-[-0.02em] text-fm-ink">Solicitudes recientes</h2>
              <Link href="/app/faculty/requests" className="text-sm font-bold text-fm-blue hover:underline">Ver todas</Link>
            </div>
            {recentRequests && recentRequests.length > 0 ? (
              <ul>
                {recentRequests.map((req: any) => (
                  <li key={req.id} className="border-t border-fm-border px-6 py-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-bold text-fm-ink">{req.institution?.name ?? "Institución"}</p>
                      <span className="shrink-0 text-xs text-[#5E6F8E]">{formatDateTZ(req.created_at)}</span>
                    </div>
                    {req.message && <p className="mt-0.5 truncate text-[13px] text-[#5E6F8E]">{req.message}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="border-t border-fm-border px-6 py-8">
                <p className="text-sm font-bold text-fm-ink">Aún no tienes solicitudes</p>
                <p className="mt-1 max-w-[46ch] text-sm text-[#5B6B85]">
                  Cuando una institución quiera contactarte, aparecerá aquí. Completa tu perfil para aparecer primero.
                </p>
              </div>
            )}
          </div>

          {/* Recursos */}
          <div className={cardCls}>
            <div className="flex items-center justify-between px-6 pb-2 pt-5">
              <h2 className="text-base font-bold tracking-[-0.02em] text-fm-ink">Recursos para docentes</h2>
              <a href="/resources" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-fm-blue hover:underline">
                Ver todos
              </a>
            </div>
            <ul>
              {RESOURCES.map((r) => (
                <li key={r.slug} className="border-t border-fm-border">
                  <a
                    href={`/resources/${r.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 px-6 py-3.5 transition-colors hover:bg-fm-surface"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-snug text-fm-ink">{r.title}</span>
                      <span className="mt-0.5 block text-xs text-[#5E6F8E]">{r.category}</span>
                    </span>
                    <ArrowRight size={15} className="shrink-0 text-[#5E6F8E]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Columna lateral ── */}
        <div className="min-w-0 space-y-6">

          {/* Cómo apareces */}
          <div className={`${cardCls} p-5`}>
            <h3 className="text-base font-bold tracking-[-0.02em] text-fm-ink">Así apareces</h3>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-fm-navy text-sm font-extrabold text-white">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
                ) : (
                  profile?.full_name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "?"
                )}
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-2 truncate text-sm font-bold text-fm-ink">
                  {profile?.full_name || "Tu nombre"}
                  {isPro && <span className="text-xs font-semibold text-[#5E6F8E]">Pro</span>}
                </p>
                <p className="line-clamp-2 text-[13px] leading-snug text-[#5B6B85]">
                  {facultyProfile?.headline || "Sin titular"}
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-1 text-[13px] text-[#5B6B85]">
              {(facultyProfile?.location || facultyProfile?.city) && (
                <li className="flex items-center gap-1.5"><MapPin size={13} />{[facultyProfile.city, facultyProfile.location].filter(Boolean).join(", ")}</li>
              )}
              {facultyProfile?.availability && (
                <li>{facultyProfile.availability === "open" ? "Disponible ahora" : facultyProfile.availability}</li>
              )}
              {areas.length > 0 && <li>{areas.slice(0, 2).map((a: any) => a.area).join(" · ")}</li>}
              {(facultyProfile?.years_experience ?? 0) > 0 && <li>{facultyProfile.years_experience} años de experiencia</li>}
            </ul>
            <Link href="/app/faculty/profile" className="mt-4 inline-block text-sm font-bold text-fm-blue hover:underline">
              Editar perfil
            </Link>
          </div>

          {/* Visibilidad */}
          <div className={`${cardCls} p-5`}>
            <h3 className="text-base font-bold tracking-[-0.02em] text-fm-ink">Visibilidad</h3>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-fm-ink">
                {isPublic ? "Perfil público" : visibility === "hidden" ? "Perfil oculto" : "Perfil privado"}
              </span>
              <Link href="/app/faculty/privacy" className="font-bold text-fm-blue hover:underline">Cambiar</Link>
            </div>
            {isPublic && facultyProfile?.profile_slug ? (
              <a
                href={`https://facultymatch.app/docentes/${facultyProfile.profile_slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex max-w-full items-center gap-1.5 truncate text-[13px] font-semibold text-fm-blue hover:underline"
              >
                facultymatch.app/docentes/{facultyProfile.profile_slug}
                <ExternalLink size={12} className="shrink-0" />
              </a>
            ) : (
              <p className="mt-2 text-[13px] leading-relaxed text-[#5B6B85]">
                {visibility === "hidden"
                  ? "Ninguna institución podrá encontrarte en el buscador ni en el directorio."
                  : "Tu enlace público aún no funciona. Cámbialo a público cuando quieras que las instituciones puedan verlo."}
              </p>
            )}
          </div>

          {/* Plan */}
          {isPro ? (
            <div className="rounded-xl bg-fm-navy p-5 text-white">
              <h3 className="text-base font-bold tracking-[-0.02em]">Plan Professional</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                Tu perfil aparece <strong className="text-white">prioritario</strong> en búsquedas y tienes privacidad avanzada.
              </p>
              {profile?.subscription_current_period_end && (() => {
                const end = new Date(profile.subscription_current_period_end);
                const daysLeft = Math.max(0, Math.round((end.getTime() - Date.now()) / 86400000));
                return (
                  <div className="mt-4 border-t border-white/15 pt-3 text-sm">
                    <p className="text-white/60">Renovación</p>
                    <p className="mt-0.5 font-semibold">
                      {formatDateTZ(profile.subscription_current_period_end, { day: "2-digit", month: "long", year: "numeric" })}
                      <span className="ml-2 font-normal text-white/60">{daysLeft} días</span>
                    </p>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className={`${cardCls} p-5`}>
              <h3 className="text-base font-bold tracking-[-0.02em] text-fm-ink">Plan Professional</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5B6B85]">
                Aparece primero en búsquedas, visibilidad preferente ante instituciones y estadísticas de visitas.
              </p>
              <p className="mt-3 text-[1.4rem] font-extrabold tracking-[-0.03em] text-fm-ink">
                29 € <span className="text-sm font-medium text-[#5B6B85]">/ año</span>
              </p>
              <Link
                href="/checkout?plan=faculty-pro"
                className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-fm-blue text-sm font-bold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
              >
                Activar plan Professional
              </Link>
            </div>
          )}

          {/* Invita y gana */}
          {successfulReferrals < 10 && (
            <div className={`${cardCls} p-5`}>
              <h3 className="text-base font-bold tracking-[-0.02em] text-fm-ink">Invita y Gana</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5B6B85]">
                Cuando 10 colegas verifiquen su perfil con tu enlace, te regalamos 1 año del plan Professional.
              </p>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-[#5B6B85]">Invitaciones exitosas</span>
                <span className="font-extrabold tabular-nums text-fm-ink">{successfulReferrals}/10</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E6ECF7]">
                <div className="h-full rounded-full bg-fm-blue" style={{ width: `${Math.min(100, (successfulReferrals / 10) * 100)}%` }} />
              </div>
              <Link href="/app/faculty/referrals" className="mt-3 inline-block text-sm font-bold text-fm-blue hover:underline">
                Ver mis invitaciones
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
