import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const { email, website } = await req.json();

  // Honeypot anti-spam: si el campo invisible llega relleno, es un bot.
  // Se responde como si hubiera funcionado, sin guardar nada.
  if (typeof website === 'string' && website.trim()) {
    return NextResponse.json({ ok: true });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // La tabla newsletter_subscribers solo tiene email + source (no hay columna
  // 'name' — el insert anterior la incluía y fallaba con 500 en cada envío).
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email: email.trim().toLowerCase(), source: 'resources' });

  // 23505 = ya está suscrito. No es un error para el usuario.
  if (error && error.code !== '23505') {
    console.error('[newsletter] insert error:', error);
    return NextResponse.json({ error: 'Error al guardar. Inténtalo de nuevo.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
