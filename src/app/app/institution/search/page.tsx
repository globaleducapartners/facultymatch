import { createClient, createAdminClient } from "@/lib/supabase-server";
import { InstitutionSearchPage } from "@/components/dashboard/InstitutionSearchPage";
import { InstitutionWelcomeBanner } from "@/components/dashboard/InstitutionWelcomeBanner";
import { redirect } from "next/navigation";
import { matchesBlockedDomain } from "@/lib/domain";
import { escapeOrValue } from "@/lib/postgrest-filter";

// ─── Area → Spanish keywords mapping ──────────────────────────────────────────
const AREA_KEYWORDS: Record<string, string[]> = {
  "Business & Management": [
    "negocios", "business", "management", "administración", "administracion",
    "marketing", "ventas", "emprendimiento", "emprendedurismo",
    "recursos humanos", "logística", "logistica", "comercio",
  ],
  "Economía & Finanzas": [
    "economía", "economia", "finanzas", "financiero", "contabilidad",
    "mba", "finance",
  ],
  "Derecho & Ciencias Políticas": [
    "derecho", "jurídico", "juridico", "políticas", "politicas",
    "ciencias políticas", "civil", "penal", "constitucional",
    "internacional", "extranjería",
  ],
  "Ingeniería & Tecnología": [
    "ingeniería", "ingenieria", "tecnología", "tecnologia",
    "informática", "informatica", "sistemas", "técnico", "tecnico",
  ],
  "IA & Datos": [
    "ia", "datos", "inteligencia artificial", "data",
    "machine learning", "big data",
  ],
  "Salud & Ciencias": [
    "salud", "enfermería", "enfermeria", "farmacia", "nutrición",
    "nutricion", "medicina", "ciencias", "dietética", "dietetica",
    "emergencias",
  ],
  "Comunicación & Marketing": [
    "comunicación", "comunicacion", "marketing", "periodismo",
    "publicidad", "relaciones públicas", "relaciones publicas",
  ],
  "Educación": [
    "educación", "educacion", "docencia", "formación", "formacion",
    "pedagógica", "pedagogica", "enseñanza", "ensenanza",
    "orientación", "orientacion", "tutoría", "tutoria",
    "formación profesional",
  ],
  "Otros": [],
};

