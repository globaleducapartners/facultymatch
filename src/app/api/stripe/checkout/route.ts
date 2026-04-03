import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

const PRICE_IDS: Record<string, string | undefined> = {
  'faculty-pro': process.env.STRIPE_PRICE_FACULTY_PRO,
  'institution-pro': process.env.STRIPE_PRICE_INSTITUTION_PRO,
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado. Inicia sesión para continuar.' }, { status: 401 });
    }

    const { plan } = await req.json();

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return NextResponse.json({ error: `Plan no válido o no configurado (${plan}). Contacta con support@facultymatch.app.` }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Pasarela de pago no configurada. Contacta con support@facultymatch.app.' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.facultymatch.app';
    const dashboardPath = plan.startsWith('faculty') ? 'faculty' : 'institution';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/app/${dashboardPath}?upgrade=success`,
      cancel_url: `${siteUrl}/checkout?plan=${plan}`,
      locale: 'es',
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[stripe/checkout] error:', err);
    return NextResponse.json(
      { error: err?.message || 'Error al crear la sesión de pago. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
