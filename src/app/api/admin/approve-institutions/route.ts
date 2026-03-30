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
  const { data: adminProfile } = await admin
    .from("user_profiles").select("role").eq("id", user.id).single();

  if (!adminProfile || (adminProfile.role !== "admin" && adminProfile.role !== "super_admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { institutionId, action } = await request.json();
  if (!institutionId || !action) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const newStatus = action === "approve" ? "active" : "blocked";

  const { error } = await admin
    .from("institutions")
    .update({ 
      status: newStatus,
      verified_at: action === "approve" ? new Date().toISOString() : null
    })
    .eq("id", institutionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Si se aprueba, enviar email a la institución y a support
  if (action === "approve") {
    const { data: inst } = await admin
      .from("institutions")
      .select("name, contact_email, user_id")
      .eq("id", institutionId)
      .single();

    const { data: authUser } = inst?.user_id 
      ? await admin.auth.admin.getUserById(inst.user_id) 
      : { data: null };

    const email = inst?.contact_email || authUser?.user?.email;
    const name = inst?.name || "tu institución";

    if (email) {
      resend.emails.send({
        from: FROM,
        to: [email],
        subject: `✅ ${name} ha sido aprobada en FacultyMatch`,
        html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
<tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;max-width:600px;">
<tr><td style="background:#0B1220;padding:24px 40px;text-align:center;border-radius:16px 16px 0 0;">
  <span style="color:#fff;font-size:20px;font-weight:900;">FACULTY<span style="color:#2563EB;">MATCH</span></span>
</td></tr>
<tr><td style="padding:40px;">
  <h2 style="margin:0 0 12px;color:#0B1220;font-size:22px;font-weight:900;">¡Cuenta aprobada!</h2>
  <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0 0 8px;">
    Hola, nos complace comunicarte que <strong style="color:#0B1220;">${name}</strong> ha sido verificada 
    y aprobada en FacultyMatch.
  </p>
  <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0 0 24px;">
    Ya puedes acceder a tu panel institucional y empezar a buscar y contactar docentes.
  </p>
  <a href="https://www.facultymatch.app/app/institution" style="display:inline-block;background:#2563EB;color:#fff;padding:14px 28px;border-radius:10px;font-weight:700;text-decoration:none;">
    Acceder al panel →
  </a>
</td></tr>
<tr><td style="background:#f8fafc;padding:16px 40px;text-align:center;border-top:1px solid #e2e8f0;border-radius:0 0 16px 16px;">
  <p style="margin:0;font-size:11px;color:#94a3b8;">FacultyMatch · www.facultymatch.app</p>
</td></tr>
</table></td></tr></table>
</body></html>`,
      }).catch(e => console.warn("[approve-institution] email failed:", e));
    }

    resend.emails.send({
      from: FROM,
      to: ["support@facultymatch.app"],
      subject: `✅ Institución aprobada: ${name}`,
      html: `<p>Has aprobado la institución <strong>${name}</strong>.<br>Email: ${email}<br>ID: ${institutionId}</p>
             <p><a href="https://www.facultymatch.app/control/institutions">Ver panel →</a></p>`,
    }).catch(() => {});
  }

  return NextResponse.json({ success: true, status: newStatus });
}