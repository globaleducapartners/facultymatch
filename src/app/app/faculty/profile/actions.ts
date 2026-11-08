"use server";

import { createClient, createAdminClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { checkReVerification } from "@/lib/re-verification";
import { revalidatePublicProfile } from "@/lib/profile-slug";
import { refreshFacultyCompleteness } from "@/lib/faculty-completeness";
import { refreshFacultyGeo } from "@/lib/geo";
import type { CvSuggestionPayload } from "@/lib/cv-profile-diff";

interface OrcidSavePayload {
  orcid: string;
  saveAfiliaciones: boolean;
  saveTitulos: boolean;
  savePublicaciones: boolean;
  saveCitas: boolean;
  saveTemas: boolean;
  importData: {
    nombre_completo: string;
    afiliaciones: Array<{ institucion: string; fecha_inicio: string | null; fecha_fin: string | null }>;
    titulos: Array<{ titulo: string; institucion: string; anio: string | null }>;
    publicaciones_count: number;
    citas_count: number;
    temas_investigacion: string[];
  };
  institutionChoice: "import" | "existing" | "merge";
  degreesChoice: "import" | "existing" | "merge";
}

export async function saveOrcidImport(payload: OrcidSavePayload) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: existingProfile } = await supabase
    .from("faculty_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const updateData: Record<string, any> = {
    orcid_id: payload.orcid,
    updated_at: new Date().toISOString(),
  };

  // Build orcid_import_data JSONB
  const importData: Record<string, any> = {
    nombre_completo: payload.importData.nombre_completo,
    afiliaciones: payload.importData.afiliaciones,
    titulos: payload.importData.titulos,
    publicaciones_count: payload.importData.publicaciones_count,
    citas_count: payload.importData.citas_count,
    temas_investigacion: payload.importData.temas_investigacion,
    importado_el: new Date().toISOString(),
  };

  // Handle institution/affiliation
  if (payload.saveAfiliaciones && payload.importData.afiliaciones.length > 0) {
    const firstAffiliation = payload.importData.afiliaciones[0].institucion;
    const allInstitutions = payload.importData.afiliaciones.map(a => a.institucion).filter(Boolean);

    if (payload.institutionChoice === "import") {
      updateData.current_institution = firstAffiliation;
      updateData.institutions_taught = allInstitutions.slice(1);
    } else if (payload.institutionChoice === "merge") {
      // Combine existing + imported
      const existingInst = existingProfile?.current_institution || "";
      const existingTaught: string[] = existingProfile?.institutions_taught || [];
      const combined = [existingInst, ...existingTaught, ...allInstitutions].filter(Boolean);
      const unique = [...new Set(combined)];
      updateData.current_institution = unique[0] || firstAffiliation;
      updateData.institutions_taught = unique.slice(1);
    }
    // "existing" = don't touch current_institution
  }

  // Handle degrees
  if (payload.saveTitulos && payload.importData.titulos.length > 0) {
    const importedDegrees = payload.importData.titulos.map(t => ({
      type: t.titulo || "Titulación",
      institution: t.institucion,
      year: t.anio,
    }));

    if (payload.degreesChoice === "import") {
      updateData.degrees = importedDegrees;
    } else if (payload.degreesChoice === "merge") {
      const existingDegrees: any[] = existingProfile?.degrees || [];
      updateData.degrees = [...existingDegrees, ...importedDegrees];
    }
    // "existing" = don't touch degrees
  }

  // Build research metrics to store in orcid_import_data
  importData.publicaciones_seleccionadas = payload.savePublicaciones;
  importData.citas_seleccionadas = payload.saveCitas;
  importData.temas_seleccionados = payload.saveTemas;

  updateData.orcid_import_data = importData;

  // Upsert using the same convention as the rest of the code
  const { error } = await supabase
    .from("faculty_profiles")
    .upsert(
      {
        id: user.id,
        user_id: user.id,
        ...updateData,
      },
      { onConflict: "id" }
    );

  if (error) {
    console.error("[saveOrcidImport]", error);
    throw new Error("Error al guardar los datos: " + error.message);
  }

  // Re-verification: orcid_id always changes here, plus institution/degrees
  // whenever the import actually touched them.
  await checkReVerification(user.id, Object.keys(updateData));

  revalidatePath("/app/faculty/profile");
  revalidatePath("/app/faculty");
}

