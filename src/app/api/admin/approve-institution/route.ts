import { createClient, createAdminClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "FacultyMatch <noreply@facultymatch.app>";
const SITE = "https://www.facultymatch.app";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: adminProfile } = await admin.from("user_profiles").select("role").eq("id", user.id).single();
  if (!adminProfile || (adminProfile.role !== "admin" && adminProfile.role !== "super_admin"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { institutionId, action } = await request.json();
  if (!institutionId || !action) return NextResponse.json({ error: "Missing data" }, { status: 400 });

  // "active" on approve so the institution appears correctly in all stats/badges
  const newStatus = action === "approve" ? "active" : "rejected";
  const { error } = await admin.from("institutions")
    .update({ status: newStatus, verified_at: action === "approve" ? new Date().toISOString() : null })
    .eq("id", institutionId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (action === "approve") {
    const { data: inst } = await admin.from("institutions").select("name, contact_email, user_id").eq("id", institutionId).single();
    const { data: authUser } = inst?.user_id ? await admin.auth.admin.getUserById(inst.user_id) : { data: null };
    const email = inst?.contact_email || authUser?.user?.email;
    const name = inst?.name || "vuestra institución";

    if (email) {
      resend.emails.send({
        from: FROM,
        to: [email],
        subject: `✅ ${name} ha sido aprobada en FacultyMatch`,
        html: buildApprovalEmail(name),
      }).catch(() => {});
    }
    resend.emails.send({
      from: FROM,
      to: ["support@facultymatch.app"],
      subject: `✅ Institución aprobada: ${name}`,
      html: `<p><strong>${name}</strong> aprobada. ID: ${institutionId}. Email: ${email || "—"}</p>`,
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
}

function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;max-width:600px;">
  <tr><td style="background:#0B1220;padding:28px 40px;text-align:center;">
    <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:1px;">FACULTY<span style="color:#2563EB;">MATCH</span></span>
  </td></tr>
  <tr><td style="padding:40px;">${content}</td></tr>
  <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:12px;color:#94a3b8;">FacultyMatch · <a href="${SITE}" style="color:#94a3b8;">${SITE.replace("https://","")}</a></p>
    <p style="margin:4px 0 0;font-size:11px;color:#cbd5e1;">Grupo Global Educa SL · support@facultymatch.app</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function buildApprovalEmail(name: string) {
  return emailWrapper(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:#dcfce7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:32px;">✅</span>
      </div>
      <h1 style="margin:0;color:#0B1220;font-size:26px;font-weight:900;">¡${name} ha sido aprobada!</h1>
      <p style="color:#64748b;font-size:16px;margin:12px 0 0;line-height:1.6;">
        Hemos revisado vuestra institución y ya forma parte de la <strong style="color:#0B1220;">red verificada de FacultyMatch</strong>.
      </p>
    </div>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:24px;margin-bottom:28px;">
      <p style="margin:0 0 12px;font-weight:900;color:#1d4ed8;font-size:14px;text-transform:uppercase;letter-spacing:1px;">¿Qué significa esto?</p>
      <ul style="margin:0;padding:0 0 0 20px;color:#1e40af;font-size:14px;line-height:2;">
        <li>Podéis buscar y contactar docentes verificados de inmediato</li>
        <li>Vuestro perfil institucional ya es visible para los docentes</li>
        <li>Tenéis acceso completo al directorio de talento académico</li>
      </ul>
    </div>
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${SITE}/app/institution" style="display:inline-block;background:#F97316;color:#fff;padding:16px 36px;border-radius:12px;font-weight:900;font-size:16px;text-decoration:none;">
        Acceder al panel de institución →
      </a>
    </div>
    <div style="border-top:1px solid #f1f5f9;padding-top:24px;">
      <p style="margin:0 0 16px;font-weight:900;color:#0B1220;font-size:14px;">Próximos pasos recomendados:</p>
      ${[
        ["01", "Completa tu perfil institucional al 100%"],
        ["02", "Explora el directorio de docentes verificados"],
        ["03", "Crea tu primera shortlist de candidatos"],
      ].map(([n, t]) => `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <span style="background:#0B1220;color:#fff;font-weight:900;font-size:12px;padding:4px 10px;border-radius:8px;flex-shrink:0;">${n}</span>
        <span style="color:#475569;font-size:14px;">${t}</span>
      </div>`).join("")}
    </div>
    <p style="text-align:center;color:#94a3b8;font-size:13px;margin-top:24px;">¿Tienes dudas? Escríbenos a <a href="mailto:support@facultymatch.app" style="color:#2563EB;">support@facultymatch.app</a></p>
  `);
}
