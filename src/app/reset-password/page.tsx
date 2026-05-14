"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

const SANS = `var(--font-sans, system-ui, -apple-system, sans-serif)`;
const D = {
  dark:   "#071326",
  navy:   "#0D2240",
  blue:   "#1B4FD8",
  surf:   "#F2F6FC",
  white:  "#FFFFFF",
  ink:    "#0C1018",
  muted:  "#6B7280",
  border: "#D8E2EF",
  error:  "#DC2626",
};

export default function ResetPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.facultymatch.app"}/auth/callback?next=/update-password`,
    });

    if (error) {
      setError("No hemos podido procesar tu solicitud. Verifica el email e inténtalo de nuevo.");
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: D.surf, padding: "48px 24px", fontFamily: SANS,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 7, background: D.blue,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: "-0.03em" }}>FM</span>
            </div>
            <span style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: D.ink, letterSpacing: "-0.03em" }}>
              FacultyMatch
            </span>
          </Link>
        </div>

        {sent ? (
          <div style={{
            background: D.white, borderRadius: 16, border: `1px solid ${D.border}`,
            padding: "40px 36px", textAlign: "center",
            display: "flex", flexDirection: "column", gap: 12, alignItems: "center",
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: 14,
              background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CheckCircle2 size={28} color="#16A34A" />
            </div>
            <h1 style={{ fontFamily: SANS, fontSize: 22, fontWeight: 900, color: D.ink, letterSpacing: "-0.04em", margin: 0 }}>
              ¡Email enviado!
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 14, color: D.muted, lineHeight: 1.6, margin: 0 }}>
              Revisa tu bandeja en <strong style={{ color: D.ink }}>{email}</strong>.
              Te hemos enviado un enlace para restablecer tu contraseña.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 12, color: "#9CA3AF", margin: 0 }}>
              ¿No lo encuentras? Revisa la carpeta de spam.
            </p>
            <Link href="/login" style={{
              display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8,
              fontFamily: SANS, fontSize: 14, fontWeight: 600, color: D.blue, textDecoration: "none",
            }}>
              <ArrowLeft size={15} /> Volver al acceso
            </Link>
          </div>
        ) : (
          <div style={{
            background: D.white, borderRadius: 16, border: `1px solid ${D.border}`,
            padding: "40px 36px", display: "flex", flexDirection: "column", gap: 24,
          }}>
            <div>
              <h1 style={{ fontFamily: SANS, fontSize: 24, fontWeight: 900, color: D.ink, letterSpacing: "-0.04em", margin: "0 0 8px" }}>
                Recuperar contraseña
              </h1>
              <p style={{ fontFamily: SANS, fontSize: 14, color: D.muted, margin: 0 }}>
                Introduce tu email y te enviamos un enlace para crear una nueva contraseña.
              </p>
            </div>

            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "12px 14px" }}>
                <p style={{ fontFamily: SANS, fontSize: 13, color: D.error, margin: 0 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: D.muted, display: "block", marginBottom: 8 }}>
                  Email profesional
                </label>
                <input
                  type="email" required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nombre@universidad.edu"
                  style={{
                    fontFamily: SANS, width: "100%", fontSize: 14, color: D.ink,
                    background: D.white, border: `1px solid ${D.border}`,
                    borderRadius: 8, padding: "12px 14px", outline: "none",
                    boxSizing: "border-box" as const,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                style={{
                  fontFamily: SANS, width: "100%",
                  background: loading || !email ? "#94A3B8" : D.blue,
                  color: D.white, border: "none",
                  padding: "14px 22px", borderRadius: 8,
                  fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em",
                  cursor: loading || !email ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Enviando...</> : "Enviar enlace de recuperación"}
              </button>
            </form>

            <p style={{ fontFamily: SANS, fontSize: 13, color: D.muted, textAlign: "center", margin: 0 }}>
              <Link href="/login" style={{ color: D.blue, fontWeight: 600, textDecoration: "none" }}>
                ← Volver al acceso
              </Link>
            </p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
