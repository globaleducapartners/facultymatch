"use server";

import { createClient, createAdminClient } from "@/lib/supabase-server";
import { SENSITIVE_FIELDS } from "@/lib/profile-sensitivity";

/**
 * When a verified profile updates a sensitive field, downgrade it back to
 * en_revision so an admin must re-verify before it's trusted again.
 *
 * Every code path that writes to faculty_profiles — the tabbed editor and
 * the ORCID import modal alike — must call this with the DB columns it just
 * wrote, so the check can't be bypassed by adding a new save path later.
 */
export async function checkReVerification(userId: string, dbColumns: string[]) {
  const supabase = await createClient();
  const { data: fp } = await supabase
    .from("faculty_profiles")
    .select("estado_perfil")
    .eq("id", userId)
    .maybeSingle();

  if (!fp || fp.estado_perfil !== "verificado") return;

  const hasSensitive = dbColumns.some((col) =>
    (SENSITIVE_FIELDS as readonly string[]).includes(col)
  );
  if (!hasSensitive) return;

  const admin = createAdminClient();
  await admin.from("faculty_profiles").update({
    estado_perfil: "en_revision",
    is_verified: false,
    verificado_por: null,
    verificado_en: null,
    verification_notes: null,
    updated_at: new Date().toISOString(),
  }).eq("id", userId);
}
