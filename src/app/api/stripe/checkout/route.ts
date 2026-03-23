import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_IDS: Record<string, string> = {
  'faculty-pro': 'price_1TDvExLw5PCavs69t029xaaY',
  'institution-pro': 'price_1TDvFgLw5PCavs69YGuYE0Z0',
};

export async function POST(req: NextRequest) {
  const { plan, userEmail } = await req.json();

  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json({ error: 'Plan no encontrado' }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: userEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/app/${plan.startsWith('faculty') ? 'faculty' : 'institution'}?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${plan.startsWith('faculty') ? 'faculty' : 'institutions'}`,
    locale: 'es',
  });

  return NextResponse.json({ url: session.url });
}
