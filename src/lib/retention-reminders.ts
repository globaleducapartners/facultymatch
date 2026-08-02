import { createAdminClient } from "@/lib/supabase-server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "FacultyMatch <noreply@facultymatch.app>";
const SITE = "https://www.facultymatch.app";

type Admin = ReturnType<typeof createAdminClient>;

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
    <p style="margin:0;font-size:12px;color:#94a3b8;">FacultyMatch · <a href="${SITE}" style="color:#94a3b8;">${SITE.replace('https://', '')}</a></p>
    <p style="margin:4px 0 0;font-size:11px;color:#cbd5e1;">Grupo Global Educa SL · support@facultymatch.app</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

// ── 1. Institutions that signed up 3-4 days ago and never ran a search ──────
export async function runInstitutionInactivityReminder(admin: Admin) {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString();

  const { data: institutions, error } = await admin
    .from("institutions")
    .select("id, user_id, name, contact_email")
    .eq("status", "active")
    .gte("created_at", fourDaysAgo)
    .lte("created_at", threeDaysAgo)
    .limit(100);

  if (error) return { sent: 0, errors: [error.message] };
  if (!institutions || institutions.length === 0) return { sent: 0, errors: [] };

  const institutionIds = institutions.map(i => i.id);
  const { data: activeSearchers } = await admin
    .from("search_usage")
    .select("institution_id")
    .in("institution_id", institutionIds)
    .gt("search_count", 0);
  const activeIds = new Set((activeSearchers || []).map(r => r.institution_id));
  const dormant = institutions.filter(i => !activeIds.has(i.id));

  let sent = 0;
  const errors: string[] = [];

  for (const inst of dormant) {
    try {
      let email = inst.contact_email as string | null;
      if (!email && inst.user_id) {
        const { data: authUser } = await admin.auth.admin.getUserById(inst.user_id);
        email = authUser?.user?.email || null;
      }
      if (!email) continue;

      await resend.emails.send({
        from: FROM,
        to: [email],
        subject: `${inst.name || "Hola"}, tu directorio de docentes te está esperando`,
        html: emailWrapper(`
          <h1 style="margin:0 0 16px;color:#0B1220;font-size:24px;font-weight:900;">
            ${inst.name || "Hola"}, todavía no habéis hecho vuestra primera búsqueda
          </h1>
          <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
            Vuestra cuenta institucional en FacultyMatch está lista, pero aún no habéis
            buscado ningún perfil. El directorio ya tiene docentes y expertos verificados
            listos para contactar — filtrando por área, idioma, modalidad y disponibilidad.
          </p>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${SITE}/app/institution/search" style="display:inline-block;background:#1d4ed8;color:#fff;padding:16px 36px;border-radius:12px;font-weight:900;font-size:15px;text-decoration:none;">
              Hacer mi primera búsqueda →
            </a>
          </div>
          <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;line-height:1.6;">
            ¿Alguna duda sobre cómo funciona? Responde a este correo y os ayudamos.
          </p>
        `),
      });
      sent++;
    } catch (e: any) {
      errors.push(e.message);
    }
  }

  return { sent, errors };
}

// ── 2. Verified profiles untouched for ~1 year — nudge only, no state change ─
export async function runReverificationReminder(admin: Admin) {
  const now = new Date();
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
  const oneYearAndADayAgo = new Date(now.getTime() - 366 * 24 * 60 * 60 * 1000).toISOString();

  const { data: profiles, error } = await admin
    .from("faculty_profiles")
    .select("id, user_id")
    .eq("estado_perfil", "verificado")
    .gte("verificado_en", oneYearAndADayAgo)
    .lte("verificado_en", oneYearAgo)
    .limit(100);

  if (error) return { sent: 0, errors: [error.message] };
  if (!profiles || profiles.length === 0) return { sent: 0, errors: [] };

  let sent = 0;
  const errors: string[] = [];

  for (const fp of profiles) {
    try {
      const { data: up } = await admin
        .from("user_profiles")
        .select("full_name, email")
        .eq("id", fp.user_id)
        .single();
      if (!up?.email) continue;

      const firstName = up.full_name?.split(" ")[0] || up.email.split("@")[0];

      await resend.emails.send({
        from: FROM,
        to: [up.email],
        subject: `${firstName}, ¿sigue tu perfil al día?`,
        html: emailWrapper(`
          <h1 style="margin:0 0 16px;color:#0B1220;font-size:24px;font-weight:900;">
            ${firstName}, hace un año que verificamos tu perfil
          </h1>
          <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
            Los perfiles actualizados con tu trayectoria más reciente (nuevos cargos,
            publicaciones, formación) reciben más contactos de instituciones. Es un buen
            momento para revisar el tuyo y añadir lo que haya cambiado este año.
          </p>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${SITE}/app/faculty/profile" style="display:inline-block;background:#1d4ed8;color:#fff;padding:16px 36px;border-radius:12px;font-weight:900;font-size:15px;text-decoration:none;">
              Revisar mi perfil →
            </a>
          </div>
          <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;line-height:1.6;">
            Si no cambias nada, tu perfil sigue exactamente igual de activo y verificado.
          </p>
        `),
      });
      sent++;
    } catch (e: any) {
      errors.push(e.message);
    }
  }

  return { sent, errors };
}

// ── 3. Contacts sitting unanswered ('pending') for 3-4 days ─────────────────
export async function runUnansweredContactReminder(admin: Admin) {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString();

  const { data: contacts, error } = await admin
    .from("contacts")
    .select("id, faculty_id, institution_id, created_at")
    .eq("status", "pending")
    .gte("created_at", fourDaysAgo)
    .lte("created_at", threeDaysAgo)
    .limit(100);

  if (error) return { sent: 0, errors: [error.message] };
  if (!contacts || contacts.length === 0) return { sent: 0, errors: [] };

  let sent = 0;
  const errors: string[] = [];

  for (const c of contacts) {
    try {
      const { data: fp } = await admin
        .from("faculty_profiles")
        .select("user_id, notify_messages")
        .eq("id", c.faculty_id)
        .maybeSingle();
      if (!fp || fp.notify_messages === false) continue;

      const { data: up } = await admin
        .from("user_profiles")
        .select("full_name, email")
        .eq("id", fp.user_id)
        .maybeSingle();
      if (!up?.email) continue;

      const { data: inst } = await admin
        .from("institutions")
        .select("name")
        .eq("id", c.institution_id)
        .maybeSingle();

      const firstName = up.full_name?.split(" ")[0] || up.email.split("@")[0];
      const institutionName = inst?.name || "Una institución";

      await resend.emails.send({
        from: FROM,
        to: [up.email],
        subject: `${firstName}, tienes una propuesta sin responder`,
        html: emailWrapper(`
          <h1 style="margin:0 0 16px;color:#0B1220;font-size:24px;font-weight:900;">
            ${firstName}, ${institutionName} sigue esperando tu respuesta
          </h1>
          <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
            Hace unos días os propusieron una colaboración a través de FacultyMatch y
            todavía no habéis respondido. Aunque no os interese, contestar (aunque sea
            para declinar) ayuda a que sigan confiando en el directorio.
          </p>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${SITE}/app/faculty/requests" style="display:inline-block;background:#1d4ed8;color:#fff;padding:16px 36px;border-radius:12px;font-weight:900;font-size:15px;text-decoration:none;">
              Ver la propuesta →
            </a>
          </div>
        `),
      });
      sent++;
    } catch (e: any) {
      errors.push(e.message);
    }
  }

  return { sent, errors };
}
