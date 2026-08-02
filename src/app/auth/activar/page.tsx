import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-server";
import { hashToken, isTokenExpired } from "@/lib/activation-token";
import { ConfirmActivationButton } from "./ConfirmActivationButton";

const SANS = `'Inter', system-ui, -apple-system, sans-serif`;
const D = {
  blue: "#1B4FD8",
  navy: "#0D2240",
  white: "#FFFFFF",
  ink: "#0C1018",
  muted: "#6B7280",
  border: "#D8E2EF",
};

interface Props {
  searchParams: Promise<{ token?: string }>;
}

// Deliberately read-only: this page only VALIDATES the token (exists, not
// used, not expired) — it never marks it used or changes estado_perfil.
// Email providers and corporate security filters (Microsoft Safe Links,
// Gmail, etc.) routinely pre-fetch every link in an email to scan it before
// the person ever opens the message. The previous version of this route
// activated the account directly on that first GET, so the scanner's
// request — not the person's click — consumed the one-time token, and the
// real click landed on "already used". Activation now only happens after
// an explicit button press (a POST via the server action below), which a
// link-scanner's plain GET can't trigger.
export default async function ActivarPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/auth/verificar-email?error=missing_token");
  }

  const admin = createAdminClient();
  const tokenHash = hashToken(token);

  const { data: row } = await admin
    .from("activation_tokens")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!row) {
    redirect("/auth/verificar-email?error=invalid_token");
  }
  if (row.used) {
    redirect("/auth/verificar-email?error=already_used");
  }
  if (isTokenExpired(row.expires_at)) {
    redirect("/auth/verificar-email?error=expired");
  }

  const { data: profile } = await admin
    .from("user_profiles")
    .select("full_name")
    .eq("id", row.user_id)
    .maybeSingle();
  const firstName = profile?.full_name?.split(" ")[0] || "";

  return (
    <div style={{ fontFamily: SANS, minHeight: "100vh", background: "#F2F6FC", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 440, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: D.navy, letterSpacing: "-1px" }}>
            FACULTY<span style={{ color: D.blue }}>MATCH</span>
          </div>
        </div>

        <div style={{ background: D.white, border: `1px solid ${D.border}`, borderRadius: 20, padding: 40, boxShadow: "0 4px 24px rgba(13,34,64,0.08)", textAlign: "center" }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: D.ink, margin: "0 0 8px", letterSpacing: "-0.03em" }}>
            {firstName ? `¡Hola ${firstName}!` : "¡Ya casi está!"}
          </h1>
          <p style={{ fontSize: 14, color: D.muted, lineHeight: 1.6, margin: "0 0 28px" }}>
            Confirma para activar tu cuenta y empezar a crear tu perfil docente.
          </p>

          <ConfirmActivationButton token={token} />
        </div>
      </div>
    </div>
  );
}
