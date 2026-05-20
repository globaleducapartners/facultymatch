"use server";

import { createClient, createAdminClient } from "@/lib/supabase-server";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "FacultyMatch <noreply@facultymatch.app>";

export async function sendFollowUp(contactId: string, message: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const admin = createAdminClient();

  // Verify institution owns this contact
  const { data: contact } = await admin
    .from("contacts")
    .select("*, institution:institutions(id, name, contact_email, user_id)")
    .eq("id", contactId)
    .single();

  if (!contact) return { error: "Contacto no encontrado" };

  const inst = contact.institution as any;
  if (inst?.user_id !== user.id) return { error: "No autorizado" };

  // Get faculty email
  const admin2 = createAdminClient();
  const { data: facultyAuth } = await admin2.auth.admin.getUserById(contact.faculty_id);
  const facultyEmail = facultyAuth?.user?.email;

  // Get faculty name
  const { data: fp } = await admin
    .from("user_profiles")
    .select("full_name")
    .eq("id", contact.faculty_id)
    .single();
  const facultyName = fp?.full_name || "Docente";

  if (facultyEmail) {
    try {
      await resend.emails.send({
        from: FROM,
        to: [facultyEmail],
        reply_to: inst?.contact_email || user.email || undefined,
        subject: `💬 ${inst?.name || "Una institución"} te ha enviado un seguimiento en FacultyMatch`,
        html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;max-width:600px;overflow:hidden;">
  <tr><td style="background:#0B1220;padding:28px 40px;text-align:center;">
    <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:1px;">FACULTY<span style="color:#2563EB;">MATCH</span></span>
  </td></tr>
  <tr><td style="padding:40px;">
    <h2 style="margin:0 0 8px;color:#0B1220;font-size:20px;font-weight:900;">Nuevo mensaje de ${inst?.name || "una institución"}</h2>
    <p style="color:#64748b;font-size:15px;margin:0 0 24px;">Hola ${facultyName}, tienes un nuevo mensaje de seguimiento:</p>
    <div style="background:#EFF6FF;border-left:3px solid #2563EB;border-radius:0 8px 8px 0;padding:20px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#0B1220;line-height:1.7;">${message.replace(/\n/g, "<br>")}</p>
    </div>
    <a href="https://www.facultymatch.app/app/faculty/requests"
       style="display:inline-block;background:#2563EB;color:#fff;padding:14px 28px;border-radius:10px;font-weight:700;text-decoration:none;font-size:15px;">
      Ver en mi panel →
    </a>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:12px;color:#94a3b8;">FacultyMatch · <a href="https://www.facultymatch.app" style="color:#94a3b8;">www.facultymatch.app</a></p>
    <p style="margin:4px 0 0;font-size:11px;color:#cbd5e1;">Grupo Global Educa SL · support@facultymatch.app</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
      });
    } catch (e) {
      console.warn("[sendFollowUp] Email failed:", e);
    }
  }

  revalidatePath("/app/institution/contacts");
  return { success: true };
}
