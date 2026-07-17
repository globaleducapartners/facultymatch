import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert a name to a URL-friendly slug (e.g. "Miguel Ángel" → "miguel-angel").
 * Removes accents, lowercases, replaces spaces/special chars with hyphens.
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Generate a public storage URL for a faculty document from its file_path.
 * The faculty_documents bucket is public, so we can construct the URL directly.
 */
export function getDocumentUrl(filePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/faculty_documents/${filePath}`;
}

/**
 * Get the public URL for an uploaded banner image.
 */
export function getBannerUrl(filePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/banners/${filePath}`;
}

/**
 * ──────────────────────────────────────────────────────────────────
 *  Timezone helpers — all displayed dates in Europe/Madrid (UTC+2)
 * ──────────────────────────────────────────────────────────────────
 */

/**
 * Format a date string to Spanish locale in Europe/Madrid timezone.
 */
export function formatDateTZ(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }
): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-ES", { ...options, timeZone: "Europe/Madrid" });
  } catch {
    return dateStr;
  }
}

/**
 * Full date + time in Europe/Madrid (e.g. "12 jun 2026, 14:30").
 */
export function formatDateTimeTZ(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Madrid",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Human-readable relative time in Spanish, based on Europe/Madrid.
 */
export function timeAgoTZ(dateStr: string): string {
  try {
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now.getTime() - then.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Ahora";
    if (mins < 60) return `Hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Hace ${days}d`;
    return formatDateTZ(dateStr);
  } catch {
    return dateStr;
  }
}
