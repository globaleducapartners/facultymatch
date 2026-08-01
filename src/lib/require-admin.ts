import { createClient, createAdminClient } from "@/lib/supabase-server";

/**
 * Server Actions (unlike the pages under src/app/control, which are all
 * protected by control/layout.tsx) are invoked as independent POSTs and are
 * NOT covered by that layout's role check — each one must verify admin
 * access itself. Mirrors the verifyAdmin() pattern already used by the
 * /api/admin/* routes.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
    throw new Error("Unauthorized");
  }

  return { userId: user.id, admin };
}
