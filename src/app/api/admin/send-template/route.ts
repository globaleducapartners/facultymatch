import { createClient, createAdminClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "FacultyMatch <noreply@facultymatch.app>";

const TEMPLATES: Record<string, { subject: string; body: string }> = {
  upload_avatar: {
    subject: "Mejora tu perfil — sube tu foto",
    body: "Te invitamos a subir una foto de perfil para mejorar tu visibilidad en FacultyMatch. Los perfiles con foto profesional reciben más visitas de instituciones interesadas.",
  },
  complete_profile: {
    subject: "Completa tu perfil al 100%",
    body: "Tu perfil está incompleto. Te recomendamos completar toda la información académica y profesional para aparecer primero en los resultados de búsqueda de las instituciones.",
  },
  upload_documents: {
    subject: "Sube tus documentos académicos",
    body: "Para completar tu proceso de verificación, necesitamos que subas tus documentos académicos (títulos, certificados, acreditaciones, etc.) desde la sección de documentos de tu perfil.",
  },
  upload_banner: {
    subject: "Añade una imagen de portada a tu perfil",
    body: "Personaliza tu perfil con una imagen de portada (banner). Esto hará que tu perfil destaque frente a las instituciones que visiten tu página.",
  },
  admin_message: {
    subject: "Mensaje del equipo de FacultyMatch",
    body: "Hemos publicado una actualización importante en la plataforma. Por favor, revisa tu perfil para mantenerlo actualizado.",
  },
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: adminProfile } = await admin
    .from("user_profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!adminProfile || (adminProfile.role !== "admin" && adminProfile.role !== "super_admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { template: templateKey, facultyIds, subject: customSubject, body: customBody, segment } = await request.json();

  let targetIds: string[] = [];
  let targetEmails: string[] = [];

  // Determine recipients
  if (facultyIds && Array.isArray(facultyIds) && facultyIds.length > 0) {
    targetIds = facultyIds;
    // Fetch their emails
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const userMap = new Map((authData?.users ?? []).map((u) => [u.id, u.email]));
    targetEmails = targetIds.map((id) => userMap.get(id)).filter(Boolean) as string[];

    // Also get from user_profiles
    const { data: profiles } = await admin
      .from("user_profiles")
      .select("id, email")
      .in("id", targetIds);
    if (profiles) {
      profiles.forEach((p: any) => {
        if (p.email) {
          const idx = targetIds.indexOf(p.id);
          if (idx >= 0 && !targetEmails[idx]) targetEmails[idx] = p.email;
        }
      });
    }
  } else if (segment) {
    // Build segment query
    let ids: string[] = [];

    if (segment === "all_faculty") {
      const { data: allFaculty } = await admin.from("user_profiles").select("id").eq("role", "faculty").limit(1000);
      ids = (allFaculty ?? []).map((f: any) => f.id);
    } else if (segment === "no_avatar") {
      const { data: noAvatar } = await admin.from("user_profiles").select("id").eq("role", "faculty").is("avatar_url", null).limit(1000);
      ids = (noAvatar ?? []).map((f: any) => f.id);
    } else if (segment === "incomplete_profile") {
      const { data: allFaculty } = await admin.from("user_profiles").select("id").eq("role", "faculty").limit(1000);
      const { data: fps } = await admin.from("faculty_profiles").select("user_id").not("bio", "is", null).in("user_id", (allFaculty ?? []).map((f: any) => f.id));
      const hasBio = new Set((fps ?? []).map((fp: any) => fp.user_id));
      ids = (allFaculty ?? []).filter((f: any) => !hasBio.has(f.id)).map((f: any) => f.id);
    } else if (segment === "pending_verification") {
      const { data: pending } = await admin.from("user_profiles").select("id").eq("role", "faculty").or("verification_status.eq.pending,verification_status.is.null").limit(1000);
      ids = (pending ?? []).map((f: any) => f.id);
    }

    targetIds = ids;
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const userMap = new Map((authData?.users ?? []).map((u) => [u.id, u.email]));
    targetEmails = targetIds.map((id) => userMap.get(id)).filter(Boolean) as string[];

    // Also from user_profiles
    const { data: profiles } = await admin.from("user_profiles").select("id, email").in("id", targetIds);
    if (profiles) {
      profiles.forEach((p: any) => {
        if (p.email) {
          const idx = targetIds.indexOf(p.id);
          if (idx >= 0 && !targetEmails[idx]) targetEmails[idx] = p.email;
        }
      });
    }
  }

  targetEmails = [...new Set(targetEmails)].filter(Boolean);
  if (targetEmails.length === 0) {
    return NextResponse.json({ error: "No recipients found" }, { status: 400 });
  }

  // Resolve template content
  const templateDef = TEMPLATES[templateKey] || TEMPLATES.admin_message;
  const subject = customSubject || templateDef.subject;
  const emailBody = customBody || templateDef.body;

  // Send emails in batches (BCC)
  const BATCH_SIZE = 50;
  let sent = 0;
  let errors = 0;

  for (let i = 0; i < targetEmails.length; i += BATCH_SIZE) {
    const batch = targetEmails.slice(i, i + BATCH_SIZE);
    try {
      await resend.emails.send({
        from: FROM,
        to: ["support@facultymatch.app"],
        bcc: batch,
        reply_to: "support@facultymatch.app",
        subject,
        html: buildTemplateHtml(subject, emailBody),
      });
      sent += batch.length;
    } catch {
      errors += batch.length;
    }
  }

  // Log to email_logs
  const logEntries = targetEmails.map((email, idx) => ({
    recipient_id: targetIds[idx] || null,
    recipient_email: email,
    template: templateKey,
    subject,
    metadata: {
      admin_id: user.id,
      segment: segment || null,
      template_params: { body: emailBody },
    },
  }));

  // Insert in batches
  for (let i = 0; i < logEntries.length; i += 100) {
    const batch = logEntries.slice(i, i + 100);
    try { await admin.from("email_logs").insert(batch); } catch {}
  }

  // If we have specific target IDs, also create admin_notifications for each
  if (targetIds.length > 0 && targetIds.length <= 50) {
    const notifEntries = targetIds.map((fid) => ({
      faculty_id: fid,
      type: templateKey,
      subject,
      body: emailBody,
      admin_id: user.id,
    }));
    try { await admin.from("admin_notifications").insert(notifEntries); } catch {}
  }

  return NextResponse.json({ success: true, sent, errors, total: targetEmails.length });
}

function buildTemplateHtml(subject: string, body: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
  <tr><td style="background:#0B1220;padding:28px 40px;text-align:center;">
    <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:1px;">FACULTY<span style="color:#2563EB;">MATCH</span></span>
  </td></tr>
  <tr><td style="padding:40px;">
    <h2 style="margin:0 0 16px;color:#0B1220;font-size:20px;font-weight:900;">${subject}</h2>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0;">${body.replace(/\n/g, "<br/>")}</p>
    <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f1f5f9;">
      <a href="https://www.facultymatch.app/app" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;">Ir a mi cuenta →</a>
    </div>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:12px;color:#94a3b8;">FacultyMatch · support@facultymatch.app</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}