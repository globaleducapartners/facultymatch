import { createAdminClient } from "@/lib/supabase-server";
import { escapeOrValue } from "@/lib/postgrest-filter";

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
  };
}

export interface FacultySearchOptions {
  /** IDs de docentes que esta institución tiene bloqueados — no aplica al directorio entre docentes. */
  blockedFacultyIds?: Set<string>;
  /** true cuando el límite mensual de búsquedas ya se agotó — no ejecuta ninguna consulta real. */
  skip?: boolean;
  /** Prefijo para los console.error, para saber desde qué pantalla vino el fallo. */
  logPrefix?: string;
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
  const { query, area, subarea, country, language, modality, phd, aneca } = filters;
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
  function applySearchFilters(q: any) {
    let query_ = q.or("visibility.eq.public,visibility.eq.private,visibility.is.null");

    if (blockedFacultyIds.size > 0) {
      query_ = query_.not("id", "in", `(${[...blockedFacultyIds].join(",")})`);
    }

    // Broad text search: headline + bio + current_institution + full_name +
    // degrees/subjects (via pre-queried IDs — degrees es jsonb y subjects
    // text[], ninguno acepta ilike directamente).
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
  const { data: educators, error: educatorsError } = await educatorQuery.range(0, 49);
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
      if (a.is_pro && !b.is_pro) return -1;
      if (!a.is_pro && b.is_pro) return 1;
      if (b._completeness !== a._completeness) return b._completeness - a._completeness;
      return (a.full_name || "").localeCompare(b.full_name || "");
    });

  return { transformedEducators, transformedPending };
}
