import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'FacultyMatch <noreply@facultymatch.app>';
const SITE = 'https://www.facultymatch.app';

// Price ID → plan name. Prefer env vars; fall back to known production IDs.
function buildPriceMap() {
  const map: Record<string, string> = {};
  const fp = process.env.STRIPE_PRICE_FACULTY_PRO;
  const ip = process.env.STRIPE_PRICE_INSTITUTION_PRO;
  if (fp) map[fp] = 'faculty-pro';
  if (ip) map[ip] = 'institution-pro';
  // Always include known IDs as fallback
  map['price_1TDvExLw5PCavs69t029xaaY'] = 'faculty-pro';
  map['price_1TDvFgLw5PCavs69YGuYE0Z0'] = 'institution-pro';
  return map;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const PRICE_TO_PLAN = buildPriceMap();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[stripe webhook] signature verification failed:', message);
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== 'subscription') break;

      const customerEmail = session.customer_email;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data.price'],
      });
      const priceId = subscription.items.data[0]?.price.id;
      const plan = PRICE_TO_PLAN[priceId] ?? 'faculty-pro';
      const rawPeriodEnd = (subscription as any).current_period_end as number;
      const periodEnd = rawPeriodEnd ? new Date(rawPeriodEnd * 1000).toISOString() : null;

      // Look up user by email
      const { data: authData } = await supabase.auth.admin.listUsers();
      const user = authData?.users.find(u => u.email === customerEmail);
      if (!user) {
        console.error('[stripe webhook] user not found for email:', customerEmail);
        break;
      }

      await supabase
        .from('user_profiles')
        .update({
          plan,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: 'active',
          subscription_current_period_end: periodEnd,
        })
        .eq('id', user.id);

      // Send activation email
      const { data: up } = await supabase.from('user_profiles').select('full_name').eq('id', user.id).single();
      const firstName = up?.full_name?.split(' ')[0] || customerEmail?.split('@')[0] || 'Docente';
      if (customerEmail) {
        resend.emails.send({
          from: FROM,
          to: [customerEmail],
          subject: '🎉 Plan Professional activado — FacultyMatch',
          html: buildActivationEmail(firstName, plan, periodEnd),
        }).catch(() => {});
      }

      console.log(`[stripe webhook] activated ${plan} for ${customerEmail}`);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const status = subscription.status;
      const rawEnd = (subscription as any).current_period_end as number;
      const periodEnd = rawEnd ? new Date(rawEnd * 1000).toISOString() : null;
      const effectiveStatus = subscription.cancel_at_period_end ? 'canceling' : status;

      await supabase
        .from('user_profiles')
        .update({
          subscription_status: effectiveStatus,
          subscription_current_period_end: periodEnd,
        })
        .eq('stripe_customer_id', customerId);

      console.log(`[stripe webhook] subscription updated for ${customerId}: ${effectiveStatus}`);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await supabase
        .from('user_profiles')
        .update({
          plan: 'free',
          stripe_subscription_id: null,
          subscription_status: 'canceled',
          subscription_current_period_end: null,
        })
        .eq('stripe_customer_id', customerId);

      console.log(`[stripe webhook] subscription canceled for ${customerId}`);
      break;
    }

    // ── 7-day renewal reminder ───────────────────────────────────────────────
    case 'invoice.upcoming': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      // Only send if renewal is ≤ 7 days out
      const nextPayment = (invoice as any).next_payment_attempt as number | null;
      if (!nextPayment) break;
      const daysUntilDue = Math.round((nextPayment * 1000 - Date.now()) / 86400000);
      if (daysUntilDue < 0 || daysUntilDue > 8) break;

      const { data: up } = await supabase
        .from('user_profiles')
        .select('full_name, plan, subscription_current_period_end')
        .eq('stripe_customer_id', customerId)
        .single();

      if (!up) break;

      // Retrieve customer email from Stripe
      let customerEmail: string | null = null;
      try {
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        customerEmail = customer.email;
      } catch { break; }

      if (!customerEmail) break;

      const firstName = up.full_name?.split(' ')[0] || 'Docente';
      const renewalDate = up.subscription_current_period_end
        ? new Date(up.subscription_current_period_end).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
        : '';
      const amount = up.plan === 'faculty-pro' ? '29€' : '99€';

      resend.emails.send({
        from: FROM,
        to: [customerEmail],
        subject: `⏰ Tu Plan Professional se renueva en ${daysUntilDue} días — FacultyMatch`,
        html: buildRenewalEmail(firstName, daysUntilDue, renewalDate, amount),
      }).catch(() => {});

      console.log(`[stripe webhook] renewal reminder sent to ${customerEmail} (${daysUntilDue} days)`);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

