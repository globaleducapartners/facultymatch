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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
          institution_name: institutionName,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }
  }

    // El trigger en la base de datos (handle_new_user) se encarga de crear:
    // 1. user_profiles
    // 2. faculty_profiles o institutions según el rol

    // Send Welcome Email (Corporate Identity)

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

  // Si existe el parámetro next, redirigimos directamente allí
  if (next && next.startsWith("/")) {
    redirect(next);
  }

  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No authenticated user found after login" };

  // 2. Get user role to redirect (filtering by ID)
  const { data: profile, error: pErr } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (pErr) {
    console.error("Error fetching user profile:", pErr.message);
    // If profile is missing but user is authenticated, we might need a default or fallback
    return redirect("/");
  }

  if (profile?.role === "faculty") {
    // Check if onboarding is completed
    const { data: facultyProfile } = await supabase
      .from("faculty_profiles")
      .select("headline")
      .eq("id", user.id)
      .single();
    
    if (!facultyProfile?.headline) {
      redirect("/onboarding");
    }
    redirect("/app/faculty");
  } else if (profile?.role === "institution") {
    redirect("/app/institution");
  } else if (profile?.role === "admin" || profile?.role === "super_admin") {
    redirect("/app/admin");
  } else {
    redirect("/");
  }
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

  const headline = formData.get("headline") as string;
  const location = formData.get("location") as string;
  const bio = formData.get("bio") as string;
  const visibility = formData.get("visibility") as 'public' | 'hidden' | 'institutions_only';
  
  // New fields
  const areas = formData.getAll("areas") as string[];
  const levels = formData.getAll("levels") as string[];
  const languagesStr = formData.get("languages") as string; // JSON string from client
  const historyStr = formData.get("history") as string; // JSON string from client

  let languages: { language: string, level: string }[] = [];
  try { languages = JSON.parse(languagesStr || "[]"); } catch (e) { console.error("Error parsing languages:", e); }

  let history: { institution: string, role: string, from: string, to: string }[] = [];
  try { history = JSON.parse(historyStr || "[]"); } catch (e) { console.error("Error parsing history:", e); }

  // Update faculty_profiles
  const { error: profileError } = await supabase
    .from("faculty_profiles")
    .update({
      headline,
      location,
      bio,
      visibility,
      is_active: true,
    })
    .eq("id", user.id);

  if (profileError) {
    console.error("Profile error:", profileError);
    return { error: profileError.message };
  }

  // Handle Areas (using faculty_areas table as requested)
  await supabase.from("faculty_areas").delete().eq("faculty_id", user.id);
  if (areas && areas.length > 0) {
    const areaData = areas.map(area => ({ faculty_id: user.id, area }));
    await supabase.from("faculty_areas").insert(areaData);
  }

  // Handle Levels
  await supabase.from("faculty_levels").delete().eq("faculty_id", user.id);
  if (levels && levels.length > 0) {
    const levelData = levels.map(level => ({ faculty_id: user.id, level }));
    await supabase.from("faculty_levels").insert(levelData);
  }

  // Handle Languages
  await supabase.from("faculty_languages").delete().eq("faculty_id", user.id);
  if (languages && languages.length > 0) {
    const langData = languages.map(l => ({ 
      faculty_id: user.id, 
      language: l.language, 
      level: l.level 
    }));
    await supabase.from("faculty_languages").insert(langData);
  }

  // Handle History
  await supabase.from("faculty_teaching_history").delete().eq("faculty_id", user.id);
  if (history && history.length > 0) {
    const historyData = history.map(h => ({
      faculty_id: user.id,
      institution_name: h.institution,
      role: h.role,
      year_from: parseInt(h.from) || null,
      year_to: parseInt(h.to) || null
    }));
    await supabase.from("faculty_teaching_history").insert(historyData);
  }

  // Keep faculty_expertise in sync if it exists (legacy/parallel)
  await supabase.from("faculty_expertise").delete().eq("faculty_id", user.id);
  if (areas && areas.length > 0) {
    const expertiseData = areas.map(area => ({ faculty_id: user.id, area }));
    await supabase.from("faculty_expertise").insert(expertiseData);
  }

  revalidatePath("/app/faculty");
  redirect("/app/faculty");
}
