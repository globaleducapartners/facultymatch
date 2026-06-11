"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "@/app/auth/actions";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

// ─── Design tokens ────────────────────────────────────────────────────────────
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
  faint:  "#9CA3AF",
  border: "#D8E2EF",
  error:  "#DC2626",
  errBg:  "#FEF2F2",
};

const inp: React.CSSProperties = {
  fontFamily: SANS, width: "100%", fontSize: 14, color: D.ink,
  background: D.white, border: `1px solid ${D.border}`,
  borderRadius: 8, padding: "11px 14px", outline: "none",
  boxSizing: "border-box" as const,
};

const lbl: React.CSSProperties = {
  fontFamily: SANS, fontSize: 13, fontWeight: 500,
  color: D.ink, display: "block", marginBottom: 6,
};

// ─── Login form ───────────────────────────────────────────────────────────────
function LoginContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const searchParams = useSearchParams();
  const message  = searchParams.get("message");
  const next     = searchParams.get("next");
  const urlError = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div id="fm-login-layout" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "2fr 3fr", fontFamily: SANS }}>

      {/* ── Panel izquierdo — dark ── */}
      <div id="fm-login-left" style={{
        background: `linear-gradient(160deg, ${D.dark} 0%, ${D.navy} 100%)`,
        padding: "48px 44px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        {/* Wordmark */}
        <Logo variant="light" />

        {/* Cuerpo */}
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(233,160,48,0.15)", border: "1px solid rgba(233,160,48,0.3)",
            borderRadius: 20, padding: "4px 12px", marginBottom: 20,
          }}>
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: D.gold }}>
              Tu red académica
            </span>
          </div>
          <h2 style={{
            fontFamily: SANS, fontSize: 32, fontWeight: 900, color: "#fff",
            lineHeight: 1.15, margin: "0 0 28px", letterSpacing: "-0.04em",
          }}>
            Bienvenido de nuevo.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "Tu perfil sigue activo en el directorio",
              "Las instituciones pueden seguir encontrándote",
              "Gestiona tu disponibilidad y privacidad",
              "Revisa las solicitudes que hayas recibido",
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: "rgba(27,79,216,0.25)", border: "1px solid rgba(27,79,216,0.4)",
                  flexShrink: 0, marginTop: 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L3 5L7 1" stroke="#1B4FD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ fontFamily: SANS, fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>{t}</span>
              </div>
            ))}
          </div>

          {/* Stat strip */}
          <div style={{
            marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}>
            {[
              { n: "500+", label: "expertos verificados" },
              { n: "80+",  label: "instituciones educativas" },
            ].map(({ n, label }) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, padding: "14px 16px",
              }}>
                <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em" }}>{n}</div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie */}
        <span style={{ fontFamily: SANS, fontSize: 11, color: "rgba(255,255,255,0.22)" }}>
          © 2026 FacultyMatch · Grupo Global Educa SL
        </span>
      </div>

      {/* ── Panel derecho — blanco ── */}
      <div id="fm-login-right" style={{ background: D.surf, padding: "48px 56px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ maxWidth: 400, margin: "0 auto", width: "100%" }}>

          {/* Logo visible only on mobile */}
          <div id="fm-login-mobile-logo" style={{ display: "none", marginBottom: 28 }}>
            <Logo />
          </div>

          {/* Cabecera */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: SANS, fontSize: 26, fontWeight: 900, color: D.ink, margin: "0 0 6px", letterSpacing: "-0.04em" }}>
              Accede a tu cuenta
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 14, color: D.muted, margin: 0 }}>
              Introduce tu email y contraseña para continuar.
            </p>
          </div>

          {/* Mensaje de confirmación */}
          {message && (
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "12px 14px", marginBottom: 20 }}>
              <p style={{ fontFamily: SANS, fontSize: 13, color: "#15803D", margin: 0 }}>{message}</p>
            </div>
          )}

          {/* Error */}
          {(error || urlError) && (
            <div style={{ background: D.errBg, border: "1px solid #FCA5A5", borderRadius: 8, padding: "12px 14px", marginBottom: 20 }}>
              <p style={{ fontFamily: SANS, fontSize: 13, color: D.error, margin: 0 }}>
                {error?.toLowerCase().includes("email not confirmed")
                  ? "Debes confirmar tu email antes de acceder. Revisa tu bandeja de entrada."
                  : error || "Error de autenticación. Inténtalo de nuevo."}
              </p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <input type="hidden" name="next" value={next || ""} />

            <div>
              <label style={lbl}>Correo electrónico</label>
              <input
                name="email" type="email" required
                autoComplete="email"
                placeholder="nombre@universidad.edu"
                style={inp}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ ...lbl, marginBottom: 0 }}>Contraseña</label>
                <Link href="/reset-password" style={{ fontFamily: SANS, fontSize: 12, color: D.blue, textDecoration: "none" }}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                name="password" type="password" required
                autoComplete="current-password"
                placeholder="••••••••"
                style={inp}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: SANS, width: "100%",
                background: loading ? D.muted : D.blue,
                color: D.white, border: "none",
                padding: "13px 22px", borderRadius: 8,
                fontSize: 14, fontWeight: 700,
                cursor: loading ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                marginTop: 4, letterSpacing: "-0.01em",
              }}
            >
              {loading
                ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Entrando...</>
                : "Acceder →"
              }
            </button>
          </form>

          <div style={{ margin: "24px 0", borderTop: `1px solid ${D.border}` }} />

          <p style={{ fontFamily: SANS, fontSize: 13, color: D.faint, textAlign: "center" }}>
            ¿No tienes cuenta?{" "}
            <Link href="/signup" style={{ color: D.blue, fontWeight: 600, textDecoration: "none" }}>
              Crear perfil gratis
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @media (max-width: 767px) {
          #fm-login-layout { display: flex !important; flex-direction: column !important; }
          #fm-login-left   { display: none !important; }
          #fm-login-right  { padding: 36px 24px !important; justify-content: flex-start !important; }
          #fm-login-mobile-logo { display: block !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Export con Suspense ──────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: D.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: SANS, fontSize: 18, color: "rgba(255,255,255,0.4)" }}>
          Cargando...
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
