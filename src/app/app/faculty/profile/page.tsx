import { createClient, createAdminClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureProfileSlug } from "@/lib/profile-slug";
import { ProfileEditorClient } from "./ProfileEditorClient";
import { SENSITIVE_FIELDS } from "@/lib/profile-sensitivity";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; tab?: string }>;
}) {
  const { saved, tab } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userMeta = user.user_metadata || {};

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: facultyProfile } = await supabase
    .from("faculty_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: documents } = await supabase
    .from("faculty_documents")
    .select("*")
    .eq("faculty_id", user.id)
    .order("created_at", { ascending: false });

  // ─── Re-verification helper ─────────────────────────────────────────────
  // When a verified profile updates a sensitive field, downgrade to en_revision
  // so an admin must re-verify before the profile is considered trusted again.

  async function checkReVerification(userId: string, dbColumns: string[]) {
    "use server";
    const supabase = await createClient();
    const { data: fp } = await supabase
      .from("faculty_profiles")
      .select("estado_perfil")
      .eq("id", userId)
      .maybeSingle();

    if (!fp || fp.estado_perfil !== "verificado") return;

    const hasSensitive = dbColumns.some((col) =>
      (SENSITIVE_FIELDS as readonly string[]).includes(col)
    );
    if (!hasSensitive) return;

    const admin = createAdminClient();
    await admin.from("faculty_profiles").update({
      estado_perfil: "en_revision",
      is_verified: false,
      verificado_por: null,
      verificado_en: null,
      verification_notes: null,
      updated_at: new Date().toISOString(),
    }).eq("id", userId);
  }

  // ─── Server Actions (one per tab) ────────────────────────────────────────

  async function saveBasicInfo(formData: FormData) {
    "use server";
    const fullName = formData.get("fullName") as string;
    const headline = formData.get("headline") as string;
    const bio = formData.get("bio") as string;
    const country = formData.get("country") as string;
    const city = formData.get("city") as string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Save the name first so a slug (if not set yet) is generated from it
    await supabase.from("user_profiles").update({ full_name: fullName }).eq("id", user.id);

    const admin = createAdminClient();
    await ensureProfileSlug(admin, user.id);

    await supabase.from("faculty_profiles")
      .upsert({
        id: user.id, user_id: user.id,
        headline, bio, country, city,
        location: [city, country].filter(Boolean).join(", ") || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

    // Re-verification: full_name is a sensitive field
    await checkReVerification(user.id, ["full_name"]);

    revalidatePath("/app/faculty/profile");
    revalidatePath("/app/faculty");
    redirect("/app/faculty/profile?saved=1&tab=basic");
  }

  async function saveExperience(formData: FormData) {
    "use server";
    const currentInstitution = formData.get("currentInstitution") as string;
    const yearsExperience = parseInt(formData.get("yearsExperience") as string) || 0;
    const availability = formData.get("availability") as string;
    const isPhd = formData.get("isPhd") === "on";
    const academicLevel = formData.get("academicLevel") as string;
    const institutionsTaughtRaw = formData.get("institutionsTaught") as string;
    const institutionsTaught = JSON.parse(institutionsTaughtRaw || "[]");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("faculty_profiles")
      .update({
        current_institution: currentInstitution,
        years_experience: yearsExperience,
        availability,
        is_phd: isPhd,
        academic_level: academicLevel,
        institutions_taught: institutionsTaught,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);

    // Re-verification: current_institution, is_phd, academic_level, institutions_taught
    await checkReVerification(user.id, [
      "current_institution", "is_phd", "academic_level", "institutions_taught",
    ]);

    revalidatePath("/app/faculty/profile");
    revalidatePath("/app/faculty");
    redirect("/app/faculty/profile?saved=1&tab=experience");
  }

  async function saveFormacion(formData: FormData) {
    "use server";
    const degreesRaw = formData.get("degrees") as string;
    const degrees = JSON.parse(degreesRaw || "[]");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("faculty_profiles")
      .update({ degrees, updated_at: new Date().toISOString() }).eq("id", user.id);

    // Re-verification: degrees is a sensitive field
    await checkReVerification(user.id, ["degrees"]);

    revalidatePath("/app/faculty/profile");
    revalidatePath("/app/faculty");
    redirect("/app/faculty/profile?saved=1&tab=formacion");
  }

  async function saveLanguages(formData: FormData) {
    "use server";
    const languagesRaw = formData.get("languages") as string;
    const languages = JSON.parse(languagesRaw || "[]");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("faculty_profiles")
      .update({ languages, updated_at: new Date().toISOString() }).eq("id", user.id);

    revalidatePath("/app/faculty/profile");
    revalidatePath("/app/faculty");
    redirect("/app/faculty/profile?saved=1&tab=idiomas");
  }

  async function saveResearch(formData: FormData) {
    "use server";
    const hasAneca = formData.get("hasAneca") === "on";
    const otherAccreditation = (formData.get("otherAccreditation") as string)?.trim() || "";
    const anecaAccreditation = [
      hasAneca ? "Titular de Universidad (ANECA)" : null,
      otherAccreditation || null,
    ].filter(Boolean).join(" · ") || null;
    const researchPublications = formData.get("researchPublications") as string;
    const googleScholarId = formData.get("googleScholarId") as string;
    const orcidId = formData.get("orcidId") as string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("faculty_profiles")
      .update({
        aneca_accreditation: anecaAccreditation,
        research_publications: researchPublications,
        google_scholar_id: googleScholarId,
        orcid_id: orcidId,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);

    // Re-verification: aneca_accreditation, google_scholar_id, orcid_id
    await checkReVerification(user.id, ["aneca_accreditation", "google_scholar_id", "orcid_id"]);

    revalidatePath("/app/faculty/profile");
    revalidatePath("/app/faculty");
    redirect("/app/faculty/profile?saved=1&tab=research");
  }

  async function saveLinks(formData: FormData) {
    "use server";
    const linkedinUrl = formData.get("linkedinUrl") as string;
    const website = formData.get("website") as string;
    const phone = formData.get("phone") as string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("faculty_profiles")
      .update({
        linkedin_url: linkedinUrl || null,
        website: website || null,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);

    revalidatePath("/app/faculty/profile");
    revalidatePath("/app/faculty");
    redirect("/app/faculty/profile?saved=1&tab=links");
  }

  async function updateContactPreferences(formData: FormData) {
    "use server";
    const contactEmail = formData.get("contactEmail") as string;
    const contactWhatsapp = formData.get("contactWhatsapp") as string;
    const contactLinkedin = formData.get("contactLinkedin") as string;
    const notifyNewOffers = formData.get("notifyNewOffers") === "on";
    const notifyMessages = formData.get("notifyMessages") === "on";
    const notifyWeeklyDigest = formData.get("notifyWeeklyDigest") === "on";
    const preferredContact = formData.get("preferredContact") as string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("faculty_profiles").update({
      contact_email: contactEmail || null,
      contact_whatsapp: contactWhatsapp || null,
      contact_linkedin: contactLinkedin || null,
      notify_new_offers: notifyNewOffers,
      notify_messages: notifyMessages,
      notify_weekly_digest: notifyWeeklyDigest,
      preferred_contact_method: preferredContact,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);

    revalidatePath("/app/faculty/profile");
    revalidatePath("/app/faculty");
    redirect("/app/faculty/profile?saved=1&tab=preferences");
  }

  // ─── View count ──────────────────────────────────────────────────────────
  const viewCount = (facultyProfile as any)?.view_count ?? 0;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <ProfileEditorClient
      user={{ id: user.id, email: user.email }}
      userMeta={userMeta}
      profile={profile}
      facultyProfile={facultyProfile}
      documents={documents || []}
      viewCount={viewCount}
      saved={saved === "1"}
      tab={tab}
      saveBasicInfo={saveBasicInfo}
      saveExperience={saveExperience}
      saveFormacion={saveFormacion}
      saveLanguages={saveLanguages}
      saveResearch={saveResearch}
      saveLinks={saveLinks}
      updateContactPreferences={updateContactPreferences}
    />
  );
}
