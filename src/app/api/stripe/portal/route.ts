import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Pasarela de pago no configurada.' }, { status: 500 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id, plan')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'No se encontró una suscripción activa.' }, { status: 404 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.facultymatch.app';
    const dashboardPath = profile.plan?.startsWith('faculty') ? 'faculty' : 'institution';

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${siteUrl}/app/${dashboardPath}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[stripe/portal] error:', err);
    return NextResponse.json(
      { error: err?.message || 'Error al abrir el portal de facturación.' },
      { status: 500 }
    );
  }
}
