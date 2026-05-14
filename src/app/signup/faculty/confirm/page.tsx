"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const SANS = `var(--font-sans, system-ui, -apple-system, sans-serif)`;
const D = {
  dark:   "#071326",
  navy:   "#0D2240",
  blue:   "#1B4FD8",
  gold:   "#E9A030",
  surf:   "#F2F6FC",
  white:  "#FFFFFF",
  ink:    "#0C1018",
  muted:  "#6B7280",
  border: "#D8E2EF",
};

function ConfirmContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [resending, setResending] = useState(false);
  const [resent,    setResent]    = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.resend({ type: "signup", email });
    setResent(true);
    setResending(false);
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: D.surf, padding: "48px 24px", fontFamily: SANS,
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Logo />
        </div>

        {/* Card */}
        <div style={{
          background: D.white, borderRadius: 20,
          border: `1px solid ${D.border}`,
          boxShadow: "0 4px 24px rgba(7,19,38,0.06)",
          padding: "40px 36px",
          display: "flex", flexDirection: "column", gap: 24,
        }}>
          {/* Icon + heading */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: "#EFF6FF", border: "1px solid #BFDBFE",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <Mail size={30} color={D.blue} />
            </div>
            <h1 style={{
              fontFamily: SANS, fontSize: 24, fontWeight: 900,
              color: D.ink, letterSpacing: "-0.04em", margin: "0 0 8px",
            }}>
              Confirma tu email
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 14, color: D.muted, margin: 0 }}>
              Hemos enviado un email de verificación a:
            </p>
            {email && (
              <p style={{
                fontFamily: SANS, fontSize: 15, fontWeight: 700,
                color: D.navy, margin: "8px 0 0", wordBreak: "break-all",
              }}>
                {email}
              </p>
            )}
          </div>

          {/* Info box — warning */}
          <div style={{
            background: "#FFFBEB", border: "1px solid #FDE68A",
            borderRadius: 12, padding: "14px 16px",
          }}>
            <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "#92400E", margin: "0 0 4px" }}>
              Antes de acceder, confirma tu email
            </p>
            <p style={{ fontFamily: SANS, fontSize: 12, color: "#B45309", margin: 0, lineHeight: 1.5 }}>
              Haz clic en el enlace del email para activar tu cuenta. Expira en 24 horas.
            </p>
          </div>

          {/* Info box — next step */}
          <div style={{
            background: "#EFF6FF", border: "1px solid #BFDBFE",
            borderRadius: 12, padding: "14px 16px",
          }}>
            <p style={{ fontFamily: SANS, fontSize: 13, color: D.navy, margin: 0, lineHeight: 1.5 }}>
              Una vez confirmado podrás acceder y completar tu perfil docente.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={handleResend}
              disabled={resending || resent}
              style={{
                fontFamily: SANS, width: "100%",
                background: D.white, color: D.navy,
                border: `1px solid ${D.border}`,
                padding: "12px", borderRadius: 10,
                fontSize: 14, fontWeight: 700, cursor: resending || resent ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: resending || resent ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {resending ? (
                <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Enviando...</>
              ) : resent ? (
                <><CheckCircle2 size={16} color="#059669" /> Email reenviado ✓</>
              ) : (
                "Reenviar email de verificación"
              )}
            </button>

            <p style={{ fontFamily: SANS, fontSize: 12, color: D.muted, textAlign: "center", margin: 0 }}>
              <Link href="/signup/faculty" style={{ color: D.muted, textDecoration: "underline" }}>
                ¿Email incorrecto? Volver al registro
              </Link>
            </p>

            <Link href="/login" style={{
              fontFamily: SANS, display: "block", textAlign: "center",
              fontSize: 14, fontWeight: 700, color: D.blue, textDecoration: "none",
            }}>
              ¿Ya confirmaste? Acceder →
            </Link>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

export default function FacultyConfirmPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: D.surf }}>
        <Loader2 size={32} color={D.blue} style={{ animation: "spin 1s linear infinite" }} />
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
