import { createClient, createAdminClient } from "@/lib/supabase-server";
import { InstitutionSearchPage } from "@/components/dashboard/InstitutionSearchPage";
import { redirect } from "next/navigation";

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
          conditions.push(`area.ilike.%${kw}%`);
          conditions.push(`subarea.ilike.%${kw}%`);
        }
        if (area) {
          conditions.push(`area.ilike.%${area}%`);
          conditions.push(`subarea.ilike.%${area}%`);
        }
        if (subarea) {
          conditions.push(`area.ilike.%${subarea}%`);
          conditions.push(`subarea.ilike.%${subarea}%`);
        }
        return admin.from("faculty_expertise").select("faculty_id").or(conditions.join(","));
      })()
    : Promise.resolve({ data: null as null | { faculty_id: string }[] });

  // Query 2: faculty_profiles — match across headline, bio, subjects, degrees
  const areaProfilesQuery = areaKeywords.length > 0
    ? (() => {
        const fpConditions: string[] = [];
        for (const kw of areaKeywords) {
          fpConditions.push(`headline.ilike.%${kw}%`);
          fpConditions.push(`bio.ilike.%${kw}%`);
          fpConditions.push(`degrees.ilike.%${kw}%`);
          fpConditions.push(`subjects.ilike.%${kw}%`);
        }
        if (area) {
          fpConditions.push(`headline.ilike.%${area}%`);
          fpConditions.push(`bio.ilike.%${area}%`);
          fpConditions.push(`degrees.ilike.%${area}%`);
          fpConditions.push(`subjects.ilike.%${area}%`);
        }
        if (subarea) {
          fpConditions.push(`headline.ilike.%${subarea}%`);
          fpConditions.push(`bio.ilike.%${subarea}%`);
          fpConditions.push(`degrees.ilike.%${subarea}%`);
          fpConditions.push(`subjects.ilike.%${subarea}%`);
        }
        return admin.from("faculty_profiles").select("id").or(fpConditions.join(","));
      })()
    : Promise.resolve({ data: null as null | { id: string }[] });

  // Text search: use admin to bypass RLS on user_profiles
  const namePreQuery = query
    ? admin.from("user_profiles").select("id").ilike("full_name", `%${query}%`)
    : Promise.resolve({ data: null as null | { id: string }[] });

  // Pre-fetch which faculty IDs have expertise entries (for completeness scoring)
  const allExpertiseQuery = admin.from("faculty_expertise").select("faculty_id");

  const [
    { data: areaMatchData },
    { data: areaProfilesData },
    { data: nameMatchData },
    { data: allExpertiseData },
  ] = await Promise.all([
    areaExpertiseQuery,
    areaProfilesQuery,
    namePreQuery,
    allExpertiseQuery,
  ]);

  // Merge area matches from faculty_expertise AND faculty_profiles headline/bio
  const areaMatchIds: string[] = [...new Set([
    ...(areaMatchData   || []).map((e: any) => e.faculty_id),
    ...(areaProfilesData || []).map((p: any) => p.id),
  ])];
  const nameMatchIds: string[] = (nameMatchData || []).map((m: any) => m.id);
  const hasExpertiseIds = new Set((allExpertiseData || []).map((e: any) => e.faculty_id));

  // ── Main DB query with all filters pushed down ───────────────────────────
  let educatorQuery = admin
    .from("faculty_profiles")
    .select(`*, user:user_profiles(full_name, avatar_url, plan, subscription_status), expertise:faculty_expertise(*)`)
    .or("visibility.eq.public,visibility.eq.private,visibility.is.null");

  // Broad text search: headline + bio + current_institution + subjects + degrees + full_name (via pre-queried IDs)
  if (query) {
    const orParts = [
      `headline.ilike.%${query}%`,
      `bio.ilike.%${query}%`,
      `current_institution.ilike.%${query}%`,
      `degrees.ilike.%${query}%`,
      `subjects.ilike.%${query}%`,
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
      fpConditions.push(`headline.ilike.%${kw}%`);
      fpConditions.push(`bio.ilike.%${kw}%`);
      fpConditions.push(`degrees.ilike.%${kw}%`);
      fpConditions.push(`subjects.ilike.%${kw}%`);
    }
    if (area) {
      fpConditions.push(`headline.ilike.%${area}%`);
      fpConditions.push(`bio.ilike.%${area}%`);
      fpConditions.push(`degrees.ilike.%${area}%`);
      fpConditions.push(`subjects.ilike.%${area}%`);
    }
    if (subarea) {
      fpConditions.push(`headline.ilike.%${subarea}%`);
      fpConditions.push(`bio.ilike.%${subarea}%`);
      fpConditions.push(`degrees.ilike.%${subarea}%`);
      fpConditions.push(`subjects.ilike.%${subarea}%`);
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