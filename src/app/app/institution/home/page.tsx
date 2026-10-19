import { createClient, createAdminClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { formatDateTZ } from "@/lib/utils";

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

  const subscriptionActive = userProfile?.subscription_status === "active" || userProfile?.subscription_status === "trialing";
  const isPro = userProfile?.plan === "institution-pro" && subscriptionActive;
  const searchMonthlyLimit = isPro ? null : 5;

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
    searchMonthlyLimit !== null
      ? admin.from("search_usage").select("search_count").eq("institution_id", institution.id).eq("month", currentMonth).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const searchesUsed = (usageData as any)?.search_count ?? 0;
  const isPending = institution.status === "pending";
  const isBlocked = institution.status === "blocked";

  // Profile completion
  const profileFields = [institution.name, (institution as any).type, institution.country, institution.description, institution.website];
  const profileCompletion = Math.round(profileFields.filter(Boolean).length / profileFields.length * 100);

  const cardCls = "rounded-xl border border-fm-border bg-white";
  const figures = [
    { label: "Contactos totales", value: totalContacts ?? 0, href: "/app/institution/contacts" },
    { label: "Contactos este mes", value: monthlyContacts ?? 0, href: "/app/institution/contacts" },
    { label: "Favoritos", value: favoritesCount ?? 0, href: "/app/institution/favorites" },
    {
      label: searchMonthlyLimit === null ? "Búsquedas ilimitadas" : "Búsquedas este mes",
      value: searchMonthlyLimit === null ? "∞" : `${searchesUsed}/${searchMonthlyLimit}`,
      href: "/app/institution/search",
    },
  ];
  const checklist = [
    { label: "Nombre", done: !!institution.name },
    { label: "Tipo de institución", done: !!(institution as any).type },
    { label: "País y ciudad", done: !!institution.country },
    { label: "Descripción", done: !!institution.description },
    { label: "Web oficial", done: !!institution.website },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-0">

      {/* ── Cabecera ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-extrabold tracking-[-0.035em] text-fm-ink">
            {institution.name || "Mi institución"}
          </h1>
          <p className="mt-1 text-[#5B6B85]">
            {[institution.city, institution.country].filter(Boolean).join(", ") || "Completa tu perfil para aparecer mejor"}
          </p>
        </div>
        <Link
          href="/app/institution/search"
          className="inline-flex h-11 items-center justify-center rounded-[10px] bg-fm-blue px-6 text-sm font-bold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
        >
          Buscar docentes
        </Link>
      </div>

      {/* ── Estado de la cuenta ── */}
      {isPending && (
        <div className={`${cardCls} p-5`}>
          <p className="flex items-center gap-2.5 text-[15px] font-semibold text-fm-ink">
            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" aria-hidden />
            Cuenta en revisión
          </p>
          <p className="mt-1.5 text-sm text-[#5B6B85]">
            Nuestro equipo revisará tu cuenta en 24-48 horas hábiles. Mientras tanto puedes completar tu perfil.
          </p>
        </div>
      )}
      {isBlocked && (
        <div className={`${cardCls} p-5`}>
          <p className="flex items-center gap-2.5 text-[15px] font-semibold text-fm-ink">
            <span className="h-2 w-2 shrink-0 rounded-full bg-red-600" aria-hidden />
            Cuenta suspendida
          </p>
          <p className="mt-1.5 text-sm text-[#5B6B85]">Contacta con soporte para más información: support@facultymatch.app</p>
        </div>
      )}

      {/* ── Cifras ── */}
      <div className={`${cardCls} grid grid-cols-2 sm:grid-cols-4`}>
        {figures.map((stat, i) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`px-6 py-5 transition-colors hover:bg-fm-surface ${i > 0 ? "sm:border-l sm:border-fm-border" : ""} ${i % 2 === 1 ? "border-l border-fm-border sm:border-l" : ""} ${i > 1 ? "border-t border-fm-border sm:border-t-0" : ""}`}
          >
            <p className="text-[1.6rem] font-extrabold leading-none tracking-[-0.03em] text-fm-ink tabular-nums">{stat.value}</p>
            <p className="mt-2 text-sm text-[#5B6B85]">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">

        {/* ── Contactos recientes ── */}
        <div className={`${cardCls} min-w-0 self-start`}>
          <div className="flex items-center justify-between px-6 pb-2 pt-5">
            <h2 className="text-base font-bold tracking-[-0.02em] text-fm-ink">Contactos recientes</h2>
            <Link href="/app/institution/contacts" className="text-sm font-bold text-fm-blue hover:underline">Ver todos</Link>
          </div>
          {recentContacts && recentContacts.length > 0 ? (
            <ul>
              {recentContacts.map((contact: any) => {
                const fp = contact.faculty;
                const userObj = Array.isArray(fp?.user) ? fp?.user[0] : fp?.user;
                const name = userObj?.full_name || "Docente";

                // Último mensaje del hilo, para el "último seguimiento"
                let lastMsgText = contact.message;
                let lastMsgSender = "Tú";
                let lastMsgDate = contact.created_at;

                const rawFollowUps = contact.follow_ups;
                if (Array.isArray(rawFollowUps) && rawFollowUps.length > 0) {
                  const lastFu = rawFollowUps[rawFollowUps.length - 1];
                  lastMsgText = lastFu.message;
                  lastMsgSender = lastFu.sender === "institution" ? "Tú" : name;
                  lastMsgDate = lastFu.created_at || contact.created_at;
                } else if (contact.reply_message) {
                  lastMsgText = contact.reply_message;
                  lastMsgSender = name;
                  lastMsgDate = contact.replied_at || contact.created_at;
                }

                const isReplied = contact.status === "replied";
                const isSent = contact.status === "sent" || contact.status === "pending";

                return (
                  <li key={contact.id} className="border-t border-fm-border px-6 py-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-bold text-fm-ink">{name}</p>
                      <span className="flex shrink-0 items-center gap-2 text-xs text-[#5E6F8E]">
                        <span className={`font-semibold ${isReplied ? "text-fm-ink" : isSent ? "text-fm-blue" : ""}`}>
                          {isReplied ? "Respondida" : isSent ? "Enviada" : "Archivada"}
                        </span>
                        {formatDateTZ(lastMsgDate)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[13px] text-[#5E6F8E]">
                      <span className="font-semibold text-[#5B6B85]">{lastMsgSender}:</span> {lastMsgText}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="border-t border-fm-border px-6 py-8">
              <p className="text-sm font-bold text-fm-ink">Aún no has contactado docentes</p>
              <p className="mt-1 max-w-[46ch] text-sm text-[#5B6B85]">
                Busca en el directorio y envía propuestas a los profesores que encajen con tus programas.
              </p>
              <Link
                href="/app/institution/search"
                className="mt-4 inline-flex h-11 items-center justify-center rounded-[10px] border border-fm-border bg-white px-6 text-sm font-semibold text-fm-navy transition-colors hover:border-fm-blue"
              >
                Explorar directorio
              </Link>
            </div>
          )}
        </div>

        {/* ── Lateral ── */}
        <div className="min-w-0 space-y-6">

          <div className={`${cardCls} p-5`}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold tracking-[-0.02em] text-fm-ink">Perfil de institución</h3>
              <span className="text-sm font-extrabold tabular-nums text-fm-ink">{profileCompletion}%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E6ECF7]" role="img" aria-label={`Perfil completado al ${profileCompletion}%`}>
              <div className="h-full rounded-full bg-fm-blue transition-[width] duration-500" style={{ width: `${profileCompletion}%` }} />
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {checklist.map((item) => (
                <li key={item.label} className={`flex items-center gap-2.5 ${item.done ? "text-[#5B6B85]" : "font-semibold text-fm-ink"}`}>
                  {item.done ? (
                    <CheckCircle2 size={15} className="shrink-0 text-fm-blue" />
                  ) : (
                    <span className="h-[15px] w-[15px] shrink-0 rounded-full border border-[#B9C6E0]" aria-hidden />
                  )}
                  {item.label}
                </li>
              ))}
            </ul>
            <Link href="/app/institution" className="mt-4 inline-block text-sm font-bold text-fm-blue hover:underline">
              Editar perfil
            </Link>
          </div>

          {isPro ? (
            <div className="rounded-xl bg-fm-navy p-5 text-white">
              <h3 className="text-base font-bold tracking-[-0.02em]">Plan Professional</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                Búsquedas ilimitadas, contactos ilimitados y acceso completo al directorio.
              </p>
              <p className="mt-3 text-sm font-semibold text-white/90">Activo</p>
            </div>
          ) : (
            <div className={`${cardCls} p-5`}>
              <h3 className="text-base font-bold tracking-[-0.02em] text-fm-ink">Plan Professional</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5B6B85]">
                Búsquedas y contactos ilimitados. Encuentra el profesorado ideal para todos tus programas.
              </p>
              <p className="mt-3 text-[1.4rem] font-extrabold tracking-[-0.03em] text-fm-ink">
                99 € <span className="text-sm font-medium text-[#5B6B85]">/ mes</span>
              </p>
              <Link
                href="/app/institution/billing"
                className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-fm-blue text-sm font-bold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
              >
                Activar plan Professional
              </Link>
              {searchesUsed >= 5 && (
                <p className="mt-3 text-[13px] font-semibold text-red-600">
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
