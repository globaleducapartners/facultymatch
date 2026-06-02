import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'FacultyMatch <noreply@facultymatch.app>';
const SITE = 'https://www.facultymatch.app';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();

  // Faculty profiles created 2-3 days ago with completeness < 80
  const { data: profiles, error } = await admin
    .from('faculty_profiles')
    .select('user_id, profile_completeness')
    .lt('profile_completeness', 80)
    .gte('updated_at', threeDaysAgo)
    .lte('updated_at', twoDaysAgo)
    .limit(50);

  if (error) {
    console.error('[profile-reminder] query error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No profiles to remind' });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const fp of profiles) {
    try {
      // Get user email and name, skip if pro plan
      const { data: up } = await admin
        .from('user_profiles')
        .select('full_name, email, plan, subscription_status')
        .eq('id', fp.user_id)
        .single();

      if (!up?.email) continue;
      if (up.plan === 'faculty-pro' && up.subscription_status === 'active') continue;

      const firstName = up.full_name?.split(' ')[0] || up.email.split('@')[0];
      const completeness = fp.profile_completeness ?? 0;

      await resend.emails.send({
        from: FROM,
        to: [up.email],
        subject: `${firstName}, hay instituciones revisando perfiles ahora mismo`,
        html: buildReminderEmail(firstName, completeness),
      });

      sent++;
    } catch (e: any) {
      errors.push(e.message);
    }
  }

  console.log(`[profile-reminder] sent ${sent} emails, ${errors.length} errors`);
  return NextResponse.json({ sent, errors: errors.length > 0 ? errors : undefined });
}

function buildReminderEmail(name: string, completeness: number) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;max-width:600px;">
  <tr><td style="background:#0B1220;padding:28px 40px;text-align:center;">
    <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:1px;">FACULTY<span style="color:#2563EB;">MATCH</span></span>
  </td></tr>
  <tr><td style="padding:40px;">
    <h1 style="margin:0 0 16px;color:#0B1220;font-size:24px;font-weight:900;">
      ${name}, tu perfil está al ${completeness}%
    </h1>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
      Hay instituciones universitarias revisando perfiles en FacultyMatch ahora mismo.
      Los perfiles completos reciben <strong>3 veces más visitas</strong> que los incompletos.
    </p>
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
      <p style="margin:0 0 8px;font-weight:900;color:#9a3412;font-size:14px;">
        ¿Qué te falta para completar tu perfil?
      </p>
      <ul style="margin:0;padding:0 0 0 18px;color:#c2410c;font-size:14px;line-height:2;">
        <li>Titular profesional y ubicación</li>
        <li>Áreas de especialidad</li>
        <li>Idiomas que hablas</li>
        <li>Historial docente</li>
        <li>Biografía profesional</li>
      </ul>
    </div>
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${SITE}/app/faculty/profile"
         style="display:inline-block;background:#1d4ed8;color:#fff;padding:16px 36px;border-radius:12px;font-weight:900;font-size:15px;text-decoration:none;">
        Completar mi perfil ahora →
      </a>
    </div>
    <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;line-height:1.6;">
      Las instituciones solo pueden contactar a docentes con perfil completo y verificado.
    </p>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:12px;color:#94a3b8;">
      FacultyMatch · <a href="${SITE}" style="color:#94a3b8;">${SITE.replace('https://','')}</a>
    </p>
    <p style="margin:4px 0 0;font-size:11px;color:#cbd5e1;">
      Grupo Global Educa SL · support@facultymatch.app
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}
