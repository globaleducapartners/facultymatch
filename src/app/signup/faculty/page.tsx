"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const SERIF = `var(--font-serif, 'Georgia', 'Times New Roman', serif)`;
const SANS  = `var(--font-sans, system-ui, -apple-system, sans-serif)`;
const C = {
  ink: "#0C1018", navy: "#0D2240", brass: "#B8963E",
  cream: "#F7F5F0", white: "#FFFFFF",
  muted: "#6B7280", faint: "#9CA3AF", border: "#E5E1D8",
  error: "#DC2626", errorBg: "#FEF2F2",
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

// ─── UI helpers ───────────────────────────────────────────────────────────────
const inp = (hasErr = false): React.CSSProperties => ({
  fontFamily: SANS, width: "100%", fontSize: 14, color: C.ink,
  background: C.white, border: `1px solid ${hasErr ? C.error : C.border}`,
  borderRadius: 8, padding: "10px 14px", outline: "none",
  boxSizing: "border-box" as const,
});

const lbl: React.CSSProperties = {
  fontFamily: SANS, fontSize: 13, fontWeight: 500,
  color: C.ink, display: "block", marginBottom: 6,
};

const errStyle: React.CSSProperties = {
  fontFamily: SANS, fontSize: 12, color: C.error, marginTop: 4,
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
    if (!fullName.trim())                        e.fullName     = "Indica tu nombre completo.";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = "Email no válido.";
    if (password.length < 8)                     e.password     = "Mínimo 8 caracteres.";
    if (!area)                                   e.area         = "Selecciona tu área principal.";
    if (!availability)                           e.availability = "Selecciona tu disponibilidad.";
    if (!terms)                                  e.terms        = "Debes aceptar los términos para continuar.";
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
    <div style={{
      minHeight: "100vh", display: "grid",
      gridTemplateColumns: "1fr 1fr",
      fontFamily: SANS,
    }}>

      {/* ── Columna izquierda — Formulario ── */}
      <div style={{ background: C.cream, padding: "56px 52px", overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ maxWidth: 440, width: "100%", margin: "0 auto" }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 8, marginBottom: 36 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 5,
              background: C.navy, border: "1px solid rgba(13,34,64,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: C.white, fontSize: 10, fontWeight: 700 }}>FM</span>
            </div>
            <span style={{ fontFamily: SERIF, fontSize: 16, color: C.ink }}>FacultyMatch</span>
          </Link>

          <h1 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 400, color: C.ink, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Crea tu perfil docente.
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 14, color: C.muted, margin: "0 0 28px" }}>
            Gratis y sin permanencia. En menos de 2 minutos.
          </p>

          {/* Error de servidor */}
          {serverError && (
            <div style={{ background: C.errorBg, border: "1px solid #FCA5A5", borderRadius: 8, padding: "12px 14px", marginBottom: 20 }}>
              <p style={{ fontFamily: SANS, fontSize: 13, color: C.error, margin: 0 }}>
                {serverError === "duplicate"
                  ? <>Este email ya está registrado.{" "}<Link href="/login" style={{ fontWeight: 600, color: C.error }}>Acceder →</Link></>
                  : serverError
                }
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Nombre completo */}
            <div>
              <label style={lbl}>Nombre completo <span style={{ color: C.error }}>*</span></label>
              <input
                type="text"
                style={inp(!!errors.fullName)}
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="María García López"
              />
              {errors.fullName && <p style={errStyle}>{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label style={lbl}>Email <span style={{ color: C.error }}>*</span></label>
              <input
                type="email"
                style={inp(!!errors.email)}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
              {errors.email && <p style={errStyle}>{errors.email}</p>}
            </div>

            {/* Contraseña */}
            <div>
              <label style={lbl}>Contraseña <span style={{ color: C.error }}>*</span></label>
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
                    fontFamily: SANS, fontSize: 12, color: C.faint,
                  }}
                >{showPwd ? "Ocultar" : "Ver"}</button>
              </div>
              {errors.password && <p style={errStyle}>{errors.password}</p>}
            </div>

            {/* Área principal */}
            <div>
              <label style={lbl}>Área principal <span style={{ color: C.error }}>*</span></label>
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

            {/* Disponibilidad */}
            <div>
              <label style={lbl}>Disponibilidad <span style={{ color: C.error }}>*</span></label>
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

            {/* Términos */}
            <div>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={e => setTerms(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: C.navy, marginTop: 2, flexShrink: 0 }}
                />
                <span style={{ fontFamily: SANS, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                  He leído y acepto los{" "}
                  <Link href="/terms" target="_blank" style={{ color: C.navy }}>Términos y condiciones</Link>
                  {" "}y la{" "}
                  <Link href="/privacy" target="_blank" style={{ color: C.navy }}>Política de privacidad</Link>
                </span>
              </label>
              {errors.terms && <p style={errStyle}>{errors.terms}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: SANS, background: loading ? C.muted : C.navy,
                color: C.white, border: "none", padding: "13px 22px",
                borderRadius: 8, fontSize: 14, fontWeight: 600,
                cursor: loading ? "default" : "pointer", marginTop: 4,
              }}
            >
              {loading ? "Creando perfil..." : "Crear mi perfil gratis"}
            </button>
          </form>

          {/* Footer */}
          <p style={{ fontFamily: SANS, fontSize: 13, color: C.faint, textAlign: "center", marginTop: 20 }}>
            ¿Ya tengo cuenta?{" "}
            <Link href="/login" style={{ color: C.navy, fontWeight: 500 }}>Acceder</Link>
          </p>
        </div>
      </div>

      {/* ── Columna derecha — Panel navy ── */}
      <div style={{
        background: C.navy, padding: "56px 52px",
        display: "flex", flexDirection: "column", justifyContent: "center",
      }}>
        <div style={{ maxWidth: 400 }}>

          {/* Titular */}
          <h2 style={{
            fontFamily: SERIF, fontSize: 48, fontWeight: 400,
            color: C.white, margin: "0 0 40px", letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}>
            Publica hoy.
          </h2>

          {/* Bullets */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {[
              "Las instituciones dan el primer paso. Tú respondes si quieres.",
              "Tu empresa no tiene por qué saberlo. Bloquea quién te ve.",
              "Gratuito para docentes. Sin permanencia.",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: C.brass, flexShrink: 0, marginTop: 8,
                }} />
                <span style={{
                  fontFamily: SANS, fontSize: 16,
                  color: "rgba(247,245,240,0.82)", lineHeight: 1.6,
                }}>{text}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
