import type { CvProfile } from "./cv-extraction-schema";

export interface CvReviewItem {
  key: string;
  label: string;
  value: string;
  confidence: "alta" | "media" | null;
  evidence: string | null;
}

export interface CvWizardPrefill {
  fullName?: string;
  headline?: string;
  country?: string;
  bio?: string;
  yearsExperience?: number;
  currentPosition?: string;
  currentInstitution?: string;
  institutionsTaught?: string[];
  academicLevel?: string;
  isPhd?: boolean;
  researchPublications?: string;
  unescoTopics?: string;
  languages?: { lang: string; level: string }[];
  degrees?: { type: string; institution: string | null; year: string | number | null }[];
}

const DOCTOR_KEYWORDS = ["doctor", "phd", "doctorado", "ph.d"];

function mentionsDoctor(...texts: (string | null | undefined)[]): boolean {
  return texts.some(
    (t) => !!t && DOCTOR_KEYWORDS.some((kw) => t.toLowerCase().includes(kw))
  );
}

function inferAcademicLevel(tituloMaximo: string | null): string {
  if (!tituloMaximo) return "";
  const t = tituloMaximo.toLowerCase();
  if (DOCTOR_KEYWORDS.some((kw) => t.includes(kw))) return "Doctorado";
  if (t.includes("postdoc")) return "Postdoctorado";
  if (t.includes("máster") || t.includes("master") || t.includes("mba")) return "Master";
  if (t.includes("grado") || t.includes("licenciatura") || t.includes("ingenier") || t.includes("bachelor")) return "Grado";
  return "";
}

/** Perfil legible con badges de confianza para la pantalla de revisión. */
export function buildCvReviewItems(profile: CvProfile): CvReviewItem[] {
  const items: CvReviewItem[] = [];

  const push = (
    key: string,
    label: string,
    value: string | null | undefined,
    confidence: "alta" | "media" | null,
    evidence: string | null
  ) => {
    if (!value) return;
    items.push({ key, label, value, confidence, evidence });
  };

  push("nombre_completo", "Nombre completo", profile.nombre_completo.value, profile.nombre_completo.confidence, profile.nombre_completo.evidence);
  push("titulo_maximo", "Titular académico", profile.titulo_maximo.value, profile.titulo_maximo.confidence, profile.titulo_maximo.evidence);
  push("pais_residencia", "País de residencia", profile.pais_residencia.value, profile.pais_residencia.confidence, profile.pais_residencia.evidence);
  push(
    "anios_experiencia",
    "Años de experiencia",
    profile.anios_experiencia.value != null ? String(profile.anios_experiencia.value) : null,
    profile.anios_experiencia.confidence,
    profile.anios_experiencia.evidence
  );

  if (profile.experiencia.length > 0) {
    const first = profile.experiencia[0];
    push(
      "experiencia_actual",
      "Puesto / institución más reciente",
      [first.puesto, first.institucion].filter(Boolean).join(" — "),
      null,
      first.evidence
    );
  }

  if (profile.titulos.length > 0) {
    push(
      "titulos",
      "Titulaciones",
      profile.titulos.map((t) => [t.value, t.institucion, t.anio].filter(Boolean).join(", ")).filter(Boolean).join(" · "),
      null,
      null
    );
  }

  if (profile.idiomas.length > 0) {
    push(
      "idiomas",
      "Idiomas",
      profile.idiomas.map((i) => [i.idioma, i.nivel].filter(Boolean).join(" ")).filter(Boolean).join(", "),
      null,
      null
    );
  }

  if (profile.areas_especialidad.length > 0) {
    push(
      "areas_especialidad",
      "Áreas de especialidad",
      profile.areas_especialidad.map((a) => a.value).filter(Boolean).join(", "),
      profile.areas_especialidad[0]?.confidence ?? null,
      null
    );
  }

  if (profile.publicaciones_destacadas.length > 0) {
    push(
      "publicaciones",
      "Publicaciones destacadas",
      profile.publicaciones_destacadas.map((p) => [p.titulo, p.anio].filter(Boolean).join(" ")).filter(Boolean).join(" · "),
      null,
      null
    );
  }

  if (profile.bio_draft.value) {
    push("bio_draft", "Biografía (borrador)", profile.bio_draft.value, null, null);
  }

  return items;
}

/** Campos vacíos que el propio prompt ya marcó como "complétalo tú". */
export function getCamposNoEncontrados(profile: CvProfile): string[] {
  return profile.campos_no_encontrados;
}

/** Traduce el JSON extraído a los campos que el wizard sabe editar/guardar. */
export function mapCvProfileToWizardPrefill(profile: CvProfile): CvWizardPrefill {
  const prefill: CvWizardPrefill = {};

  if (profile.nombre_completo.value) prefill.fullName = profile.nombre_completo.value;
  if (profile.titulo_maximo.value) prefill.headline = profile.titulo_maximo.value;
  if (profile.pais_residencia.value) prefill.country = profile.pais_residencia.value;
  if (profile.bio_draft.value) prefill.bio = profile.bio_draft.value;
  if (profile.anios_experiencia.value != null) {
    prefill.yearsExperience = Number(profile.anios_experiencia.value);
  }

  const institutions = profile.experiencia
    .map((e) => e.institucion)
    .filter((v): v is string => !!v);
  const uniqueInstitutions = [...new Set(institutions)];
  if (uniqueInstitutions.length > 0) {
    prefill.currentInstitution = uniqueInstitutions[0];
    prefill.institutionsTaught = uniqueInstitutions.slice(1);
  }
  const firstPuesto = profile.experiencia.find((e) => e.puesto)?.puesto;
  if (firstPuesto) prefill.currentPosition = firstPuesto;

  const academicLevel = inferAcademicLevel(profile.titulo_maximo.value);
  if (academicLevel) prefill.academicLevel = academicLevel;

  if (mentionsDoctor(profile.titulo_maximo.value, ...profile.titulos.map((t) => t.value))) {
    prefill.isPhd = true;
  }

  if (profile.publicaciones_destacadas.length > 0) {
    const lines = profile.publicaciones_destacadas
      .map((p) => [p.titulo, p.anio ? `(${p.anio})` : null].filter(Boolean).join(" "))
      .filter(Boolean);
    if (lines.length > 0) prefill.researchPublications = lines.join("\n");
  }

  if (profile.areas_especialidad.length > 0) {
    const topics = profile.areas_especialidad.map((a) => a.value).filter(Boolean);
    if (topics.length > 0) prefill.unescoTopics = topics.join(", ");
  }

  if (profile.idiomas.length > 0) {
    const languages = profile.idiomas
      .filter((i): i is typeof i & { idioma: string } => !!i.idioma)
      .map((i) => ({ lang: i.idioma, level: i.nivel || "B2" }));
    if (languages.length > 0) prefill.languages = languages;
  }

  if (profile.titulos.length > 0) {
    const degrees = profile.titulos
      .filter((t): t is typeof t & { value: string } => !!t.value)
      .map((t) => ({ type: t.value, institution: t.institucion, year: t.anio }));
    if (degrees.length > 0) prefill.degrees = degrees;
  }

  return prefill;
}
