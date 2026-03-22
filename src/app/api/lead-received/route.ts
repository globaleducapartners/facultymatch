import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://facultymatch.vercel.app";
const FROM =
  process.env.RESEND_FROM_EMAIL || "FacultyMatch <onboarding@resend.dev>";

// Admin client with service role — can generate magic links
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function buildEmail(full_name: string, magicLinkUrl: string): string {
  const firstName = full_name.split(" ")[0];

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Perfil recibido — FacultyMatch</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <a href="${SITE_URL}" style="text-decoration:none;">
                <span style="font-size:22px;font-weight:900;color:#1E3A5F;letter-spacing:-0.5px;">Faculty<span style="color:#FF6B2C;">Match</span></span>
              </a>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;border:1px solid #E8EDF2;overflow:hidden;">

              <!-- Top accent bar -->
              <tr>
                <td style="background:linear-gradient(90deg,#1E3A5F 0%,#2563EB 100%);height:6px;"></td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px 48px 32px;">

                  <p style="margin:0 0 8px;font-size:28px;font-weight:900;color:#1E3A5F;line-height:1.2;">
                    ¡Hola, ${firstName}!
                  </p>
                  <p style="margin:0 0 24px;font-size:16px;color:#64748B;line-height:1.6;font-weight:500;">
                    Tu perfil docente ha sido recibido en <strong style="color:#1E3A5F;">FacultyMatch</strong>.
                    Nuestro equipo lo revisará en las próximas <strong>48 horas</strong>.
                  </p>

                  <!-- Steps -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;border-radius:12px;padding:20px 24px;margin-bottom:32px;">
                    <tr>
                      <td>
                        <p style="margin:0 0 12px;font-size:11px;font-weight:800;color:#94A3B8;letter-spacing:0.1em;text-transform:uppercase;">Próximos pasos</p>
                        <table cellpadding="0" cellspacing="0" style="margin-bottom:10px;"><tr>
                          <td style="width:28px;vertical-align:top;padding-top:2px;"><span style="display:inline-block;width:22px;height:22px;background:#1E3A5F;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:900;color:#fff;">1</span></td>
                          <td style="font-size:14px;color:#475569;font-weight:500;line-height:1.5;">Revisaremos tu perfil y verificaremos tu experiencia.</td>
                        </tr></table>
                        <table cellpadding="0" cellspacing="0" style="margin-bottom:10px;"><tr>
                          <td style="width:28px;vertical-align:top;padding-top:2px;"><span style="display:inline-block;width:22px;height:22px;background:#1E3A5F;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:900;color:#fff;">2</span></td>
                          <td style="font-size:14px;color:#475569;font-weight:500;line-height:1.5;">Te conectaremos con instituciones que buscan tu perfil.</td>
                        </tr></table>
                        <table cellpadding="0" cellspacing="0" style="margin-bottom:10px;"><tr>
                          <td style="width:28px;vertical-align:top;padding-top:2px;"><span style="display:inline-block;width:22px;height:22px;background:#1E3A5F;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:900;color:#fff;">3</span></td>
                          <td style="font-size:14px;color:#475569;font-weight:500;line-height:1.5;">Haz clic en el botón de abajo para acceder a tu panel con todos tus datos.</td>
                        </tr></table>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA -->
                    <p style="margin:0 0 16px;font-size:15px;color:#475569;font-weight:500;">
                      Usa el enlace de abajo para acceder directamente a tu perfil en FacultyMatch.
                    </p>

                  <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                    <tr>
                      <td style="background:#FF6B2C;border-radius:12px;text-align:center;">
                        <a href="${magicLinkUrl}"
                           style="display:inline-block;padding:16px 40px;font-size:15px;font-weight:900;color:#ffffff;text-decoration:none;letter-spacing:0.01em;">
                          Acceder a mi perfil →
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.6;">
                    Este enlace es válido durante 1 hora. Si no solicitaste este registro, ignora este email.
                  </p>
                </td>
              </tr>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#94A3B8;">
                © ${new Date().getFullYear()} FacultyMatch ·
                <a href="${SITE_URL}/privacy" style="color:#94A3B8;text-decoration:underline;">Privacidad</a> ·
                <a href="${SITE_URL}/terms" style="color:#94A3B8;text-decoration:underline;">Términos</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { full_name, email } = body as { full_name: string; email: string };

    if (!full_name || !email) {
      return NextResponse.json(
        { error: "full_name and email are required" },
        { status: 400 }
      );
    }

    // Generate a real Supabase magic link so the user can access their dashboard
    // with one click from the email — no password needed.
    let magicLinkUrl = `${SITE_URL}/login`;
    try {
      const { data: linkData, error: linkError } =
        await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email,
          options: {
            redirectTo: `${SITE_URL}/auth/callback?next=/dashboard`,
          },
        });
      if (linkError) {
        console.warn("[lead-received] generateLink error:", linkError.message);
        // Fall back to login page — user can request a new magic link
        magicLinkUrl = `${SITE_URL}/login`;
      } else if (linkData?.properties?.action_link) {
        magicLinkUrl = linkData.properties.action_link;
      }
    } catch (e) {
      console.warn("[lead-received] generateLink exception:", e);
    }

    // Send the email via Resend
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [email],
      subject: `¡Tu perfil en FacultyMatch ha sido recibido, ${full_name.split(" ")[0]}!`,
      html: buildEmail(full_name, magicLinkUrl),
    });

    if (error) {
      console.error("[lead-received] Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[lead-received] Email sent:", data?.id, "→", email);
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    console.error("[lead-received] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
