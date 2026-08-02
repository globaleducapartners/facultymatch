"use server";

import { createClient, createAdminClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { notifyAdminProfileNeedsReview } from "@/lib/admin-alerts";

interface WizardData {
  onboarding_step: number;
  career_type?: string | null;
  // Step 1 - Basic Info
  full_name?: string;
  headline?: string;
  country?: string;
  city?: string;
  bio?: string;
  // Step 2 - Career (professional path)
  current_position?: string;
  current_company?: string;
  industry_sector?: string;
  career_description?: string;
  // Step 3 - Specialty & Accreditation
  unesco_area?: string;
  unesco_subarea?: string;
  unesco_topics?: string;
  selected_accreditations?: string[];
  other_accreditation?: string;
  is_phd?: boolean;
  research_publications?: string;
  google_scholar_id?: string;
  orcid_id?: string;
  // Step 4 - Modality & Availability
  languages?: any[];
  availability?: string;
  academic_level?: string;
  institutions_taught?: string[];
  current_institution?: string;
  years_experience?: number;
  modalities?: string[];
  // Vía IA del onboarding — no tiene paso propio en el wizard, se guarda
  // en el primer paso que se confirme tras importar el CV
  degrees?: any[];
}

export async function saveWizardStep(data: WizardData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const admin = createAdminClient();

  // Ensure user_profiles row exists (foreign key constraint)
  const { data: existingProfile } = await admin
    .from("user_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!existingProfile) {
    await admin
      .from("user_profiles")
      .insert({
        id: user.id,
        role: user.user_metadata?.role || "faculty",
        full_name: user.user_metadata?.full_name || data.full_name || null,
        terms_accepted_at: user.user_metadata?.terms_accepted ? new Date().toISOString() : null,
        privacy_accepted_at: user.user_metadata?.privacy_accepted ? new Date().toISOString() : null,
        marketing_opt_in: user.user_metadata?.marketing_opt_in ?? false,
        consent_version: user.user_metadata?.consent_version || "v1",
      });
  }

  const updateData: Record<string, any> = {
    onboarding_step: data.onboarding_step,
    onboarding_status: "in_progress",
    updated_at: new Date().toISOString(),
  };

  // Career type
  if (data.career_type !== undefined) {
    updateData.career_type = data.career_type;
  }

  // Step 1 fields
  if (data.full_name !== undefined) {
    await admin
      .from("user_profiles")
      .update({ full_name: data.full_name })
      .eq("id", user.id);
  }
  if (data.headline !== undefined) updateData.headline = data.headline;
  if (data.country !== undefined) updateData.country = data.country;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.bio !== undefined) updateData.bio = data.bio;

  // Step 2 professional fields
  if (data.current_position !== undefined) updateData.current_position = data.current_position;
  if (data.current_company !== undefined) updateData.current_company = data.current_company;
  if (data.industry_sector !== undefined) updateData.industry_sector = data.industry_sector;
  if (data.career_description !== undefined) updateData.career_description = data.career_description;

  // Step 3 fields
  if (data.unesco_area && data.unesco_area.trim()) updateData.unesco_area = data.unesco_area.trim();
  if (data.unesco_subarea && data.unesco_subarea.trim()) updateData.unesco_subarea = data.unesco_subarea.trim();
  if (data.unesco_topics && data.unesco_topics.trim()) updateData.unesco_topics = data.unesco_topics.trim();
  if (data.selected_accreditations !== undefined || data.other_accreditation !== undefined) {
    const parts: string[] = [];
    const arr = data.selected_accreditations || [];
    if (arr.includes("aneca_titular")) parts.push("Titular de Universidad (ANECA)");
    if (arr.includes("aneca_catedratico")) parts.push("Catedrático de Universidad (ANECA)");
    if (arr.includes("aneca_ayudante")) parts.push("Ayudante Doctor (ANECA)");
    const otherLabels = arr
      .filter((v: string) => !["aneca_titular", "aneca_catedratico", "aneca_ayudante"].includes(v))
      .map((v: string) => v.toUpperCase())
      .filter(Boolean);
    parts.push(...otherLabels);
    if (data.other_accreditation && data.other_accreditation.trim()) parts.push(data.other_accreditation.trim());
    updateData.aneca_accreditation = parts.length > 0 ? parts.join(" · ") : null;
  }
  if (data.is_phd !== undefined) updateData.is_phd = data.is_phd;
  if (data.research_publications !== undefined) updateData.research_publications = data.research_publications;
  if (data.google_scholar_id !== undefined) updateData.google_scholar_id = data.google_scholar_id;
  if (data.orcid_id !== undefined) updateData.orcid_id = data.orcid_id;

  // Step 4 fields
  if (data.languages !== undefined) updateData.languages = data.languages;
  if (data.availability !== undefined) updateData.availability = data.availability;
  if (data.academic_level !== undefined) updateData.academic_level = data.academic_level;
  if (data.institutions_taught !== undefined) updateData.institutions_taught = data.institutions_taught;
  if (data.current_institution !== undefined) updateData.current_institution = data.current_institution;
  if (data.years_experience !== undefined) updateData.years_experience = data.years_experience;
  if (data.modalities !== undefined) updateData.modalities = data.modalities;
  if (data.degrees !== undefined) updateData.degrees = data.degrees;

  // Build location
  if (data.city !== undefined || data.country !== undefined) {
    const { data: existing } = await admin
      .from("faculty_profiles")
      .select("city, country")
      .eq("user_id", user.id)
      .maybeSingle();
    const city = data.city ?? existing?.city ?? "";
    const country = data.country ?? existing?.country ?? "";
    updateData.location = [city, country].filter(Boolean).join(", ") || null;
  }

  const { error } = await admin
    .from("faculty_profiles")
    .upsert(
      { id: user.id, user_id: user.id, ...updateData },
      { onConflict: "id" }
    );

  if (error) {
    console.error("[saveWizardStep]", error);
    throw new Error("Error al guardar: " + error.message);
  }

  revalidatePath("/app/faculty/onboarding");
}

