"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase-server";
import { hashToken, isTokenExpired } from "@/lib/activation-token";

// The actual state-changing step — only reachable via an explicit button
// press on /auth/activar (a POST through this server action), never a bare
// GET, so an email client's link-scanner can't consume the token by itself.
export async function confirmActivation(token: string) {
  const admin = createAdminClient();
  const tokenHash = hashToken(token);

  const { data: row } = await admin
    .from("activation_tokens")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!row) {
    redirect("/auth/verificar-email?error=invalid_token");
  }
  if (row.used) {
    redirect("/auth/verificar-email?error=already_used");
  }
  if (isTokenExpired(row.expires_at)) {
    redirect("/auth/verificar-email?error=expired");
  }

  const { error: updateError } = await admin
    .from("activation_tokens")
    .update({ used: true })
    .eq("id", row.id);
  if (updateError) {
    console.error("[confirmActivation] Failed to mark token as used:", updateError);
    redirect("/auth/verificar-email?error=server_error");
  }

  const { error: activateError } = await admin
    .from("faculty_profiles")
    .update({ estado_perfil: "incompleto" })
    .eq("id", row.user_id);
  if (activateError) {
    console.error("[confirmActivation] Failed to update estado_perfil:", activateError);
  }

  // If the person is already logged in on this device (the common case —
  // same browser they signed up in), send them straight to onboarding.
  const supabase = await createClient();
  const { data: { user: sessionUser } } = await supabase.auth.getUser();

  if (sessionUser && sessionUser.id === row.user_id) {
    // Force a fresh render of the destination — right after a redirect that
    // follows an auth/data change, Next's router cache can otherwise serve a
    // stale copy of the page fetched before this update, showing blank/old
    // content until a manual reload.
    revalidatePath("/app/faculty/onboarding");
    revalidatePath("/app/faculty");
    redirect("/app/faculty/onboarding");
  }

  redirect("/login?message=Cuenta activada. Ahora inicia sesión para completar tu perfil.");
}
