"use server";

import { createClient, createAdminClient } from "@/lib/supabase-server";
import { sendWelcomeEmail } from "@/lib/emails/service";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'FacultyMatch <noreply@facultymatch.app>';

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

    // Send welcome email to new user
    sendWelcomeEmail(email, fullName, role, institutionName || fullName).catch(e =>
      console.error("[SignUp] Welcome email failed:", e)
    );

    // Notify support team of new registration
    resend.emails.send({
      from: FROM,
      to: ['support@facultymatch.app'],
      subject: `🎓 Nuevo ${role === 'faculty' ? 'docente' : 'institución'} registrado: ${fullName}`,
      html: buildSupportNotification(role, fullName, email, role === 'institution' ? (institutionName || undefined) : undefined),
    }).catch(e => console.warn("[SignUp] Support notification email failed:", e));
  }

  return { success: true };
}

// Institution-specific signup: uses admin client to auto-confirm (no Supabase email sent)
// then auto-logs in and sends our own branded welcome email via Resend
export async function signUpInstitution(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const institutionName = formData.get("institutionName") as string;
  const institutionType = formData.get("institutionType") as string;
  const country = formData.get("country") as string;
  const city = formData.get("city") as string;
  const website = formData.get("website") as string;
  const cif = formData.get("cif") as string;
  const position = formData.get("position") as string;
  const phone = formData.get("phone") as string;
  const urgency = formData.get("urgency") as string;
  const termsAccepted = formData.get("terms_accepted") === "true";
  const privacyAccepted = formData.get("privacy_accepted") === "true";
  const marketingOptIn = formData.get("marketing_opt_in") === "true";

  let knowledge_areas: string[] = [];
  try { knowledge_areas = JSON.parse((formData.get("knowledge_areas") as string) || "[]"); } catch {}

  if (!email || !password || !fullName || !institutionName) {
    return { error: "Faltan datos obligatorios." };
  }

  const admin = createAdminClient();

  // Create user with email pre-confirmed — no Supabase confirmation email sent
  const { data, error } = await admin.auth.admin.createUser({
    email: email.toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      role: "institution",
      onboarding_completed: true,
      institution_name: institutionName,
      institution_type: institutionType,
      country,
      city,
      website: website || null,
      cif: cif || null,
      position,
      phone,
      knowledge_areas,
      urgency: urgency || null,
      terms_accepted: termsAccepted,
      privacy_accepted: privacyAccepted,
      marketing_opt_in: marketingOptIn,
      consent_version: "v1",
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("already been registered") ||
        msg.includes("user already") || msg.includes("email address is already") ||
        msg.includes("email already")) {
      return { error: "Este correo ya está registrado. Accede con tu cuenta existente." };
    }
    return { error: error.message };
  }

  if (!data.user) return { error: "No se pudo crear la cuenta. Inténtalo de nuevo." };

  // Create institution record immediately with all signup data
  const cityCountry = [city, country].filter(Boolean).join(', ');
  await admin.from("institutions").upsert({
    user_id: data.user.id,
    name: institutionName,
    institution_type: institutionType || null,
    type: institutionType || null,
    country: country || null,
    city: city || null,
    location: cityCountry || null,
    website: website || null,
    phone: phone || null,
    contact_email: email.toLowerCase(),
    status: "pending",
  }, { onConflict: "user_id" });

  // Auto-login
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase(),
    password,
  });
  if (signInError) {
    console.error("[signUpInstitution] Auto-login failed:", signInError.message);
    return { error: "Cuenta creada. Por favor accede con tu email y contraseña." };
  }

  // Save to institution_applications (non-blocking)
  admin.from("institution_applications").insert({
    institution_name: institutionName,
    institution_type: institutionType,
    country,
    city,
    website: website || null,
    contact_name: fullName,
    contact_email: email.toLowerCase(),
    contact_phone: phone,
    contact_position: position,
    areas_needed: knowledge_areas,
    urgency: urgency || null,
  }).then(({ error }) => {
    if (error) console.warn('[signUpInstitution] application insert failed:', error.message);
  });

  // Send branded welcome email via Resend (not Supabase)
  sendWelcomeEmail(email.toLowerCase(), fullName, "institution", institutionName)
    .catch(e => console.error("[signUpInstitution] Welcome email failed:", e));

  // Notify support team of new institution registration
  resend.emails.send({
    from: FROM,
    to: ['support@facultymatch.app'],
    subject: `🏛️ Nueva institución registrada: ${institutionName}`,
    html: buildSupportNotification("institution", fullName, email.toLowerCase(), institutionName, country, city, institutionType),
  }).catch(e => console.warn("[signUpInstitution] Support notification email failed:", e));

  return { success: true };
}

