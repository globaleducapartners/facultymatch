import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if user has a profile, if not redirect to role selection/complete profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .single();
      
      if (!profile) {
        // New SSO user, redirect to role selection
        return NextResponse.redirect(`${origin}/signup?new_sso=true`);
      }

      if (profile.role === 'faculty') {
        return NextResponse.redirect(`${origin}/dashboard/educator`);
      } else if (profile.role === 'institution') {
        return NextResponse.redirect(`${origin}/dashboard/institution`);
      }
      
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
