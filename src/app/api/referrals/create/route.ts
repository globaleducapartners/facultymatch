import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase-server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'FacultyMatch <noreply@facultymatch.app>';
const SITE = 'https://www.facultymatch.app';
const MAX_INVITATIONS = 20;

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'INVITE-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  // Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();

  // Check role
  const { data: profile } = await admin
    .from('user_profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'faculty') {
    return NextResponse.json({ error: 'Solo los docentes pueden enviar invitaciones' }, { status: 403 });
  }

  const body = await req.json();
  const inviteeEmail: string = body?.email?.trim().toLowerCase();

  if (!inviteeEmail || !inviteeEmail.includes('@')) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  }

  // Check invitations_sent limit
  const { data: facultyProfile } = await admin
    .from('faculty_profiles')
    .select('referral_stats')
    .eq('user_id', user.id)
    .single();

  const stats = (facultyProfile?.referral_stats as Record<string, number | boolean>) || {};
  const invitationsSent = typeof stats.invitations_sent === 'number' ? stats.invitations_sent : 0;

  if (invitationsSent >= MAX_INVITATIONS) {
    return NextResponse.json({ error: 'Has alcanzado el límite de 20 invitaciones' }, { status: 400 });
  }

  // Check if already invited this email
  const { data: existingReferral } = await admin
    .from('referrals')
    .select('id')
    .eq('referrer_id', user.id)
    .eq('invitee_email', inviteeEmail)
    .maybeSingle();

  if (existingReferral) {
    return NextResponse.json({ error: 'Ya has invitado a este email' }, { status: 400 });
  }

  // Stripe: create promotion code
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_REFERRAL_COUPON_ID) {
    return NextResponse.json({ error: 'Pasarela de pago no configurada' }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const code = generateInviteCode();

  let stripePromoCode: Stripe.PromotionCode;
  try {
    stripePromoCode = await stripe.promotionCodes.create({
      promotion: {
        type: 'coupon',
        coupon: process.env.STRIPE_REFERRAL_COUPON_ID!,
      },
      code,
      max_redemptions: 1,
      restrictions: {
        first_time_transaction: true,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[referrals/create] Stripe error:', msg);
    return NextResponse.json({ error: 'Error al crear el código de invitación' }, { status: 500 });
  }

  // Save referral to DB
  const { error: insertError } = await admin.from('referrals').insert({
    referrer_id: user.id,
    invitee_email: inviteeEmail,
    code,
    status: 'pending',
    created_at: new Date().toISOString(),
  });

  if (insertError) {
    console.error('[referrals/create] insert error:', insertError);
    return NextResponse.json({ error: 'Error al guardar la invitación' }, { status: 500 });
  }

  // Increment invitations_sent in referral_stats
  const newStats = { ...stats, invitations_sent: invitationsSent + 1 };
  await admin
    .from('faculty_profiles')
    .update({ referral_stats: newStats })
    .eq('user_id', user.id);

  // Send invitation email
  const inviterFullName = profile.full_name || user.email?.split('@')[0] || 'Un docente';
  const inviterFirstName = inviterFullName.split(' ')[0];
  const registrationLink = `${SITE}/signup?ref=${code}`;

  await resend.emails.send({
    from: FROM,
    to: [inviteeEmail],
    subject: `${inviterFullName} te invita a unirte a FacultyMatch`,
    html: buildInvitationEmail(inviterFirstName, inviterFullName, code, registrationLink),
  }).catch(e => console.warn('[referrals/create] email failed:', e));

  return NextResponse.json({ success: true, code });
}

// ── Email Template ────────────────────────────────────────────────────────────

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
    <p style="margin:0;font-size:12px;color:#94a3b8;">FacultyMatch · <a href="${SITE}" style="color:#94a3b8;">facultymatch.app</a></p>
    <p style="margin:4px 0 0;font-size:11px;color:#cbd5e1;">Grupo Global Educa SL · support@facultymatch.app</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function buildInvitationEmail(
  inviterFirstName: string,
  inviterFullName: string,
  code: string,
  registrationLink: string,
) {
  return emailWrapper(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:#eff6ff;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:32px;">🎓</span>
      </div>
      <h1 style="margin:0;color:#0B1220;font-size:24px;font-weight:900;">
        ${inviterFirstName} te invita a unirte a FacultyMatch
      </h1>
      <p style="color:#64748b;font-size:15px;margin:12px 0 0;line-height:1.6;">
        <strong style="color:#0B1220;">${inviterFullName}</strong> quiere conectarte con las mejores
        instituciones educativas de habla hispana.
      </p>
    </div>

    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px 24px;margin-bottom:28px;text-align:center;">
      <p style="margin:0 0 4px;font-weight:900;color:#1d4ed8;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Tu regalo de bienvenida</p>
      <p style="margin:0;color:#1e40af;font-size:18px;font-weight:900;">1 mes de acceso profesional gratis</p>
      <p style="margin:8px 0 0;color:#3b82f6;font-size:13px;">
        Perfil prioritario, visibilidad ampliada y herramientas profesionales sin coste.
      </p>
    </div>

    <div style="text-align:center;margin-bottom:28px;">
      <a href="${registrationLink}"
         style="display:inline-block;background:#F97316;color:#fff;padding:16px 40px;border-radius:12px;font-weight:900;font-size:16px;text-decoration:none;">
        Unirme a FacultyMatch →
      </a>
      <p style="margin:12px 0 0;color:#94a3b8;font-size:12px;">
        El mes gratuito se activa automáticamente al registrarte con este enlace.
      </p>
    </div>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;text-align:center;">
      <p style="margin:0 0 4px;color:#64748b;font-size:12px;">¿El enlace no funciona? Usa este código al registrarte:</p>
      <p style="margin:0;font-family:monospace;font-size:18px;font-weight:900;color:#0B1220;letter-spacing:2px;">${code}</p>
    </div>
  `);
}
