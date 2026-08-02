import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase-server";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "FacultyMatch <noreply@facultymatch.app>";

// Única dirección de aviso interno — antes había 3 sitios distintos que
// avisaban de un registro nuevo, dos de ellos a support@facultymatch.app y
// uno a esta. Se unifica aquí en vez de mantener el mismo HTML duplicado en
// cada sitio.
export const ADMIN_NOTIFY_EMAIL = "director@globaleducapartners.com";

function wrapEmail(title: string, rows: Array<[string, string]>): string {
  const rowsHtml = rows
    .map(
      ([label, value], i) => `
      <tr><td style="padding:16px 20px;${i < rows.length - 1 ? "border-bottom:1px solid #e2e8f0;" : ""}">
        <p style="margin:0;font-size:11px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">${label}</p>
        <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#0B1220;">${value}</p>
      </td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;max-width:600px;">
  <tr><td style="background:#0B1220;padding:24px 40px;text-align:center;">
    <span style="color:#fff;font-size:20px;font-weight:900;">FACULTY<span style="color:#2563EB;">MATCH</span></span>
  </td></tr>
  <tr><td style="padding:36px 40px;">
    <h2 style="margin:0 0 16px;color:#0B1220;font-size:22px;font-weight:900;">${title}</h2>
    <table cellpadding="0" cellspacing="0" width="100%" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px;">
      ${rowsHtml}
    </table>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:12px;color:#94a3b8;">FacultyMatch · <a href="https://www.facultymatch.app" style="color:#94a3b8;">www.facultymatch.app</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export async function notifyAdminNewRegistration(params: {
  role: "faculty" | "institution";
  name: string;
  email: string;
  institutionName?: string | null;
  institutionType?: string | null;
  country?: string | null;
  city?: string | null;
}) {
  const { role, name, email, institutionName, institutionType, country, city } = params;
  const rows: Array<[string, string]> = [
    ["Nombre", name],
    ["Email", email],
    ["Tipo", role === "institution" ? "Institución" : "Docente"],
  ];
  if (institutionName) rows.push(["Institución", institutionName]);
  if (institutionType) rows.push(["Tipo de institución", institutionType]);
  if (city || country) rows.push(["Ubicación", [city, country].filter(Boolean).join(", ")]);

  try {
    await resend.emails.send({
      from: FROM,
      to: [ADMIN_NOTIFY_EMAIL],
      subject: `🎉 Nuevo registro en FacultyMatch: ${name}`,
      html: wrapEmail("Nuevo registro 🎉", rows),
    });
  } catch (e) {
    console.warn("[notifyAdminNewRegistration] failed:", e);
  }
}

// Aviso al admin de que un perfil docente necesita revisión — antes nadie
// se enteraba salvo entrando al panel; se dispara desde los 3 sitios que
// escriben estado_perfil = 'en_revision' por una acción del propio docente
// (publicar tras el onboarding, pedir verificación, o editar un campo
// sensible de un perfil ya verificado). No se dispara cuando es el propio
// admin quien reactiva un perfil rechazado — de eso ya se ha enterado.
export async function notifyAdminProfileNeedsReview(facultyId: string) {
  try {
    const admin = createAdminClient();
    const { data: fp } = await admin
      .from("faculty_profiles")
      .select("user_id, headline")
      .eq("id", facultyId)
      .maybeSingle();
    if (!fp) return;

    const { data: up } = await admin
      .from("user_profiles")
      .select("full_name, email")
      .eq("id", fp.user_id)
      .maybeSingle();

    const name = up?.full_name || "Docente";
    const rows: Array<[string, string]> = [
      ["Nombre", name],
      ["Email", up?.email || "—"],
    ];
    if (fp.headline) rows.push(["Titular del perfil", fp.headline]);

    await resend.emails.send({
      from: FROM,
      to: [ADMIN_NOTIFY_EMAIL],
      subject: `📋 Perfil pendiente de revisión: ${name}`,
      html: wrapEmail("Un perfil necesita revisión", rows),
    });
  } catch (e) {
    console.warn("[notifyAdminProfileNeedsReview] failed:", e);
  }
}
