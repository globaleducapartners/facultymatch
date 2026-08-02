import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import {
  runInstitutionInactivityReminder,
  runReverificationReminder,
  runUnansweredContactReminder,
} from '@/lib/retention-reminders';

// Single cron entry point running all 3 retention checks in sequence —
// kept as one Vercel cron job (not three) since Vercel's free/Hobby plan
// caps the number of cron jobs on a project; consolidating here avoids
// bumping into that limit regardless of which plan this project is on.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const [institutionInactivity, reverification, unansweredContact] = await Promise.all([
    runInstitutionInactivityReminder(admin),
    runReverificationReminder(admin),
    runUnansweredContactReminder(admin),
  ]);

  const result = { institutionInactivity, reverification, unansweredContact };
  console.log('[retention/daily]', JSON.stringify(result));

  return NextResponse.json(result);
}
