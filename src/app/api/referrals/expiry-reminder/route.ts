import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'FacultyMatch <noreply@facultymatch.app>';
const SITE = 'https://www.facultymatch.app';

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sets Authorization: Bearer <CRON_SECRET>)
  const authHeader = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_REFERRAL_COUPON_ID) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const admin = createAdminClient();

  // Window: subscriptions/trials ending between 2 and 4 days from now (~3 days)
  const now = Math.floor(Date.now() / 1000);
  const twoDays = now + 2 * 24 * 60 * 60;
  const fourDays = now + 4 * 24 * 60 * 60;

  // Strategy: use our DB as primary source (subscription_current_period_end),
  // then verify against Stripe that the subscription uses the referral coupon.
  //
  // Find faculty users who:
  //  - have a subscription ending in the 2–4 day window
  //  - have referred_by set in faculty_profiles (came via referral)
  const { data: candidates } = await admin
    .from('user_profiles')
    .select('id, full_name, email, stripe_subscription_id, subscription_current_period_end')
    .in('subscription_status', ['active', 'trialing'])
    .not('stripe_subscription_id', 'is', null)
    .gte('subscription_current_period_end', new Date(twoDays * 1000).toISOString())
    .lte('subscription_current_period_end', new Date(fourDays * 1000).toISOString());

  if (!candidates?.length) {
    return NextResponse.json({ success: true, emailsSent: 0 });
  }

  // Filter to only those who came via referral
  const userIds = candidates.map(u => u.id);
  const { data: referredProfiles } = await admin
    .from('faculty_profiles')
    .select('user_id')
    .in('user_id', userIds)
    .not('referred_by', 'is', null);

  const referredIds = new Set((referredProfiles || []).map(fp => fp.user_id));
  const referredCandidates = candidates.filter(u => referredIds.has(u.id));

  if (!referredCandidates.length) {
    return NextResponse.json({ success: true, emailsSent: 0 });
  }

  // For each candidate, verify with Stripe that the subscription used our coupon
  let emailsSent = 0;

  for (const candidate of referredCandidates) {
    try {
      const sub = await stripe.subscriptions.retrieve(candidate.stripe_subscription_id!, {
        expand: ['discounts'],
      });

      // Accept if the subscription has our referral coupon as direct discount
      // or a promotion code based on that coupon.
      // Stripe v20: discounts is an array, each Discount has source.coupon and promotion_code
      const discounts = sub.discounts ?? [];
      let hasReferralCoupon = false;

      for (const discountEntry of discounts) {
        if (typeof discountEntry === 'string') continue;
        const discount = discountEntry as Stripe.Discount;

        // Direct coupon check via discount.source.coupon
        const sourceCoupon = discount.source?.coupon;
        const sourceCouponId = typeof sourceCoupon === 'string' ? sourceCoupon : sourceCoupon?.id;
        if (sourceCouponId === process.env.STRIPE_REFERRAL_COUPON_ID) {
          hasReferralCoupon = true;
          break;
        }

        // Check via promotion code: discount.promotion_code → PromotionCode.promotion.coupon
        const promoEntry = discount.promotion_code;
        const promoCodeId = typeof promoEntry === 'string' ? promoEntry : promoEntry?.id;
        if (promoCodeId) {
          try {
            const promo = await stripe.promotionCodes.retrieve(promoCodeId);
            const promoCoupon = promo.promotion.coupon;
            const promoCouponId = typeof promoCoupon === 'string' ? promoCoupon : promoCoupon?.id;
            if (promoCouponId === process.env.STRIPE_REFERRAL_COUPON_ID) {
              hasReferralCoupon = true;
              break;
            }
          } catch {
            // Ignore lookup errors
          }
        }
      }

      if (!hasReferralCoupon) continue;

      // Get email — prefer auth email over user_profiles.email
      const { data: authData } = await admin.auth.admin.getUserById(candidate.id);
      const email = authData?.user?.email || candidate.email;
      if (!email) continue;

      const firstName = candidate.full_name?.split(' ')[0] || 'Docente';

      await resend.emails.send({
        from: FROM,
        to: [email],
        subject: 'Tu mes de acceso profesional vence en 3 días — FacultyMatch',
        html: buildExpiryReminderEmail(firstName),
      }).catch(e => console.warn('[expiry-reminder] email failed for', email, e));

      emailsSent++;
    } catch (err) {
      console.warn('[expiry-reminder] error processing candidate', candidate.id, err);
    }
  }

  return NextResponse.json({ success: true, emailsSent });
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

function buildExpiryReminderEmail(name: string) {
  return emailWrapper(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:#fef9c3;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:32px;">⏳</span>
      </div>
      <h1 style="margin:0;color:#0B1220;font-size:24px;font-weight:900;">
        Tu mes de acceso profesional vence en 3 días, ${name}
      </h1>
      <p style="color:#64748b;font-size:15px;margin:12px 0 0;line-height:1.6;">
        A partir de entonces, tu perfil dejará de estar oculto para instituciones no verificadas.
        Activa tu plan para mantener el control.
      </p>
    </div>

    <div style="background:#fef9c3;border:1px solid #fde047;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
      <p style="margin:0 0 8px;font-weight:900;color:#713f12;font-size:14px;">¿Qué pasa si no activo mi plan?</p>
      <ul style="margin:0;padding:0 0 0 20px;color:#713f12;font-size:14px;line-height:1.9;">
        <li>Tu perfil vuelve al nivel Starter</li>
        <li>Pierdes el posicionamiento prioritario en búsquedas</li>
        <li>Instituciones no verificadas podrán ver tu perfil</li>
      </ul>
    </div>

    <div style="text-align:center;margin-bottom:24px;">
      <a href="${SITE}/app/faculty/settings"
         style="display:inline-block;background:#F97316;color:#fff;padding:16px 40px;border-radius:12px;font-weight:900;font-size:16px;text-decoration:none;">
        Activar mi plan ahora →
      </a>
    </div>

    <p style="text-align:center;color:#94a3b8;font-size:13px;margin:0;">
      ¿Tienes dudas? Escríbenos a
      <a href="mailto:support@facultymatch.app" style="color:#2563EB;">support@facultymatch.app</a>
    </p>
  `);
}
