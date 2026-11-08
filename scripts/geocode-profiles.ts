// Calcula las coordenadas (centro de la ciudad) de docentes e instituciones a
// partir de su ciudad y país. Requiere la migración 20261108000001 y haber
// cargado geo_places con scripts/load-geonames.ts.
//
//   bun scripts/geocode-profiles.ts             → simulación: informe de qué se resolvería, no escribe
//   bun scripts/geocode-profiles.ts --apply     → guarda las coordenadas (solo filas sin coordenadas)
//   bun scripts/geocode-profiles.ts --apply --all → recalcula también las que ya tienen
//
// Lee las claves de .env.local. Nunca toca la ciudad/país escritos por el usuario.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { resolvePlace } from "../src/lib/geo";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const apply = process.argv.includes("--apply");
const all = process.argv.includes("--all");

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

const { count: placesCount, error: placesError } = await admin.from("geo_places").select("id", { count: "exact", head: true });
if (placesError || !placesCount) {
  console.error("geo_places está vacía o no existe. Aplica la migración y ejecuta scripts/load-geonames.ts primero.");
  process.exit(1);
}

async function run(table: "faculty_profiles" | "institutions", label: string) {
  let q = admin.from(table).select("id, city, country, location, latitude");
  if (!all) q = q.is("latitude", null);
  const { data, error } = await q.limit(5000);
  if (error) {
    console.error(`${label}: no se pudo leer (${error.message})`);
    return;
  }

  let ok = 0;
  const sinCiudad: string[] = [];
  const noResueltas: string[] = [];
  const ambiguas: string[] = [];

  for (const row of data || []) {
    const city = (row.city || "").trim();
    // Si falta la ciudad, no se inventa nada: solo se podría ubicar por país.
    if (!city) {
      sinCiudad.push(`${row.id.slice(0, 8)} · ${row.location ?? "(sin ubicación)"}`);
      continue;
    }
    const place = await resolvePlace(admin, city, row.country);
    if (!place) {
      noResueltas.push(`${row.id.slice(0, 8)} · "${city}" / ${row.country ?? "?"}`);
      continue;
    }
    if (/\by\b|\/|,|;/.test(city)) ambiguas.push(`"${city}" → ${place.name}`);
    ok++;
    if (apply) {
      const { error: upErr } = await admin
        .from(table)
        .update({
          latitude: place.latitude,
          longitude: place.longitude,
          geo_place_id: place.placeId,
          geo_updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      if (upErr) console.error(`  ${row.id}: ${upErr.message}`);
    } else {
      console.log(`  ${label} ${row.id.slice(0, 8)} · "${city}" / ${row.country} → ${place.name} (${place.latitude.toFixed(2)}, ${place.longitude.toFixed(2)})`);
    }
  }

  console.log(`\n${label}: ${data?.length ?? 0} revisados · ${ok} ${apply ? "guardados" : "se resolverían"} · ${sinCiudad.length} sin ciudad · ${noResueltas.length} sin resolver`);
  if (sinCiudad.length) console.log("  Sin ciudad (no se ubican):\n   " + sinCiudad.join("\n   "));
  if (noResueltas.length) console.log("  No resueltas (revisar a mano):\n   " + noResueltas.join("\n   "));
  if (ambiguas.length) console.log("  Resueltas pero con texto dudoso (revisar):\n   " + ambiguas.join("\n   "));
}

console.log(apply ? "MODO REAL: se guardarán coordenadas.\n" : "SIMULACIÓN: no se escribe nada.\n");
await run("faculty_profiles", "Docentes");
await run("institutions", "Instituciones");
if (!apply) console.log("\nAñade --apply para guardar.");
