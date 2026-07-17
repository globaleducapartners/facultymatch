import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // If Supabase redirected to a non-callback page with an auth code
  // (happens when emailRedirectTo URL is not in Supabase's allowed list
  //  and Supabase falls back to Site URL), intercept and forward to /auth/callback
  const code = request.nextUrl.searchParams.get('code');
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  if ((code || tokenHash) && pathname !== '/auth/callback') {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = '/auth/callback';
    return NextResponse.redirect(callbackUrl);
  }

  // Forward pathname + search params so server layouts can read them via headers()
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', request.nextUrl.pathname);
  requestHeaders.set('x-url-search', request.nextUrl.search || '');

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // /control is guarded by its own layout — middleware only checks auth
  const isControlRoute = pathname === "/control" || pathname.startsWith("/control/");

  // Rutas protegidas: SOLO /app/*
  const isAppRoute =
    pathname === "/app" ||
    pathname.startsWith("/app/") ||
    pathname === "/checkout" ||
    pathname.startsWith("/checkout");

  const isProtected = isAppRoute || isControlRoute;

  // Si NO hay usuario y entra a protegido → /login?next=/ruta
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Solo para rutas /app/* comprobamos rol (no para /control — su layout lo gestiona)
  if (user && isAppRoute && !pathname.startsWith("/onboarding") && !pathname.startsWith("/auth")) {
    // Use admin client to bypass recursive RLS on user_profiles
    const admin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: profile } = await admin
      .from("user_profiles")
      .select("role, active_mode")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.role) {
      // No role assigned yet — let layouts handle it, don't redirect here
      return response;
    }

    // active_mode as source of truth; fall back to role when null
    const activeMode = profile.active_mode ?? profile.role;

    // Redirigir admins a /control cuando intentan acceder a /app/*
    const role = profile.role;
    if (role === "admin" || role === "super_admin") {
      if (!pathname.startsWith("/control")) {
        const url = request.nextUrl.clone();
        url.pathname = "/control";
        return NextResponse.redirect(url);
      }
    }
    // Evitar que un faculty acceda a /app/institution y viceversa
    if (activeMode === "faculty" && pathname.startsWith("/app/institution")) {
      const url = request.nextUrl.clone();
      url.pathname = "/app/faculty";
      return NextResponse.redirect(url);
    }
    // Institution users can view individual faculty profiles (/app/faculty/[uuid])
    // but not the faculty dashboard pages (profile, settings, etc.)
    const isInstitutionViewingFacultyProfile =
      activeMode === "institution" &&
      /^\/app\/faculty\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pathname);
    if (activeMode === "institution" && pathname.startsWith("/app/faculty") && !isInstitutionViewingFacultyProfile) {
      const url = request.nextUrl.clone();
      url.pathname = "/app/institution";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
