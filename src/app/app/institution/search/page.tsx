import { createClient, createAdminClient } from "@/lib/supabase-server";
import { InstitutionSearchPage } from "@/components/dashboard/InstitutionSearchPage";
import { InstitutionWelcomeBanner } from "@/components/dashboard/InstitutionWelcomeBanner";
import { redirect } from "next/navigation";
import { matchesBlockedDomain } from "@/lib/domain";
import { parseFacultySearchParams, searchFacultyProfiles } from "@/lib/faculty-search";

export default async function InstitutionSearchRoute({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const filters = parseFacultySearchParams(params);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: institution } = await supabase
    .from("institutions")
    .select("id, name, type, country, location, website, description, created_at, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!institution) redirect("/app/institution");

  // A suspended institution has no business seeing search results at all —
  // previously "blocked" only drove a banner on the dashboard home, the
  // search route itself never checked it.
  if ((institution as any).status === "blocked") {
    redirect("/app/institution/home");
  }

  // Plan check — three real tiers, not a binary isPro. Essential (free): 5
  // searches/month. Growth: 20/month. Professional: unlimited. Previously
  // Growth was silently treated as equivalent to Professional here, giving
  // it unlimited access it isn't sold or billed for (see billing/page.tsx).
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("plan, subscription_status")
    .eq("id", user.id)
    .single();

  const subscriptionActive = userProfile?.subscription_status === "active" || userProfile?.subscription_status === "trialing";
  const isPro = userProfile?.plan === "institution-pro" && subscriptionActive;
  const isGrowth = userProfile?.plan === "institution-growth" && subscriptionActive;
  const searchMonthlyLimit = isPro ? null : isGrowth ? 20 : 5;

  const hasSearchParams = !!(
    params.query || params.area || params.subarea || params.country ||
    params.language || params.phd || params.modality || params.aneca
  );

  // Search limit enforcement — the RPC itself does the check-and-increment
  // atomically (FOR UPDATE) and returns whether this search was allowed, so
  // there's no separate read-then-write race here anymore.
  let searchLimitReached = false;
  const admin = createAdminClient();
  const currentMonth = new Date().toISOString().slice(0, 7);

  if (searchMonthlyLimit !== null && hasSearchParams) {
    const { data: allowed } = await admin.rpc("increment_search_usage", {
      p_institution_id: institution.id,
      p_month: currentMonth,
      p_monthly_limit: searchMonthlyLimit,
    });
    if (!allowed) searchLimitReached = true;
  }

  const [year, monthNum] = currentMonth.split("-").map(Number);
  const nextMonthStr = monthNum === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(monthNum + 1).padStart(2, "0")}-01`;

  // Extract the institution's email domain for domain-based blocking
  const userEmailDomain = user.email?.split("@")[1]?.toLowerCase() || null;

  const [
    { data: favoritesData },
    { count: contactsCount },
    { count: monthlyContactsUsed },
    { data: blockedById },
    { data: blockedByName },
    { data: blockedByDomain },
  ] = await Promise.all([
    admin.from("favorites").select("faculty_id").eq("institution_id", institution.id),
    supabase.from("contacts").select("*", { count: "exact", head: true }).eq("institution_id", institution.id),
    supabase.from("contacts").select("*", { count: "exact", head: true })
      .eq("institution_id", institution.id)
      .gte("created_at", `${currentMonth}-01`)
      .lt("created_at", nextMonthStr),
    admin.from("visibility_rules").select("faculty_id").eq("institution_id", institution.id).eq("rule", "block"),
    institution.name
      ? admin.from("visibility_rules").select("faculty_id").ilike("institution_name", institution.name).eq("rule", "block")
      : Promise.resolve({ data: null as null | { faculty_id: string }[] }),
    // Fetch all blocked rules by domain (not just exact match),
    // then filter in code to support subdomain matching
    admin.from("visibility_rules").select("faculty_id, domain").not("domain", "is", "null").eq("rule", "block"),
  ]);

  const favorites = favoritesData?.map((f: any) => f.faculty_id) || [];

  // Subdomain-aware domain blocking: if the user's email domain matches a blocked
  // domain or is a subdomain of it (e.g. alu.ucam.edu matches blocked ucam.edu),
  // include that faculty_id in the blocked set.
  const domainBlockedIds: string[] = [];
  if (userEmailDomain && blockedByDomain) {
    for (const rule of blockedByDomain) {
      if (matchesBlockedDomain(userEmailDomain, (rule as any).domain)) {
        domainBlockedIds.push(rule.faculty_id);
      }
    }
  }

  const blockedFacultyIds = new Set([
    ...(blockedById     || []).map((r: any) => r.faculty_id),
    ...(blockedByName   || []).map((r: any) => r.faculty_id),
    ...domainBlockedIds,
  ]);

  const isNewUser = !!(
    institution.created_at &&
    Date.now() - new Date(institution.created_at).getTime() < 1000 * 60 * 60 * 24 * 30
  );

  const welcomeBanner = isNewUser ? (
    <InstitutionWelcomeBanner
      institutionName={institution.name || ""}
      institutionId={institution.id}
      hasDescription={!!institution.description}
      hasFavorites={favorites.length > 0}
      hasContacts={(contactsCount ?? 0) > 0}
      storageKey={`fm_welcome_inst_${institution.id}`}
    />
  ) : null;

  // First page: 50 results — skipped entirely once the plan's monthly search
  // quota is exhausted, so an over-limit institution never actually receives
  // real results (previously this ran unconditionally and only the usage
  // counter stopped incrementing — the "limit" was cosmetic).
  const { transformedEducators, transformedPending } = await searchFacultyProfiles(admin, filters, {
    blockedFacultyIds,
    skip: searchLimitReached,
    logPrefix: "[institution/search]",
  });

  const contactMonthlyLimit = isPro ? null : isGrowth ? 20 : 5;

  return (
    <>
      {welcomeBanner}
      <InstitutionSearchPage
        initialEducators={transformedEducators}
        pendingEducators={transformedPending}
        institutionId={institution.id || ""}
        searchParams={params}
        initialFavorites={favorites}
        isPro={isPro}
        isGrowth={isGrowth}
        contactMonthlyLimit={contactMonthlyLimit}
        searchMonthlyLimit={searchMonthlyLimit ?? 5}
        searchLimitReached={searchLimitReached}
        monthlyContactsUsed={monthlyContactsUsed ?? 0}
      />
    </>
  );
}
