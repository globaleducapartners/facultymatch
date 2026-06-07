import { createClient } from '@/lib/supabase-server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'FacultyMatch <noreply@facultymatch.app>';
const ADMIN_NOTIFY_EMAIL = 'director@globaleducapartners.com';

// Admin client to read faculty_leads (bypasses RLS — leads have no SELECT policy)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
    || 'https://www.facultymatch.app';

  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as 'signup' | 'recovery' | 'email' | 'magiclink' | null;
  const next = searchParams.get('next') ?? '/dashboard';

  const supabase = await createClient();

  // Step 1: Exchange code or token_hash for a session
  // Supabase can send either format depending on auth flow / project settings
  if (tokenHash && type) {
    // OTP / token_hash flow (doesn't require PKCE verifier)
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) {
      console.error('[callback] verifyOtp error:', error.message);
      return NextResponse.redirect(new URL('/login?error=Could not authenticate user', origin).toString());
    }
  } else if (code) {
    // PKCE authorization code flow
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('[callback] exchangeCodeForSession error:', error.message);
      return NextResponse.redirect(new URL('/login?error=Could not authenticate user', origin).toString());
    }
  } else {
    return NextResponse.redirect(new URL('/login?error=Could not authenticate user', origin).toString());
  }

  // Step 2: Session is established — handle recovery redirect before anything else
  if (next && next.startsWith('/update-password')) {
    return NextResponse.redirect(new URL('/update-password', origin).toString());
  }

  // Step 3: Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/login?error=Could not authenticate user', origin).toString());
  }

  // Step 4: For institution users — ensure institutions record exists (from signup metadata)
  if (user.user_metadata?.role === 'institution') {
    try {
      const { data: existingInst } = await supabaseAdmin
        .from('institutions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingInst) {
        const meta = user.user_metadata;
        const cityCountry = [meta.city, meta.country].filter(Boolean).join(', ');
        await supabaseAdmin.from('institutions').insert({
          user_id: user.id,
          name: meta.institution_name
            || `${meta.first_name || ''} ${meta.last_name || ''}`.trim()
            || user.email?.split('@')[0]
            || 'Mi Institución',
          institution_type: meta.institution_type ?? null,
          type: meta.institution_type ?? null,
          country: meta.country ?? null,
          city: meta.city ?? null,
          location: cityCountry || null,
          website: meta.website ?? null,
          phone: meta.phone ?? null,
          contact_email: user.email ?? null,
          status: 'active',
        });
      }
    } catch (e) {
      console.warn('[callback] institution record creation failed:', e);
    }
  }

  // Step 4b: Save referral code for faculty users who registered via a referral link
  if (user.user_metadata?.role === 'faculty' && user.user_metadata?.referral_code) {
    try {
      const code: string = user.user_metadata.referral_code;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      let referredBy: string | null = null;

      if (uuidRegex.test(code)) {
        // Personal referral link: the code is the referrer's user_id
        referredBy = code;
      } else {
        // Email invite code (INVITE-XXXXXXXX): look up referrer_id in referrals table
        const { data: referralRow } = await supabaseAdmin
          .from('referrals')
          .select('referrer_id')
          .eq('code', code)
          .maybeSingle();
        referredBy = referralRow?.referrer_id || null;

        // Update referral status to 'registered'
        if (referralRow) {
          await supabaseAdmin
            .from('referrals')
            .update({ status: 'registered' })
            .eq('code', code);
        }
      }

      // Only set once (don't overwrite if already redeemed)
      await supabaseAdmin
        .from('faculty_profiles')
        .update({ referral_code_redeemed: code, referred_by: referredBy })
        .eq('user_id', user.id)
        .is('referral_code_redeemed', null);
    } catch (e) {
      console.warn('[callback] referral code save failed:', e);
    }
  }

  // Step 4c: Try to pre-populate faculty_profiles from faculty_leads
  // (only for old /apply magic-link users — skip for new /signup/faculty users
  //  to avoid overwriting onboarding_completed with false)
  try {
    const { data: lead } = await supabaseAdmin
      .from('faculty_leads')
      .select('*')
      .eq('email', user.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lead) {
      await supabaseAdmin
  .from('faculty_profiles')
  .upsert({
    user_id: user.id,
    bio: lead.bio ?? undefined,
    location: lead.city
      ? [lead.city, lead.country].filter(Boolean).join(', ')
      : lead.country ?? undefined,
    city: lead.city ?? undefined,
    country: lead.country ?? undefined,
    linkedin_url: lead.linkedin_url ?? undefined,
    modalities: lead.modalities ?? undefined,
    // CORREGIDO: primary_fields en leads = faculty_areas en profiles
    faculty_areas: lead.primary_fields ?? lead.fields ?? lead.faculty_areas ?? undefined,
    // AÑADIDO: subjects se guarda como datos extra
    subjects: lead.subjects ?? undefined,
    languages: lead.languages ?? undefined,
    availability: lead.availability ?? undefined,
    years_experience: lead.years_experience ?? undefined,
    current_institution: lead.current_institution ?? undefined,
    headline: lead.academic_level
      ? `Docente · ${lead.academic_level}`
      : undefined,
    visibility: 'public',
    is_active: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

      // Only update full_name — do NOT set onboarding_completed here
      // to avoid overwriting what the trigger already set
      if (lead.full_name) {
        await supabaseAdmin
          .from('user_profiles')
          .update({ full_name: lead.full_name })
          .eq('id', user.id);
      }
    }
  } catch (e) {
    console.warn('[callback] lead pre-population failed:', e);
  }

  // Step 5: Determine destination
  let { data: profile } = await supabase
    .from('user_profiles')
    .select('role, onboarding_completed')
    .eq('id', user.id)
    .single();

  // Recovery: if the DB trigger failed silently, rebuild profile from user metadata
  if (!profile?.role && user.user_metadata?.role) {
    try {
      await supabaseAdmin.from('user_profiles').upsert({
        id: user.id,
        role: user.user_metadata.role,
        full_name: user.user_metadata.full_name || user.email?.split('@')[0],
        onboarding_completed: user.user_metadata.onboarding_completed === true,
        terms_accepted_at: user.user_metadata.terms_accepted ? new Date().toISOString() : null,
        privacy_accepted_at: user.user_metadata.privacy_accepted ? new Date().toISOString() : null,
        marketing_opt_in: user.user_metadata.marketing_opt_in ?? false,
        consent_version: user.user_metadata.consent_version ?? 'v1',
      }, { onConflict: 'id' });

      // Also ensure faculty_profiles row exists for faculty users
      if (user.user_metadata.role === 'faculty') {
        await supabaseAdmin.from('faculty_profiles').upsert({
          user_id: user.id,
          visibility: 'public',
          is_active: true,
          is_verified: false,
          faculty_areas: user.user_metadata.knowledge_areas ?? [],
          availability: user.user_metadata.availability ?? null,
          modalities: user.user_metadata.modalities ?? [],
          linkedin_url: user.user_metadata.linkedin_url ?? null,
        }, { onConflict: 'user_id' });
      } else if (user.user_metadata.role === 'institution') {
        const meta = user.user_metadata;
        const cityCountry = [meta.city, meta.country].filter(Boolean).join(', ');
        await supabaseAdmin.from('institutions').upsert({
          user_id: user.id,
          name: meta.institution_name || meta.full_name || user.email?.split('@')[0],
          institution_type: meta.institution_type ?? null,
          type: meta.institution_type ?? null,
          country: meta.country ?? null,
          city: meta.city ?? null,
          location: cityCountry || null,
          website: meta.website ?? null,
          phone: meta.phone ?? null,
          contact_email: user.email ?? null,
          status: 'active',
        }, { onConflict: 'user_id' });
      }

      // Refetch profile with recovered data
      const { data: recovered } = await supabase
        .from('user_profiles')
        .select('role, onboarding_completed')
        .eq('id', user.id)
        .single();
      profile = recovered;
    } catch (e) {
      console.warn('[callback] profile recovery failed:', e);
    }
  }

  // Notify admin on new registrations (signup type only, not login)
  if (type === 'signup' || searchParams.get('type') === 'signup') {
    try {
      const role = profile?.role ?? user.user_metadata?.role ?? 'faculty';
      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Nuevo usuario';
      const instName = user.user_metadata?.institution_name;
      resend.emails.send({
        from: FROM,
        to: [ADMIN_NOTIFY_EMAIL],
        subject: `🎉 Nuevo registro en FacultyMatch: ${userName}`,
        html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;max-width:600px;">
  <tr><td style="background:#0B1220;padding:24px 40px;text-align:center;">
    <span style="color:#fff;font-size:20px;font-weight:900;">FACULTY<span style="color:#2563EB;">MATCH</span></span>
  </td></tr>
  <tr><td style="padding:36px 40px;">
    <h2 style="margin:0 0 16px;color:#0B1220;font-size:22px;font-weight:900;">Nuevo registro 🎉</h2>
    <table cellpadding="0" cellspacing="0" width="100%" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
        <p style="margin:0;font-size:11px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Nombre</p>
        <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#0B1220;">${userName}</p>
      </td></tr>
      <tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
        <p style="margin:0;font-size:11px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Email</p>
        <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#0B1220;">${user.email ?? '—'}</p>
      </td></tr>
      <tr><td style="padding:16px 20px;border-bottom:${instName ? '1px solid #e2e8f0' : 'none'};">
        <p style="margin:0;font-size:11px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Tipo</p>
        <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#0B1220;">${role === 'institution' ? 'Institución' : 'Docente'}</p>
      </td></tr>
      ${instName ? `<tr><td style="padding:16px 20px;">
        <p style="margin:0;font-size:11px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Institución</p>
        <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#0B1220;">${instName}</p>
      </td></tr>` : ''}
    </table>
    <a href="https://www.facultymatch.app/control" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;">
      Ver en el panel de administración →
    </a>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:16px 40px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:11px;color:#94a3b8;">FacultyMatch · www.facultymatch.app</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
      }).catch(() => {});
    } catch { /* graceful fail — never block auth flow */ }
  }

  // Always use role-based routing — send users to the right dashboard
  let destination: string;
  if (!profile?.role) {
    destination = '/app/faculty';
  } else if (profile.role === 'faculty') {
    destination = '/app/faculty';
  } else if (profile.role === 'institution') {
    destination = '/app/institution';
  } else if (profile.role === 'admin' || profile.role === 'super_admin') {
    destination = '/control';
  } else {
    // Explicit next param for special cases (e.g. /update-password already handled above)
    destination = next !== '/dashboard' ? next : '/app/faculty';
  }

  return NextResponse.redirect(new URL(destination, origin).toString());
}
