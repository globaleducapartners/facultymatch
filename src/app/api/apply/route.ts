import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://facultymatch.app";
const FROM = process.env.RESEND_FROM_EMAIL || "FacultyMatch <noreply@facultymatch.app>";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { full_name, email, ...rest } = body;

    if (!full_name || !email) {
      return NextResponse.json({ error: "Nombre y email son obligatorios." }, { status: 400 });
    }

    // 1. Insert into faculty_leads (service role bypasses RLS)
    const { error: insertError } = await supabaseAdmin
      .from("faculty_leads")
      .insert([{ full_name, email, ...rest }]);

      if (insertError) {
        // If duplicate email, still treat as success (idempotent)
        if (!insertError.message.includes("duplicate") && !insertError.message.includes("unique")) {
          console.error("[apply] Insert error:", insertError.message, insertError.code, insertError.details);
          return NextResponse.json({ error: `DB: ${insertError.message} (${insertError.code})` }, { status: 500 });
        }
      }

    // 2. Generate magic link for the user
    let magicLinkUrl = `${SITE_URL}/login`;
    try {
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo: `${SITE_URL}/auth/callback?next=/dashboard` },
      });
      if (!linkError && linkData?.properties?.action_link) {
        magicLinkUrl = linkData.properties.action_link;
      }
    } catch (e) {
      console.warn("[apply] generateLink error:", e);
    }

    // 3. Send welcome email via Resend
    const firstName = full_name.split(" ")[0];
    const html = buildWelcomeEmail(firstName, magicLinkUrl);

    try {
      await resend.emails.send({
        from: FROM,
        to: [email],
        subject: `¡Tu perfil en FacultyMatch ha sido recibido, ${firstName}!`,
        html,
      });
    } catch (emailErr) {
      // Email failure is non-fatal — lead is already saved
      console.warn("[apply] Email send failed:", emailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[apply] Unexpected error:", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

function buildWelcomeEmail(firstName: string, magicLinkUrl: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="padding-bottom:32px;">
          <a href="${SITE_URL}" style="text-decoration:none;">
            <span style="font-size:22px;font-weight:900;color:#1E3A5F;">Faculty<span style="color:#FF6B2C;">Match</span></span>
          </a>
        </td></tr>
        <tr><td style="background:#ffffff;border-radius:20px;border:1px solid #E8EDF2;overflow:hidden;">
          <table width="100%"><tr><td style="background:linear-gradient(90deg,#1E3A5F 0%,#2563EB 100%);height:6px;"></td></tr></table>
          <table width="100%"><tr><td style="padding:40px 48px 32px;">
            <p style="margin:0 0 8px;font-size:28px;font-weight:900;color:#1E3A5F;">¡Hola, ${firstName}!</p>
            <p style="margin:0 0 24px;font-size:16px;color:#64748B;line-height:1.6;font-weight:500;">
              Tu perfil docente ha sido recibido en <strong style="color:#1E3A5F;">FacultyMatch</strong>.
              Nuestro equipo lo revisará en las próximas <strong>48 horas</strong>.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;border-radius:12px;padding:20px 24px;margin-bottom:32px;">
              <tr><td>
                <p style="margin:0 0 12px;font-size:11px;font-weight:800;color:#94A3B8;letter-spacing:0.1em;text-transform:uppercase;">Próximos pasos</p>
                  <p style="margin:0 0 8px;font-size:14px;color:#475569;font-weight:500;">1. Haz clic en el botón de abajo para confirmar tu correo y acceder a tu perfil.</p>
                <p style="margin:0 0 8px;font-size:14px;color:#475569;font-weight:500;">2. Revisaremos tu experiencia y verificaremos tus credenciales.</p>
                <p style="margin:0;font-size:14px;color:#475569;font-weight:500;">3. Tu perfil será visible para instituciones universitarias verificadas.</p>
              </td></tr>
            </table>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
              <tr><td style="background:#FF6B2C;border-radius:12px;text-align:center;">
                <a href="${magicLinkUrl}" style="display:inline-block;padding:16px 40px;font-size:15px;font-weight:900;color:#ffffff;text-decoration:none;">
                  Acceder a mi perfil →
                </a>
              </td></tr>
            </table>
            <p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.6;">
              Este enlace es válido durante 1 hora. Si no solicitaste este registro, ignora este email.
            </p>
          </td></tr></table>
        </td></tr>
        <tr><td align="center" style="padding-top:24px;">
          <p style="margin:0;font-size:12px;color:#94A3B8;">
            © ${new Date().getFullYear()} FacultyMatch by Grupo Global Educa SL ·
            <a href="${SITE_URL}/privacy" style="color:#94A3B8;text-decoration:underline;">Privacidad</a> ·
            <a href="${SITE_URL}/terms" style="color:#94A3B8;text-decoration:underline;">Términos</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
