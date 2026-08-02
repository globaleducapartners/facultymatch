import { createClient, createAdminClient } from "@/lib/supabase-server";
import { InstitutionSearchPage } from "@/components/dashboard/InstitutionSearchPage";
import { redirect } from "next/navigation";
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
  const matched = AREA_KEYWORDS[area];
  if (matched) return matched;
  return [area.toLowerCase()];
}

export default async function FacultyDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Institution users go to their own search
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("role, can_switch_role")
    .eq("id", user.id)
    .single();

  if (userProfile?.role === "institution") redirect("/app/institution/search");

  const query    = (params.query    as string) || "";
  const area     = (params.area     as string) || "";
  const subarea  = (params.subarea  as string) || "";
  const country  = (params.country  as string) || "";
  const language = (params.language as string) || "";
  const modality = Array.isArray(params.modality) ? params.modality[0] : (params.modality as string) || "";
  const phd      = (params.phd      as string) || "";
  const aneca    = (params.aneca    as string) || "";

  const hasAreaFilter = !!(area || subarea);
  const admin = createAdminClient();

  // ── Area / subarea: broad multi-field search ─────────────────────────────

  // Resolve area keywords (from mapping or direct)
  const areaKeywords = area ? getAreaKeywords(area) : [];
  // Subarea param → use as an additional keyword
  if (subarea && !areaKeywords.includes(subarea.toLowerCase())) {
    areaKeywords.push(subarea.toLowerCase());
  }

  // Query 1: faculty_expertise — match across area, subarea
  const areaExpertiseQuery = areaKeywords.length > 0
    ? (() => {
        const conditions: string[] = [];
        for (const kw of areaKeywords) {
          conditions.push(`area.ilike.%${escapeOrValue(kw)}%`);
          conditions.push(`subarea.ilike.%${escapeOrValue(kw)}%`);
        }
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

  // Query 2: faculty_profiles — match across headline, bio.
  // degrees (jsonb) and subjects (text[]) can't take the ilike operator —
  // Postgres rejects it outright, which previously broke the WHOLE .or()
  // and silently returned zero results for every text search.
  const areaProfilesQuery = areaKeywords.length > 0
    ? (() => {
        const fpConditions: string[] = [];
        for (const kw of areaKeywords) {
          fpConditions.push(`headline.ilike.%${escapeOrValue(kw)}%`);
          fpConditions.push(`bio.ilike.%${escapeOrValue(kw)}%`);
        }
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

  // Pre-fetch which faculty IDs have expertise entries (for completeness scoring)
  const allExpertiseQuery = admin.from("faculty_expertise").select("faculty_id");

  const [
    { data: areaMatchData },
    { data: areaProfilesData },
    { data: nameMatchData },
    { data: allExpertiseData },
    { data: degreesMatchData, error: degreesMatchError },
  ] = await Promise.all([
    areaExpertiseQuery,
    areaProfilesQuery,
    namePreQuery,
    allExpertiseQuery,
    degreesTextQuery,
  ]);
  if (degreesMatchError && query) {
    console.error("[faculty/directory] search_faculty_by_degrees_subjects failed (migration not applied yet?):", degreesMatchError);
  }

  // Merge area matches from faculty_expertise AND faculty_profiles headline/bio
  const areaMatchIds: string[] = [...new Set([
    ...(areaMatchData   || []).map((e: any) => e.faculty_id),
    ...(areaProfilesData || []).map((p: any) => p.id),
  ])];
  const nameMatchIds: string[] = (nameMatchData || []).map((m: any) => m.id);
  const degreesMatchIds: string[] = (degreesMatchData || []).map((d: any) => d.faculty_id);
  const hasExpertiseIds = new Set((allExpertiseData || []).map((e: any) => e.faculty_id));

  // ── Main DB query with all filters pushed down ───────────────────────────
  // estado_perfil = 'verificado' was missing entirely here — this directory
  // (faculty browsing their peers, read-only) showed every faculty_profiles
  // row regardless of verification status: pendiente_verificacion,
  // incompleto, en_revision, rechazado all leaked through. The institution
  // side of this same shared component (src/app/app/institution/search/
  // page.tsx) already had this filter; it was just never copied here.
  let educatorQuery = admin
    .from("faculty_profiles")
    .select(`*, user:user_profiles(full_name, avatar_url, plan, subscription_status), expertise:faculty_expertise(*)`)
    .eq("estado_perfil", "verificado")
    .or("visibility.eq.public,visibility.eq.private,visibility.is.null");

  // Broad text search: headline + bio + current_institution + full_name +
  // degrees/subjects (via pre-queried IDs — see search_faculty_by_degrees_subjects
  // migration and the comment on areaProfilesQuery above).
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
    }
    if (area) {
      fpConditions.push(`headline.ilike.%${escapeOrValue(area)}%`);
      fpConditions.push(`bio.ilike.%${escapeOrValue(area)}%`);
    }
    if (subarea) {
      fpConditions.push(`headline.ilike.%${escapeOrValue(subarea)}%`);
      fpConditions.push(`bio.ilike.%${escapeOrValue(subarea)}%`);
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

  // First page: 50 results
  const { data: educators, error: educatorsError } = await educatorQuery.range(0, 49);
  if (educatorsError) {
    console.error("[faculty/directory] educatorQuery failed:", educatorsError);
  }

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

  return (
    <InstitutionSearchPage
      initialEducators={transformedEducators}
      institutionId=""
      searchParams={params}
      initialFavorites={[]}
      isPro={false}
      contactMonthlyLimit={null}
      searchLimitReached={false}
      monthlyContactsUsed={0}
      isReadOnly
      isAlreadyInstitution={!!userProfile?.can_switch_role}
    />
  );
}