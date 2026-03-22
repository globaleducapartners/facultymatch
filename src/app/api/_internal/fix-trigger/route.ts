import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const host = request.headers.get('host') || '';
  if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const projectRef = 'lwhhxgfhjrwqteguetmy';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // Use Supabase's internal pg-meta SQL endpoint (available to service role)
  const sql = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $func$
DECLARE
  v_role public.user_role;
  v_full_name text;
  v_institution_name text;
  v_onboarding_completed boolean;
BEGIN
  BEGIN
    v_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'faculty';
  END;
  IF v_role IS NULL THEN v_role := 'faculty'; END IF;

  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  v_institution_name := COALESCE(NEW.raw_user_meta_data->>'institution_name', v_full_name);
  v_onboarding_completed := COALESCE((NEW.raw_user_meta_data->>'onboarding_completed')::boolean, false);

  INSERT INTO public.user_profiles (id, role, full_name, onboarding_completed, terms_accepted_at, privacy_accepted_at, marketing_opt_in, consent_version)
  VALUES (
    NEW.id, v_role, v_full_name, v_onboarding_completed,
    CASE WHEN (NEW.raw_user_meta_data->>'terms_accepted')::boolean THEN now() ELSE NULL END,
    CASE WHEN (NEW.raw_user_meta_data->>'privacy_accepted')::boolean THEN now() ELSE NULL END,
    COALESCE((NEW.raw_user_meta_data->>'marketing_opt_in')::boolean, false),
    COALESCE(NEW.raw_user_meta_data->>'consent_version', 'v1')
  )
  ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        onboarding_completed = EXCLUDED.onboarding_completed,
        terms_accepted_at = COALESCE(EXCLUDED.terms_accepted_at, user_profiles.terms_accepted_at),
        privacy_accepted_at = COALESCE(EXCLUDED.privacy_accepted_at, user_profiles.privacy_accepted_at),
        marketing_opt_in = EXCLUDED.marketing_opt_in,
        consent_version = EXCLUDED.consent_version;

  IF (NEW.raw_user_meta_data->>'terms_accepted')::boolean OR (NEW.raw_user_meta_data->>'privacy_accepted')::boolean THEN
    INSERT INTO public.consents (user_id, accepted_terms, accepted_privacy, marketing_opt_in, consent_version, accepted_at)
    VALUES (
      NEW.id,
      COALESCE((NEW.raw_user_meta_data->>'terms_accepted')::boolean, false),
      COALESCE((NEW.raw_user_meta_data->>'privacy_accepted')::boolean, false),
      COALESCE((NEW.raw_user_meta_data->>'marketing_opt_in')::boolean, false),
      COALESCE(NEW.raw_user_meta_data->>'consent_version', 'v1'),
      now()
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  IF v_role = 'faculty' THEN
    INSERT INTO public.faculty_profiles (user_id, visibility, is_active, is_verified)
    VALUES (NEW.id, 'public', true, false)
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF v_role = 'institution' THEN
    INSERT INTO public.institutions (id, name)
    VALUES (NEW.id, v_institution_name)
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[handle_new_user] error for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$func$
`;

  const res = await fetch(
    `https://${projectRef}.supabase.co/pg/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  const body = await res.text();
  return NextResponse.json({ status: res.status, body });
}
