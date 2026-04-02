import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_IDS: Record<string, string> = {
  'faculty-pro': process.env.STRIPE_PRICE_FACULTY_PRO!,
  'institution-pro': process.env.STRIPE_PRICE_INSTITUTION_PRO!,
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { plan } = await req.json();

  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json({ error: 'Plan no encontrado' }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: user.email,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/app/${plan.startsWith('faculty') ? 'faculty' : 'institution'}?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/app/${plan.startsWith('faculty') ? 'faculty' : 'institution'}`,
    locale: 'es',
  });

  return NextResponse.json({ url: session.url });
}
