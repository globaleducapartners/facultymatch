import { createHash } from "crypto";

/**
 * Código de verificación (SHA-256) y credencial legible de un perfil
 * verificado — usados tanto en el certificado PDF como en la página
 * pública /verificar/[slug].
 *
 * IMPORTANTE: el hash se calcula a partir de `verifiedAt` (la fecha real
 * en que se verificó el perfil, faculty_profiles.verificado_en), NUNCA a
 * partir de "ahora". Antes se generaba con `new Date()` en el momento de
 * pedir el PDF, así que cada descarga producía un hash distinto — un
 * "código de verificación" que cambia cada vez no sirve para verificar
 * nada. Con verifiedAt como entrada, el mismo perfil siempre produce el
 * mismo hash, y la página /verificar puede recalcularlo de forma
 * independiente para confirmar que coincide.
 */
export function generateVerificationHash(
  fullName: string,
  verifiedAt: string,
  profileSlug?: string | null
): string {
  const data = `FACULTYMATCH::${fullName}::${verifiedAt}::${profileSlug || "sin-slug"}`;
  return createHash("sha256").update(data).digest("hex").toUpperCase();
}

export function shortenHash(hash: string): string {
  return `${hash.slice(0, 16)}…${hash.slice(-16)}`;
}

/**
 * ID de credencial legible, estilo "FM-2026-MAME-7842" — pensado para
 * pegar en el campo "ID de la credencial" de LinkedIn. Determinista:
 * mismo perfil + misma fecha de verificación → mismo ID siempre.
 */
export function buildCredentialId(fullName: string, verifiedAt: string, profileSlug?: string | null): string {
  const year = new Date(verifiedAt).getFullYear();
  const initials =
    fullName
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // quita acentos: Á → A
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 4) || "FM";
  const hash = generateVerificationHash(fullName, verifiedAt, profileSlug);
  const digits = (hash.replace(/[^0-9]/g, "").slice(0, 4) || "0000").padEnd(4, "0");
  return `FM-${year}-${initials}-${digits}`;
}
