import { createServerClient, type CookieOptions } from "@supabase/ssr";
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

  // Forward search params so server layouts can read them via headers()
  const requestHeaders = new Headers(request.headers);
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

  // Rutas protegidas: SOLO /app/* y /admin/*
  const isAppRoute =
    pathname === "/app" ||
    pathname.startsWith("/app/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

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
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile?.role) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding/role";
      return NextResponse.redirect(url);
    }

    // Redirigir admins a /control cuando intentan acceder a /app/*
    const role = profile.role;
    if (role === "admin" || role === "super_admin") {
      if (!pathname.startsWith("/control") && !pathname.startsWith("/app/admin")) {
        const url = request.nextUrl.clone();
        url.pathname = "/control";
        return NextResponse.redirect(url);
      }
    }
    // Evitar que un faculty acceda a /app/institution y viceversa
    if (role === "faculty" && pathname.startsWith("/app/institution")) {
      const url = request.nextUrl.clone();
      url.pathname = "/app/faculty";
      return NextResponse.redirect(url);
    }
    if (role === "institution" && pathname.startsWith("/app/faculty")) {
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
