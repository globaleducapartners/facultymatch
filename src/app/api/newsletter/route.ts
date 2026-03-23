import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const { name, email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert(
      { email: email.trim().toLowerCase(), name: name?.trim() || null, source: 'resources' },
      { onConflict: 'email', ignoreDuplicates: true }
    );

  if (error) {
    console.error('[newsletter] insert error:', error);
    return NextResponse.json({ error: 'Error al guardar. Inténtalo de nuevo.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
