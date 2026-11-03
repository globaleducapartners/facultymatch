import { createClient, createAdminClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { firstNameOf } from "@/lib/emails/templates";

// Un envío personalizado va de uno en uno (unos 0,5 s por correo).
export const maxDuration = 60;

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

  const { subject, body, segment, test } = await request.json();
  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Subject and body are required" }, { status: 400 });
  }

  // Get user emails by segment — also build email→id map for logging
  let emails: string[] = [];
  const emailToId: Record<string, string> = {};

  // Build map of email → user_id from auth for logging
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  (authData?.users ?? []).forEach((u) => {
    if (u.email) emailToId[u.email] = u.id;
  });

  if (segment === "faculty" || segment === "all") {
    const { data: facultyUsers } = await admin.from("user_profiles").select("id").eq("role", "faculty").limit(1000);
    if (facultyUsers?.length) {
      const ids = facultyUsers.map(u => u.id);
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
      const instEmails = (authData?.users ?? [])
        .filter(u => instIds.includes(u.id) && u.email)
        .map(u => u.email!);
      // Also add contact_emails that aren't in auth, and map them
      const directEmails = instUsers.map(u => u.contact_email).filter(Boolean) as string[];
      directEmails.forEach((e) => {
        if (!emailToId[e]) {
          const matchingUser = instUsers.find((u: any) => u.contact_email === e && u.user_id);
          if (matchingUser?.user_id) emailToId[e] = matchingUser.user_id;
        }
      });
      const allInstEmails = [...new Set([...instEmails, ...directEmails])];
      emails.push(...allInstEmails);
    }
  }

  // Deduplicate
  emails = [...new Set(emails)].filter(Boolean);
  // Cuentas de prueba internas: nunca reciben envíos masivos.
  emails = emails.filter((e) => !/prueba|@facultymatch\.app$/i.test(e));

  if (emails.length === 0 && !test) {
    return NextResponse.json({ error: "No recipients found" }, { status: 400 });
  }

  // Etiquetas personalizables: {{nombre}} (nombre de pila) y {{enlace}} (enlace personal
  // de invitación de cada docente). Si el texto no las usa, el envío es el de siempre.
  const personalised = /\{\{\s*(nombre|enlace)\s*\}\}/i.test(`${subject} ${body}`);
  const escapeHtml = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const renderBody = (t: string) =>
    escapeHtml(t)
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#1B4FD8;">$1</a>')
      .replace(/\n/g, "<br/>");
  const fill = (t: string, name: string, link: string) =>
    t
      .replace(/\s*\{\{\s*nombre\s*\}\}/gi, name ? ` ${name}` : "")
      .replace(/\{\{\s*enlace\s*\}\}/gi, link)
      .replace(/^\s+/, "");

  const buildHtml = (text: string) => `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:48px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <!-- Logo header -->
  <tr><td style="background:#0D2240;padding:28px 40px;text-align:center;border-radius:16px 16px 0 0;">
    <span style="color:#fff;font-size:24px;font-weight:900;letter-spacing:2px;text-transform:uppercase;"><img src="https://www.facultymatch.app/icon-192.png" width="26" height="26" alt="" style="vertical-align:middle;border-radius:6px;margin-right:8px;">facultymatch</span>
    <p style="margin:6px 0 0;color:#94a3b8;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">La plataforma académica de referencia</p>
  </td></tr>
  <!-- Accent bar -->
  <tr><td style="background:linear-gradient(90deg,#1B4FD8,#1d4ed8);height:3px;"></td></tr>
  <!-- Body -->
  <tr><td style="background:#ffffff;padding:48px 40px;">
    <div style="color:#1e293b;font-size:15px;line-height:1.8;">${renderBody(text)}</div>
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #f1f5f9;">
      <a href="https://www.facultymatch.app/app" style="display:inline-block;background:#1B4FD8;color:#ffffff;padding:14px 28px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;">
        Acceder a mi cuenta →
      </a>
    </div>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;border-radius:0 0 16px 16px;">
    <p style="margin:0;font-size:12px;color:#64748b;font-weight:600;">FacultyMatch · <a href="https://www.facultymatch.app" style="color:#1B4FD8;text-decoration:none;">www.facultymatch.app</a></p>
    <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;">Grupo Global Educa SL · <a href="mailto:support@facultymatch.app" style="color:#94a3b8;text-decoration:none;">support@facultymatch.app</a></p>
    <p style="margin:8px 0 0;font-size:10px;color:#cbd5e1;">Has recibido este email porque estás registrado en FacultyMatch. Para darte de baja escribe a support@facultymatch.app</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  // ── Prueba: solo al propio administrador, con datos de ejemplo ──────────────
  if (test) {
    const { data: me } = await admin.from("user_profiles").select("full_name").eq("id", user.id).maybeSingle();
    const link = `https://www.facultymatch.app/signup?ref=${user.id}`;
    try {
      await resend.emails.send({
        from: FROM,
        to: [user.email!],
        reply_to: "support@facultymatch.app",
        subject: `[PRUEBA] ${fill(subject, firstNameOf(me?.full_name), link)}`,
        html: buildHtml(fill(body, firstNameOf(me?.full_name), link)),
      });
      return NextResponse.json({ success: true, sent: 1, errors: 0, total: 1, testTo: user.email });
    } catch {
      return NextResponse.json({ error: "No se pudo enviar la prueba" }, { status: 500 });
    }
  }

  // ── Envío personalizado: uno a uno, con nombre y enlace propios ───────────
  if (personalised) {
    const ids = Object.values(emailToId);
    const { data: profs } = await admin.from("user_profiles").select("id, full_name").in("id", ids);
    const nameById = new Map((profs || []).map((p: any) => [p.id, p.full_name as string | null]));
    let okCount = 0;
    let failCount = 0;
    const sentEmails: string[] = [];
    for (const email of emails) {
      const uid = emailToId[email];
      const name = firstNameOf(uid ? nameById.get(uid) : "");
      const link = uid ? `https://www.facultymatch.app/signup?ref=${uid}` : "https://www.facultymatch.app";
      try {
        await resend.emails.send({
          from: FROM,
          to: [email],
          reply_to: "support@facultymatch.app",
          subject: fill(subject, name, link),
          html: buildHtml(fill(body, name, link)),
        });
        okCount++;
        sentEmails.push(email);
      } catch {
        failCount++;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    const entries = sentEmails.map((email) => ({
      recipient_id: emailToId[email] || null,
      recipient_email: email,
      template: "broadcast",
      subject,
      metadata: { admin_id: user.id, segment: segment || null, personalised: true },
    }));
    for (let i = 0; i < entries.length; i += 100) {
      try { await admin.from("email_logs").insert(entries.slice(i, i + 100)); } catch {}
    }
    return NextResponse.json({ success: true, sent: okCount, errors: failCount, total: emails.length });
  }

  // Resend supports up to 50 recipients per call — batch if needed
  const BATCH_SIZE = 50;
  let sent = 0;
  let errors = 0;

  // Use BCC so recipients never see each other's email addresses.
  // Visible "to" is always support@facultymatch.app.
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);
    try {
      await resend.emails.send({
        from: FROM,
        to: ["support@facultymatch.app"],
        bcc: batch,
        reply_to: "support@facultymatch.app",
        subject,
        html: buildHtml(body),
      });
      sent += batch.length;
    } catch {
      errors += batch.length;
    }
  }

  // Log all sent emails to email_logs
  const logEntries = emails.map((email) => ({
    recipient_id: emailToId[email] || null,
    recipient_email: email,
    template: "broadcast",
    subject,
    metadata: { admin_id: user.id, segment: segment || null },
  }));

  // Insert in batches of 100
  for (let i = 0; i < logEntries.length; i += 100) {
    const batch = logEntries.slice(i, i + 100);
    try { await admin.from("email_logs").insert(batch); } catch {}
  }

  return NextResponse.json({ success: true, sent, errors, total: emails.length });
}
