// Carga las ciudades de GeoNames (más de 5.000 habitantes) en la tabla geo_places.
// Requiere haber aplicado antes la migración 20261108000001_geolocation_foundation.sql.
//
//   bun scripts/load-geonames.ts <ruta/cities5000.txt>            → simulación: cuenta y muestra, no escribe
//   bun scripts/load-geonames.ts <ruta/cities5000.txt> --apply    → carga real (se puede repetir sin duplicar)
//
// Datos: https://download.geonames.org/export/dump/cities5000.zip (CC BY 4.0).
// Lee las claves de .env.local.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { parseGeoNamesLine, type GeoNamesRow } from "../src/lib/geo";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const file = process.argv[2];
const apply = process.argv.includes("--apply");
if (!file || file.startsWith("--")) {
  console.error("Uso: bun scripts/load-geonames.ts <ruta/cities5000.txt> [--apply]");
  process.exit(1);
}

const rows: GeoNamesRow[] = [];
let skipped = 0;
for (const line of readFileSync(file, "utf8").split("\n")) {
  if (!line.trim()) continue;
  const r = parseGeoNamesLine(line);
  if (r) rows.push(r);
  else skipped++;
}

const byCountry = new Map<string, number>();
for (const r of rows) byCountry.set(r.country_code, (byCountry.get(r.country_code) ?? 0) + 1);
console.log(`Ciudades leídas: ${rows.length} (líneas descartadas: ${skipped}) · países: ${byCountry.size}`);
console.log(`España: ${byCountry.get("ES") ?? 0} · Colombia: ${byCountry.get("CO") ?? 0} · México: ${byCountry.get("MX") ?? 0}`);

if (!apply) {
  console.log("\nSimulación: no se ha escrito nada. Añade --apply para cargar.");
  process.exit(0);
}

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

const BATCH = 500;
let done = 0;
for (let i = 0; i < rows.length; i += BATCH) {
  const chunk = rows.slice(i, i + BATCH);
  const { error } = await admin.from("geo_places").upsert(chunk, { onConflict: "id" });
  if (error) {
    console.error(`\nError en el lote ${i}-${i + chunk.length}:`, error.message);
    console.error("¿Se aplicó la migración 20261108000001? Detenido; se puede repetir sin duplicar.");
    process.exit(1);
  }
  done += chunk.length;
  process.stdout.write(`\rCargadas ${done}/${rows.length}`);
}
console.log("\nListo.");
