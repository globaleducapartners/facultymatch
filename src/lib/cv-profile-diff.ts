// Compara el borrador que la IA lee del CV con el perfil que el docente ya
// tiene y lo convierte en una lista de cambios que puede aceptar uno a uno.
//
// Reglas (decididas con Miguel): se rellenan los campos vacíos y se añade lo
// que falta en las listas; solo el titular y la biografía se proponen como
// mejora aunque ya tengan contenido, y esas propuestas nacen desmarcadas.
// Nunca se cambia el nombre ni se borra nada de lo existente.
import type { CvWizardPrefill } from "./cv-import-mapping";
import { SENSITIVE_FIELDS } from "./profile-sensitivity";

export interface CurrentProfileSnapshot {
  headline: string;
  bio: string;
  country: string;
  yearsExperience: number;
  currentPosition: string;
  researchPublications: string;
  currentInstitution: string;
  institutionsTaught: string[];
  academicLevel: string;
  isPhd: boolean;
  degrees: { type?: string; institution?: string | null; year?: string | number | null }[];
  languages: { lang?: string; level?: string }[];
}

export interface CvSuggestionPayload {
  headline?: string;
  bio?: string;
  country?: string;
  yearsExperience?: number;
  currentPosition?: string;
  researchPublications?: string;
  currentInstitution?: string;
  academicLevel?: string;
  isPhd?: boolean;
  addInstitutionsTaught?: string[];
  addDegrees?: { type: string; institution: string | null; year: string | number | null }[];
  addLanguages?: { lang: string; level: string }[];
}

export interface CvSuggestion {
  key: string;
  label: string;
  kind: "nuevo" | "mejora" | "añadir";
  /** Toca un campo que, en un perfil verificado, lo devuelve a revisión. */
  sensitive: boolean;
  current: string;
  proposed: string;
  defaultChecked: boolean;
  /** Fragmento que se envía al servidor si se acepta. */
  payload: CvSuggestionPayload;
}

const norm = (s: string | null | undefined) => (s || "").toLowerCase().replace(/\s+/g, " ").trim();
// Columnas de la base de datos que cada clave de sugerencia puede escribir.
const DB_COLUMNS: Record<string, string> = {
  currentInstitution: "current_institution",
  academicLevel: "academic_level",
  isPhd: "is_phd",
  institutionsTaught: "institutions_taught",
  degrees: "degrees",
};
const isSensitiveKey = (k: string) => !!DB_COLUMNS[k] && (SENSITIVE_FIELDS as readonly string[]).includes(DB_COLUMNS[k]);

export function buildCvSuggestions(
  current: CurrentProfileSnapshot,
  prefill: CvWizardPrefill,
  verified: boolean
): CvSuggestion[] {
  const out: CvSuggestion[] = [];

  const scalar = (
    key: keyof CvSuggestionPayload,
    label: string,
    cur: string,
    next: string | undefined,
    opts: { improvable?: boolean } = {}
  ) => {
    const proposed = (next || "").trim();
    if (!proposed) return;
    const sensitive = isSensitiveKey(key as string);
    if (!norm(cur)) {
      out.push({
        key, label, kind: "nuevo", sensitive, current: "", proposed,
        defaultChecked: !(sensitive && verified), payload: { [key]: proposed } as CvSuggestionPayload,
      });
    } else if (opts.improvable && norm(cur) !== norm(proposed)) {
      out.push({
        key, label, kind: "mejora", sensitive, current: cur, proposed,
        defaultChecked: false, payload: { [key]: proposed } as CvSuggestionPayload,
      });
    }
  };

  scalar("headline", "Titular", current.headline, prefill.headline, { improvable: true });
  scalar("bio", "Biografía", current.bio, prefill.bio, { improvable: true });
  scalar("country", "País", current.country, prefill.country);
  scalar("currentPosition", "Puesto actual", current.currentPosition, prefill.currentPosition);
  scalar("currentInstitution", "Institución actual", current.currentInstitution, prefill.currentInstitution);
  scalar("academicLevel", "Nivel académico", current.academicLevel, prefill.academicLevel);
  scalar("researchPublications", "Publicaciones", current.researchPublications, prefill.researchPublications);

  if (!current.yearsExperience && prefill.yearsExperience && prefill.yearsExperience > 0) {
    out.push({
      key: "yearsExperience", label: "Años de experiencia", kind: "nuevo", sensitive: false,
      current: "", proposed: String(prefill.yearsExperience), defaultChecked: true,
      payload: { yearsExperience: prefill.yearsExperience },
    });
  }

  if (prefill.isPhd && !current.isPhd) {
    out.push({
      key: "isPhd", label: "Doctorado", kind: "nuevo", sensitive: true,
      current: "", proposed: "Marcar como doctor/a", defaultChecked: !verified,
      payload: { isPhd: true },
    });
  }

  // Listas: solo se añade lo que falta; lo que ya hay no se toca.
  const known = new Set([norm(current.currentInstitution), ...current.institutionsTaught.map(norm)]);
  const newInst = (prefill.institutionsTaught || []).filter((i) => i && !known.has(norm(i)));
  if (newInst.length > 0) {
    out.push({
      key: "institutionsTaught", label: "Instituciones donde has enseñado", kind: "añadir", sensitive: true,
      current: current.institutionsTaught.join(", "), proposed: newInst.join(", "),
      defaultChecked: !verified, payload: { addInstitutionsTaught: newInst },
    });
  }

  const haveDegrees = new Set(current.degrees.map((d) => `${norm(d.type)}|${norm(d.institution)}`));
  const newDegrees = (prefill.degrees || []).filter((d) => d.type && !haveDegrees.has(`${norm(d.type)}|${norm(d.institution)}`));
  if (newDegrees.length > 0) {
    out.push({
      key: "degrees", label: "Titulaciones", kind: "añadir", sensitive: true,
      current: current.degrees.map((d) => d.type).filter(Boolean).join(" · "),
      proposed: newDegrees.map((d) => [d.type, d.institution, d.year].filter(Boolean).join(", ")).join(" · "),
      defaultChecked: !verified, payload: { addDegrees: newDegrees },
    });
  }

  const haveLangs = new Set(current.languages.map((l) => norm(l.lang)));
  const newLangs = (prefill.languages || []).filter((l) => l.lang && !haveLangs.has(norm(l.lang)));
  if (newLangs.length > 0) {
    out.push({
      key: "languages", label: "Idiomas", kind: "añadir", sensitive: false,
      current: current.languages.map((l) => l.lang).filter(Boolean).join(", "),
      proposed: newLangs.map((l) => `${l.lang} (${l.level})`).join(", "),
      defaultChecked: true, payload: { addLanguages: newLangs },
    });
  }

  return out;
}

/** Une los fragmentos de las sugerencias aceptadas en un único payload. */
export function mergeSuggestionPayloads(items: CvSuggestion[]): CvSuggestionPayload {
  const merged: CvSuggestionPayload = {};
  for (const it of items) Object.assign(merged, it.payload);
  return merged;
}
