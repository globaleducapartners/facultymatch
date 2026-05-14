"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

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

const AREAS = [
  "Business & Management", "Economía & Finanzas",
  "Derecho & Ciencias Políticas", "Ingeniería & Tecnología",
  "IA & Datos", "Salud & Ciencias",
  "Comunicación & Marketing", "Educación", "Otros",
];

const AVAILABILITY = [
  "Inmediata", "Próximo semestre", "Puntual", "Por invitación",
];

const inp = (hasErr = false): React.CSSProperties => ({
  fontFamily: SANS, width: "100%", fontSize: 14, color: D.ink,
  background: D.white, border: `1px solid ${hasErr ? D.error : D.border}`,
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

export default function SignupFacultyPage() {
  const router = useRouter();

  const [fullName,     setFullName]     = useState("");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPwd,      setShowPwd]      = useState(false);
  const [area,         setArea]         = useState("");
  const [availability, setAvailability] = useState("");
  const [terms,        setTerms]        = useState(false);

  const [loading,      setLoading]      = useState(false);
  const [serverError,  setServerError]  = useState("");
  const [errors,       setErrors]       = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim())                                       e.fullName     = "Indica tu nombre completo.";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email))          e.email        = "Email no válido.";
    if (password.length < 8)                                    e.password     = "Mínimo 8 caracteres.";
    if (!area)                                                  e.area         = "Selecciona tu área principal.";
    if (!availability)                                          e.availability = "Selecciona tu disponibilidad.";
    if (!terms)                                                 e.terms        = "Debes aceptar los términos para continuar.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError("");

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.facultymatch.app").replace(/\/$/, "");

      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
          data: {
            full_name:            fullName.trim(),
            role:                 "faculty",
            knowledge_areas:      [area],
            availability,
            onboarding_completed: false,
            terms_accepted:       true,
            privacy_accepted:     true,
            consent_version:      "v1",
          },
        },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("already registered") || error.status === 400) {
          setServerError("duplicate");
        } else {
          setServerError(error.message);
        }
        setLoading(false);
        return;
      }

      router.push("/app/faculty");
    } catch {
      setServerError("Error de red. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", fontFamily: SANS }}>

      {/* ── Columna izquierda — Formulario ── */}
      <div style={{ background: D.surf, padding: "56px 52px", overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ maxWidth: 440, width: "100%", margin: "0 auto" }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 7, background: D.blue,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: D.white, fontSize: 11, fontWeight: 800, letterSpacing: "-0.03em" }}>FM</span>
            </div>
            <span style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: D.ink, letterSpacing: "-0.03em" }}>FacultyMatch</span>
          </Link>

          <h1 style={{ fontFamily: SANS, fontSize: 26, fontWeight: 900, color: D.ink, margin: "0 0 6px", letterSpacing: "-0.04em" }}>
            Crea tu perfil docente
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 14, color: D.muted, margin: "0 0 28px" }}>
            Gratis y sin permanencia. En menos de 2 minutos.
          </p>

          {/* Error de servidor */}
          {serverError && (
            <div style={{ background: D.errBg, border: "1px solid #FCA5A5", borderRadius: 8, padding: "12px 14px", marginBottom: 20 }}>
              <p style={{ fontFamily: SANS, fontSize: 13, color: D.error, margin: 0 }}>
                {serverError === "duplicate"
                  ? <>Este email ya está registrado.{" "}<Link href="/login" style={{ fontWeight: 600, color: D.error }}>Acceder →</Link></>
                  : serverError
                }
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            <div>
              <label style={lbl}>Nombre completo <span style={{ color: D.error }}>*</span></label>
              <input
                type="text"
                style={inp(!!errors.fullName)}
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="María García López"
              />
              {errors.fullName && <p style={errStyle}>{errors.fullName}</p>}
            </div>

            <div>
              <label style={lbl}>Email <span style={{ color: D.error }}>*</span></label>
              <input
                type="email"
                style={inp(!!errors.email)}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
              {errors.email && <p style={errStyle}>{errors.email}</p>}
            </div>

            <div>
              <label style={lbl}>Contraseña <span style={{ color: D.error }}>*</span></label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  style={{ ...inp(!!errors.password), paddingRight: 52 }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    fontFamily: SANS, fontSize: 12, color: D.faint,
                  }}
                >{showPwd ? "Ocultar" : "Ver"}</button>
              </div>
              {errors.password && <p style={errStyle}>{errors.password}</p>}
            </div>

            <div>
              <label style={lbl}>Área principal <span style={{ color: D.error }}>*</span></label>
              <select
                style={inp(!!errors.area)}
                value={area}
                onChange={e => setArea(e.target.value)}
              >
                <option value="">Selecciona tu área...</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {errors.area && <p style={errStyle}>{errors.area}</p>}
            </div>

            <div>
              <label style={lbl}>Disponibilidad <span style={{ color: D.error }}>*</span></label>
              <select
                style={inp(!!errors.availability)}
                value={availability}
                onChange={e => setAvailability(e.target.value)}
              >
                <option value="">Selecciona una opción...</option>
                {AVAILABILITY.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {errors.availability && <p style={errStyle}>{errors.availability}</p>}
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={e => setTerms(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: D.blue, marginTop: 2, flexShrink: 0 }}
                />
                <span style={{ fontFamily: SANS, fontSize: 13, color: D.muted, lineHeight: 1.6 }}>
                  He leído y acepto los{" "}
                  <Link href="/terms" target="_blank" style={{ color: D.blue }}>Términos y condiciones</Link>
                  {" "}y la{" "}
                  <Link href="/privacy" target="_blank" style={{ color: D.blue }}>Política de privacidad</Link>
                </span>
              </label>
              {errors.terms && <p style={errStyle}>{errors.terms}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: SANS, background: loading ? D.muted : D.blue,
                color: D.white, border: "none", padding: "13px 22px",
                borderRadius: 8, fontSize: 14, fontWeight: 700,
                cursor: loading ? "default" : "pointer", marginTop: 4,
                letterSpacing: "-0.01em",
              }}
            >
              {loading ? "Creando perfil..." : "Crear mi perfil gratis"}
            </button>
          </form>

          <p style={{ fontFamily: SANS, fontSize: 13, color: D.faint, textAlign: "center", marginTop: 20 }}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" style={{ color: D.blue, fontWeight: 500 }}>Acceder</Link>
          </p>
        </div>
      </div>

      {/* ── Columna derecha — Panel oscuro ── */}
      <div style={{
        background: `linear-gradient(160deg, ${D.dark} 0%, ${D.navy} 100%)`,
        padding: "56px 52px",
        display: "flex", flexDirection: "column", justifyContent: "center",
      }}>
        <div style={{ maxWidth: 400 }}>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(233,160,48,0.15)", border: "1px solid rgba(233,160,48,0.3)",
            borderRadius: 20, padding: "4px 12px", marginBottom: 24,
          }}>
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: D.gold }}>
              Para docentes y expertos
            </span>
          </div>

          <h2 style={{
            fontFamily: SANS, fontSize: 40, fontWeight: 900,
            color: D.white, margin: "0 0 36px", letterSpacing: "-0.04em",
            lineHeight: 1.1,
          }}>
            Publica hoy.
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              "Las instituciones dan el primer paso. Tú respondes si quieres.",
              "Tu empresa no tiene por qué saberlo. Bloquea quién te ve.",
              "Gratuito para docentes. Sin permanencia.",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: "rgba(27,79,216,0.25)", border: "1px solid rgba(27,79,216,0.4)",
                  flexShrink: 0, marginTop: 2,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L3 5L7 1" stroke="#1B4FD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{
                  fontFamily: SANS, fontSize: 15,
                  color: "rgba(247,245,240,0.75)", lineHeight: 1.6,
                }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Stat cards */}
          <div style={{ marginTop: 44, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { n: "2.400+", label: "docentes activos" },
              { n: "380+",   label: "instituciones" },
            ].map(({ n, label }) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, padding: "14px 16px",
              }}>
                <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 900, color: D.white, letterSpacing: "-0.04em" }}>{n}</div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
