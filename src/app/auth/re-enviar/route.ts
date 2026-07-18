import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { sendActivationEmail } from "@/lib/emails/service";
import {
  generateToken,
  getTokenExpiry,
  RESEND_COOLDOWN_SECONDS,
} from "@/lib/activation-token";

const ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.facultymatch.app";

const NEUTRAL_MESSAGE =
  "Si existe una cuenta con ese correo, hemos enviado un nuevo enlace de activación.";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email requerido." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Find the user by email
    const { data: users } = await admin.auth.admin.listUsers();
    const user = users.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (user) {
      // Check cooldown: last token for this user must be older than 60 seconds
      const { data: lastToken } = await admin
        .from("activation_tokens")
        .select("created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!lastToken) {
        // No cooldown — generate new token
        await generateAndSendToken(admin, user, email);
      } else {
        const elapsed =
          (Date.now() - new Date(lastToken.created_at).getTime()) / 1000;
        if (elapsed < RESEND_COOLDOWN_SECONDS) {
          // Cooldown active — still return the same message
          return NextResponse.json({ message: NEUTRAL_MESSAGE });
        }
        // Cooldown passed — generate new token
        await generateAndSendToken(admin, user, email);
      }
    }

    // Always return the same response — never reveal whether the email exists
    return NextResponse.json({ message: NEUTRAL_MESSAGE });
  } catch (err) {
    console.error("[re-enviar] Unexpected error:", err);
    // Return neutral message even on server error to avoid leaking info
    return NextResponse.json({ message: NEUTRAL_MESSAGE });
  }
}

async function generateAndSendToken(
  admin: ReturnType<typeof createAdminClient>,
  user: { id: string; user_metadata?: { full_name?: string }; email?: string },
  email: string
) {
  // Invalidate all previous tokens for this user
  await admin
    .from("activation_tokens")
    .update({ used: true })
    .eq("user_id", user.id);

  // Generate new token
  const { token, hash } = generateToken();
  const expiresAt = getTokenExpiry();

  const { error: insertError } = await admin
    .from("activation_tokens")
    .insert({
      user_id: user.id,
      token_hash: hash,
      expires_at: expiresAt,
      used: false,
    });

  if (insertError) {
    console.error("[re-enviar] Failed to insert token:", insertError);
    return;
  }

  // Send the activation email
  const fullName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "docente";
  const activationLink = `${ORIGIN}/auth/activar?token=${token}`;

  await sendActivationEmail(email, fullName, activationLink);
}