// Fuente ÚNICA de la completitud de un perfil docente.
//
// Antes había 5 cálculos distintos repartidos por la app (panel del docente,
// editor de perfil, pantalla de verificación, orden del buscador, ficha de
// /control) y cada uno daba un número diferente para el mismo perfil. El de
// /control además comprobaba dos columnas que no existen en faculty_profiles
// (contact_email, avatar_url), así que TODO docente perdía un 25% fijo ahí
// (por eso un perfil completo salía al ~63%). Este módulo lo unifica.
//
// `calcFacultyCompleteness` es puro y se puede importar desde componentes de
// cliente. `refreshFacultyCompleteness` es la versión de servidor que además
// escribe el resultado en faculty_profiles.profile_completeness.

export interface CompletenessInput {
  headline?: string | null;
  bio?: string | null;
  /** location combinada ("Murcia, España") o city+country por separado */
  location?: string | null;
  city?: string | null;
  country?: string | null;
  availability?: string | null;
  academicLevel?: string | null;
  degreesCount?: number;
  languagesCount?: number;
  institutionsTaughtCount?: number;
  /** ¿tiene fila en faculty_expertise O faculty_areas relleno? */
  hasExpertise?: boolean;
  /** user_profiles.avatar_url (la foto NO vive en faculty_profiles) */
  avatarUrl?: string | null;
}

interface FieldDef {
  key: string;
  label: string;
  weight: number;
  /** los "core" son los que se listan como "te falta …" al docente */
  core: boolean;
  filled: (i: CompletenessInput) => boolean;
}

const nonEmpty = (v: unknown) => typeof v === "string" && v.trim().length > 0;

// Pesos sumando 100. Los campos importantes (bio, área, foto) pesan más que
// los secundarios (historial, nivel académico). Deliberadamente NO se
// puntúa: years_experience (se rompía con el valor 0 y no aplica a todos los
// perfiles), web/LinkedIn (opcional), banner (cosmético), acreditación ANECA
// (solo aplica a una parte).
export const COMPLETENESS_FIELDS: FieldDef[] = [
  { key: "headline", label: "Titular profesional", weight: 12, core: true,
    filled: (i) => nonEmpty(i.headline) },
  { key: "bio", label: "Biografía profesional", weight: 16, core: true,
    filled: (i) => nonEmpty(i.bio) },
  { key: "location", label: "Ubicación", weight: 10, core: true,
    filled: (i) => nonEmpty(i.location) || (nonEmpty(i.city) && nonEmpty(i.country)) },
  { key: "expertise", label: "Área de especialidad", weight: 16, core: true,
    filled: (i) => !!i.hasExpertise },
  { key: "languages", label: "Idiomas", weight: 10, core: true,
    filled: (i) => (i.languagesCount ?? 0) > 0 },
  { key: "availability", label: "Disponibilidad", weight: 10, core: true,
    filled: (i) => nonEmpty(i.availability) },
  { key: "avatar", label: "Foto de perfil", weight: 12, core: true,
    filled: (i) => nonEmpty(i.avatarUrl) },
  { key: "degrees", label: "Titulación / formación", weight: 8, core: true,
    filled: (i) => (i.degreesCount ?? 0) > 0 },
  { key: "history", label: "Historial docente", weight: 4, core: false,
    filled: (i) => (i.institutionsTaughtCount ?? 0) > 0 },
  { key: "academicLevel", label: "Nivel académico", weight: 2, core: false,
    filled: (i) => nonEmpty(i.academicLevel) },
];

export interface CompletenessResult {
  /** 0–100 */
  score: number;
  /** etiquetas de campos core sin rellenar, para el aviso "te falta …" */
  missing: string[];
}

export function calcFacultyCompleteness(input: CompletenessInput): CompletenessResult {
  let score = 0;
  const missing: string[] = [];
  for (const f of COMPLETENESS_FIELDS) {
    if (f.filled(input)) {
      score += f.weight;
    } else if (f.core) {
      missing.push(f.label);
    }
  }
  return { score: Math.round(score), missing };
}

// ── Adaptador desde las filas de BD ──────────────────────────────────────────
// fp = fila de faculty_profiles, userProfile = fila de user_profiles (por la
// foto). hasExpertise se pasa aparte porque vive en otra tabla.
export function completenessInputFromRows(
  fp: any,
  userProfile: any,
  hasExpertise: boolean
): CompletenessInput {
  return {
    headline: fp?.headline,
    bio: fp?.bio,
    location: fp?.location,
    city: fp?.city,
    country: fp?.country,
    availability: fp?.availability,
    academicLevel: fp?.academic_level,
    degreesCount: Array.isArray(fp?.degrees) ? fp.degrees.length : 0,
    languagesCount: Array.isArray(fp?.languages) ? fp.languages.length : 0,
    institutionsTaughtCount: Array.isArray(fp?.institutions_taught) ? fp.institutions_taught.length : 0,
    hasExpertise:
      hasExpertise ||
      (Array.isArray(fp?.faculty_areas) && fp.faculty_areas.length > 0),
    avatarUrl: userProfile?.avatar_url ?? null,
  };
}

// ── Versión de servidor: calcula y guarda en profile_completeness ────────────
// `admin` es un cliente de Supabase con service role. `facultyId` es
// faculty_profiles.id (== user_id en este proyecto). Devuelve la puntuación.
// Se llama al final de cada acción que modifica el perfil (onboarding,
// editor, especialidades) para mantener la columna al día.
export async function refreshFacultyCompleteness(
  admin: any,
  facultyId: string
): Promise<number | null> {
  try {
    const [{ data: fp }, { data: up }, { data: expertise }] = await Promise.all([
      admin
        .from("faculty_profiles")
        .select("headline, bio, location, city, country, availability, academic_level, degrees, languages, institutions_taught, faculty_areas")
        .eq("id", facultyId)
        .maybeSingle(),
      admin.from("user_profiles").select("avatar_url").eq("id", facultyId).maybeSingle(),
      admin.from("faculty_expertise").select("id").eq("faculty_id", facultyId).limit(1),
    ]);
    if (!fp) return null;

    const { score } = calcFacultyCompleteness(
      completenessInputFromRows(fp, up, (expertise?.length ?? 0) > 0)
    );

    await admin
      .from("faculty_profiles")
      .update({ profile_completeness: score })
      .eq("id", facultyId);

    return score;
  } catch (e) {
    console.error("[refreshFacultyCompleteness]", e);
    return null;
  }
}
