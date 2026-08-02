"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signUp } from "@/app/auth/actions";
import { submitAcquisitionData } from "@/lib/acquisition";
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

// ─── UI helpers ───────────────────────────────────────────────────────────────
const inp = (err = false): React.CSSProperties => ({
  fontFamily: SANS, width: "100%", fontSize: 14, color: D.ink,
  background: D.white, border: `1px solid ${err ? D.error : D.border}`,
  borderRadius: 8, padding: "10px 14px", outline: "none",
  boxSizing: "border-box" as const,
});

const lbl: React.CSSProperties = {
  fontFamily: SANS, fontSize: 13, fontWeight: 500,
  color: D.ink, display: "block", marginBottom: 6,
};

const errStyle: React.CSSProperties = {
  fontFamily: SANS, fontSize: 12, color: D.error, marginTop: 4,
};

// ─── Formulario ───────────────────────────────────────────────────────────────
function SignupForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [loading,     setLoading]     = useState(false);
  const [serverError, setServerError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPwd,   setShowPwd]   = useState(false);
  const [terms,     setTerms]     = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  // ── Validación ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "Indica tu nombre.";
    if (!lastName.trim())  e.lastName  = "Indica tus apellidos.";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = "Email no válido.";
    if (password.length < 8) e.password = "Mínimo 8 caracteres.";
    if (!terms) e.terms = "Debes aceptar los términos para continuar.";
    setErrors(e); return !Object.keys(e).length;
  };

  // Institución si llega por cualquiera de los dos parámetros que usan los
  // distintos CTAs del sitio (?intent=institution en marketing, ?role=institution
  // en algún enlace interno) — antes esto se calculaba pero nunca se usaba para
  // decidir el rol real, así que CUALQUIER registro (institución incluida)
  // creaba siempre una cuenta de docente.
  const isInstitution =
    searchParams.get("intent") === "institution" ||
    searchParams.get("role") === "institution";

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setServerError("");

    try {
      const role = isInstitution ? "institution" : "faculty";
      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      const formData = new FormData();
      formData.append("email", email.trim().toLowerCase());
      formData.append("password", password);
      formData.append("fullName", fullName);
      formData.append("role", role);
      // Sin un campo dedicado en este formulario, el nombre de la institución
      // se rellena con el nombre de la persona — se corrige de inmediato desde
      // /app/institution, que ya lo deja editar.
      if (role === "institution") formData.append("institutionName", fullName);
      formData.append("terms_accepted", terms ? "on" : "off");
      formData.append("privacy_accepted", terms ? "on" : "off");
      formData.append("marketing_opt_in", "off");

      const result = await signUp(formData);

      if (result?.error) {
        setServerError(result.error);
        setLoading(false);
        return;
      }

      // Track acquisition
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        submitAcquisitionData(user.id);
      }

      // signUp() ya hace redirect() en el servidor según el rol
      // (faculty → /auth/verificar-email, institution → /app/institution);
      // esto es solo un respaldo por si esa redirección no se produce.
      window.location.href = role === "institution" ? "/app/institution" : "/app/faculty/onboarding";
    } catch (err) {
      console.error("[Signup] Unexpected error:", err);
      setServerError("Error de red. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div id="fm-signup-layout" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "2fr 3fr", fontFamily: SANS }}>

      {/* ── Panel izquierdo — dark ── */}
      <div id="fm-signup-left" style={{
        background: `linear-gradient(160deg, ${D.dark} 0%, ${D.navy} 100%)`,
        padding: "48px 44px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        <Logo variant="light" />

        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(233,160,48,0.15)", border: "1px solid rgba(233,160,48,0.3)",
            borderRadius: 20, padding: "4px 12px", marginBottom: 20,
          }}>
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: D.gold }}>
              Directorio académico global
            </span>
          </div>
          <h2 style={{ fontFamily: SANS, fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.2, margin: "0 0 24px", letterSpacing: "-0.04em" }}>
            Un perfil para todo lo que sabes hacer.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              "Apareces en búsquedas de instituciones educativas",
              "Tú decides si respondes y en qué condiciones",
              "Puedes también registrar tu institución",
              "Gratuito siempre para docentes y expertos",
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
        </div>

        <span style={{ fontFamily: SANS, fontSize: 11, color: "rgba(255,255,255,0.22)" }}>
          © 2026 FacultyMatch · Grupo Global Educa SL
        </span>
      </div>

      {/* ── Panel derecho ── */}
      <div id="fm-signup-right" style={{ background: D.surf, padding: "48px 56px", overflowY: "auto" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>

          {/* Logo visible only on mobile */}
          <div id="fm-signup-mobile-logo" style={{ display: "none", marginBottom: 24 }}>
            <Logo />
          </div>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: SANS, fontSize: 26, fontWeight: 900, color: D.ink, margin: 0, letterSpacing: "-0.04em" }}>
              Crea tu cuenta
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 14, color: D.muted, margin: "6px 0 0" }}>
              Solo lo esencial para empezar. Completarás tu perfil después.
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div style={{ background: D.errBg, border: "1px solid #FCA5A5", borderRadius: 8, padding: "12px 14px", marginBottom: 20 }}>
              <p style={{ fontFamily: SANS, fontSize: 13, color: D.error, margin: 0 }}>
                {serverError === "duplicate" || serverError.toLowerCase().includes("already registered")
                  ? <>Este email ya está registrado. <Link href="/login" style={{ fontWeight: 600, color: D.error }}>Acceder →</Link></>
                  : serverError
                }
              </p>
            </div>
          )}

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={lbl}>Nombre <span style={{ color: D.error }}>*</span></label>
                <input style={inp(!!errors.firstName)} value={firstName}
                  onChange={e => setFirstName(e.target.value)} placeholder="María" />
                {errors.firstName && <p style={errStyle}>{errors.firstName}</p>}
              </div>
              <div>
                <label style={lbl}>Apellidos <span style={{ color: D.error }}>*</span></label>
                <input style={inp(!!errors.lastName)} value={lastName}
                  onChange={e => setLastName(e.target.value)} placeholder="García" />
                {errors.lastName && <p style={errStyle}>{errors.lastName}</p>}
              </div>
            </div>
            <div>
              <label style={lbl}>Email <span style={{ color: D.error }}>*</span></label>
              <input type="email" style={inp(!!errors.email)} value={email}
                onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />
              {errors.email && <p style={errStyle}>{errors.email}</p>}
            </div>
            <div>
              <label style={lbl}>Contraseña <span style={{ color: D.error }}>*</span></label>
              <div style={{ position: "relative" }}>
                <input type={showPwd ? "text" : "password"}
                  style={{ ...inp(!!errors.password), paddingRight: 48 }}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: SANS, fontSize: 12, color: D.faint,
                }}>{showPwd ? "Ocultar" : "Ver"}</button>
              </div>
              {errors.password && <p style={errStyle}>{errors.password}</p>}
            </div>

            <div style={{ paddingTop: 4 }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: D.blue, marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontFamily: SANS, fontSize: 13, color: D.muted, lineHeight: 1.6 }}>
                  He leído y acepto los{" "}
                  <Link href="/terms" target="_blank" style={{ color: D.blue }}>Términos y condiciones</Link>
                  {" "}y la{" "}
                  <Link href="/privacy" target="_blank" style={{ color: D.blue }}>Política de privacidad</Link>
                </span>
              </label>
              {errors.terms && <p style={errStyle}>{errors.terms}</p>}
            </div>
          </div>

          {/* Submit button */}
          <div style={{ marginTop: 28 }}>
            <button type="button" onClick={handleSubmit} disabled={loading} style={{
              fontFamily: SANS, width: "100%",
              background: loading ? D.muted : D.blue,
              color: D.white, border: "none", padding: "12px 22px",
              borderRadius: 8, fontSize: 14, fontWeight: 700,
              cursor: loading ? "default" : "pointer", letterSpacing: "-0.01em",
            }}>
              {loading ? "Creando perfil..." : "Crear mi perfil"}
            </button>
          </div>

          <p style={{ fontFamily: SANS, fontSize: 13, color: D.faint, textAlign: "center", marginTop: 18 }}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" style={{ color: D.blue, fontWeight: 500 }}>Acceder</Link>
          </p>

          <p style={{ fontFamily: SANS, fontSize: 12, color: D.muted, textAlign: "center", marginTop: 12 }}>
            {isInstitution ? (
              <>
                ¿Eres docente?{" "}
                <Link href="/signup" style={{ color: D.blue, fontWeight: 500 }}>
                  Crea tu perfil docente aquí
                </Link>
              </>
            ) : (
              <>
                ¿Eres una institución?{" "}
                <Link href="/signup?intent=institution" style={{ color: D.blue, fontWeight: 500 }}>
                  Registra tu institución aquí
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          #fm-signup-layout { display: flex !important; flex-direction: column !important; }
          #fm-signup-left   { display: none !important; }
          #fm-signup-right  { padding: 36px 24px !important; }
          #fm-signup-mobile-logo { display: block !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function SignupPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: D.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: SANS, fontSize: 18, color: "rgba(255,255,255,0.4)" }}>
          Cargando...
        </div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}