// Aplica las sugerencias de la IA que el docente ha aceptado. El servidor no se
// fía de las listas del cliente: vuelve a leer el perfil y solo AÑADE a lo que
// ya hay (nunca sustituye ni borra). Pasa por la misma comprobación de
// re-verificación que el resto de rutas de guardado.
export async function applyCvSuggestions(payload: CvSuggestionPayload) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: fp } = await supabase
    .from("faculty_profiles")
    .select("country, city, institutions_taught, degrees, languages")
    .eq("id", user.id)
    .maybeSingle();

  const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const key = (v: unknown) => String(v ?? "").toLowerCase().replace(/\s+/g, " ").trim();
  const update: Record<string, any> = {};

  const headline = text(payload.headline, 200);
  if (headline) update.headline = headline;
  const bio = text(payload.bio, 3000);
  if (bio) update.bio = bio;
  const country = text(payload.country, 100);
  if (country) {
    update.country = country;
    update.location = [fp?.city, country].filter(Boolean).join(", ") || null;
  }
  const position = text(payload.currentPosition, 200);
  if (position) update.current_position = position;
  const publications = text(payload.researchPublications, 5000);
  if (publications) update.research_publications = publications;
  const institution = text(payload.currentInstitution, 200);
  if (institution) update.current_institution = institution;
  const level = text(payload.academicLevel, 60);
  if (level) update.academic_level = level;
  if (payload.isPhd === true) update.is_phd = true;
  if (typeof payload.yearsExperience === "number" && payload.yearsExperience > 0 && payload.yearsExperience < 80) {
    update.years_experience = Math.round(payload.yearsExperience);
  }

  if (Array.isArray(payload.addInstitutionsTaught) && payload.addInstitutionsTaught.length > 0) {
    const existing: string[] = Array.isArray(fp?.institutions_taught) ? fp!.institutions_taught : [];
    const seen = new Set(existing.map(key));
    const extra = payload.addInstitutionsTaught.map((i) => text(i, 200)).filter((i) => i && !seen.has(key(i)));
    if (extra.length > 0) update.institutions_taught = [...existing, ...extra];
  }
  if (Array.isArray(payload.addDegrees) && payload.addDegrees.length > 0) {
    const existing: any[] = Array.isArray(fp?.degrees) ? fp!.degrees : [];
    const seen = new Set(existing.map((d) => `${key(d?.type)}|${key(d?.institution)}`));
    const extra = payload.addDegrees
      .map((d) => ({ type: text(d?.type, 200), institution: d?.institution ? text(d.institution, 200) : null, year: d?.year ?? null }))
      .filter((d) => d.type && !seen.has(`${key(d.type)}|${key(d.institution)}`));
    if (extra.length > 0) update.degrees = [...existing, ...extra];
  }
  if (Array.isArray(payload.addLanguages) && payload.addLanguages.length > 0) {
    const existing: any[] = Array.isArray(fp?.languages) ? fp!.languages : [];
    const seen = new Set(existing.map((l) => key(l?.lang)));
    const extra = payload.addLanguages
      .map((l) => ({ lang: text(l?.lang, 60), level: text(l?.level, 20) || "B2" }))
      .filter((l) => l.lang && !seen.has(key(l.lang)));
    if (extra.length > 0) update.languages = [...existing, ...extra];
  }

  const columns = Object.keys(update);
  if (columns.length === 0) return { ok: true, changed: 0, estado: null as string | null };

  const { error } = await supabase
    .from("faculty_profiles")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) {
    console.error("[applyCvSuggestions]", error);
    throw new Error("No se pudieron guardar los cambios");
  }

  await checkReVerification(user.id, columns);
  if (country) await refreshFacultyGeo(createAdminClient(), user.id);
  await refreshFacultyCompleteness(createAdminClient(), user.id);
  await revalidatePublicProfile(createAdminClient(), user.id);

  const { data: after } = await supabase.from("faculty_profiles").select("estado_perfil").eq("id", user.id).maybeSingle();

  revalidatePath("/app/faculty/profile");
  revalidatePath("/app/faculty");
  return { ok: true, changed: columns.length, estado: (after?.estado_perfil as string | null) ?? null };
}
