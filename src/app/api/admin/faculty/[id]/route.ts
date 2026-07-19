import { createClient, createAdminClient } from "@/lib/supabase-server";
import { ensureProfileSlug } from "@/lib/profile-slug";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "FacultyMatch <noreply@facultymatch.app>";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) return null;
  return { userId: user.id, admin };
}

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { action, ...payload } = await _request.json();

  switch (action) {
    case "hide": {
      await session.admin.from("faculty_profiles").update({ visibility: "private" }).eq("user_id", id);
      return NextResponse.json({ success: true, action: "hidden" });
    }
    case "unhide": {
      await session.admin.from("faculty_profiles").update({ visibility: "public" }).eq("user_id", id);
      return NextResponse.json({ success: true, action: "unhidden" });
    }
    case "revoke": {
      await session.admin.from("faculty_profiles").update({
        estado_perfil: "rechazado",
        is_verified: false,
        verificado_en: new Date().toISOString(),
      }).eq("user_id", id);
      return NextResponse.json({ success: true, action: "revoked" });
    }
    case "activate": {
      const { force } = payload;
      if (!force) {
        const { data: fp } = await session.admin
          .from("faculty_profiles")
          .select("onboarding_status")
          .eq("user_id", id)
          .maybeSingle();
        if (fp?.onboarding_status !== "completed") {
          return NextResponse.json({ error: "ONBOARDING_INCOMPLETE" }, { status: 409 });
        }
      }
      await ensureProfileSlug(session.admin, id);

      await session.admin.from("faculty_profiles").update({
        estado_perfil: "verificado",
        is_verified: true,
        verificado_por: session.userId,
        verificado_en: new Date().toISOString(),
      }).eq("user_id", id);
      return NextResponse.json({ success: true, action: "activated" });
    }
    case "delete": {
      await session.admin.auth.admin.deleteUser(id);
      return NextResponse.json({ success: true, action: "deleted" });
    }
    case "send_notification": {
      const { type, subject, body: notifBody, sendEmail } = payload;
      if (!subject) {
        return NextResponse.json({ error: "Subject is required" }, { status: 400 });
      }

      let emailLogId: string | null = null;

      if (sendEmail) {
        const { data: facultyUser } = await session.admin
          .from("user_profiles")
          .select("full_name, email")
          .eq("id", id)
          .single();

        const { data: authUser } = await session.admin.auth.admin.getUserById(id);
        const facultyEmail = facultyUser?.email || authUser?.user?.email;

        if (facultyEmail) {
          const name = facultyUser?.full_name?.split(" ")[0] || "Docente";
          const html = buildNotificationHtml(name, subject, notifBody || subject);

          await resend.emails.send({
            from: FROM,
            to: [facultyEmail],
            subject,
            html,
          });

          const { data: logEntry } = await session.admin
            .from("email_logs")
            .insert({
              recipient_id: id,
              recipient_email: facultyEmail,
              template: type || "admin_message",
              subject,
              metadata: { admin_id: session.userId },
            })
            .select("id")
            .single();

          emailLogId = logEntry?.id || null;
        }
      }

      await session.admin.from("admin_notifications").insert({
        faculty_id: id,
        type: type || "admin_message",
        subject,
        body: notifBody || subject,
        admin_id: session.userId,
        email_log_id: emailLogId,
      });

      return NextResponse.json({ success: true, action: "notification_sent" });
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
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