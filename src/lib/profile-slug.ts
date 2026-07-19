import { createAdminClient } from "@/lib/supabase-server";
import { toSlug } from "@/lib/utils";

/**
 * Ensures a faculty profile has a profile_slug. Returns the existing slug
 * unchanged if one is already set (slugs are immutable once created, since
 * they may already be shared publicly) — otherwise generates one from
 * full_name, appending a numeric suffix on collision. Returns null if
 * full_name isn't set yet (caller decides whether that blocks anything).
 */
export async function ensureProfileSlug(
  admin: ReturnType<typeof createAdminClient>,
  facultyId: string
): Promise<string | null> {
  const { data: fp } = await admin
    .from("faculty_profiles")
    .select("profile_slug")
    .eq("id", facultyId)
    .maybeSingle();

  if (fp?.profile_slug) return fp.profile_slug;

  const { data: up } = await admin
    .from("user_profiles")
    .select("full_name")
    .eq("id", facultyId)
    .maybeSingle();

  if (!up?.full_name) return null;

  const base = toSlug(up.full_name);
  let candidate = base;
  let counter = 1;
  while (true) {
    const { data: taken } = await admin
      .from("faculty_profiles")
      .select("id")
      .eq("profile_slug", candidate)
      .neq("id", facultyId)
      .maybeSingle();
    if (!taken) break;
    candidate = `${base}-${++counter}`;
  }

  await admin.from("faculty_profiles").update({ profile_slug: candidate }).eq("id", facultyId);

  return candidate;
}
