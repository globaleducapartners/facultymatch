import { createClient, createAdminClient } from "@/lib/supabase-server";
import { InstitutionSearchPage } from "@/components/dashboard/InstitutionSearchPage";
import { InstitutionWelcomeBanner } from "@/components/dashboard/InstitutionWelcomeBanner";
import { redirect } from "next/navigation";
import { matchesBlockedDomain } from "@/lib/domain";
import { escapeOrValue } from "@/lib/postgrest-filter";

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

  // ── Area / subarea: exact match against the REAL taxonomy ────────────────
  // Antes esto expandía el área elegida a una lista de palabras clave
  // inventadas a mano (p.ej. "IA & Datos" → "ia", "datos"...) y buscaba esas
  // palabras sueltas por ilike en area/subarea/headline/bio. El problema: el
  // desplegable de aquí usaba categorías propias (Business & Management, IA &
  // Datos...) que NUNCA coinciden con lo que el docente elige realmente en el
  // asistente (UNESCO_FIELDS — "Negocios, Administración y Derecho",
  // "Tecnologías de la Información y Comunicación"...), así que solo
  // "funcionaba" por coincidencias de letras sueltas — p.ej. "ia" (de "IA y
  // Datos") aparece dentro de "Ciencias Sociales" o "Ingeniería" sin ninguna
  // relación real, mientras que un área genuina de TIC podía no matchear
  // nunca. Ahora el desplegable ofrece las mismas 10 áreas (y sus subáreas)
  // que ve el docente al completar su perfil — ver src/lib/unesco-fields.ts —
  // y aquí se compara exacto contra faculty_expertise.area/subarea.
  const hasAreaFilter = !!(area || subarea);

  // Query 1: faculty_expertise — exact match on area/subarea
  const areaExpertiseQuery = hasAreaFilter
    ? (() => {
        let q = admin.from("faculty_expertise").select("faculty_id");
        if (area) q = q.eq("area", area);
        if (subarea) q = q.eq("subarea", subarea);
        return q;
      })()
    : Promise.resolve({ data: null as null | { faculty_id: string }[] });

  // Query 2: faculty_profiles headline/bio — secondary fallback for older
  // profiles with free-text specialties never migrated into faculty_expertise
  // (ver backfill 20260803000001). Coincidencia literal del nombre del área/
  // subárea elegida, no de sinónimos inventados.
  const areaProfilesQuery = hasAreaFilter
    ? (() => {
        const fpConditions: string[] = [];
        if (area) {
          fpConditions.push(`headline.ilike.%${escapeOrValue(area)}%`);
          fpConditions.push(`bio.ilike.%${escapeOrValue(area)}%`);
        }
        if (subarea) {
          fpConditions.push(`headline.ilike.%${escapeOrValue(subarea)}%`);
          fpConditions.push(`bio.ilike.%${escapeOrValue(subarea)}%`);
        }
        return admin.from("faculty_profiles").select("id").or(fpConditions.join(","));
      })()
    : Promise.resolve({ data: null as null | { id: string }[] });

  // Text search: use admin to bypass RLS on user_profiles
  const namePreQuery = query
    ? admin.from("user_profiles").select("id").ilike("full_name", `%${query}%`)
    : Promise.resolve({ data: null as null | { id: string }[] });

  // degrees (jsonb) / subjects (text[]) can't be searched via PostgREST's ilike
  // filter — see search_faculty_by_degrees_subjects migration. Fails open: if
  // that migration hasn't been applied yet, this just returns an error here
  // and search keeps working without the extra degree-title matches.
  const degreesTextQuery = query
    ? admin.rpc("search_faculty_by_degrees_subjects", { p_query: query })
    : Promise.resolve({ data: null as null | { faculty_id: string }[], error: null as any });

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
    { data: degreesMatchData, error: degreesMatchError },
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
    degreesTextQuery,
  ]);
  if (degreesMatchError && query) {
    console.error("[institution/search] search_faculty_by_degrees_subjects failed (migration not applied yet?):", degreesMatchError);
  }
  const degreesMatchIds: string[] = (degreesMatchData || []).map((d: any) => d.faculty_id);

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

  // ── Shared filter application — used for both the verified results and the
  // "pending" teaser cards below, so both respect exactly the same search/
  // filter criteria (query, area, country, phd, aneca, language, modality).
  function applySearchFilters(q: any) {
    let query_ = q.or("visibility.eq.public,visibility.eq.private,visibility.is.null");

    if (blockedFacultyIds.size > 0) {
      query_ = query_.not("id", "in", `(${[...blockedFacultyIds].join(",")})`);
    }

    // Broad text search: headline + bio + current_institution + full_name +
    // degrees/subjects (via pre-queried IDs — see search_faculty_by_degrees_subjects
    // migration; degrees is jsonb and subjects is text[], neither takes the ilike
    // operator directly, which previously broke the WHOLE .or() and silently
    // returned zero results for every text search).
    if (query) {
      const orParts = [
        `headline.ilike.%${escapeOrValue(query)}%`,
        `bio.ilike.%${escapeOrValue(query)}%`,
        `current_institution.ilike.%${escapeOrValue(query)}%`,
      ];
      const idMatches = [...new Set([...nameMatchIds, ...degreesMatchIds])];
      if (idMatches.length > 0) {
        orParts.push(`id.in.(${idMatches.join(",")})`);
      }
      query_ = query_.or(orParts.join(","));
    }

    // Country → location column
    if (country) {
      query_ = query_.ilike("location", `%${country}%`);
    }

    // Area / subarea — areaMatchIds ya combina el match exacto de
    // faculty_expertise con el fallback de headline/bio (areaProfilesQuery);
    // si ninguno de los dos encontró nada, no hay nada más que probar.
    if (hasAreaFilter && areaMatchIds.length > 0) {
      query_ = query_.in("id", areaMatchIds);
    } else if (hasAreaFilter && areaMatchIds.length === 0) {
      // Sin coincidencias reales — forzar cero resultados en vez de devolver
      // la lista sin filtrar (antes, si el fallback también fallaba, esta
      // rama simplemente no aplicaba ningún filtro de área en absoluto).
      query_ = query_.eq("id", "00000000-0000-0000-0000-000000000000");
    }

    // PhD
    if (phd === "true") {
      query_ = query_.eq("is_phd", true);
    }

    // ANECA accreditation
    if (aneca) {
      query_ = query_.ilike("aneca_accreditation", `%${aneca}%`);
    }

    // Language — JSONB containment: check if languages array contains {lang: "Inglés"}
    if (language) {
      query_ = query_.filter("languages", "cs", JSON.stringify([{ lang: language }]));
    }

    // Modality → modalities array column (stored as ["Online","Presencial","Híbrida"])
    if (modality) {
      query_ = query_.contains("modalities", [modality]);
    }

    return query_;
  }

  // ── Main DB query with all filters pushed down ────────────────────────────
  let educatorQuery = applySearchFilters(
    admin
      .from("faculty_profiles")
      .select(`*, user:user_profiles(full_name, avatar_url, plan, subscription_status), expertise:faculty_expertise(*)`)
      .eq("estado_perfil", "verificado")
  );

  // First page: 50 results — skipped entirely once the plan's monthly
  // search quota is exhausted, so an over-limit institution never actually
  // receives real results (previously this ran unconditionally and only
  // the usage counter stopped incrementing — the "limit" was cosmetic).
  const { data: educators, error: educatorsError } = searchLimitReached
    ? { data: [] as any[], error: null }
    : await educatorQuery.range(0, 49);
  if (educatorsError) {
    console.error("[institution/search] educatorQuery failed:", educatorsError);
  }

  // ── "Pending" teaser cards — perfiles reales que aún no están verificados ──
  // Mismos filtros que la búsqueda principal (misma applySearchFilters), pero
  // sobre estado_perfil NO verificado. 'rechazado' queda fuera a propósito —
  // un perfil ya rechazado por un admin no es "viene de camino", es un caso
  // cerrado. Select mínimo: nunca se manda nombre ni bio completa al cliente
  // — la tarjeta correspondiente (PendingEducatorCard) es deliberadamente
  // anónima y no clicable, así que no hace falta pedir más.
  let pendingQuery = applySearchFilters(
    admin
      .from("faculty_profiles")
      .select("id, estado_perfil, country, location, expertise:faculty_expertise(area)")
      .in("estado_perfil", ["pendiente_verificacion", "incompleto", "en_revision"])
  );
  const { data: pendingEducators, error: pendingError } = searchLimitReached
    ? { data: [] as any[], error: null }
    : await pendingQuery.range(0, 23);
  if (pendingError) {
    console.error("[institution/search] pendingQuery failed:", pendingError);
  }
  const transformedPending = (pendingEducators || []).map((p: any) => {
    const expertise = Array.isArray(p.expertise) ? p.expertise[0] : p.expertise;
    return {
      id: p.id,
      estado_perfil: p.estado_perfil,
      area: expertise?.area || null,
      country: p.country || p.location || null,
    };
  });

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