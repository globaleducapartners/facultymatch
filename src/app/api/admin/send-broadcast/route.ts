import { createClient, createAdminClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "FacultyMatch <noreply@facultymatch.app>";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: adminProfile } = await admin.from("user_profiles").select("role").eq("id", user.id).single();
  if (!adminProfile || (adminProfile.role !== "admin" && adminProfile.role !== "super_admin"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { subject, body, segment } = await request.json();
  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Subject and body are required" }, { status: 400 });
  }

  // Get user emails by segment
  let emails: string[] = [];

  if (segment === "faculty" || segment === "all") {
    const { data: facultyUsers } = await admin.from("user_profiles").select("id").eq("role", "faculty").limit(1000);
    if (facultyUsers?.length) {
      const ids = facultyUsers.map(u => u.id);
      const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
      const facultyEmails = (authData?.users ?? [])
        .filter(u => ids.includes(u.id) && u.email)
        .map(u => u.email!);
      emails.push(...facultyEmails);
    }
  }

  if (segment === "institution" || segment === "all") {
    const { data: instUsers } = await admin.from("institutions").select("contact_email, user_id").limit(500);
    if (instUsers?.length) {
      const instIds = instUsers.map(u => u.user_id).filter(Boolean);
      const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
      const instEmails = (authData?.users ?? [])
        .filter(u => instIds.includes(u.id) && u.email)
        .map(u => u.email!);
      // Merge with contact_email
      const directEmails = instUsers.map(u => u.contact_email).filter(Boolean) as string[];
      const allInstEmails = [...new Set([...instEmails, ...directEmails])];
      emails.push(...allInstEmails);
    }
  }

  // Deduplicate
  emails = [...new Set(emails)].filter(Boolean);

  if (emails.length === 0) {
    return NextResponse.json({ error: "No recipients found" }, { status: 400 });
  }

  const htmlBody = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;max-width:600px;">
  <tr><td style="background:#0B1220;padding:28px 40px;text-align:center;">
    <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:1px;">FACULTY<span style="color:#2563EB;">MATCH</span></span>
  </td></tr>
  <tr><td style="padding:40px;">
    <div style="color:#334155;font-size:15px;line-height:1.7;">${body.replace(/\n/g, "<br/>")}</div>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:12px;color:#94a3b8;">FacultyMatch · www.facultymatch.app</p>
    <p style="margin:4px 0 0;font-size:11px;color:#cbd5e1;">Grupo Global Educa SL · support@facultymatch.app</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  // Resend supports up to 50 recipients per call — batch if needed
  const BATCH_SIZE = 50;
  let sent = 0;
  let errors = 0;

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);
    try {
      await resend.emails.send({
        from: FROM,
        to: batch,
        subject,
        html: htmlBody,
      });
      sent += batch.length;
    } catch {
      errors += batch.length;
    }
  }

  return NextResponse.json({ success: true, sent, errors, total: emails.length });
}