function getAreaKeywords(area: string): string[] {
  // Direct match in the mapping
  const matched = AREA_KEYWORDS[area];
  if (matched) return matched;
  // If not found, use the area string itself as a keyword
  return [area.toLowerCase()];
}

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

  // ── Pre-queries (run in parallel) ────────────────────────────────────────
  const [year, monthNum] = currentMonth.split("-").map(Number);
  const nextMonthStr = monthNum === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(monthNum + 1).padStart(2, "0")}-01`;

  // ── Area / subarea: broad multi-field search ─────────────────────────────
  const hasAreaFilter = !!(area || subarea);

  // Resolve area keywords (from mapping or direct)
  const areaKeywords = area ? getAreaKeywords(area) : [];
  // Subarea param → use as an additional keyword
  if (subarea && !areaKeywords.includes(subarea.toLowerCase())) {
    areaKeywords.push(subarea.toLowerCase());
  }

  // Query 1: faculty_expertise — match across area, subarea
  const areaExpertiseQuery = areaKeywords.length > 0
    ? (() => {
        // Build OR conditions for each keyword across area + subarea
        const conditions: string[] = [];
        for (const kw of areaKeywords) {
          conditions.push(`area.ilike.%${escapeOrValue(kw)}%`);
          conditions.push(`subarea.ilike.%${escapeOrValue(kw)}%`);
        }
        // Also include original area text and subarea text for direct match
        if (area) {
          conditions.push(`area.ilike.%${escapeOrValue(area)}%`);
          conditions.push(`subarea.ilike.%${escapeOrValue(area)}%`);
        }
        if (subarea) {
          conditions.push(`area.ilike.%${escapeOrValue(subarea)}%`);
          conditions.push(`subarea.ilike.%${escapeOrValue(subarea)}%`);
        }
        return admin.from("faculty_expertise").select("faculty_id").or(conditions.join(","));
      })()
    : Promise.resolve({ data: null as null | { faculty_id: string }[] });

  // Query 2: faculty_profiles — match across headline, bio, subjects, degrees
  const areaProfilesQuery = areaKeywords.length > 0
    ? (() => {
        const fpConditions: string[] = [];
        for (const kw of areaKeywords) {
          fpConditions.push(`headline.ilike.%${escapeOrValue(kw)}%`);
          fpConditions.push(`bio.ilike.%${escapeOrValue(kw)}%`);
          fpConditions.push(`degrees.ilike.%${escapeOrValue(kw)}%`);
          // subjects array — PostgREST @> (contains) with case‑insensitive match
          fpConditions.push(`subjects.ilike.%${escapeOrValue(kw)}%`);
        }
        // Also original text
        if (area) {
          fpConditions.push(`headline.ilike.%${escapeOrValue(area)}%`);
          fpConditions.push(`bio.ilike.%${escapeOrValue(area)}%`);
          fpConditions.push(`degrees.ilike.%${escapeOrValue(area)}%`);
          fpConditions.push(`subjects.ilike.%${escapeOrValue(area)}%`);
        }
        if (subarea) {
          fpConditions.push(`headline.ilike.%${escapeOrValue(subarea)}%`);
          fpConditions.push(`bio.ilike.%${escapeOrValue(subarea)}%`);
          fpConditions.push(`degrees.ilike.%${escapeOrValue(subarea)}%`);
          fpConditions.push(`subjects.ilike.%${escapeOrValue(subarea)}%`);
        }
        return admin.from("faculty_profiles").select("id").or(fpConditions.join(","));
      })()
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
    // Fetch all blocked rules by domain (not just exact match),
    // then filter in code to support subdomain matching
    admin.from("visibility_rules").select("faculty_id, domain").not("domain", "is", "null").eq("rule", "block"),
    areaExpertiseQuery,
    areaProfilesQuery,
    namePreQuery,
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

  // Merge area matches from faculty_expertise AND faculty_profiles headline/bio
  const areaMatchIds: string[] = [...new Set([
    ...(areaMatchData   || []).map((e: any) => e.faculty_id),
    ...(areaProfilesData || []).map((p: any) => p.id),
  ])];
  const nameMatchIds: string[] = (nameMatchData || []).map((m: any) => m.id);

  // ── NOTE: earlyEmpty has been REMOVED ──
  // Instead of returning empty when area filter has zero matches,
  // we let the broader query run. If no results, the UI will show
  // "No se han encontrado docentes" as a fallback.

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

  // ── Main DB query with all filters pushed down ────────────────────────────
  let educatorQuery = admin
    .from("faculty_profiles")
    .select(`*, user:user_profiles(full_name, avatar_url, plan, subscription_status), expertise:faculty_expertise(*)`)
    .eq("estado_perfil", "verificado")
    .or("visibility.eq.public,visibility.eq.private,visibility.is.null");

  // Exclude blocked faculty
  if (blockedFacultyIds.size > 0) {
    educatorQuery = educatorQuery.not("id", "in", `(${[...blockedFacultyIds].join(",")})`);
  }

  // Broad text search: headline + bio + current_institution + subjects + degrees + full_name (via pre-queried IDs)
  if (query) {
    const orParts = [
      `headline.ilike.%${escapeOrValue(query)}%`,
      `bio.ilike.%${escapeOrValue(query)}%`,
      `current_institution.ilike.%${escapeOrValue(query)}%`,
      `degrees.ilike.%${escapeOrValue(query)}%`,
      `subjects.ilike.%${escapeOrValue(query)}%`,
    ];
    if (nameMatchIds.length > 0) {
      orParts.push(`id.in.(${nameMatchIds.join(",")})`);
    }
    educatorQuery = educatorQuery.or(orParts.join(","));
  }

  // Country → location column
  if (country) {
    educatorQuery = educatorQuery.ilike("location", `%${country}%`);
  }

  // Area / subarea (resolved via broad pre-query)
  if (hasAreaFilter && areaMatchIds.length > 0) {
    educatorQuery = educatorQuery.in("id", areaMatchIds);
  } else if (hasAreaFilter && areaKeywords.length > 0 && areaMatchIds.length === 0) {
    // Fallback: no exact matches from pre-queries, try inline ilike on the main query
    const fpConditions: string[] = [];
    for (const kw of areaKeywords) {
      fpConditions.push(`headline.ilike.%${escapeOrValue(kw)}%`);
      fpConditions.push(`bio.ilike.%${escapeOrValue(kw)}%`);
      fpConditions.push(`degrees.ilike.%${escapeOrValue(kw)}%`);
      fpConditions.push(`subjects.ilike.%${escapeOrValue(kw)}%`);
    }
    if (area) {
      fpConditions.push(`headline.ilike.%${escapeOrValue(area)}%`);
      fpConditions.push(`bio.ilike.%${escapeOrValue(area)}%`);
      fpConditions.push(`degrees.ilike.%${escapeOrValue(area)}%`);
      fpConditions.push(`subjects.ilike.%${escapeOrValue(area)}%`);
    }
    if (subarea) {
      fpConditions.push(`headline.ilike.%${escapeOrValue(subarea)}%`);
      fpConditions.push(`bio.ilike.%${escapeOrValue(subarea)}%`);
      fpConditions.push(`degrees.ilike.%${escapeOrValue(subarea)}%`);
      fpConditions.push(`subjects.ilike.%${escapeOrValue(subarea)}%`);
    }
    educatorQuery = (educatorQuery as any).or(fpConditions.join(","));
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

  // First page: 50 results — skipped entirely once the plan's monthly
  // search quota is exhausted, so an over-limit institution never actually
  // receives real results (previously this ran unconditionally and only
  // the usage counter stopped incrementing — the "limit" was cosmetic).
  const { data: educators } = searchLimitReached
    ? { data: [] as any[] }
    : await educatorQuery.range(0, 49);

  // ── Batch fetch faculty documents + expertise flags for these educators ──
  const educatorIds = (educators || []).map((ed: any) => ed.id);
  let documentsMap: Record<string, any[]> = {};
  let hasExpertiseIds = new Set<string>();
  if (educatorIds.length > 0) {
    const [{ data: allDocs }, { data: scopedExpertise }] = await Promise.all([
      admin
        .from("faculty_documents")
        .select("id, name, file_name, file_path, doc_type, faculty_id, created_at")
        .in("faculty_id", educatorIds)
        .order("created_at", { ascending: false }),
      admin
        .from("faculty_expertise")
        .select("faculty_id")
        .in("faculty_id", educatorIds),
    ]);
    if (allDocs) {
      documentsMap = allDocs.reduce((acc: Record<string, any[]>, doc: any) => {
        const fid = doc.faculty_id;
        if (!acc[fid]) acc[fid] = [];
        acc[fid].push(doc);
        return acc;
      }, {});
    }
    hasExpertiseIds = new Set((scopedExpertise || []).map((e: any) => e.faculty_id));
  }

  // ── Transform + sort by Pro status + profile completeness ────────────────
  const transformedEducators = (educators || [])
    .map((ed: any) => {
      const userJoin = ed.user;
      const userObj = Array.isArray(userJoin) ? userJoin[0] : userJoin;
      const isFacultyPro = userObj?.plan === "faculty-pro" && userObj?.subscription_status === "active";

      // Profile completeness scoring (0–100)
      const hasAvatar = !!userObj?.avatar_url;
      const hasBio = !!ed.bio;
      const hasHeadline = !!ed.headline;
      const hasDegrees = Array.isArray(ed.degrees) && ed.degrees.length > 0;
      const docCount = documentsMap[ed.id]?.length || 0;
      const hasExpertise = hasExpertiseIds.has(ed.id);
      const hasLanguages = Array.isArray(ed.languages) && ed.languages.length > 0;
      const hasAneca = !!ed.aneca_accreditation;

      const completenessScore =
        (hasAvatar ? 25 : 0) +
        (hasBio ? 20 : 0) +
        (hasHeadline ? 10 : 0) +
        (hasDegrees ? 15 : 0) +
        (docCount > 0 ? 10 : 0) +
        (hasExpertise ? 10 : 0) +
        (hasLanguages ? 5 : 0) +
        (hasAneca ? 5 : 0);

      return {
        ...ed,
        full_name: userObj?.full_name || ed.full_name || "Docente",
        avatar_url: userObj?.avatar_url || null,
        country: ed.country || ed.location || null,
        city: ed.city || null,
        experience_years: ed.years_teaching || ed.years_experience || 0,
        is_pro: isFacultyPro,
        faculty_documents: documentsMap[ed.id] || [],
        _completeness: completenessScore,
      };
    })
    .sort((a: any, b: any) => {
      // 1. Pro users first
      if (a.is_pro && !b.is_pro) return -1;
      if (!a.is_pro && b.is_pro) return 1;
      // 2. Then by completeness score (descending)
      if (b._completeness !== a._completeness) return b._completeness - a._completeness;
      // 3. Then alphabetically
      return (a.full_name || "").localeCompare(b.full_name || "");
    });

  const contactMonthlyLimit = isPro ? null : isGrowth ? 20 : 5;

  return (
    <>
      {welcomeBanner}
      <InstitutionSearchPage
        initialEducators={transformedEducators}
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