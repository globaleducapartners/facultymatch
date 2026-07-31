"use server";

import { createClient, createAdminClient } from "@/lib/supabase-server";
import { ensureProfileSlug } from "@/lib/profile-slug";
import { revalidatePath } from "next/cache";

export async function hideFaculty(facultyId: string) {
  const admin = createAdminClient();
  await admin.from("faculty_profiles").update({ visibility: "private" }).eq("user_id", facultyId);
  revalidatePath(`/control/faculty/${facultyId}`);
}

export async function unhideFaculty(facultyId: string) {
  const admin = createAdminClient();
  await admin.from("faculty_profiles").update({ visibility: "public" }).eq("user_id", facultyId);
  revalidatePath(`/control/faculty/${facultyId}`);
}

export async function revokeFaculty(facultyId: string) {
  const admin = createAdminClient();
  await admin.from("faculty_profiles").update({
    estado_perfil: "rechazado",
    is_verified: false,
    verificado_en: new Date().toISOString(),
  }).eq("user_id", facultyId);
  revalidatePath(`/control/faculty/${facultyId}`);
}

export async function activateFaculty(
  facultyId: string,
  force = false
): Promise<{ ok: true } | { ok: false; reason: "ONBOARDING_INCOMPLETE" }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const admin = createAdminClient();

  const { data: adminProfile } = await admin
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!adminProfile || (adminProfile.role !== "admin" && adminProfile.role !== "super_admin")) {
    throw new Error("Unauthorized");
  }

  if (!force) {
    const { data: fp } = await admin
      .from("faculty_profiles")
      .select("onboarding_status")
      .eq("user_id", facultyId)
      .maybeSingle();
    if (fp?.onboarding_status !== "completed") {
      // No lanzar: Next.js censura el mensaje de las excepciones de Server
      // Actions en producción, y el cliente nunca detectaría este caso para
      // mostrar el diálogo de confirmación. Se devuelve como resultado normal,
      // igual que ya hace /api/admin/faculty/[id]/route.ts.
      return { ok: false, reason: "ONBOARDING_INCOMPLETE" };
    }
  }

  await ensureProfileSlug(admin, facultyId);

  await admin.from("faculty_profiles").update({
    estado_perfil: "verificado",
    is_verified: true,
    verificado_por: user.id,
    verificado_en: new Date().toISOString(),
  }).eq("user_id", facultyId);
  revalidatePath(`/control/faculty/${facultyId}`);
  return { ok: true };
}

export async function deleteFaculty(facultyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const admin = createAdminClient();
  // Delete user (cascade will handle related tables)
  await admin.auth.admin.deleteUser(facultyId);
  revalidatePath("/control/faculty");
}

export async function sendNotification(
  facultyId: string,
  type: string,
  subject: string,
  body?: string,
  sendEmail?: boolean
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const admin = createAdminClient();

  let emailLogId: string | null = null;

  if (sendEmail) {
    const { data: facultyUser } = await admin
      .from("user_profiles")
      .select("full_name, email")
      .eq("id", facultyId)
      .single();

    const { data: authUser } = await admin.auth.admin.getUserById(facultyId);
    const facultyEmail = facultyUser?.email || authUser?.user?.email;

    if (facultyEmail) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const FROM = process.env.RESEND_FROM_EMAIL || "FacultyMatch <noreply@facultymatch.app>";

      const html = buildNotificationHtml(
        facultyUser?.full_name?.split(" ")[0] || "Docente",
        subject,
        body || subject
      );

      await resend.emails.send({
        from: FROM,
        to: [facultyEmail],
        subject,
        html,
      });

      // Log email
      const { data: logEntry } = await admin
        .from("email_logs")
        .insert({
          recipient_id: facultyId,
          recipient_email: facultyEmail,
          template: type,
          subject,
          metadata: { admin_id: user.id },
        })
        .select("id")
        .single();

      emailLogId = logEntry?.id || null;
    }
  }

  // Insert notification
  await admin.from("admin_notifications").insert({
    faculty_id: facultyId,
    type,
    subject,
    body: body || subject,
    admin_id: user.id,
    email_log_id: emailLogId,
  });

  revalidatePath(`/control/faculty/${facultyId}`);
}

function buildNotificationHtml(name: string, subject: string, body: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
  <tr><td style="background:#0B1220;padding:28px 40px;text-align:center;">
    <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:1px;">FACULTY<span style="color:#2563EB;">MATCH</span></span>
  </td></tr>
  <tr><td style="padding:40px;">
    <h1 style="margin:0 0 12px;color:#0B1220;font-size:24px;font-weight:900;">Hola ${name},</h1>
    <h2 style="margin:0 0 16px;color:#2563EB;font-size:18px;font-weight:700;">${subject}</h2>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0;">${body.replace(/\n/g, "<br/>")}</p>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:12px;color:#94a3b8;">FacultyMatch · support@facultymatch.app</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}