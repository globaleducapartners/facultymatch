/**
 * Fix Script: Ensures admin@facultymatch.app has super_admin access to /control
 * and fixes any profile data inconsistencies across interconnected tables.
 *
 * Usage: bun run scripts/fix-admin.ts
 */

import { createClient } from "@supabase/supabase-js";

// Load .env.local manually
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const ADMIN_EMAIL = "admin@facultymatch.app";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("❌ Missing environment variables (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)");
  console.error("   Make sure .env.local exists with these variables.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findAdminUser() {
  let page = 0;
  const perPage = 100;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      perPage,
      page: page + 1,
    });

    if (error) {
      console.error("❌ Error listing users:", error.message);
      return null;
    }

    const found = data.users.find((u) => u.email === ADMIN_EMAIL);
    if (found) return found;

    if (data.users.length < perPage) break;
    page++;
  }

  return null;
}

async function fix() {
  console.log("=".repeat(60));
  console.log("🔧 FACULTYMATCH — Admin & Profile Fix Script");
  console.log("=".repeat(60));
  console.log("");

  // ── Step 1: Find or create admin user ──────────────────────────────────
  console.log("📧 Step 1: Checking admin user:", ADMIN_EMAIL);
  let adminUser = await findAdminUser();

  if (adminUser) {
    console.log(`   ✅ Admin user found: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Created at: ${adminUser.created_at}`);
    console.log(`   Current metadata role: ${adminUser.user_metadata?.role || "none"}`);
  } else {
    console.log("   ⚠️  Admin user not found. Creating...");

    const pass = process.env.ADMIN_PASSWORD || "Admin123!";

    const { data, error } = await admin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: pass,
      email_confirm: true,
      user_metadata: {
        full_name: "Administrador FacultyMatch",
        role: "super_admin",
      },
    });

    if (error) {
      console.error("   ❌ Failed to create admin user:", error.message);
      console.log("\n   Create the user manually in Supabase Dashboard → Authentication, then re-run this script.");
      process.exit(1);
    }

    adminUser = data.user;
    console.log(`   ✅ Admin user created: ${adminUser.id}`);
    console.log(`   🔑 Temporary password: ${pass} (change after first login!)`);
  }

  // ── Step 2: Ensure user_profiles has super_admin role ──────────────────
  console.log("\n👤 Step 2: Checking admin user_profiles entry...");

  const { data: existingProfile, error: profileFetchError } = await admin
    .from("user_profiles")
    .select("*")
    .eq("id", adminUser.id)
    .maybeSingle();

  if (profileFetchError) {
    console.error("   ❌ Error fetching user_profiles:", profileFetchError.message);
  }

  if (!existingProfile) {
    console.log("   ⚠️  user_profiles entry missing. Creating...");
    const { error: insertError } = await admin.from("user_profiles").insert({
      id: adminUser.id,
      role: "super_admin",
      full_name: "Administrador FacultyMatch",
      onboarding_completed: true,
      email: adminUser.email,
    });

    if (insertError) {
      console.error("   ❌ Failed to create user_profiles:", insertError.message);
    } else {
      console.log("   ✅ user_profiles created with role: super_admin");
    }
  } else {
    // Update role if needed
    if (existingProfile.role !== "super_admin" && existingProfile.role !== "admin") {
      console.log(`   ⚠️  Current role is "${existingProfile.role}". Updating to "super_admin"...`);
      await admin.from("user_profiles").update({ role: "super_admin" }).eq("id", adminUser.id);
      console.log("   ✅ Role updated to super_admin");
    } else {
      console.log(`   ✅ user_profiles OK — role: ${existingProfile.role}`);
    }

    // Ensure email is set in user_profiles
    if (!existingProfile.email && adminUser.email) {
      console.log("   ⚠️  Email missing in user_profiles. Setting...");
      await admin.from("user_profiles").update({ email: adminUser.email }).eq("id", adminUser.id);
      console.log("   ✅ Email set");
    }

    // Ensure onboarding is completed for admin
    if (!existingProfile.onboarding_completed) {
      console.log("   ⚠️  Onboarding not completed. Setting...");
      await admin.from("user_profiles").update({ onboarding_completed: true }).eq("id", adminUser.id);
      console.log("   ✅ Onboarding completed set");
    }
  }

  // ── Step 3: Backfill missing faculty_profiles rows ─────────────────────
  console.log("\n📋 Step 3: Checking for users with missing faculty_profiles...");

  const { data: facultyUsers, error: fError } = await admin
    .from("user_profiles")
    .select("id, full_name")
    .eq("role", "faculty");

  if (fError) {
    console.error("   ❌ Error fetching faculty users:", fError.message);
  } else if (facultyUsers) {
    let backfilled = 0;
    for (const u of facultyUsers) {
      const { data: fp } = await admin
        .from("faculty_profiles")
        .select("id")
        .eq("user_id", u.id)
        .maybeSingle();

      if (!fp) {
        console.log(`   ⚠️  Missing faculty_profiles for "${u.full_name || "unnamed"}" (${u.id.substring(0, 8)}...). Creating...`);
        const { error: insErr } = await admin.from("faculty_profiles").insert({
          id: u.id,
          user_id: u.id,
          visibility: "public",
          is_active: true,
          is_verified: true,
        });
        if (insErr) {
          console.error(`   ❌ Failed: ${insErr.message}`);
        } else {
          backfilled++;
          console.log(`   ✅ Created faculty_profiles for ${u.full_name || u.id.substring(0, 8)}`);
        }
      }
    }

    // Check if all faculty_profiles rows have id = user_id
    const { data: fpRows } = await admin.from("faculty_profiles").select("id, user_id");
    if (fpRows) {
      let idFixed = 0;
      for (const row of fpRows) {
        if (row.id !== row.user_id) {
          console.log(`   ⚠️  Mismatch: id=${row.id.substring(0, 8)}... user_id=${row.user_id.substring(0, 8)}... Fixed by admin trigger`);
          await admin.from("faculty_profiles").update({ id: row.user_id }).eq("id", row.id);
          idFixed++;
        }
      }
      if (idFixed > 0) console.log(`   ✅ Fixed ${idFixed} id/user_id mismatches`);
    }

    if (backfilled > 0) {
      console.log(`   ✅ ${backfilled} faculty_profiles rows created`);
    } else {
      console.log("   ✅ All faculty users have faculty_profiles");
    }
  }

  // ── Step 4: Fix null full_name in user_profiles from auth metadata ────
  console.log("\n🔄 Step 4: Fixing null full_name in user_profiles...");

  let nameFixes = 0;
  let page = 0;
  while (true) {
    const { data: authPage, error: authErr } = await admin.auth.admin.listUsers({ perPage: 100, page: page + 1 });
    if (authErr || !authPage) break;

    for (const au of authPage.users) {
      const metaName = au.user_metadata?.full_name;
      if (metaName) {
        const { data: up } = await admin.from("user_profiles").select("full_name").eq("id", au.id).maybeSingle();
        if (up && !up.full_name) {
          console.log(`   ✅ Fixing name for ${au.email}: "${metaName}"`);
          await admin.from("user_profiles").update({ full_name: metaName, email: au.email }).eq("id", au.id);
          nameFixes++;
        }
      }
    }

    if (authPage.users.length < 100) break;
    page++;
  }

  if (nameFixes > 0) {
    console.log(`   ✅ Fixed ${nameFixes} null full_name values`);
  } else {
    console.log("   ✅ All user_profiles have full_name set");
  }

  // ── Step 5: Set admin auth metadata role to super_admin ──────────────
  console.log("\n🔑 Step 5: Ensuring admin auth metadata reflects super_admin...");

  const umeta = { ...adminUser.user_metadata };
  if (umeta.role !== "super_admin") {
    console.log(`   ⚠️  Auth metadata role is "${umeta.role}". Updating to "super_admin"...`);
    const { error: metaErr } = await admin.auth.admin.updateUserById(adminUser.id, {
      user_metadata: { ...umeta, role: "super_admin" },
    });
    if (metaErr) {
      console.error(`   ❌ Failed: ${metaErr.message}`);
    } else {
      console.log("   ✅ Auth metadata updated to super_admin");
    }
  } else {
    console.log("   ✅ Auth metadata already has super_admin");
  }

  // ── Step 6: Verify everything ──────────────────────────────────────────
  console.log("\n✅ Step 6: Verification...");

  // Admin verification
  const { data: verifyProfile } = await admin
    .from("user_profiles")
    .select("id, role, full_name, onboarding_completed, email")
    .eq("id", adminUser.id)
    .single();

  if (verifyProfile) {
    console.log("\n   📊 Admin Profile Status:");
    console.log(`      ID:           ${verifyProfile.id}`);
    console.log(`      Role:         ${verifyProfile.role}`);
    console.log(`      Name:         ${verifyProfile.full_name || "—"}`);
    console.log(`      Email:        ${verifyProfile.email || "—"}`);
    console.log(`      Onboarding:   ${verifyProfile.onboarding_completed ? "✅ Completado" : "⚠️  Pendiente"}`);

    if (verifyProfile.role === "super_admin" || verifyProfile.role === "admin") {
      console.log("\n   🎉 ¡TODO CORRECTO! El admin ahora puede acceder a /control");
    } else {
      console.log(`\n   ⚠️  El rol sigue siendo "${verifyProfile.role}". Algo salió mal.`);
    }
  }

  // Faculty profiles check
  const { data: allFaculty } = await admin.from("user_profiles").select("id").eq("role", "faculty");
  if (allFaculty) {
    let missing = 0;
    for (const u of allFaculty) {
      const { data: fp } = await admin.from("faculty_profiles").select("id").eq("user_id", u.id).maybeSingle();
      if (!fp) missing++;
    }
    if (missing === 0) {
      console.log("\n   ✅ Todos los perfiles de faculty tienen su faculty_profiles correspondiente");
    } else {
      console.log(`\n   ⚠️  Aún faltan ${missing} faculty_profiles por crear`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("🏁 Fix script completed!");
  console.log("=".repeat(60));

  // Final instructions
  console.log("\n📋 PRÓXIMOS PASOS:");
  console.log("   1. Cierra sesión si estabas logueado (importante)");
  console.log("   2. Ve a https://www.facultymatch.app/admin-login");
  console.log("   3. Accede con: admin@facultymatch.app");
  console.log("   4. Confirma que puedes ver el panel /control");
  console.log("   5. Verifica que los perfiles de docentes muestran toda su información\n");
}

fix().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});