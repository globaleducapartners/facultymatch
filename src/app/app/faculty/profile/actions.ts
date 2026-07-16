"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

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

  revalidatePath("/app/faculty/profile");
  revalidatePath("/app/faculty");
}