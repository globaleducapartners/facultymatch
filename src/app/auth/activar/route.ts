import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hashToken, isTokenExpired } from "@/lib/activation-token";

const ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.facultymatch.app";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(
      new URL("/auth/verificar-email?error=missing_token", ORIGIN)
    );
  }

  const admin = createAdminClient();
  const tokenHash = hashToken(token);

  // Look up the token
  const { data: row } = await admin
    .from("activation_tokens")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!row) {
    return NextResponse.redirect(
      new URL("/auth/verificar-email?error=invalid_token", ORIGIN)
    );
  }

  if (row.used) {
    return NextResponse.redirect(
      new URL("/auth/verificar-email?error=already_used", ORIGIN)
    );
  }

  if (isTokenExpired(row.expires_at)) {
    return NextResponse.redirect(
      new URL("/auth/verificar-email?error=expired", ORIGIN)
    );
  }

  // Mark token as used
  const { error: updateError } = await admin
    .from("activation_tokens")
    .update({ used: true })
    .eq("id", row.id);

  if (updateError) {
    console.error("[activar] Failed to mark token as used:", updateError);
    return NextResponse.redirect(
      new URL("/auth/verificar-email?error=server_error", ORIGIN)
    );
  }

  // Update estado_perfil so the user can access the app
  const { error: activateError } = await admin
    .from("faculty_profiles")
    .update({ estado_perfil: "incompleto" })
    .eq("id", row.user_id);

  if (activateError) {
    console.error("[activar] Failed to update estado_perfil:", activateError);
  }

  // Check if the user already has an active session (common case: same device)
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Read-only — we don't need to set cookies here
        },
      },
    }
  );

  const { data: { user: sessionUser } } = await supabase.auth.getUser();

  if (sessionUser && sessionUser.id === row.user_id) {
    // User is already logged in — redirect straight to onboarding
    return NextResponse.redirect(
      new URL("/app/faculty/onboarding", ORIGIN)
    );
  }

  // No active session — redirect to login with success message
  return NextResponse.redirect(
    new URL(
      "/login?message=Correo confirmado. Ahora inicia sesión para completar tu perfil.",
      ORIGIN
    )
  );
}