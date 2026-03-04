"use server";

import { createClient } from "@/lib/supabase-server";
import { sendWelcomeEmail } from "@/lib/emails/service";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signUp(formData: FormData, isSSO: boolean = false) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as "faculty" | "institution";
  const institutionName = formData.get("institutionName") as string;

  const supabase = await createClient();

  if (isSSO) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No se encontró sesión de SSO activa." };
  } else {
    const termsAccepted = formData.get("terms_accepted") === "on";
    const privacyAccepted = formData.get("privacy_accepted") === "on";
    const marketingOptIn = formData.get("marketing_opt_in") === "on";

    if (!termsAccepted || !privacyAccepted) {
      return { error: "Debes aceptar los términos y la política de privacidad." };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
          institution_name: institutionName,
          terms_accepted: true,
          privacy_accepted: true,
          marketing_opt_in: marketingOptIn,
          consent_version: 'v1'
        },
      },
    });

    if (error) {
      return { error: error.message };
    }
  }

  if (!isSSO) {
    try {
      await sendWelcomeEmail(email, fullName, role, institutionName || fullName);
    } catch (e) {
      console.error("Email sending failed but user created:", e);
    }
    return redirect("/login?message=Check your email to confirm your account");
  }

  return { success: true };
}

export const signOut = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
};