// ── Email Templates ──────────────────────────────────────────────────────────

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
    <p style="margin:0;font-size:12px;color:#94a3b8;">FacultyMatch · <a href="${SITE}" style="color:#94a3b8;">${SITE.replace('https://','')}</a></p>
    <p style="margin:4px 0 0;font-size:11px;color:#cbd5e1;">Grupo Global Educa SL · support@facultymatch.app</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function buildActivationEmail(name: string, plan: string, periodEnd: string | null) {
  const isFaculty = plan === 'faculty-pro';
  const endDate = periodEnd
    ? new Date(periodEnd).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';
  const dashboardLink = isFaculty ? `${SITE}/app/faculty` : `${SITE}/app/institution`;

  return emailWrapper(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:#fff7ed;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:32px;">🎉</span>
      </div>
      <h1 style="margin:0;color:#0B1220;font-size:26px;font-weight:900;">¡Plan Professional activado, ${name}!</h1>
      <p style="color:#64748b;font-size:16px;margin:12px 0 0;line-height:1.6;">
        Tu suscripción está activa. Ya tienes acceso completo a todas las funcionalidades premium de FacultyMatch.
      </p>
    </div>
    ${endDate ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 24px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;color:#1d4ed8;font-size:14px;font-weight:700;">Próxima renovación: <strong>${endDate}</strong></p>
      <p style="margin:4px 0 0;color:#64748b;font-size:12px;">Te avisaremos 7 días antes por email.</p>
    </div>` : ''}
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:28px;">
      <p style="margin:0 0 12px;font-weight:900;color:#0B1220;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Funcionalidades activadas:</p>
      <ul style="margin:0;padding:0 0 0 20px;color:#475569;font-size:14px;line-height:2;">
        ${isFaculty ? `
        <li>Bloqueo de instituciones específicas</li>
        <li>Posicionamiento prioritario en búsquedas</li>
        <li>Oculto para tu centro actual</li>
        <li>Estadísticas de visitas a tu perfil</li>` : `
        <li>Búsquedas ilimitadas de docentes</li>
        <li>Contacto directo con docentes verificados</li>
        <li>Acceso a informes de mercado</li>
        <li>Soporte prioritario</li>`}
      </ul>
    </div>
    <div style="text-align:center;margin-bottom:16px;">
      <a href="${dashboardLink}" style="display:inline-block;background:#F97316;color:#fff;padding:16px 36px;border-radius:12px;font-weight:900;font-size:16px;text-decoration:none;">
        Ir a mi dashboard →
      </a>
    </div>
  `);
}

function buildRenewalEmail(name: string, days: number, date: string, amount: string) {
  return emailWrapper(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:#fef9c3;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:32px;">⏰</span>
      </div>
      <h1 style="margin:0;color:#0B1220;font-size:24px;font-weight:900;">Tu plan se renueva en ${days} días, ${name}</h1>
      <p style="color:#64748b;font-size:15px;margin:12px 0 0;line-height:1.6;">
        Tu Plan Professional se renovará automáticamente el <strong>${date}</strong> por <strong>${amount}</strong>.
      </p>
    </div>
    <div style="background:#fef9c3;border:1px solid #fde047;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0;color:#713f12;font-size:14px;font-weight:700;">¿Quieres cancelar o cambiar algo?</p>
      <p style="margin:8px 0 0;color:#713f12;font-size:13px;">Escríbenos a <a href="mailto:support@facultymatch.app" style="color:#1d4ed8;">support@facultymatch.app</a> antes de la fecha de renovación y lo gestionamos.</p>
    </div>
    <div style="text-align:center;margin-bottom:16px;">
      <a href="${SITE}/app/faculty" style="display:inline-block;background:#2563EB;color:#fff;padding:14px 32px;border-radius:12px;font-weight:900;font-size:15px;text-decoration:none;">
        Ver mi plan →
      </a>
    </div>
  `);
}
