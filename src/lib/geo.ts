// Búsqueda geográfica — utilidades compartidas (migración 20261108000001).
//
// Las coordenadas son SIEMPRE las del centro de la ciudad (tabla geo_places,
// GeoNames), nunca una dirección. Se usan solo en el servidor; al navegador
// solo llega la distancia aproximada.

export interface ResolvedPlace {
  placeId: number;
  name: string;
  countryCode: string;
  latitude: number;
  longitude: number;
}

// Cualquier cliente de Supabase (admin o de scripts) que sepa llamar a rpc().
type RpcClient = { rpc: (fn: string, args: Record<string, unknown>) => PromiseLike<{ data: any; error: any }> };

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

let countryIndex: Map<string, string> | null = null;

// "España" → "ES". Se construye con los nombres de país del propio sistema
// (en español e inglés) en lugar de una lista escrita a mano.
function getCountryIndex(): Map<string, string> {
  if (countryIndex) return countryIndex;
  const index = new Map<string, string>();
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (const lang of ["es", "en"]) {
    const names = new Intl.DisplayNames([lang], { type: "region" });
    for (const a of A) {
      for (const b of A) {
        const code = a + b;
        let label: string | undefined;
        try {
          label = names.of(code);
        } catch {
          continue;
        }
        if (label && label !== code && !index.has(norm(label))) index.set(norm(label), code);
      }
    }
  }
  // Variantes habituales escritas a mano por los usuarios.
  for (const [alias, code] of [
    ["eeuu", "US"], ["ee uu", "US"], ["usa", "US"], ["estados unidos de america", "US"],
    ["uk", "GB"], ["inglaterra", "GB"], ["republica dominicana", "DO"], ["mexico", "MX"],
  ] as const) {
    index.set(alias, code);
  }
  countryIndex = index;
  return index;
}

/** "España" → "ES"; null si el texto no se reconoce como país. */
export function countryCodeFromName(name: string | null | undefined): string | null {
  if (!name) return null;
  return getCountryIndex().get(norm(name)) ?? null;
}

/**
 * Busca la ciudad en geo_places. Devuelve null si no hay coincidencia exacta:
 * es preferible un perfil sin coordenadas a uno colocado en el sitio equivocado
 * (sigue apareciendo en las búsquedas por texto y por país).
 */
export async function resolvePlace(
  client: RpcClient,
  city: string | null | undefined,
  country: string | null | undefined,
  options: { anyCountry?: boolean } = {}
): Promise<ResolvedPlace | null> {
  const cityText = (city ?? "").trim();
  if (!cityText) return null;

  // Sin país no se adivina: "Valencia" sola sería la de Venezuela (más poblada).
  // Solo las búsquedas de quien consulta (anyCountry) admiten no indicar país;
  // un país escrito pero no reconocido sigue sin adivinarse.
  const countryCode = countryCodeFromName(country);
  if (!countryCode && !(options.anyCountry && !(country ?? "").trim())) return null;

  const { data, error } = await client.rpc("geo_resolve", { p_name: cityText, p_country_code: countryCode });
  if (error || !Array.isArray(data) || data.length === 0) return null;
  const r = data[0];
  return {
    placeId: Number(r.place_id),
    name: r.place_name,
    countryCode: String(r.country_code),
    latitude: Number(r.latitude),
    longitude: Number(r.longitude),
  };
}

/** Quita del texto de ciudad los trozos que son el propio país ("Palma, España" → "Palma"). */
export function cleanCityForGeo(city: string | null | undefined, countryCode: string | null): string {
  const parts = (city ?? "").split(/\s*,\s*/).filter((p) => p && (!countryCode || countryCodeFromName(p) !== countryCode));
  return parts.join(", ").trim();
}

// Cliente con rpc() y from() (el de servidor del proyecto o el de los scripts).
type DbClient = RpcClient & { from: (table: string) => any };

/**
 * Recalcula las ciudades (hasta 3) y coordenadas de un docente a partir de la
 * ciudad y el país que tiene guardados ("Valencia y Murcia" → ambas). Se llama
 * DESPUÉS de guardar. Nunca lanza: si falla (p. ej. la migración aún no está
 * aplicada) solo se registra, y guardar el perfil no se ve afectado.
 */
export async function refreshFacultyGeo(client: DbClient, facultyId: string): Promise<number> {
  try {
    const { data: fp } = await client.from("faculty_profiles").select("city, country").eq("id", facultyId).maybeSingle();
    const countryCode = countryCodeFromName(fp?.country);
    const { data, error } = await client.rpc("geo_set_faculty_places", {
      p_faculty_id: facultyId,
      p_city: cleanCityForGeo(fp?.city, countryCode),
      p_country_code: countryCode,
    });
    if (error) {
      console.error("[geo] geo_set_faculty_places:", error.message ?? error);
      return 0;
    }
    return Number(data) || 0;
  } catch (e) {
    console.error("[geo] refreshFacultyGeo:", e);
    return 0;
  }
}

/**
 * Recalcula las coordenadas de una institución a partir de su ciudad y país.
 * Igual que refreshFacultyGeo: se llama DESPUÉS de guardar y nunca lanza.
 */
export async function refreshInstitutionGeo(client: DbClient, userId: string): Promise<void> {
  try {
    const { data: inst } = await client.from("institutions").select("id, city, country").eq("user_id", userId).maybeSingle();
    if (!inst) return;
    const place = await resolvePlace(client, cleanCityForGeo(inst.city, countryCodeFromName(inst.country)), inst.country);
    const { error } = await client
      .from("institutions")
      .update({
        latitude: place?.latitude ?? null,
        longitude: place?.longitude ?? null,
        geo_place_id: place?.placeId ?? null,
        geo_updated_at: new Date().toISOString(),
      })
      .eq("id", inst.id);
    if (error) console.error("[geo] institutions update:", error.message ?? error);
  } catch (e) {
    console.error("[geo] refreshInstitutionGeo:", e);
  }
}

// ── Carga de GeoNames (scripts/load-geonames.ts) ─────────────────────────────

export interface GeoNamesRow {
  id: number;
  name: string;
  country_code: string;
  admin1_code: string | null;
  population: number;
  latitude: number;
  longitude: number;
  alt_names: string[];
}

const LATIN_NAME = /^[\p{Script=Latin}\p{M}0-9 .'’\-]+$/u;

/** Una línea de cities5000.txt (columnas separadas por tabulador, ver readme de GeoNames). */
export function parseGeoNamesLine(line: string): GeoNamesRow | null {
  const c = line.split("\t");
  if (c.length < 15) return null;
  const id = Number(c[0]);
  const latitude = Number(c[4]);
  const longitude = Number(c[5]);
  if (!Number.isFinite(id) || !Number.isFinite(latitude) || !Number.isFinite(longitude) || !c[1] || !c[8]) return null;

  const alt = new Set<string>();
  for (const n of [c[2], ...c[3].split(",")]) {
    const t = n.trim();
    if (t && t !== c[1] && t.length <= 60 && LATIN_NAME.test(t)) alt.add(t);
    if (alt.size >= 80) break;
  }
  return {
    id,
    name: c[1],
    country_code: c[8],
    admin1_code: c[10] || null,
    population: Number(c[14]) || 0,
    latitude,
    longitude,
    alt_names: [...alt],
  };
}
