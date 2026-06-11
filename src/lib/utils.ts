import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