export async function signInWithSSO(provider: 'google' | 'azure', next?: string) {
  const supabase = await createClient();
  
  const redirectTo = new URL(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`);
  if (next) {
    redirectTo.searchParams.set("next", next);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectTo.toString(),
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = formData.get("next") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (next && next.startsWith("/")) {
    redirect(next);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No se encontró sesión." };

  const { data: profile, error: profileErr } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileErr) return { error: profileErr.message };

  if (profile?.role === "faculty") redirect("/app/faculty");
  if (profile?.role === "institution") redirect("/app/institution");
  if (profile?.role === "admin" || profile?.role === "super_admin") redirect("/app/admin");
  redirect("/");
}

export async function contactFaculty(formData: FormData) {
  const supabase = await createClient();
  const facultyId = formData.get("facultyId") as string;
  const institutionId = formData.get("institutionId") as string;
  const message = formData.get("message") as string;
  const reason = formData.get("reason") as string;
  const modality = formData.get("modality") as string;
  const dates = formData.get("dates") as string;

  const { error } = await supabase.from("contacts").insert({
    faculty_id: facultyId,
    institution_id: institutionId,
    message,
    subject: reason,
    modality,
    dates,
    status: 'pending' 
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/institution/contacts");
  return { success: true };
}

export async function toggleFavorite(facultyId: string, institutionId: string) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("faculty_id", facultyId)
    .eq("institution_id", institutionId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id);
    if (error) return { error: error.message };
    revalidatePath("/app/institution/favorites");
    return { success: true, action: 'removed' };
  } else {
    const { error } = await supabase
      .from("favorites")
      .insert({
        faculty_id: facultyId,
        institution_id: institutionId
      });
    if (error) return { error: error.message };
    revalidatePath("/app/institution/favorites");
    return { success: true, action: 'added' };
  }
}

export async function saveOnboarding(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No se encontró usuario autenticado." };

  try {
    const headline = formData.get("headline") as string;
    const location = formData.get("location") as string;
    const bio = formData.get("bio") as string;
    const visibility = formData.get("visibility") as 'public' | 'hidden' | 'institutions_only';
    const fullName = formData.get("full_name") as string;
    const termsAccepted = formData.get("terms_accepted") === "on";
    const privacyAccepted = formData.get("privacy_accepted") === "on";
    
    const areas = formData.getAll("faculty_areas") as string[]; 
    const levels = formData.getAll("levels") as string[];
    const degrees = formData.getAll("degrees") as string[];
    const modalities = formData.getAll("modalities") as string[];
    const availability = formData.get("availability") as string;
    const linkedinUrl = formData.get("linkedin_url") as string;
    const languagesStr = formData.get("languages") as string;
    const historyStr = formData.get("history") as string;

    let languages: any[] = [];
    try { languages = JSON.parse(languagesStr || "[]"); } catch (e) {}

    let history: any[] = [];
    try { history = JSON.parse(historyStr || "[]"); } catch (e) {}

    // Update user_profiles
    const profileUpdate: any = {};
    if (fullName) profileUpdate.full_name = fullName;
    if (termsAccepted) profileUpdate.terms_accepted_at = new Date().toISOString();
    if (privacyAccepted) profileUpdate.privacy_accepted_at = new Date().toISOString();
    
    if (Object.keys(profileUpdate).length > 0) {
      const { error: userError } = await supabase.from("user_profiles").update(profileUpdate).eq("id", user.id);
      if (userError) {
        console.error("[Onboarding] Error updating user_profile:", userError);
      }
    }

    const { error: facultyError } = await supabase
      .from("faculty_profiles")
      .upsert({
        id: user.id,
        headline,
        location,
        bio,
        visibility,
        is_active: true,
        languages,
        modalities,
        degrees,
        institutions_taught: history,
        faculty_areas: areas,
        levels,
        availability,
        linkedin_url: linkedinUrl,
        updated_at: new Date().toISOString()
      });

    if (facultyError) {
      console.error("[Onboarding] Error upserting faculty_profile:", facultyError);
      // Better error message for schema cache issues
      if (facultyError.message.includes("schema cache")) {
        return { error: "Error de configuración en el servidor (schema cache). Por favor, intenta de nuevo en unos segundos." };
      }
      return { error: facultyError.message };
    }
    
    revalidatePath("/app/faculty");
    return { success: true };
  } catch (err: any) {
    console.error("[Onboarding] Unexpected error during saveOnboarding:", err);
    return { error: "Ocurrió un error inesperado al guardar tu perfil." };
  }
}

export async function autosaveOnboarding(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No se encontró usuario autenticado." };

  try {
    const headline = formData.get("headline") as string;
    const location = formData.get("location") as string;
    const bio = formData.get("bio") as string;
    const visibility = formData.get("visibility") as 'public' | 'hidden';
    const fullName = formData.get("full_name") as string;
    const termsAccepted = formData.get("terms_accepted") === "on";
    const privacyAccepted = formData.get("privacy_accepted") === "on";
    
    const areas = formData.getAll("faculty_areas") as string[];
    const levels = formData.getAll("levels") as string[];
    const degrees = formData.getAll("degrees") as string[];
    const modalities = formData.getAll("modalities") as string[];
    const availability = formData.get("availability") as string;
    const linkedinUrl = formData.get("linkedin_url") as string;
    const languagesStr = formData.get("languages") as string;
    const historyStr = formData.get("history") as string;

    let languages: any[] = [];
    try { languages = JSON.parse(languagesStr || "[]"); } catch (e) {}

    let history: any[] = [];
    try { history = JSON.parse(historyStr || "[]"); } catch (e) {}

    // Update user_profiles
    const profileUpdate: any = {};
    if (fullName) profileUpdate.full_name = fullName;
    if (termsAccepted) profileUpdate.terms_accepted_at = new Date().toISOString();
    if (privacyAccepted) profileUpdate.privacy_accepted_at = new Date().toISOString();
    
    if (Object.keys(profileUpdate).length > 0) {
      await supabase.from("user_profiles").update(profileUpdate).eq("id", user.id);
    }

    const { error: facultyError } = await supabase
      .from("faculty_profiles")
      .upsert({
        id: user.id,
        headline,
        location,
        bio,
        visibility,
        languages,
        modalities,
        degrees,
        institutions_taught: history,
        faculty_areas: areas,
        levels,
        availability,
        linkedin_url: linkedinUrl,
        updated_at: new Date().toISOString()
      });

    if (facultyError) {
      console.error("[Onboarding] Error during autosave:", facultyError);
      return { error: facultyError.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error("[Onboarding] Unexpected error during autosaveOnboarding:", err);
    return { error: err.message };
  }
}
