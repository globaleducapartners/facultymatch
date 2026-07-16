import { NextResponse } from "next/server";

// ─── Types ──────────────────────────────────────────────────────────────────

interface OrcidRecord {
  nombre_completo: string;
  afiliaciones: {
    institucion: string;
    fecha_inicio: string | null;
    fecha_fin: string | null;
  }[];
  titulos: {
    titulo: string;
    institucion: string;
    anio: string | null;
  }[];
  publicaciones_count: number;
  citas_count: number;
  temas_investigacion: string[];
}

interface ErrorResponse {
  error: string;
  details?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const ORCID_REGEX = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;

function validateOrcid(orcid: string): boolean {
  return ORCID_REGEX.test(orcid);
}

function extractYear(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  // ORCID dates come as YYYY, YYYY-MM, or YYYY-MM-DD
  return dateStr.substring(0, 4) || null;
}

// ─── ORCID API ──────────────────────────────────────────────────────────────

async function fetchOrcidRecord(orcid: string) {
  const url = `https://pub.orcid.org/v3.0/${orcid}/record`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (res.status === 404) {
    throw new Error(`No se encontró ningún perfil público para el ORCID "${orcid}".`);
  }

  if (!res.ok) {
    throw new Error(
      `Error al consultar ORCID (${res.status}): ${res.statusText}`
    );
  }

  return res.json();
}

function parseOrcidName(data: any): string {
  const name = data?.person?.name;
  if (!name) return "";
  const given = name["given-names"]?.value ?? "";
  const family = name["family-name"]?.value ?? "";
  return `${given} ${family}`.trim();
}

function parseOrcidEmployments(data: any) {
  const groups =
    data?.["activities-summary"]?.employments?.["affiliation-group"] ?? [];
  const results: { institucion: string; fecha_inicio: string | null; fecha_fin: string | null }[] = [];

  for (const group of groups) {
    const summaries = group?.summaries ?? [];
    for (const s of summaries) {
      const emp = s?.["employment-summary"];
      if (!emp) continue;
      const institution = emp?.organization?.name ?? "";
      const startDate = emp?.["start-date"];
      const endDate = emp?.["end-date"];
      results.push({
        institucion: institution,
        fecha_inicio: startDate?.year?.value
          ? `${startDate.year.value}-${startDate.month?.value ?? "01"}-${startDate.day?.value ?? "01"}`
          : null,
        fecha_fin: endDate?.year?.value
          ? `${endDate.year.value}-${endDate.month?.value ?? "01"}-${endDate.day?.value ?? "01"}`
          : null,
      });
    }
  }

  return results;
}

function parseOrcidEducations(data: any) {
  const groups =
    data?.["activities-summary"]?.educations?.["affiliation-group"] ?? [];
  const results: { titulo: string; institucion: string; anio: string | null }[] = [];

  for (const group of groups) {
    const summaries = group?.summaries ?? [];
    for (const s of summaries) {
      const edu = s?.["education-summary"];
      if (!edu) continue;
      const title = edu?.["role-title"] ?? "";
      const institution = edu?.organization?.name ?? "";
      const endDate = edu?.["end-date"];
      results.push({
        titulo: title,
        institucion: institution,
        anio: endDate?.year?.value ?? null,
      });
    }
  }

  return results;
}

// ─── OpenAlex API ───────────────────────────────────────────────────────────

async function fetchOpenAlexAuthor(orcid: string) {
  const url = `https://api.openalex.org/authors/https://orcid.org/${orcid}`;
  const res = await fetch(url);

  if (res.status === 404) {
    // Not all ORCID users have an OpenAlex record — that's OK
    return null;
  }

  if (!res.ok) {
    console.warn(`OpenAlex returned ${res.status} for ORCID ${orcid}`);
    return null;
  }

  return res.json();
}

function parseOpenAlexTopics(data: any): string[] {
  const topics = data?.topics ?? [];
  // Try topics first (newer OpenAlex), fall back to x_concepts
  if (topics.length > 0) {
    return topics
      .slice(0, 10)
      .map((t: any) => t.display_name)
      .filter(Boolean);
  }

  const concepts = data?.x_concepts ?? [];
  return concepts
    .slice(0, 10)
    .map((c: any) => c.display_name)
    .filter(Boolean);
}

// ─── Route Handler ──────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orcid = body?.orcid?.trim();

    if (!orcid || !validateOrcid(orcid)) {
      return NextResponse.json(
        {
          error: "ORCID inválido",
          details:
            'El formato debe ser "0000-0000-0000-0000".',
        } satisfies ErrorResponse,
        { status: 400 }
      );
    }

    // 1. Fetch ORCID record
    const orcidData = await fetchOrcidRecord(orcid);

    // 2. Parse ORCID data
    const nombreCompleto = parseOrcidName(orcidData);
    if (!nombreCompleto) {
      return NextResponse.json(
        {
          error: "No hay datos públicos disponibles",
          details: `El ORCID "${orcid}" no tiene datos públicos de nombre.`,
        } satisfies ErrorResponse,
        { status: 404 }
      );
    }

    const afiliaciones = parseOrcidEmployments(orcidData);
    const titulos = parseOrcidEducations(orcidData);

    // 3. Fetch OpenAlex data
    const openAlexData = await fetchOpenAlexAuthor(orcid);

    // 4. Parse OpenAlex data
    const publicacionesCount = openAlexData?.works_count ?? 0;
    const citasCount = openAlexData?.cited_by_count ?? 0;
    const temasInvestigacion = parseOpenAlexTopics(openAlexData);

    // 5. Build normalized response
    const result: OrcidRecord = {
      nombre_completo: nombreCompleto,
      afiliaciones,
      titulos,
      publicaciones_count: publicacionesCount,
      citas_count: citasCount,
      temas_investigacion: temasInvestigacion,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";

    if (
      message.includes("No se encontró") ||
      message.includes("no tiene datos públicos")
    ) {
      return NextResponse.json(
        { error: message } satisfies ErrorResponse,
        { status: 404 }
      );
    }

    console.error("[import-orcid]", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: message } satisfies ErrorResponse,
      { status: 500 }
    );
  }
}