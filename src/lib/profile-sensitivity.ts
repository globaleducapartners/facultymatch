/**
 * Sensitive fields that trigger re-verification when changed.
 *
 * When a faculty user edits any of these fields, the profile's estado_perfil
 * should be set back to 'en_revision' so an admin can review the changes.
 *
 * Reglas:
 *   - Nombre/apellidos, títulos, certificaciones, instituciones → desverifican
 *   - Bio, foto, disponibilidad, idiomas, especialidades → NO desverifican
 *
 * Nota: full_name está en user_profiles, no en faculty_profiles.
 *       La verificación debe comprobarse también al actualizar user_profiles.
 */
export const SENSITIVE_FIELDS = [
  "full_name",              // Nombre y apellidos (user_profiles)
  "academic_level",         // Nivel académico
  "degrees",                // Títulos universitarios
  "aneca_accreditation",    // Certificación ANECA
  "is_phd",                 // Grado de doctor
  "institutions_taught",    // Instituciones donde ha enseñado
  "current_institution",    // Institución actual
  "google_scholar_id",      // Perfil académico Google Scholar
  "orcid_id",               // Identificador ORCID
] as const;

export type SensitiveField = (typeof SENSITIVE_FIELDS)[number];

export function isSensitiveField(field: string): boolean {
  return (SENSITIVE_FIELDS as readonly string[]).includes(field);
}