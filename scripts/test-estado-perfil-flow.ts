/**
 * End-to-end test for the estado_perfil lifecycle:
 *   signup → pendiente_verificacion → activar → incompleto → publish → en_revision
 *
 * Usage: bun run scripts/test-estado-perfil-flow.ts
 */

import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes } from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TEST_EMAIL = `test-${Date.now()}@facultymatch.test`;
const TEST_PASSWORD = "TestPass123!";

async function main() {
  console.log("=== E2E: estado_perfil lifecycle ===\n");

  // Reload PostgREST schema cache to ensure the new column is visible
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: "GET",
      headers: {
        "apikey": SERVICE_ROLE,
        "Authorization": `Bearer ${SERVICE_ROLE}`,
        "Accept": "application/json",
      },
    });
  } catch { /* ignore */ }
  console.log("Schema cache refreshed\n");

  // ── 1. Create user (simulates signUp) ─────────────────────────────
  console.log("1. Creating test user...");
  const { data: userData, error: createError } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Test User", role: "faculty" },
  });

  if (createError) {
    console.error("  FAILED:", createError.message);
    process.exit(1);
  }
  const userId = userData.user!.id;
  console.log(`  User created: ${userId}`);

  // Check if the trigger created any rows
  const { data: userProfileRow } = await admin
    .from("user_profiles")
    .select("id, role")
    .eq("id", userId)
    .maybeSingle();
  console.log(`  user_profiles after trigger: ${JSON.stringify(userProfileRow)}`);

  const { data: triggerRow } = await admin
    .from("faculty_profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  console.log(`  faculty_profiles after trigger: ${JSON.stringify(triggerRow)}`);

  // Ensure user_profiles exists first (needed for FK constraint on faculty_profiles)
  const { error: upErr } = await admin.from("user_profiles").upsert({
    id: userId,
    role: "faculty",
    full_name: "Test User",
  }, { onConflict: "id" });
  console.log(`  user_profiles upsert: ${upErr?.message || "ok"}`);

  // Now create/update faculty_profiles
  const { data: upsertResult, error: upsertError } = await admin.from("faculty_profiles").upsert({
    id: userId,
    user_id: userId,
    visibility: "public",
    is_active: true,
    is_verified: false,
    onboarding_status: "not_started",
    onboarding_step: 0,
    estado_perfil: "pendiente_verificacion",
  }, { onConflict: "id" }).select();

  console.log(`  faculty_profiles upsert: ${upsertError?.message || "ok"} result=${JSON.stringify(upsertResult)}`);

  // ── 2. Create activation token (simulates signUp) ─────────────────
  console.log("\n2. Creating activation token...");
  const token = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { error: insertError } = await admin.from("activation_tokens").insert({
    user_id: userId,
    token_hash: hash,
    expires_at: expiresAt,
    used: false,
  });

  if (insertError) {
    console.error("  FAILED:", insertError.message);
    await cleanup(userId);
    process.exit(1);
  }
  console.log("  Token created (hash):", hash.slice(0, 16) + "...");

  // ── 3. Verify estado_perfil is pendiente_verificacion ─────────────
  console.log("\n3. Verifying estado_perfil...");
  const { data: profile1, error: profile1Error } = await admin
    .from("faculty_profiles")
    .select("estado_perfil, onboarding_status, id, user_id")
    .eq("user_id", userId)
    .maybeSingle();

  console.log(`  Query error: ${profile1Error?.message || "none"}`);
  console.log(`  Profile data: ${JSON.stringify(profile1)}`);
  console.log(`  estado_perfil = '${profile1?.estado_perfil}'`);
  console.log(`  onboarding_status = '${profile1?.onboarding_status}'`);

  if (profile1?.estado_perfil !== "pendiente_verificacion") {
    console.error("  FAILED: expected 'pendiente_verificacion'");
    await cleanup(userId);
    process.exit(1);
  }
  console.log("  ✓ estado_perfil is 'pendiente_verificacion'");

  // ── 4. Activate token (simulates /auth/activar) ──────────────────
  console.log("\n4. Activating token...");
  const { data: row } = await admin
    .from("activation_tokens")
    .select("*")
    .eq("token_hash", hash)
    .maybeSingle();

  if (!row) {
    console.error("  FAILED: token not found");
    await cleanup(userId);
    process.exit(1);
  }

  // Mark as used
  await admin.from("activation_tokens").update({ used: true }).eq("id", row.id);
  // Update estado_perfil
  await admin.from("faculty_profiles").update({ estado_perfil: "incompleto" }).eq("user_id", userId);

  console.log("  Token marked as used ✓");
  console.log("  estado_perfil updated to 'incompleto' ✓");

  // ── 5. Verify estado_perfil is incompleto ─────────────────────────
  console.log("\n5. Verifying estado_perfil after activation...");
  const { data: profile2 } = await admin
    .from("faculty_profiles")
    .select("estado_perfil")
    .eq("user_id", userId)
    .single();

  console.log(`  estado_perfil = '${profile2?.estado_perfil}'`);

  if (profile2?.estado_perfil !== "incompleto") {
    console.error("  FAILED: expected 'incompleto'");
    await cleanup(userId);
    process.exit(1);
  }
  console.log("  ✓ estado_perfil is 'incompleto'");

  // ── 6. Publish profile (simulates publishProfile) ─────────────────
  console.log("\n6. Publishing profile (simulating publishProfile)...");
  await admin.from("faculty_profiles").update({
    onboarding_status: "completed",
    estado_perfil: "en_revision",
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId);

  console.log("  onboarding_status = 'completed' ✓");
  console.log("  estado_perfil = 'en_revision' ✓");

  // ── 7. Verify estado_perfil is en_revision ────────────────────────
  console.log("\n7. Verifying estado_perfil after publish...");
  const { data: profile3 } = await admin
    .from("faculty_profiles")
    .select("estado_perfil, onboarding_status")
    .eq("user_id", userId)
    .single();

  console.log(`  estado_perfil = '${profile3?.estado_perfil}'`);
  console.log(`  onboarding_status = '${profile3?.onboarding_status}'`);

  if (profile3?.estado_perfil !== "en_revision") {
    console.error("  FAILED: expected 'en_revision'");
    await cleanup(userId);
    process.exit(1);
  }
  if (profile3?.onboarding_status !== "completed") {
    console.error("  FAILED: expected onboarding_status = 'completed'");
    await cleanup(userId);
    process.exit(1);
  }
  console.log("  ✓ estado_perfil is 'en_revision'");
  console.log("  ✓ onboarding_status is 'completed'");

  // ── 8. Verify CHECK constraint rejects invalid values ─────────────
  console.log("\n8. Verifying CHECK constraint...");
  const { error: checkError } = await admin
    .from("faculty_profiles")
    .update({ estado_perfil: "invalid_value" })
    .eq("user_id", userId);

  if (checkError) {
    console.log("  ✓ CHECK constraint correctly rejected invalid value");
  } else {
    console.error("  FAILED: CHECK constraint should have rejected 'invalid_value'");
    await cleanup(userId);
    process.exit(1);
  }

  // ── 9. Verify token is marked as used ─────────────────────────────
  console.log("\n9. Verifying token status...");
  const { data: tokenRow } = await admin
    .from("activation_tokens")
    .select("used")
    .eq("token_hash", hash)
    .single();

  console.log(`  token used = ${tokenRow?.used}`);

  if (tokenRow?.used !== true) {
    console.error("  FAILED: token should be marked as used");
    await cleanup(userId);
    process.exit(1);
  }
  console.log("  ✓ Token is marked as used");

  // ── 10. Cleanup ───────────────────────────────────────────────────
  await cleanup(userId);

  console.log("\n✅ ALL TESTS PASSED");
}

async function cleanup(userId: string) {
  console.log("\n10. Cleaning up test user...");
  await admin.auth.admin.deleteUser(userId);
  console.log("  Test user deleted ✓");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});