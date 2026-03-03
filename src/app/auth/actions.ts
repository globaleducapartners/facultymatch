"use server";

import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
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
  const admin = createAdminClient();
  let userId: string;

  if (isSSO) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No se encontró sesión de SSO activa." };
    userId = user.id;
  } else {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }
    if (!data.user) return { error: "Error al crear el usuario." };
    userId = data.user.id;
  }

  // 1. Create user_profiles entry (Always using admin client to bypass RLS)
  const { error: profileError } = await admin.from("user_profiles").upsert({
    id: userId,
    role: role as any,
    full_name: fullName,
  });

  if (profileError) {
    console.error("Profile Error:", profileError.message);
    return { error: `Error al crear el perfil: ${profileError.message}` };
  }

  // 2. Create role-specific profile (Always using admin client)
  if (role === "faculty") {
    const { error: edError } = await admin.from("faculty_profiles").upsert({
      id: userId,
      visibility: 'public',
      is_active: true,
      is_verified: false,
    });
    if (edError) {
      console.error("Faculty Profile Error:", edError.message);
      return { error: `Error al crear perfil docente: ${edError.message}` };
    }
  } else {
    const { error: instError } = await admin.from("institutions").upsert({
      id: userId,
      name: institutionName || fullName,
    });
    if (instError) {
      console.error("Institution Error:", instError.message);
      return { error: `Error al crear perfil de institución: ${instError.message}` };
    }
  }

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