export async function publishProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const admin = createAdminClient();
  const { error } = await admin
    .from("faculty_profiles")
    .update({
      onboarding_status: "completed",
      estado_perfil: "en_revision",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("[publishProfile]", error);
    throw new Error("Error al publicar: " + error.message);
  }

  notifyAdminProfileNeedsReview(user.id).catch(e => console.error("[publishProfile] admin alert failed:", e));

  revalidatePath("/app/faculty/onboarding");
  revalidatePath("/app/faculty/profile");
  revalidatePath("/app/faculty");
}

export async function saveOrcidImportFromWizard(payload: {
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
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const admin = createAdminClient();

  // Ensure user_profiles row exists (foreign key constraint)
  const { data: existingUserProfile } = await admin
    .from("user_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!existingUserProfile) {
    await admin
      .from("user_profiles")
      .insert({
        id: user.id,
        role: user.user_metadata?.role || "faculty",
        full_name: user.user_metadata?.full_name || null,
        terms_accepted_at: user.user_metadata?.terms_accepted ? new Date().toISOString() : null,
        privacy_accepted_at: user.user_metadata?.privacy_accepted ? new Date().toISOString() : null,
        marketing_opt_in: user.user_metadata?.marketing_opt_in ?? false,
        consent_version: user.user_metadata?.consent_version || "v1",
      });
  }

  const { data: existingProfile } = await admin
    .from("faculty_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const updateData: Record<string, any> = {
    orcid_id: payload.orcid,
    updated_at: new Date().toISOString(),
  };

  const importData: Record<string, any> = {
    nombre_completo: payload.importData.nombre_completo,
    afiliaciones: payload.importData.afiliaciones,
    titulos: payload.importData.titulos,
    publicaciones_count: payload.importData.publicaciones_count,
    citas_count: payload.importData.citas_count,
    temas_investigacion: payload.importData.temas_investigacion,
    importado_el: new Date().toISOString(),
  };

  if (payload.saveAfiliaciones && payload.importData.afiliaciones.length > 0) {
    const firstAffiliation = payload.importData.afiliaciones[0].institucion;
    const allInstitutions = payload.importData.afiliaciones.map(a => a.institucion).filter(Boolean);

    if (payload.institutionChoice === "import") {
      updateData.current_institution = firstAffiliation;
      updateData.institutions_taught = allInstitutions.slice(1);
    } else if (payload.institutionChoice === "merge") {
      const existingInst = existingProfile?.current_institution || "";
      const existingTaught: string[] = existingProfile?.institutions_taught || [];
      const combined = [existingInst, ...existingTaught, ...allInstitutions].filter(Boolean);
      const unique = [...new Set(combined)];
      updateData.current_institution = unique[0] || firstAffiliation;
      updateData.institutions_taught = unique.slice(1);
    }
  }

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
  }

  importData.publicaciones_seleccionadas = payload.savePublicaciones;
  importData.citas_seleccionadas = payload.saveCitas;
  importData.temas_seleccionados = payload.saveTemas;
  updateData.orcid_import_data = importData;

  const { error } = await admin
    .from("faculty_profiles")
    .upsert(
      { id: user.id, user_id: user.id, ...updateData },
      { onConflict: "id" }
    );

  if (error) {
    console.error("[saveOrcidImportFromWizard]", error);
    throw new Error("Error al guardar: " + error.message);
  }

  revalidatePath("/app/faculty/onboarding");
}