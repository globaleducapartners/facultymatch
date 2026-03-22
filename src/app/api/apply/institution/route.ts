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
    const {
      institution_name,
      institution_type,
      country,
      city,
      website,
      cif,
      program_types,
      knowledge_areas,
      faculty_count,
      urgency,
      contact_name,
      contact_role,
      contact_email,
      contact_phone,
      accepts_terms,
      accepts_privacy,
      accepts_marketing,
    } = body;

    if (!institution_name || !contact_email || !contact_name || !contact_phone) {
      return NextResponse.json(
        { error: "Nombre de institución, nombre de contacto, email y teléfono son obligatorios." },
        { status: 400 }
      );
    }

    // 1. Ensure table exists and insert
    await supabaseAdmin.rpc("exec_sql", {
      sql: `CREATE TABLE IF NOT EXISTS institution_applications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        status TEXT DEFAULT 'pending',
        institution_name TEXT NOT NULL,
        institution_type TEXT,
        country TEXT,
        city TEXT,
        website TEXT,
        cif TEXT,
        program_types TEXT[],
        knowledge_areas TEXT[],
        faculty_count TEXT,
        urgency TEXT,
        contact_name TEXT NOT NULL,
        contact_role TEXT,
        contact_email TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        accepts_terms BOOLEAN DEFAULT FALSE,
        accepts_privacy BOOLEAN DEFAULT FALSE,
        accepts_marketing BOOLEAN DEFAULT FALSE
      );`,
    }).catch(() => {
      // RPC may not exist; table creation is best-effort via migration
    });

    const { error: insertError } = await supabaseAdmin
      .from("institution_applications")
      .insert([{
        institution_name,
        institution_type: institution_type || null,
        country: country || null,
        city: city || null,
        website: website || null,
        cif: cif || null,
        program_types: program_types?.length > 0 ? program_types : null,
        knowledge_areas: knowledge_areas?.length > 0 ? knowledge_areas : null,
        faculty_count: faculty_count || null,
        urgency: urgency || null,
        contact_name,
        contact_role: contact_role || null,
        contact_email,
        contact_phone,
        accepts_terms: !!accepts_terms,
        accepts_privacy: !!accepts_privacy,
        accepts_marketing: !!accepts_marketing,
      }]);

    if (insertError) {
      console.error("[apply/institution] Insert error:", insertError.message);
      return NextResponse.json({ error: `DB: ${insertError.message}` }, { status: 500 });
    }

    // 2. Send confirmation email to institution contact
    try {
      await resend.emails.send({
        from: FROM,
        to: [contact_email],
        subject: "✅ Solicitud recibida — FacultyMatch",
        html: buildConfirmationEmail(contact_name, institution_name, country),
      });
    } catch (emailErr) {
      console.warn("[apply/institution] Confirmation email failed:", emailErr);
    }

    // 3. Send alert email to internal team
    try {
      await resend.emails.send({
        from: FROM,
        to: ["info@facultymatch.app"],
        subject: `🏛️ Nueva institución: ${institution_name} · ${country || "—"}`,
        html: buildAlertEmail({
          institution_name,
          institution_type,
          country,
          city,
          contact_name,
          contact_role,
          contact_email,
          contact_phone,
          faculty_count,
          urgency,
        }),
      });
    } catch (alertErr) {
      console.warn("[apply/institution] Alert email failed:", alertErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[apply/institution] Unexpected error:", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

function buildConfirmationEmail(contactName: string, institutionName: string, country?: string): string {
  const firstName = contactName.split(" ")[0];
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
          <table width="100%"><tr><td style="background:linear-gradient(90deg,#F97316 0%,#ea580c 100%);height:6px;"></td></tr></table>
          <table width="100%"><tr><td style="padding:40px 48px 32px;">
            <p style="margin:0 0 8px;font-size:28px;font-weight:900;color:#1E3A5F;">¡Hola, ${firstName}!</p>
            <p style="margin:0 0 24px;font-size:16px;color:#64748B;line-height:1.6;font-weight:500;">
              Hemos recibido correctamente la solicitud de <strong style="color:#1E3A5F;">${institutionName}</strong>${country ? ` (${country})` : ""} en FacultyMatch.
              Nuestro equipo se pondrá en contacto contigo en las próximas <strong>48-72 horas</strong>.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;border-radius:12px;padding:20px 24px;margin-bottom:32px;">
              <tr><td>
                <p style="margin:0 0 12px;font-size:11px;font-weight:800;color:#94A3B8;letter-spacing:0.1em;text-transform:uppercase;">Próximos pasos</p>
                <p style="margin:0 0 8px;font-size:14px;color:#475569;font-weight:500;">1. Revisaremos tu solicitud y verificaremos los datos de tu institución.</p>
                <p style="margin:0 0 8px;font-size:14px;color:#475569;font-weight:500;">2. Te enviaremos acceso al directorio de docentes verificados.</p>
                <p style="margin:0;font-size:14px;color:#475569;font-weight:500;">3. Podrás explorar perfiles y contactar directamente con el profesorado.</p>
              </td></tr>
            </table>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
              <tr><td style="background:#F97316;border-radius:12px;text-align:center;">
                <a href="${SITE_URL}/directory" style="display:inline-block;padding:16px 40px;font-size:15px;font-weight:900;color:#ffffff;text-decoration:none;">
                  Explorar docentes verificados →
                </a>
              </td></tr>
            </table>
            <p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.6;">
              Si tienes alguna pregunta, responde a este email o escríbenos a <a href="mailto:info@facultymatch.app" style="color:#2563EB;">info@facultymatch.app</a>
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

function buildAlertEmail(data: {
  institution_name: string;
  institution_type?: string;
  country?: string;
  city?: string;
  contact_name: string;
  contact_role?: string;
  contact_email: string;
  contact_phone: string;
  faculty_count?: string;
  urgency?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#F8FAFC;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #E2E8F0;padding:32px;">
    <p style="margin:0 0 24px;font-size:20px;font-weight:900;color:#0B1220;">🏛️ Nueva solicitud institucional</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:8px 0;border-bottom:1px solid #F1F5F9;">
        <span style="font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.05em;">Institución</span><br/>
        <span style="font-size:15px;font-weight:700;color:#0B1220;">${data.institution_name}</span>
        ${data.institution_type ? `<span style="font-size:13px;color:#64748B;"> · ${data.institution_type}</span>` : ""}
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #F1F5F9;">
        <span style="font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.05em;">Ubicación</span><br/>
        <span style="font-size:14px;color:#334155;">${[data.city, data.country].filter(Boolean).join(", ") || "—"}</span>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #F1F5F9;">
        <span style="font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.05em;">Contacto</span><br/>
        <span style="font-size:14px;color:#334155;">${data.contact_name}${data.contact_role ? ` · ${data.contact_role}` : ""}</span><br/>
        <a href="mailto:${data.contact_email}" style="font-size:14px;color:#2563EB;">${data.contact_email}</a>
        <span style="font-size:14px;color:#334155;"> · ${data.contact_phone}</span>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #F1F5F9;">
        <span style="font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.05em;">Docentes buscados</span><br/>
        <span style="font-size:14px;color:#334155;">${data.faculty_count || "—"}</span>
      </td></tr>
      <tr><td style="padding:8px 0;">
        <span style="font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.05em;">Urgencia</span><br/>
        <span style="font-size:14px;color:#334155;">${data.urgency || "—"}</span>
      </td></tr>
    </table>
  </div>
</body>
</html>`;
}
