import { createClient, createAdminClient } from "@/lib/supabase-server";
import { InstitutionSearchPage } from "@/components/dashboard/InstitutionSearchPage";
import { InstitutionWelcomeBanner } from "@/components/dashboard/InstitutionWelcomeBanner";
import { redirect } from "next/navigation";

export default async function InstitutionSearchRoute({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const query    = (params.query    as string) || "";
  const area     = (params.area     as string) || "";
  const subarea  = (params.subarea  as string) || "";
  const country  = (params.country  as string) || "";
  const language = (params.language as string) || "";
  const modality = Array.isArray(params.modality) ? params.modality[0] : (params.modality as string) || "";
  const phd      = (params.phd      as string) || "";
  const aneca    = (params.aneca    as string) || "";

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: institution } = await supabase
    .from("institutions")
    .select("id, name, type, country, location, website, description, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!institution) redirect("/app/institution");

  // Plan check
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("plan, subscription_status")
    .eq("id", user.id)
    .single();

  const isPro = (userProfile?.plan === "institution-pro" || userProfile?.plan === "institution-growth") &&
    (userProfile?.subscription_status === "active" || userProfile?.subscription_status === "trialing");

  const hasSearchParams = !!(
    params.query || params.area || params.subarea || params.country ||
    params.language || params.phd || params.modality || params.aneca
  );

  // Search limit enforcement for Essential plan
  let searchLimitReached = false;
  const admin = createAdminClient();
  const currentMonth = new Date().toISOString().slice(0, 7);

  if (!isPro && hasSearchParams) {
    const { data: usageData } = await admin
      .from("search_usage")
      .select("search_count")
      .eq("institution_id", institution.id)
      .eq("month", currentMonth)
      .maybeSingle();

    if ((usageData?.search_count ?? 0) >= 5) {
      searchLimitReached = true;
    } else {
      await admin.rpc("increment_search_usage", {
        p_institution_id: institution.id,
        p_month: currentMonth,
      });
    }
  }

  // ── Pre-queries (run in parallel) ────────────────────────────────────────
  const [year, monthNum] = currentMonth.split("-").map(Number);
  const nextMonthStr = monthNum === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(monthNum + 1).padStart(2, "0")}-01`;

  // Area / subarea: resolve matching faculty IDs from faculty_expertise table
  const areaExpertiseQuery = (area || subarea)
    ? (() => {
        let q = admin.from("faculty_expertise").select("faculty_id");
        if (area)    q = q.ilike("area", `%${area}%`);
        if (subarea) q = q.or(`area.ilike.%${subarea}%,level.ilike.%${subarea}%`);
        return q;
      })()
    : Promise.resolve({ data: null as null | { faculty_id: string }[] });

  // Also search faculty_profiles.faculty_areas (where new signups store their areas)
  const areaProfilesQuery = area
    ? admin.from("faculty_profiles").select("id").contains("faculty_areas", [area])
    : Promise.resolve({ data: null as null | { id: string }[] });

  // Text search: use admin to bypass RLS on user_profiles
  const namePreQuery = query
    ? admin.from("user_profiles").select("id").ilike("full_name", `%${query}%`)
    : Promise.resolve({ data: null as null | { id: string }[] });

  // Extract the institution's email domain for domain-based blocking
  const userEmailDomain = user.email?.split("@")[1]?.toLowerCase() || null;

  const [
    { data: favoritesData },
    { count: contactsCount },
    { count: monthlyContactsUsed },
    { data: blockedById },
    { data: blockedByName },
    { data: blockedByDomain },
    { data: areaMatchData },
    { data: areaProfilesData },
    { data: nameMatchData },
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
    userEmailDomain
      ? admin.from("visibility_rules").select("faculty_id").eq("domain", userEmailDomain).eq("rule", "block")
      : Promise.resolve({ data: null as null | { faculty_id: string }[] }),
    areaExpertiseQuery,
    areaProfilesQuery,
    namePreQuery,
  ]);

  const favorites = favoritesData?.map((f: any) => f.faculty_id) || [];

  const blockedFacultyIds = new Set([
    ...(blockedById     || []).map((r: any) => r.faculty_id),
    ...(blockedByName   || []).map((r: any) => r.faculty_id),
    ...(blockedByDomain || []).map((r: any) => r.faculty_id),
  ]);

  // Merge area matches from faculty_expertise AND faculty_profiles.faculty_areas
  const areaMatchIds: string[] = [...new Set([
    ...(areaMatchData   || []).map((e: any) => e.faculty_id),
    ...(areaProfilesData || []).map((p: any) => p.id),
  ])];
  const nameMatchIds: string[] = (nameMatchData || []).map((m: any) => m.id);

  // If area/subarea filter is active but produced zero matches, bail out early
  const hasAreaFilter = !!(area || subarea);
  const earlyEmpty = hasAreaFilter && areaMatchIds.length === 0;

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

  if (earlyEmpty) {
    return (
      <>
        {welcomeBanner}
        <InstitutionSearchPage
          initialEducators={[]}
          institutionId={institution.id || ""}
          searchParams={params}
          initialFavorites={favorites}
          isPro={isPro}
          searchLimitReached={searchLimitReached}
          monthlyContactsUsed={monthlyContactsUsed ?? 0}
        />
      </>
    );
  }

  // ── Main DB query with all filters pushed down ────────────────────────────
  let educatorQuery = admin
    .from("faculty_profiles")
    .select(`*, user:user_profiles(full_name, avatar_url, plan, subscription_status), expertise:faculty_expertise(*)`)
    .or("visibility.eq.public,visibility.eq.private,visibility.is.null");

  // Exclude blocked faculty
  if (blockedFacultyIds.size > 0) {
    educatorQuery = educatorQuery.not("id", "in", `(${[...blockedFacultyIds].join(",")})`);
  }

  // Text search: headline + bio + full_name (via pre-queried IDs)
  if (query) {
    const orParts = [`headline.ilike.%${query}%`, `bio.ilike.%${query}%`];
    if (nameMatchIds.length > 0) {
      orParts.push(`id.in.(${nameMatchIds.join(",")})`);
    }
    educatorQuery = educatorQuery.or(orParts.join(","));
  }

  // Country → location column
  if (country) {
    educatorQuery = educatorQuery.ilike("location", `%${country}%`);
  }

  // Area / subarea (resolved via pre-query)
  if (hasAreaFilter) {
    educatorQuery = educatorQuery.in("id", areaMatchIds);
  }

  // PhD
  if (phd === "true") {
    educatorQuery = educatorQuery.eq("is_phd", true);
  }

  // ANECA accreditation
  if (aneca) {
    educatorQuery = educatorQuery.ilike("aneca_accreditation", `%${aneca}%`);
  }

  // Language — JSONB containment: check if languages array contains {lang: "Inglés"}
  if (language) {
    educatorQuery = (educatorQuery as any).filter("languages", "cs", JSON.stringify([{ lang: language }]));
  }

  // Modality → modalities array column (stored as ["Online","Presencial","Híbrida"])
  if (modality) {
    educatorQuery = (educatorQuery as any).contains("modalities", [modality]);
  }

  // First page: 50 results
  const { data: educators } = await educatorQuery.range(0, 49);

  // ── Batch fetch faculty documents for all educators ─────────────────────
  const educatorIds = (educators || []).map((ed: any) => ed.id);
  let documentsMap: Record<string, any[]> = {};
  if (educatorIds.length > 0) {
    const { data: allDocs } = await admin
      .from("faculty_documents")
      .select("id, name, file_name, file_path, doc_type, faculty_id, created_at")
      .in("faculty_id", educatorIds)
      .order("created_at", { ascending: false });
    if (allDocs) {
      documentsMap = allDocs.reduce((acc: Record<string, any[]>, doc: any) => {
        const fid = doc.faculty_id;
        if (!acc[fid]) acc[fid] = [];
        acc[fid].push(doc);
        return acc;
      }, {});
    }
  }

  const transformedEducators = (educators || [])
    .map((ed: any) => {
      const userJoin = ed.user;
      const userObj = Array.isArray(userJoin) ? userJoin[0] : userJoin;
      const isFacultyPro = userObj?.plan === "faculty-pro" && userObj?.subscription_status === "active";
      return {
        ...ed,
        full_name: userObj?.full_name || ed.full_name || "Docente",
        avatar_url: userObj?.avatar_url || null,
        country: ed.country || ed.location || null,
        city: ed.city || null,
        experience_years: ed.years_teaching || ed.years_experience || 0,
        is_pro: isFacultyPro,
        faculty_documents: documentsMap[ed.id] || [],
      };
    })
    .sort((a: any, b: any) => {
      if (a.is_pro && !b.is_pro) return -1;
      if (!a.is_pro && b.is_pro) return 1;
      return 0;
    });

  return (
    <>
      {welcomeBanner}
      <InstitutionSearchPage
        initialEducators={transformedEducators}
        institutionId={institution.id || ""}
        searchParams={params}
        initialFavorites={favorites}
        isPro={isPro}
        searchLimitReached={searchLimitReached}
        monthlyContactsUsed={monthlyContactsUsed ?? 0}
      />
    </>
  );
}
