import { createClient } from '@/lib/supabase-server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Admin client to read faculty_leads (bypasses RLS — leads have no SELECT policy)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Always redirect to canonical production domain
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.facultymatch.app';
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Try to pre-populate faculty_profiles from faculty_leads if this is
        // a fresh magic-link login from the /apply form
        try {
          const { data: lead } = await supabaseAdmin
            .from('faculty_leads')
            .select('*')
            .eq('email', user.email)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (lead) {
            // Upsert faculty_profiles with data from the apply form
            await supabaseAdmin
              .from('faculty_profiles')
              .upsert({
                user_id: user.id,
                bio: lead.bio ?? undefined,
                location: lead.city
                  ? [lead.city, lead.country].filter(Boolean).join(', ')
                  : lead.country ?? undefined,
                linkedin_url: lead.linkedin_url ?? undefined,
                modalities: lead.modalities ?? undefined,
                visibility: 'public',
                is_active: true,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'user_id' });

            // Update user_profiles with full_name from lead
            if (lead.full_name) {
              await supabaseAdmin
                .from('user_profiles')
                .update({ full_name: lead.full_name })
                .eq('id', user.id);
            }
          }
        } catch (e) {
          // Non-fatal — just skip pre-population
          console.warn('[callback] lead pre-population failed:', e);
        }

        // Determine where to send the user
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role, onboarding_completed')
          .eq('id', user.id)
          .single();

        let destination = next;
        if (next === '/dashboard' || next.startsWith('/dashboard')) {
          if (!profile?.role) {
            destination = '/onboarding/role';
          } else if (profile.role === 'faculty' && !profile.onboarding_completed) {
            destination = '/onboarding';
          } else if (profile.role === 'faculty') {
            destination = '/app/faculty';
          } else if (profile.role === 'institution') {
            destination = '/app/institution';
          } else if (profile.role === 'admin' || profile.role === 'super_admin') {
              destination = '/control';
            }
        }

        const redirectUrl = new URL(destination, origin);
        return NextResponse.redirect(redirectUrl.toString());
      }
    }
  }

  // Authentication failed
  const errorUrl = new URL('/login?error=Could not authenticate user', origin);
  return NextResponse.redirect(errorUrl.toString());
}
