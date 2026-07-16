import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing environment variables (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runMigration() {
  const migrationPath = join(__dirname, "..", "supabase", "migrations", "20260716000001_add_orcid_import_data.sql");
  const sql = readFileSync(migrationPath, "utf-8");

  // Try to execute SQL via the Supabase pg_dump extension
  // This uses the REST API with a special header
  const res = await fetch(`${url}/rest/v1/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Accept": "application/json",
      "Prefer": "params=single-object",
    },
    body: JSON.stringify({ query: sql }),
  });

  if (res.ok) {
    console.log("Migration executed successfully!");
  } else {
    const text = await res.text();
    // Fallback: try using the Supabase management API
    console.log("Direct SQL execution not available:", res.status, text.substring(0, 200));
    console.log("\nPlease run the migration manually in the Supabase dashboard SQL editor:");
    console.log("---");
    console.log(sql);
    console.log("---");
    process.exit(1);
  }
}

runMigration().catch(console.error);