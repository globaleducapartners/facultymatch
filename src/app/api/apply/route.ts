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
    let magicLinkUrl = `https://www.facultymatch.app/signup?email=${encodeURIComponent(email)}`;
    try {
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo: `${SITE_URL}/auth/callback?next=/app/faculty` },
      });
      if (!linkError && linkData?.properties?.action_link) {
        magicLinkUrl = linkData.properties.action_link;
      }
    } catch (e) {
      console.warn("[apply] generateLink error:", e);
    }

    // 3. Send welcome email via Resend
    const firstName = full_name.split(" ")[0];
    const html = buildWelcomeEmail(firstName, email, magicLinkUrl);

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

function buildWelcomeEmail(firstName: string, email: string, magicLinkUrl: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden;">

  <!-- Header -->
  <tr><td style="background:#0B1220;padding:32px 40px;text-align:center;">
    <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">
      FACULTY<span style="color:#2563EB;">MATCH</span>
    </span>
    <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:4px 0 0;letter-spacing:2px;text-transform:uppercase;">
      Conectando Talento Académico
    </p>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:40px;">

    <!-- Check icon -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:64px;height:64px;border-radius:50%;
                  background:#DCFCE7;border:2px solid #22C55E;line-height:64px;
                  font-size:28px;text-align:center;">✓</div>
    </div>

    <h1 style="color:#0B1220;font-size:26px;font-weight:900;margin:0 0 8px;text-align:center;">
      ¡Perfil recibido, ${firstName}!
    </h1>
    <p style="color:#64748B;font-size:16px;text-align:center;margin:0 0 32px;line-height:1.6;">
      Hemos guardado tus datos correctamente.<br>
      <strong style="color:#0B1220;">Ahora crea tu acceso para gestionar tu perfil.</strong>
    </p>

    <!-- CTA principal — Crear contraseña -->
    <div style="text-align:center;margin-bottom:16px;">
      <a href="${magicLinkUrl}"
         style="display:inline-block;background:#F97316;color:#fff;
                padding:18px 40px;border-radius:12px;font-weight:900;
                font-size:17px;text-decoration:none;letter-spacing:0.3px;">
        Activar mi cuenta →
      </a>
    </div>
    <p style="text-align:center;font-size:13px;color:#94A3B8;margin:0 0 32px;">
      Este enlace es personal y expira en 24 horas
    </p>

    <!-- Separador -->
    <div style="border-top:1px solid #E2E8F0;margin:24px 0;"></div>

    <!-- Qué pasa después -->
    <p style="color:#0B1220;font-weight:700;font-size:14px;margin:0 0 12px;">
      ¿Qué pasa cuando actives tu cuenta?
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#64748B;vertical-align:top;">
          <span style="color:#2563EB;font-weight:900;">01</span>
        </td>
        <td style="padding:8px 0 8px 12px;font-size:14px;color:#64748B;">
          Tus datos del formulario ya estarán en tu perfil. No tendrás que rellenar nada de nuevo.
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#64748B;vertical-align:top;">
          <span style="color:#2563EB;font-weight:900;">02</span>
        </td>
        <td style="padding:8px 0 8px 12px;font-size:14px;color:#64748B;">
          Nuestro equipo revisará tu perfil. Recibirás confirmación en 48-72 horas.
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#64748B;vertical-align:top;">
          <span style="color:#2563EB;font-weight:900;">03</span>
        </td>
        <td style="padding:8px 0 8px 12px;font-size:14px;color:#64748B;">
          Una vez aprobado, las instituciones podrán encontrarte y contactarte.
        </td>
      </tr>
    </table>

    <!-- Nota si el enlace no funciona -->
    <div style="background:#F1F5F9;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#64748B;line-height:1.6;">
        ¿El botón no funciona? También puedes acceder en
        <a href="https://www.facultymatch.app/login"
           style="color:#2563EB;font-weight:700;">www.facultymatch.app/login</a>
        con tu email <strong>${email}</strong>
        usando la opción "Continuar con Google" o solicitando un enlace de acceso.
      </p>
    </div>

  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:24px 40px;border-top:1px solid #E2E8F0;text-align:center;">
    <p style="margin:0;font-size:12px;color:#94A3B8;">
      FacultyMatch by Grupo Global Educa SL ·
      <a href="https://www.facultymatch.app" style="color:#94A3B8;">www.facultymatch.app</a> ·
      <a href="mailto:info@facultymatch.app" style="color:#94A3B8;">info@facultymatch.app</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
