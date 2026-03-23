import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_TO_PLAN: Record<string, string> = {
  'price_1TDvExLw5PCavs69t029xaaY': 'faculty-pro',
  'price_1TDvFgLw5PCavs69YGuYE0Z0': 'institution-pro',
};

// Must read raw body to verify Stripe signature
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

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

      // Resolve which plan was purchased from the subscription's price
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data.price'],
      });
      const priceId = subscription.items.data[0]?.price.id;
      const plan = PRICE_TO_PLAN[priceId] ?? 'faculty-pro';
      // current_period_end is still in the API response; cast needed for SDK v20 types
      const rawPeriodEnd = (subscription as unknown as { current_period_end: number }).current_period_end;
      const periodEnd = rawPeriodEnd ? new Date(rawPeriodEnd * 1000).toISOString() : null;

      // Look up the user by email
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

      console.log(`[stripe webhook] activated ${plan} for ${customerEmail}`);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const status = subscription.status; // active, past_due, canceled, etc.
      const rawEnd = (subscription as unknown as { current_period_end: number }).current_period_end;
      const periodEnd = rawEnd ? new Date(rawEnd * 1000).toISOString() : null;

      // If canceling at period end, keep active until then
      const effectiveStatus = subscription.cancel_at_period_end ? 'canceling' : status;

      await supabase
        .from('user_profiles')
        .update({
          subscription_status: effectiveStatus,
          subscription_current_period_end: periodEnd,
        })
        .eq('stripe_customer_id', customerId);

      console.log(`[stripe webhook] subscription updated for customer ${customerId}: ${effectiveStatus}`);
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

      console.log(`[stripe webhook] subscription canceled for customer ${customerId}`);
      break;
    }

    default:
      // Ignore other events
      break;
  }

  return NextResponse.json({ received: true });
}
