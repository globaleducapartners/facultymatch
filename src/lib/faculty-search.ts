import { createAdminClient } from "@/lib/supabase-server";
import { escapeOrValue } from "@/lib/postgrest-filter";
import { calcFacultyCompleteness, completenessInputFromRows } from "@/lib/faculty-completeness";

// Lógica de búsqueda/filtrado compartida entre las dos entradas al mismo
// directorio de docentes: la búsqueda de instituciones
// (src/app/app/institution/search/page.tsx) y el directorio de solo lectura
// entre docentes (src/app/app/faculty/directory/page.tsx). Antes cada
// archivo tenía su propia copia casi idéntica de esta lógica — ya se nos
// olvidó sincronizar un arreglo entre los dos una vez (el filtro de
// estado_perfil='verificado') y casi una segunda (las tarjetas de
// pendientes); unificarlo aquí hace que ese tipo de fallo ya no sea posible.

type AdminClient = ReturnType<typeof createAdminClient>;

export interface FacultySearchFilters {
  query: string;
  area: string;
  subarea: string;
  country: string;
  language: string;
  modality: string;
  phd: string;
  aneca: string;
  availability: string;
}

export function parseFacultySearchParams(
  params: { [key: string]: string | string[] | undefined }
): FacultySearchFilters {
  return {
    query: (params.query as string) || "",
    area: (params.area as string) || "",
    subarea: (params.subarea as string) || "",
    country: (params.country as string) || "",
    language: (params.language as string) || "",
    modality: Array.isArray(params.modality) ? params.modality[0] : (params.modality as string) || "",
    phd: (params.phd as string) || "",
    aneca: (params.aneca as string) || "",
    availability: (params.availability as string) || "",
  };
}

export interface FacultySearchOptions {
  /** IDs de docentes que esta institución tiene bloqueados — no aplica al directorio entre docentes. */
  blockedFacultyIds?: Set<string>;
  /** true cuando el límite mensual de búsquedas ya se agotó — no ejecuta ninguna consulta real. */
  skip?: boolean;
  /** true para quien no es institución (p. ej. docentes viendo a colegas): solo perfiles con visibilidad pública; "Solo instituciones" no se les muestra. */
  publicOnly?: boolean;
  /** true en el directorio entre docentes: además de los perfiles públicos devuelve, como tarjetas anónimas, los verificados con visibilidad "Solo instituciones" (sin texto libre de búsqueda: así no se puede confirmar que una persona concreta está en la plataforma). */
  lockedPrivateCards?: boolean;
  /** true solo para instituciones con plan que ve datos de contacto (teléfono, WhatsApp…): si no, esos campos nunca salen del servidor. */
  includeContact?: boolean;
  /** Prefijo para los console.error, para saber desde qué pantalla vino el fallo. */
  logPrefix?: string;
}

// Claves que nunca deben salir del servidor hacia el navegador (referidos,
// verificación interna, preferencias). El teléfono y los contactos solo se
// entregan con includeContact (instituciones con plan que los muestra).
const PRIVATE_KEYS = [
  "profile_token", "referral_stats", "referred_by", "referral_code_redeemed", "referral_reward_counted",
  "referral_reward_granted_at", "verification_notes", "verificado_por", "orcid_import_data", "visibility_source",
  "notify_new_offers", "notify_messages", "notify_weekly_digest", "blocked_institutions", "preferred_institutions",
  "hide_from_current_institution", "preferred_contact_method",
];
const CONTACT_KEYS = ["phone", "contact_email", "contact_whatsapp", "contact_linkedin"];

export function stripPrivateFields<T extends Record<string, any>>(row: T, includeContact = false): T {
  const out: Record<string, any> = { ...row };
  for (const k of PRIVATE_KEYS) delete out[k];
  if (!includeContact) for (const k of CONTACT_KEYS) delete out[k];
  return out as T;
}

export interface FacultySearchResult {
  transformedEducators: any[];
  transformedPending: any[];
}

