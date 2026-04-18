"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "@/app/auth/actions";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

// ─── Tokens ─────────────────────────────────────────────────────────────────
const SERIF = `var(--font-serif, 'Georgia', 'Times New Roman', serif)`;
const SANS  = `var(--font-sans, system-ui, -apple-system, sans-serif)`;
const C = {
  ink: "#0C1018", navy: "#0D2240", brass: "#B8963E",
  cream: "#F7F5F0", white: "#FFFFFF",
  muted: "#6B7280", faint: "#9CA3AF", border: "#E5E1D8",
  error: "#DC2626", errorBg: "#FEF2F2",
};

const inp: React.CSSProperties = {
  fontFamily: SANS, width: "100%", fontSize: 14, color: C.ink,
  background: C.white, border: `1px solid ${C.border}`,
  borderRadius: 8, padding: "11px 14px", outline: "none",
  boxSizing: "border-box" as const,
};

const lbl: React.CSSProperties = {
  fontFamily: SANS, fontSize: 13, fontWeight: 500,
  color: C.ink, display: "block", marginBottom: 6,
};

// ─── Contenido del login ─────────────────────────────────────────────────────
function LoginContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const searchParams   = useSearchParams();
  const message        = searchParams.get("message");
  const next           = searchParams.get("next");
  const urlError       = searchParams.get("error");

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
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "2fr 3fr", fontFamily: SANS }}>

      {/* ── Panel izquierdo — navy ── */}
      <div style={{
        background: C.navy, padding: "48px 44px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        {/* Wordmark */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 5,
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>FM</span>
          </div>
          <span style={{ fontFamily: SERIF, fontSize: 16, color: "#fff" }}>FacultyMatch</span>
        </Link>

        {/* Cuerpo */}
        <div>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: C.brass, marginBottom: 16 }}>
            Directorio de talento educativo
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 400, color: "#fff", lineHeight: 1.25, margin: "0 0 28px", letterSpacing: "-0.02em" }}>
            Bienvenido de nuevo.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              "Tu perfil sigue activo en el directorio",
              "Las instituciones pueden seguir encontrándote",
              "Gestiona tu disponibilidad y privacidad",
              "Revisa las solicitudes que hayas recibido",
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.brass, flexShrink: 0, marginTop: 6 }} />
                <span style={{ fontFamily: SANS, fontSize: 14, color: "rgba(255,255,255,0.58)", lineHeight: 1.55 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie */}
        <span style={{ fontFamily: SANS, fontSize: 11, color: "rgba(255,255,255,0.22)" }}>
          © 2026 FacultyMatch · Grupo Global Educa SL
        </span>
      </div>

      {/* ── Panel derecho — cream ── */}
      <div style={{ background: C.cream, padding: "48px 56px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ maxWidth: 400, margin: "0 auto", width: "100%" }}>

          {/* Cabecera */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 400, color: C.ink, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
              Accede a tu cuenta.
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 14, color: C.muted, margin: 0 }}>
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
            <div style={{ background: C.errorBg, border: "1px solid #FCA5A5", borderRadius: 8, padding: "12px 14px", marginBottom: 20 }}>
              <p style={{ fontFamily: SANS, fontSize: 13, color: C.error, margin: 0 }}>
                {error?.toLowerCase().includes("email not confirmed")
                  ? "Debes confirmar tu email antes de acceder. Revisa tu bandeja de entrada."
                  : error || "Error de autenticación. Por favor, inténtalo de nuevo."}
              </p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <input type="hidden" name="next" value={next || ""} />

            <div>
              <label style={lbl}>Correo electrónico</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="nombre@universidad.edu"
                style={inp}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ ...lbl, marginBottom: 0 }}>Contraseña</label>
                <Link href="/reset-password" style={{ fontFamily: SANS, fontSize: 12, color: C.navy, textDecoration: "none" }}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                name="password"
                type="password"
                required
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
                background: loading ? C.muted : C.navy,
                color: C.white, border: "none",
                padding: "13px 22px", borderRadius: 8,
                fontSize: 14, fontWeight: 600,
                cursor: loading ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                marginTop: 4,
              }}
            >
              {loading
                ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Entrando...</>
                : "Acceder →"
              }
            </button>
          </form>

          <p style={{ fontFamily: SANS, fontSize: 13, color: C.faint, textAlign: "center", marginTop: 24 }}>
            ¿No tienes cuenta?{" "}
            <Link href="/signup" style={{ color: C.navy, fontWeight: 500, textDecoration: "none" }}>
              Crear perfil
            </Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

// ─── Export con Suspense (necesario por useSearchParams) ─────────────────────
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: SERIF, fontSize: 18, color: "rgba(255,255,255,0.5)" }}>
          Cargando...
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
