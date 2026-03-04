import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {

        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          const next = searchParams.get('next');
          
          if (next && next !== '/') {
            return NextResponse.redirect(`${origin}${next}`);
          }

          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .single();
          
          if (!profile) {
            // New SSO user, role should be created by trigger, but if not:
            return NextResponse.redirect(`${origin}/onboarding`);
          }

          if (profile.role === 'faculty') {
            // Check if faculty profile is already completed (e.g., has headline)
            const { data: facultyProfile } = await supabase
              .from('faculty_profiles')
              .select('headline')
              .eq('id', (await supabase.auth.getUser()).data.user?.id)
              .single();
            
            if (!facultyProfile?.headline) {
              return NextResponse.redirect(`${origin}/onboarding`);
            }
            return NextResponse.redirect(`${origin}/app/faculty`);
          } else if (profile.role === 'institution') {
            return NextResponse.redirect(`${origin}/app/institution`);
          }
          
          return NextResponse.redirect(`${origin}/`);
        }
    }


  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
