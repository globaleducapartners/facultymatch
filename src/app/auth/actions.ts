"use server";

import { createClient, createAdminClient } from "@/lib/supabase-server";
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
    // SSO: user already exists, just update their profile metadata
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No se encontró sesión de SSO activa." };

    // Update user_profiles with role and name
    const admin = createAdminClient();
    await admin.from("user_profiles").upsert({
      id: user.id,
      role,
      full_name: fullName || user.user_metadata?.full_name || user.email?.split("@")[0],
    }, { onConflict: "id" });

    if (role === "institution") {
      await admin.from("institutions").upsert({
        user_id: user.id,
        name: institutionName || user.email?.split("@")[0] || "Mi Institución",
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }
  } else {
    const termsAccepted = formData.get("terms_accepted") === "on";
    const privacyAccepted = formData.get("privacy_accepted") === "on";
    const marketingOptIn = formData.get("marketing_opt_in") === "on";

    if (!termsAccepted || !privacyAccepted) {
      return { error: "Debes aceptar los términos y la política de privacidad." };
    }

    if (!email || !password || !fullName) {
      return { error: "Por favor completa todos los campos requeridos." };
    }

    // Use admin client to create user already confirmed — no email verification needed
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role,
        institution_name: institutionName || null,
        terms_accepted: true,
        privacy_accepted: true,
        marketing_opt_in: marketingOptIn,
        consent_version: "v1",
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("already been registered") ||
          error.message.toLowerCase().includes("user already") ||
          error.message.toLowerCase().includes("email address is already") ||
          error.message.toLowerCase().includes("email already exists")) {
        return { error: "Este correo electrónico ya está registrado. Por favor, accede con tu cuenta existente." };
      }
      return { error: error.message };
    }

    if (!data.user) {
      return { error: "No se pudo crear la cuenta. Inténtalo de nuevo." };
    }

    // If institution role, create institution record
    if (role === "institution") {
      await admin.from("institutions").upsert({
        user_id: data.user.id,
        name: institutionName || fullName,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }

    // Auto-login with the newly created confirmed account
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      console.error("[SignUp] Auto-login failed:", signInError.message);
      return redirect("/login?message=¡Cuenta creada! Accede con tu correo y contraseña.");
    }

    // Send welcome email async (don't block on it)
    sendWelcomeEmail(email, fullName, role, institutionName || fullName).catch(e =>
      console.error("[SignUp] Welcome email failed:", e)
    );
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
  
  // Always use the canonical production URL to avoid vercel.app redirect mismatches
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.facultymatch.app';
  const redirectTo = new URL(`${siteUrl}/auth/callback`);
  
  if (next) {
    redirectTo.searchParams.set("next", next);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectTo.toString(),
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Return the URL so the client can redirect (server actions can't redirect for OAuth)
  return { url: data.url };
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = formData.get("next") as string;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // If an explicit next destination was provided, use it
  if (next && next.startsWith("/")) {
    redirect(next);
  }

  // Otherwise redirect based on role
  const userId = data.user?.id;
  if (userId) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, onboarding_completed")
      .eq("id", userId)
      .single();

    if (!profile?.role) {
      redirect("/onboarding/role");
    } else if (profile.role === "faculty" && !profile.onboarding_completed) {
      redirect("/onboarding");
    } else if (profile.role === "faculty") {
      redirect("/app/faculty");
    } else if (profile.role === "institution" && !profile.onboarding_completed) {
      redirect("/onboarding/institution");
    } else if (profile.role === "institution") {
      redirect("/app/institution");
    } else if (profile.role === "admin" || profile.role === "super_admin") {
        redirect("/app/admin");
      }
  }

  redirect("/onboarding/role");
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

  const admin = createAdminClient();

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

    // Update user_profiles via admin (bypasses RLS)
    const profileUpdate: any = { onboarding_completed: true };
    if (fullName) profileUpdate.full_name = fullName;
    if (termsAccepted) profileUpdate.terms_accepted_at = new Date().toISOString();
    if (privacyAccepted) profileUpdate.privacy_accepted_at = new Date().toISOString();
    
    const { error: userError } = await admin.from("user_profiles").update(profileUpdate).eq("id", user.id);
    if (userError) {
      console.error("[Onboarding] Error updating user_profile:", userError);
    }

    const { error: facultyError } = await admin
      .from("faculty_profiles")
      .upsert({
        user_id: user.id,
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
      }, { onConflict: 'user_id' });

    if (facultyError) {
      console.error("[Onboarding] Error upserting faculty_profile:", facultyError);
      if (facultyError.message.includes("schema cache")) {
        return { error: "Error de configuración en el servidor. Por favor, intenta de nuevo." };
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

export async function saveInstitutionOnboarding(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const admin = createAdminClient();
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const country = formData.get("country") as string;
  const location = formData.get("location") as string;
  const website = formData.get("website") as string;
  const description = formData.get("description") as string;

  if (!name?.trim()) return { error: "El nombre de la institución es obligatorio." };

  const { error: instError } = await admin
    .from("institutions")
    .upsert({
      user_id: user.id,
      name,
      type,
      country,
      location,
      website,
      description,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

  if (instError) {
    console.error("[InstitutionOnboarding] upsert error:", instError);
    return { error: instError.message };
  }

  const { error: profileError } = await admin
    .from("user_profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  if (profileError) {
    console.error("[InstitutionOnboarding] profile update error:", profileError);
  }

  revalidatePath("/app/institution");
  return { success: true };
}

export async function assignRole(role: "faculty" | "institution") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("user_profiles")
    .upsert({ id: user.id, role }, { onConflict: "id" });

  if (error) return { error: error.message };
  return { success: true };
}

export async function autosaveOnboarding(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null; // silent fail — not an error

  const admin = createAdminClient();

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

    const profileUpdate: any = {};
    if (fullName) profileUpdate.full_name = fullName;
    if (termsAccepted) profileUpdate.terms_accepted_at = new Date().toISOString();
    if (privacyAccepted) profileUpdate.privacy_accepted_at = new Date().toISOString();
    
    if (Object.keys(profileUpdate).length > 0) {
      await admin.from("user_profiles").update(profileUpdate).eq("id", user.id);
    }

    await admin
      .from("faculty_profiles")
      .upsert({
        user_id: user.id,
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
      }, { onConflict: 'user_id' });

    return { success: true };
  } catch (err: any) {
    console.error("[Onboarding] Unexpected error during autosaveOnboarding:", err);
    return null;
  }
}