export async function searchFacultyProfiles(
  admin: AdminClient,
  filters: FacultySearchFilters,
  opts: FacultySearchOptions = {}
): Promise<FacultySearchResult> {
  const { query, area, subarea, country, language, modality, phd, aneca, availability } = filters;
  const blockedFacultyIds = opts.blockedFacultyIds ?? new Set<string>();
  const logPrefix = opts.logPrefix ?? "[faculty-search]";

  // ── Area / subarea: exact match against the REAL taxonomy ────────────────
  // El desplegable de Área ofrece las mismas 10 áreas (y sus subáreas) que
  // ve el docente al completar su perfil — ver src/lib/unesco-fields.ts —
  // y aquí se compara exacto contra faculty_expertise.area/subarea. Antes
  // cada pantalla expandía el área elegida a una lista de palabras clave
  // inventadas a mano que no correspondían a la taxonomía real, y el filtro
  // solo "funcionaba" por coincidencias de letras sueltas.
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
  // (ver backfill 20260803000001).
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

  // ── Búsqueda de texto completo (migración 20261022000001) ────────────────
  // Todas las palabras, sin tildes, en cualquier campo del perfil, con orden
  // por relevancia. Si la función aún no existe en la base de datos, se cae
  // con seguridad a la búsqueda anterior (ILIKE) de más abajo.
  let fullTextRank: Map<string, number> | null = null;
  if (query) {
    const { data: ftData, error: ftError } = await admin.rpc("search_faculty", { p_query: query, p_limit: 100 });
    if (!ftError && Array.isArray(ftData)) {
      fullTextRank = new Map(ftData.map((r: any) => [r.faculty_id as string, Number(r.rank) || 0]));
    } else if (ftError) {
      console.error(`${logPrefix} search_faculty failed (migration not applied yet?):`, ftError);
    }
  }
  const legacyText = !!query && !fullTextRank;

  // Búsqueda anterior: nombre en user_profiles (admin para saltar RLS)
  const namePreQuery = legacyText
    ? admin.from("user_profiles").select("id").ilike("full_name", `%${query}%`)
    : Promise.resolve({ data: null as null | { id: string }[] });

  // degrees (jsonb) / subjects (text[]) no admiten ilike por PostgREST; la
  // función search_faculty_by_degrees_subjects (migración 20260802000001) sí.
  const degreesTextQuery = legacyText
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
  if (degreesMatchError && legacyText) {
    console.error(`${logPrefix} search_faculty_by_degrees_subjects failed (migration not applied yet?):`, degreesMatchError);
  }

  const areaMatchIds: string[] = [...new Set([
    ...(areaMatchData || []).map((e: any) => e.faculty_id),
    ...(areaProfilesData || []).map((p: any) => p.id),
  ])];
  const nameMatchIds: string[] = (nameMatchData || []).map((m: any) => m.id);
  const degreesMatchIds: string[] = (degreesMatchData || []).map((d: any) => d.faculty_id);
  const hasExpertiseIdsAll = new Set((allExpertiseData || []).map((e: any) => e.faculty_id));

  // ── Shared filter application — usada tanto para los resultados
  // verificados como para las tarjetas "pendiente" de abajo, así ambas
  // respetan exactamente los mismos criterios de búsqueda/filtro.
  function applySearchFilters(q: any, only?: "private") {
    let query_ = only === "private"
      ? q.eq("visibility", "private")
      : opts.publicOnly
        ? q.eq("visibility", "public")
        : q.or("visibility.eq.public,visibility.eq.private,visibility.is.null");

    if (blockedFacultyIds.size > 0) {
      query_ = query_.not("id", "in", `(${[...blockedFacultyIds].join(",")})`);
    }

    // Broad text search: headline + bio + current_institution + full_name +
    // degrees/subjects (via pre-queried IDs — degrees es jsonb y subjects
    // text[], ninguno acepta ilike directamente).
    if (fullTextRank) {
      const ids = [...fullTextRank.keys()];
      query_ = query_.in("id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);
    } else if (query) {
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

    if (country) {
      query_ = query_.ilike("location", `%${country}%`);
    }

    // Area / subarea — areaMatchIds ya combina el match exacto de
    // faculty_expertise con el fallback de headline/bio.
    if (hasAreaFilter && areaMatchIds.length > 0) {
      query_ = query_.in("id", areaMatchIds);
    } else if (hasAreaFilter && areaMatchIds.length === 0) {
      // Sin coincidencias reales — forzar cero resultados en vez de devolver
      // la lista sin filtrar.
      query_ = query_.eq("id", "00000000-0000-0000-0000-000000000000");
    }

    if (phd === "true") {
      query_ = query_.eq("is_phd", true);
    }

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

    // Availability — mismos códigos que AVAIL_LABELS en EducatorCard/docentes/[slug]
    // ("open", "next_semester", "occasional"...), columna de texto simple.
    if (availability) {
      query_ = query_.eq("availability", availability);
    }

    return query_;
  }

  if (opts.skip) {
    return { transformedEducators: [], transformedPending: [] };
  }

  // ── Main query: verified profiles ─────────────────────────────────────────
  const educatorQuery = applySearchFilters(
    admin
      .from("faculty_profiles")
      .select(`*, user:user_profiles(full_name, avatar_url, plan, subscription_status), expertise:faculty_expertise(*)`)
      .eq("estado_perfil", "verificado")
  );
  // Con búsqueda de texto se traen todos los candidatos (≤100) para ordenarlos
  // por relevancia aquí; sin ella, la primera página de 50.
  const { data: educators, error: educatorsError } = await educatorQuery.range(0, fullTextRank ? 99 : 49);
  if (educatorsError) {
    console.error(`${logPrefix} educatorQuery failed:`, educatorsError);
  }

  // ── "Pending" teaser cards — docentes reales que aún no están verificados ──
  // Mismos filtros que la búsqueda principal, pero sobre estado_perfil NO
  // verificado. 'rechazado' queda fuera a propósito — un perfil ya rechazado
  // por un admin no es "viene de camino", es un caso cerrado. Select mínimo:
  // nunca se manda nombre ni bio completa al cliente — la tarjeta
  // (PendingEducatorCard) es deliberadamente anónima y no clicable.
  const pendingQuery = applySearchFilters(
    admin
      .from("faculty_profiles")
      .select("id, estado_perfil, country, location, expertise:faculty_expertise(area)")
      .in("estado_perfil", ["pendiente_verificacion", "incompleto", "en_revision"])
  );
  const { data: pendingEducators, error: pendingError } = await pendingQuery.range(0, 23);
  if (pendingError) {
    console.error(`${logPrefix} pendingQuery failed:`, pendingError);
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

  // ── Tarjetas de perfiles privados (solo directorio entre docentes) ────────
  // Verificados que eligieron "Solo instituciones": se muestra que existen,
  // con área y país como mucho, nunca nombre, foto ni texto. Sin búsqueda de
  // texto libre, para no poder confirmar si una persona concreta está aquí.
  if (opts.lockedPrivateCards && !query) {
    const { data: privateRows, error: privateError } = await applySearchFilters(
      admin
        .from("faculty_profiles")
        .select("id, country, location, expertise:faculty_expertise(area)")
        .eq("estado_perfil", "verificado"),
      "private"
    ).range(0, 23);
    if (privateError) console.error(`${logPrefix} privateQuery failed:`, privateError);
    for (const p of privateRows || []) {
      const expertise = Array.isArray((p as any).expertise) ? (p as any).expertise[0] : (p as any).expertise;
      transformedPending.push({
        id: (p as any).id,
        estado_perfil: "privado",
        area: expertise?.area || null,
        country: (p as any).country || (p as any).location || null,
      });
    }
  }

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
  // (hasExpertiseIdsAll queda disponible por si algún día hace falta puntuar
  // completitud sobre TODO el universo de docentes, no solo la página actual)
  void hasExpertiseIdsAll;

  // ── Transform + sort by Pro status + profile completeness ────────────────
  const transformedEducators = (educators || [])
    .map((ed: any) => {
      const userJoin = ed.user;
      const userObj = Array.isArray(userJoin) ? userJoin[0] : userJoin;
      const isFacultyPro = userObj?.plan === "faculty-pro" && userObj?.subscription_status === "active";

      // Completitud — mismo cálculo unificado que ve el docente y el admin
      // (src/lib/faculty-completeness.ts); aquí solo se usa para ordenar los
      // resultados (los más completos primero).
      const completenessScore = calcFacultyCompleteness(
        completenessInputFromRows(ed, userObj, hasExpertiseIds.has(ed.id))
      ).score;

      const safe = stripPrivateFields(ed, opts.includeContact);

      return {
        ...safe,
        _relevance: fullTextRank?.get(ed.id) ?? 0,
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
      // Con búsqueda de texto manda la relevancia; el plan y la completitud
      // desempatan.
      if (fullTextRank && b._relevance !== a._relevance) return b._relevance - a._relevance;
      if (a.is_pro && !b.is_pro) return -1;
      if (!a.is_pro && b.is_pro) return 1;
      if (b._completeness !== a._completeness) return b._completeness - a._completeness;
      return (a.full_name || "").localeCompare(b.full_name || "");
    });

  return { transformedEducators: transformedEducators.slice(0, 50), transformedPending };
}
