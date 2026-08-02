"use server";

import { createClient, createAdminClient } from "@/lib/supabase-server";
import { sendWelcomeEmail, sendActivationEmail } from "@/lib/emails/service";
import { generateToken, getTokenExpiry } from "@/lib/activation-token";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Resend } from 'resend';
import { notifyAdminNewRegistration } from "@/lib/admin-alerts";

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
    const { error: ssoProfileError } = await admin.from("user_profiles").upsert({
      id: user.id,
      role,
      active_mode: role,
      full_name: fullName || user.user_metadata?.full_name || user.email?.split("@")[0],
    }, { onConflict: "id" });
    if (ssoProfileError) {
      console.error("[SignUp][SSO] Error upserting user_profiles:", ssoProfileError);
    }

    if (role === "institution") {
      const { error: ssoInstitutionError } = await admin.from("institutions").upsert({
        id: user.id,
        user_id: user.id,
        name: institutionName || user.email?.split("@")[0] || "Mi Institución",
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });
      if (ssoInstitutionError) {
        console.error("[SignUp][SSO] Error upserting institutions:", ssoInstitutionError);
      }
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

    // Ensure user_profiles and faculty_profiles records exist
    // (database trigger may not be set up, so we do it explicitly)
    const { error: userProfileError } = await admin.from("user_profiles").upsert({
      id: data.user.id,
      role,
      active_mode: role,
      full_name: fullName,
      terms_accepted_at: new Date().toISOString(),
      privacy_accepted_at: new Date().toISOString(),
      marketing_opt_in: marketingOptIn,
      consent_version: "v1",
    }, { onConflict: "id" });
    if (userProfileError) {
      console.error("[SignUp] Error upserting user_profiles:", userProfileError);
    }

    if (role === "faculty") {
      const { error: facultyProfileError } = await admin.from("faculty_profiles").upsert({
        id: data.user.id,
        user_id: data.user.id,
        visibility: "public",
        is_active: true,
        is_verified: false,
        onboarding_status: "not_started",
        onboarding_step: 0,
        estado_perfil: "pendiente_verificacion",
      }, { onConflict: "id" });
      if (facultyProfileError) {
        console.error("[SignUp] Error upserting faculty_profiles:", facultyProfileError);
      }

      // Generate activation token and send confirmation email
      const { token, hash } = generateToken();
      const expiresAt = getTokenExpiry();

      const { error: activationTokenError } = await admin.from("activation_tokens").insert({
        user_id: data.user.id,
        token_hash: hash,
        expires_at: expiresAt,
        used: false,
      });
      if (activationTokenError) {
        console.error("[SignUp] Error inserting activation_tokens:", activationTokenError);
      }

      const origin =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
        "https://www.facultymatch.app";
      const activationLink = `${origin}/auth/activar?token=${token}`;

      sendActivationEmail(email, fullName, activationLink).catch(e =>
        console.error("[SignUp] Activation email failed:", e)
      );
    } else if (role === "institution") {
      const { error: institutionError } = await admin.from("institutions").upsert({
        id: data.user.id,
        user_id: data.user.id,
        name: institutionName || fullName,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });
      if (institutionError) {
        console.error("[SignUp] Error upserting institutions:", institutionError);
      }
    }

    // Auto-login with the newly created confirmed account
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      console.error("[SignUp] Auto-login failed:", signInError.message);
      return redirect("/login?message=¡Cuenta creada! Accede con tu correo y contraseña.");
    }

    // Email de bienvenida — solo instituciones (se activan al momento, sin
    // paso de verificación). Para faculty, el email de activación de arriba
    // ya es la bienvenida; enviar además "tu perfil está activo" a la vez
    // que "activa tu cuenta" es contradictorio y venía del flujo antiguo
    // previo a estado_perfil. La bienvenida real de faculty es la propia
    // pantalla de onboarding tras activar.
    if (role === "institution") {
      sendWelcomeEmail(email, fullName, role, institutionName || fullName).catch(e =>
        console.error("[SignUp] Welcome email failed:", e)
      );
    }

    // Notify admin of new registration
    notifyAdminNewRegistration({
      role,
      name: fullName,
      email,
      institutionName: role === 'institution' ? institutionName : null,
    }).catch(e => console.warn("[SignUp] Admin notification failed:", e));
  }

  // Redirect to the correct page — redirect() in server actions ensures
  // session cookies set by signInWithPassword() are included in the response.
  // revalidatePath forces a fresh render of the destination — right after
  // auto-login, Next's router cache can otherwise serve a copy of the page
  // fetched before the session existed, showing blank content until a
  // manual reload.
  if (role === "faculty") {
    revalidatePath("/auth/verificar-email");
    redirect("/auth/verificar-email?email=" + encodeURIComponent(email));
  } else if (role === "institution") {
    revalidatePath("/app/institution");
    redirect("/app/institution");
  }
  redirect("/auth/verificar-email?email=" + encodeURIComponent(email));
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
    // Use admin client to bypass recursive RLS on user_profiles
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("user_profiles")
      .select("role, onboarding_completed")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.role) {
      redirect("/app/faculty");
    } else if (profile.role === "faculty") {
      redirect("/app/faculty");
    } else if (profile.role === "institution") {
      redirect("/app/institution");
    } else if (profile.role === "admin" || profile.role === "super_admin") {
      redirect("/control");
    }
  }

  redirect("/app/faculty");
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
  const contractType = formData.get("contract_type") as string;

  if (!institutionId || !facultyId) {
    return { error: 'Datos incompletos para crear el contacto' };
  }

  // Use admin client to bypass RLS — institution is authenticated and IDs are validated
  const supabaseAdmin = createAdminClient();

  // Verify the caller actually owns this institution — previously any
  // authenticated user could pass an arbitrary institutionId in the form
  // and the contact would be created "from" an institution they don't
  // control (no ownership check existed at all).
  const { data: callerInstitution } = await supabaseAdmin
    .from('institutions')
    .select('id, status')
    .eq('id', institutionId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!callerInstitution) {
    return { error: 'No autorizado' };
  }
  if (callerInstitution.status === 'blocked') {
    return { error: 'Tu cuenta de institución está suspendida.' };
  }

  // Enforce the plan's monthly contact limit server-side — the UI's
  // "usedContacts < limit" check only disabled the button; nothing stopped
  // a direct call to this action once the limit was reached.
  const { data: contactPlanProfile } = await supabaseAdmin
    .from('user_profiles')
    .select('plan, subscription_status')
    .eq('id', user.id)
    .maybeSingle();
  const contactSubActive = contactPlanProfile?.subscription_status === 'active' || contactPlanProfile?.subscription_status === 'trialing';
  const isContactPro = contactPlanProfile?.plan === 'institution-pro' && contactSubActive;
  const isContactGrowth = contactPlanProfile?.plan === 'institution-growth' && contactSubActive;
  const contactMonthlyLimit = isContactPro ? null : isContactGrowth ? 20 : 5;

  if (contactMonthlyLimit !== null) {
    const now = new Date();
    const monthStart = `${now.toISOString().slice(0, 7)}-01`;
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10);
    const { count: contactsThisMonth } = await supabaseAdmin
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('institution_id', institutionId)
      .gte('created_at', monthStart)
      .lt('created_at', nextMonth);
    if ((contactsThisMonth ?? 0) >= contactMonthlyLimit) {
      return { error: 'Has alcanzado el límite de contactos de tu plan este mes.' };
    }
  }

  const { error } = await supabaseAdmin.from("contacts").insert({
    faculty_id: facultyId,
    institution_id: institutionId,
    message,
    subject: reason,
    modality,
    dates,
    contract_type: contractType || null,
    status: 'pending'
  });

  if (error) {
    return { error: error.message };
  }

  // Obtener datos del docente y la institución para el email
  // facultyId is faculty_profiles.id — need to look up the auth user via user_id
  const { data: facultyProfile } = await supabaseAdmin
    .from('faculty_profiles')
    .select('user_id, notify_new_offers')
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

  // Email al docente notificándole del contacto — respeta su preferencia
  // de "nuevas ofertas" (activada por defecto)
  if (facultyUser && facultyProfile && facultyProfile.notify_new_offers !== false) {
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
                    <strong>Tipo de colaboración:</strong> ${reason || 'No especificado'}
                  </p>
                  ${contractType ? `<p style="margin:0 0 8px;font-size:14px;color:#64748b;"><strong>Tipo de contrato:</strong> ${contractType}</p>` : ''}
                  <p style="margin:0 0 8px;font-size:14px;color:#64748b;">
                    <strong>Modalidad:</strong> ${modality || 'No especificada'}
                  </p>
                  ${dates ? `<p style="margin:0 0 8px;font-size:14px;color:#64748b;"><strong>Fechas:</strong> ${dates}</p>` : ''}
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

export async function replyToContact(contactId: string, replyMessage: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const admin = createAdminClient();

  // Get contact record + institution + faculty info
  const { data: contact } = await admin
    .from('contacts')
    .select('*, institution:institutions(id, name, contact_email, user_id)')
    .eq('id', contactId)
    .single();

  if (!contact) return { error: 'Solicitud no encontrada' };

  // Verify the faculty owns this contact request
  const { data: fp } = await admin
    .from('faculty_profiles')
    .select('id, user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!fp || contact.faculty_id !== fp.id) return { error: 'No autorizado' };

  // Append follow-up atomically and mark as replied (avoids losing messages
  // sent near-simultaneously via a read-modify-write race)
  const newFollowUp = {
    sender: "faculty",
    message: replyMessage,
    created_at: new Date().toISOString()
  };

  const { error: appendError } = await admin.rpc('append_contact_follow_up', {
    p_contact_id: contactId,
    p_follow_up: newFollowUp,
    p_status: 'replied',
    p_reply_message: replyMessage,
    p_set_replied_at: true,
  });
  if (appendError) return { error: 'No se pudo enviar la respuesta' };

  // Get faculty name
  const { data: facultyUser } = await admin.from('user_profiles').select('full_name').eq('id', user.id).single();
  const facultyName = facultyUser?.full_name || 'El docente';

  // Get institution email
  const inst = contact.institution as any;
  let institutionEmail: string | null = inst?.contact_email || null;
  if (!institutionEmail && inst?.user_id) {
    const { data: authUser } = await admin.auth.admin.getUserById(inst.user_id);
    institutionEmail = authUser?.user?.email || null;
  }

  if (institutionEmail) {
    try {
      await resend.emails.send({
        from: FROM,
        to: [institutionEmail],
        subject: `💬 ${facultyName} ha respondido a tu solicitud en FacultyMatch`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 16px;">
            <div style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;padding:40px;">
              <h1 style="color:#0B1220;font-size:22px;margin:0 0 8px;">Has recibido una respuesta</h1>
              <p style="color:#64748b;font-size:15px;margin:0 0 24px;">
                <strong style="color:#0B1220;">${facultyName}</strong> ha respondido a tu solicitud de contacto.
              </p>
              <div style="background:#f1f5f9;border-radius:8px;padding:20px;margin-bottom:24px;border-left:3px solid #2563EB;">
                <p style="margin:0;font-size:14px;color:#0B1220;line-height:1.7;">${replyMessage.replace(/\n/g, '<br>')}</p>
              </div>
              <a href="https://www.facultymatch.app/app/institution/contacts"
                 style="display:inline-block;background:#2563EB;color:#fff;padding:14px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">
                Ver en mi panel →
              </a>
              <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">
                FacultyMatch · <a href="https://www.facultymatch.app" style="color:#94a3b8;">www.facultymatch.app</a>
              </p>
            </div>
          </div>
        `,
      });
    } catch (e) {
      console.warn('[replyToContact] Email failed:', e);
    }
  }

  revalidatePath('/app/faculty/requests');
  return { success: true };
}

export async function toggleFavorite(facultyId: string, institutionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  // Use admin to bypass RLS (institution_id ≠ auth.uid() — it's the institution record ID)
  // Validate ownership first: the institutionId must belong to this user
  const admin = createAdminClient();
  const { data: ownedInstitution } = await admin
    .from("institutions")
    .select("id")
    .eq("id", institutionId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!ownedInstitution) return { error: 'No autorizado' };

  const { data: existing } = await admin
    .from("favorites")
    .select("id")
    .eq("faculty_id", facultyId)
    .eq("institution_id", institutionId)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from("favorites")
      .delete()
      .eq("id", existing.id);
    if (error) return { error: error.message };
    revalidatePath("/app/institution/favorites");
    return { success: true, action: 'removed' };
  } else {
    const { error } = await admin
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

export async function switchActiveMode(formData: FormData) {
  const newMode = formData.get("mode") as "faculty" | "institution";
  if (!newMode) return;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("user_profiles").update({ active_mode: newMode }).eq("id", user.id);
  redirect(newMode === "faculty" ? "/app/faculty" : "/app/institution");
}
