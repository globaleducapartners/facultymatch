import { createClient, createAdminClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { BecomeInstitutionClient } from "./BecomeInstitutionClient";
import { extractDomainFromWebsite, extractDomainFromEmail } from "@/lib/domain";

export default async function BecomeInstitutionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/become-institution");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, can_switch_role, active_mode")
    .eq("id", user.id)
    .single();

  // Pure institution accounts → go straight to their dashboard
  if (profile?.role === "institution") redirect("/app/institution");

  // Faculty user who already has institution access → switch to institution mode and go there
  if (profile?.can_switch_role) {
    // They've already registered, just send them to institution
    redirect("/app/institution");
  }

  async function registerInstitution(formData: FormData): Promise<{ error: string } | void> {
    "use server";
    const supabase = await createClient();
    const admin = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autenticado. Vuelve a iniciar sesión." };

    const name         = (formData.get("name")         as string)?.trim();
    const type         = (formData.get("type")         as string)?.trim();
    const country      = (formData.get("country")      as string)?.trim();
    const website      = (formData.get("website")      as string)?.trim() || null;
    const contactEmail = (formData.get("contactEmail") as string)?.trim().toLowerCase();
    const city         = (formData.get("city")         as string)?.trim() || null;

    if (!name)         return { error: "El nombre de la institución es obligatorio." };
    if (!type)         return { error: "Selecciona el tipo de institución." };
    if (!country)      return { error: "Selecciona el país." };
    if (!contactEmail) return { error: "El email institucional es obligatorio." };
    if (!/\S+@\S+\.\S+/.test(contactEmail)) return { error: "Email no válido." };
    if (!website)      return { error: "La web institucional es obligatoria. Debe tener el mismo dominio que tu correo electrónico." };

    // Domain validation: the institution account email must belong to the institution's domain
    const websiteDomain = extractDomainFromWebsite(website);
    const emailDomain = extractDomainFromEmail(contactEmail);
    if (websiteDomain && emailDomain) {
      const emailDomainLower = emailDomain.toLowerCase();
      const websiteDomainLower = websiteDomain.toLowerCase();
      const isValidDomain = emailDomainLower === websiteDomainLower ||
        emailDomainLower.endsWith("." + websiteDomainLower);
      if (!isValidDomain) {
        return {
          error: `El email institucional debe pertenecer al dominio de la institución (${websiteDomain}). Ejemplo: contacto@${websiteDomain}`,
        };
      }
    }
    if (!websiteDomain) {
      return { error: "La URL de la web institucional no es válida. Asegúrate de incluir el dominio completo (ej: https://www.universidad.es)." };
    }

    const location = [city, country].filter(Boolean).join(", ");

    // Create or update institution record (upsert by user_id)
    const { error: instError } = await admin.from("institutions").upsert({
      user_id:          user.id,
      name,
      institution_type: type,
      type,
      country,
      city:             city || null,
      location:         location || null,
      website,
      contact_email:    contactEmail,
      status:           "pending",
      updated_at:       new Date().toISOString(),
    }, { onConflict: "user_id" });

    if (instError) return { error: instError.message };

    // Grant dual-mode access: keep role as "faculty", enable institution mode
    const { error: profileError } = await admin
      .from("user_profiles")
      .update({
        can_switch_role: true,
        active_mode: "institution",
      })
      .eq("id", user.id);

    if (profileError) return { error: profileError.message };

    redirect("/app/institution");
  }

  return (
    <BecomeInstitutionClient
      userEmail={user.email ?? ""}
      registerAction={registerInstitution}
    />
  );
}
