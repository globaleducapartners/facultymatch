import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { runWeeklyDigest } from '@/lib/retention-reminders';

// Cron semanal (lunes 9:00) — resumen de vistas/contactos/favoritos de la
// última semana, solo a quien activó "resumen semanal" en sus ajustes de
// notificaciones. Mismo patrón de autenticación que /api/retention/daily.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const result = await runWeeklyDigest(admin);
  console.log('[weekly-digest]', JSON.stringify(result));

  return NextResponse.json(result);
}