export async function updateEmail(formData: FormData) {
  const newEmail = formData.get("newEmail") as string;
  if (!newEmail?.trim()) return { error: "Introduce un correo válido." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) return { error: error.message };
  return { success: "Hemos enviado un email de confirmación a la nueva dirección." };
}

export async function updatePassword(formData: FormData) {
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  if (!newPassword || newPassword.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };
  if (newPassword !== confirmPassword) return { error: "Las contraseñas no coinciden." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return { success: "Contraseña actualizada correctamente." };
}

export const signOut = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
};

export async function signInWithSSO(provider: 'google' | 'azure', next?: string) {
  const supabase = await createClient();
  
  // Always use the canonical production URL to avoid vercel.app redirect mismatches
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
    || 'https://www.facultymatch.app';
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
    } else if (profile.role === "faculty") {
      redirect("/app/faculty");
    } else if (profile.role === "institution") {
      redirect("/app/institution");
    } else if (profile.role === "admin" || profile.role === "super_admin") {
      redirect("/control");
    }
  }

  redirect("/onboarding/role");
}

export async function contactFaculty(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const facultyId = formData.get("facultyId") as string;
  const institutionId = formData.get("institutionId") as string;
  const message = formData.get("message") as string;
  const reason = formData.get("reason") as string;
  const modality = formData.get("modality") as string;
  const dates = formData.get("dates") as string;

  if (!institutionId || !facultyId) {
    return { error: 'Datos incompletos para crear el contacto' };
  }

  // Use admin client to bypass RLS — institution is authenticated and IDs are validated
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin.from("contacts").insert({
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

  // Obtener datos del docente y la institución para el email
  // facultyId is faculty_profiles.id — need to look up the auth user via user_id
  const { data: facultyProfile } = await supabaseAdmin
    .from('faculty_profiles')
    .select('user_id')
    .eq('id', facultyId)
    .maybeSingle();

  const { data: facultyUser } = facultyProfile ? await supabaseAdmin
    .from('user_profiles')
    .select('full_name')
    .eq('id', facultyProfile.user_id)
    .single() : { data: null };

  const { data: institutionData } = await supabaseAdmin
    .from('institutions')
    .select('name')
    .eq('id', institutionId)
    .single();

  // Email al docente notificándole del contacto
  if (facultyUser && facultyProfile) {
    const { data: facultyAuth } = await supabaseAdmin.auth.admin.getUserById(facultyProfile.user_id);
    if (facultyAuth?.user?.email) {
      try {
        await resend.emails.send({
          from: FROM,
          to: [facultyAuth.user.email],
          subject: `📬 ${institutionData?.name || 'Una institución'} quiere contactarte en FacultyMatch`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 16px;">
              <div style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;padding:40px;">
                <h1 style="color:#0B1220;font-size:24px;margin:0 0 8px;">
                  Tienes un nuevo contacto
                </h1>
                <p style="color:#64748b;font-size:16px;margin:0 0 24px;">
                  Hola ${facultyUser.full_name || 'docente'},
                  <strong style="color:#0B1220;">${institutionData?.name || 'Una institución'}</strong>
                  quiere ponerse en contacto contigo a través de FacultyMatch.
                </p>
                <div style="background:#f1f5f9;border-radius:8px;padding:20px;margin-bottom:24px;">
                  <p style="margin:0 0 8px;font-size:14px;color:#64748b;">
                    <strong>Motivo:</strong> ${reason || 'No especificado'}
                  </p>
                  <p style="margin:0 0 8px;font-size:14px;color:#64748b;">
                    <strong>Modalidad:</strong> ${modality || 'No especificada'}
                  </p>
                  ${message ? `<p style="margin:0;font-size:14px;color:#64748b;"><strong>Mensaje:</strong> ${message}</p>` : ''}
                </div>
                <a href="https://www.facultymatch.app/app/faculty"
                   style="display:inline-block;background:#2563EB;color:#fff;
                          padding:14px 28px;border-radius:8px;font-weight:700;
                          text-decoration:none;font-size:16px;">
                  Ver el contacto en mi dashboard →
                </a>
                <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">
                  FacultyMatch · <a href="https://www.facultymatch.app" style="color:#94a3b8;">www.facultymatch.app</a>
                </p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.warn('[contactFaculty] Email to faculty failed:', emailErr);
      }
    }
  }

  // Email interno de alerta al equipo
  try {
    await resend.emails.send({
      from: FROM,
      to: ['support@facultymatch.app'],
      subject: `🔔 Nuevo contacto: ${institutionData?.name} → ${facultyUser?.full_name}`,
      html: `<p>Nueva solicitud de contacto.<br>
             Institución: ${institutionData?.name}<br>
             Docente ID: ${facultyId}<br>
             Motivo: ${reason}<br>
             Mensaje: ${message}</p>`,
    });
  } catch (e) {
    console.warn('[contactFaculty] Internal alert email failed:', e);
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

// ─── Internal helper ────────────────────────────────────────────────────────

function buildSupportNotification(
  role: string,
  name: string,
  email: string,
  institution?: string,
  country?: string,
  city?: string,
  type?: string,
) {
  const roleLabel = role === "faculty" ? "Docente" : "Institución";
  const rows = [
    ["Tipo", roleLabel],
    ["Nombre", name],
    ["Email", email],
    institution ? ["Institución", institution] : null,
    type ? ["Tipo de institución", type] : null,
    (city || country) ? ["Ubicación", [city, country].filter(Boolean).join(", ")] : null,
    ["Fecha", new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })],
  ].filter(Boolean) as [string, string][];

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
<tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;max-width:600px;">
<tr><td style="background:#0B1220;padding:24px 40px;text-align:center;border-radius:16px 16px 0 0;">
  <span style="color:#fff;font-size:20px;font-weight:900;">FACULTY<span style="color:#2563EB;">MATCH</span></span>
  <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">Notificación interna — Nuevo registro</p>
</td></tr>
<tr><td style="padding:40px;">
  <h2 style="margin:0 0 20px;color:#0B1220;font-size:22px;font-weight:900;">Nuevo ${roleLabel} registrado</h2>
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
  ${rows.map(([label, value], i) => `
    <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'};">
      <td style="padding:12px 16px;font-size:13px;color:#94a3b8;font-weight:700;width:40%;">${label}</td>
      <td style="padding:12px 16px;font-size:13px;color:#0B1220;font-weight:600;">${value}</td>
    </tr>`).join("")}
  </table>
  <div style="margin-top:24px;">
    <a href="https://www.facultymatch.app/control" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;text-decoration:none;font-size:14px;">
      Ir al panel de administración →
    </a>
  </div>
</td></tr>
<tr><td style="background:#f8fafc;padding:16px 40px;text-align:center;border-top:1px solid #e2e8f0;border-radius:0 0 16px 16px;">
  <p style="margin:0;font-size:11px;color:#94a3b8;">FacultyMatch · Notificación automática interna</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
}
