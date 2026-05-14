"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
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

// ─── Opciones ─────────────────────────────────────────────────────────────────
const AREAS = [
  "Business & Management", "Economía & Finanzas",
  "Derecho & Ciencias Políticas", "Ingeniería & Tecnología",
  "Inteligencia Artificial & Datos", "Salud & Ciencias",
  "Comunicación & Marketing", "Educación",
  "Artes & Humanidades", "Ciencias Sociales",
  "Matemáticas & Estadística", "Sostenibilidad",
];

const LANGUAGES = [
  { code: "ES", label: "Español" }, { code: "EN", label: "Inglés" },
  { code: "FR", label: "Francés" }, { code: "PT", label: "Portugués" },
  { code: "DE", label: "Alemán" },  { code: "IT", label: "Italiano" },
  { code: "ZH", label: "Chino" },   { code: "AR", label: "Árabe" },
];

const MODALITIES   = ["Presencial", "Online", "Híbrida"];

const AVAILABILITY = [
  "Disponible inmediatamente",
  "Disponible próximo semestre",
  "Solo asignaturas puntuales",
  "Solo fines de semana / intensivos",
  "Solo online",
  "Por invitación directa",
];

const COUNTRIES = [
  "España", "México", "Argentina", "Colombia", "Chile", "Perú",
  "Estados Unidos", "Reino Unido", "Alemania", "Francia",
  "Portugal", "Italia", "Países Bajos", "Otro",
];

const INSTITUTION_TYPES = [
  "Universidad pública", "Universidad privada", "Business School",
  "Centro de FP Superior", "Centro online",
  "Academia / Instituto", "Empresa con formación interna", "Otro",
];

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

function Chips({ options, selected, onToggle }: {
  options: string[]; selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
      {options.map(o => {
        const active = selected.includes(o);
        return (
          <button key={o} type="button" onClick={() => onToggle(o)} style={{
            fontFamily: SANS, fontSize: 13, padding: "6px 14px",
            borderRadius: 20, cursor: "pointer",
            border: `1px solid ${active ? D.blue : D.border}`,
            background: active ? D.blue : D.white,
            color: active ? D.white : D.muted,
            transition: "all 0.12s",
          }}>{o}</button>
        );
      })}
    </div>
  );
}

function toggle(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

// ─── Step labels ──────────────────────────────────────────────────────────────
const STEPS = [
  { title: "Crea tu cuenta",       sub: "Solo lo esencial para empezar." },
  { title: "Tu perfil académico",  sub: "Determina en qué búsquedas apareces." },
  { title: "Cómo trabajas",        sub: "Los filtros que usan los directores de programa." },
  { title: "Casi listo",           sub: "Un último paso antes de entrar al directorio." },
];

// ─── Formulario ───────────────────────────────────────────────────────────────
function SignupForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const isInstitution = searchParams.get("intent") === "institution";

  const [step,        setStep]        = useState(1);
  const [loading,     setLoading]     = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  // Paso 1
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPwd,   setShowPwd]   = useState(false);

  // Paso 2
  const [areas,    setAreas]    = useState<string[]>([]);
  const [country,  setCountry]  = useState("");
  const [isPhd,    setIsPhd]    = useState(false);
  const [hasAneca, setHasAneca] = useState(false);

  // Paso 3
  const [languages,    setLanguages]    = useState<string[]>([]);
  const [modalities,   setModalities]   = useState<string[]>([]);
  const [availability, setAvailability] = useState("");

  // Paso 4
  const [wantsInst, setWantsInst] = useState(isInstitution);
  const [instName,  setInstName]  = useState("");
  const [instType,  setInstType]  = useState("");
  const [terms,     setTerms]     = useState(false);

  useEffect(() => {
    if (isInstitution) setWantsInst(true);
  }, [isInstitution]);

  // ── Validaciones ──────────────────────────────────────────────────────────
  const v1 = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "Indica tu nombre.";
    if (!lastName.trim())  e.lastName  = "Indica tus apellidos.";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = "Email no válido.";
    if (password.length < 8) e.password = "Mínimo 8 caracteres.";
    setErrors(e); return !Object.keys(e).length;
  };
  const v2 = () => {
    const e: Record<string, string> = {};
    if (!areas.length) e.areas   = "Selecciona al menos un área.";
    if (!country)      e.country = "Indica tu país.";
    setErrors(e); return !Object.keys(e).length;
  };
  const v3 = () => {
    const e: Record<string, string> = {};
    if (!languages.length)  e.languages  = "Indica al menos un idioma.";
    if (!modalities.length) e.modalities = "Indica al menos una modalidad.";
    if (!availability)      e.availability = "Indica tu disponibilidad.";
    setErrors(e); return !Object.keys(e).length;
  };
  const v4 = () => {
    const e: Record<string, string> = {};
    if (wantsInst && !instName.trim()) e.instName = "Indica el nombre de tu institución.";
    if (wantsInst && !instType)        e.instType = "Selecciona el tipo de centro.";
    if (!terms) e.terms = "Debes aceptar los términos para continuar.";
    setErrors(e); return !Object.keys(e).length;
  };

  const next = () => {
    const valid = [null, v1, v2, v3][step];
    if (valid && !valid()) return;
    setStep(s => s + 1);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!v4()) return;
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
            full_name:    `${firstName.trim()} ${lastName.trim()}`,
            first_name:   firstName.trim(),
            last_name:    lastName.trim(),
            role:         "faculty",
            knowledge_areas:     areas,
            country,
            is_phd:              isPhd,
            aneca_accreditation: hasAneca,
            languages:           languages.map(l => ({ lang: l, level: "Fluido" })),
            modalities,
            availability,
            ...(wantsInst && instName.trim() ? {
              institution_name: instName.trim(),
              institution_type: instType || null,
            } : {}),
            onboarding_completed: true,
            terms_accepted:       true,
            privacy_accepted:     true,
            marketing_opt_in:     false,
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

      router.push(wantsInst ? "/signup/institution/confirm" : "/signup/faculty/confirm");
    } catch {
      setServerError("Error de red. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  const TOTAL = 4;

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "2fr 3fr", fontFamily: SANS }}>

      {/* ── Panel izquierdo — dark ── */}
      <div style={{
        background: `linear-gradient(160deg, ${D.dark} 0%, ${D.navy} 100%)`,
        padding: "48px 44px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        {/* Logo */}
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

          {/* Step tracker */}
          <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 10 }}>
            {STEPS.map((s, i) => {
              const state = i + 1 === step ? "active" : i + 1 < step ? "done" : "pending";
              return (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", opacity: state === "pending" ? 0.3 : 1 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    background: state === "done" ? D.gold : state === "active" ? "rgba(255,255,255,0.15)" : "transparent",
                    border: `1px solid ${state === "pending" ? "rgba(255,255,255,0.2)" : D.gold}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {state === "done"
                      ? <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke={D.navy} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{i + 1}</span>
                    }
                  </div>
                  <span style={{ fontFamily: SANS, fontSize: 13, color: state === "active" ? "#fff" : "rgba(255,255,255,0.5)" }}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <span style={{ fontFamily: SANS, fontSize: 11, color: "rgba(255,255,255,0.22)" }}>
          © 2026 FacultyMatch · Grupo Global Educa SL
        </span>
      </div>

      {/* ── Panel derecho ── */}
      <div style={{ background: D.surf, padding: "48px 56px", overflowY: "auto" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>

          {/* Progress bar */}
          <div style={{ display: "flex", gap: 5, marginBottom: 36 }}>
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: i < step ? D.blue : D.border,
                transition: "background 0.2s",
              }} />
            ))}
          </div>

          {/* Step header */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: D.faint, margin: "0 0 8px" }}>
              Paso {step} de {TOTAL}
            </p>
            <h1 style={{ fontFamily: SANS, fontSize: 26, fontWeight: 900, color: D.ink, margin: 0, letterSpacing: "-0.04em" }}>
              {STEPS[step - 1].title}
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 14, color: D.muted, margin: "6px 0 0" }}>
              {STEPS[step - 1].sub}
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div style={{ background: D.errBg, border: "1px solid #FCA5A5", borderRadius: 8, padding: "12px 14px", marginBottom: 20 }}>
              <p style={{ fontFamily: SANS, fontSize: 13, color: D.error, margin: 0 }}>
                {serverError === "duplicate"
                  ? <>Este email ya está registrado. <Link href="/login" style={{ fontWeight: 600, color: D.error }}>Acceder →</Link></>
                  : serverError
                }
              </p>
            </div>
          )}

          {/* ── PASO 1 — Cuenta ── */}
          {step === 1 && (
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
            </div>
          )}

          {/* ── PASO 2 — Perfil ── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div>
                <label style={lbl}>Áreas de conocimiento <span style={{ color: D.error }}>*</span></label>
                <p style={{ fontFamily: SANS, fontSize: 12, color: D.faint, margin: "0 0 10px" }}>
                  Selecciona las que mejor describen lo que enseñas
                </p>
                <Chips options={AREAS} selected={areas} onToggle={v => setAreas(toggle(areas, v))} />
                {errors.areas && <p style={errStyle}>{errors.areas}</p>}
              </div>
              <div>
                <label style={lbl}>País de residencia <span style={{ color: D.error }}>*</span></label>
                <select style={inp(!!errors.country)} value={country} onChange={e => setCountry(e.target.value)}>
                  <option value="">Selecciona tu país...</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.country && <p style={errStyle}>{errors.country}</p>}
              </div>
              <div>
                <label style={lbl}>Acreditaciones <span style={{ fontFamily: SANS, fontSize: 12, color: D.faint, fontWeight: 400 }}>(opcional)</span></label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { val: isPhd,    set: setIsPhd,    label: "Soy Doctor/a o tengo título de PhD" },
                    { val: hasAneca, set: setHasAneca, label: "Tengo acreditación ANECA" },
                  ].map(({ val, set, label }) => (
                    <label key={label} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                      <input type="checkbox" checked={val} onChange={e => set(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: D.blue }} />
                      <span style={{ fontFamily: SANS, fontSize: 14, color: D.ink }}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PASO 3 — Cómo trabajas ── */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div>
                <label style={lbl}>Idiomas en los que puedes enseñar <span style={{ color: D.error }}>*</span></label>
                <Chips options={LANGUAGES.map(l => l.label)} selected={languages} onToggle={v => setLanguages(toggle(languages, v))} />
                {errors.languages && <p style={errStyle}>{errors.languages}</p>}
              </div>
              <div>
                <label style={lbl}>Modalidad <span style={{ color: D.error }}>*</span></label>
                <Chips options={MODALITIES} selected={modalities} onToggle={v => setModalities(toggle(modalities, v))} />
                {errors.modalities && <p style={errStyle}>{errors.modalities}</p>}
              </div>
              <div>
                <label style={lbl}>Disponibilidad <span style={{ color: D.error }}>*</span></label>
                <select style={inp(!!errors.availability)} value={availability} onChange={e => setAvailability(e.target.value)}>
                  <option value="">Selecciona una opción...</option>
                  {AVAILABILITY.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                {errors.availability && <p style={errStyle}>{errors.availability}</p>}
              </div>
            </div>
          )}

          {/* ── PASO 4 — Institución + términos ── */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{
                background: D.white,
                border: `1px solid ${wantsInst ? D.blue : D.border}`,
                borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s",
              }}>
                <label style={{ display: "flex", gap: 14, padding: "18px 20px", cursor: "pointer", alignItems: "flex-start" }}>
                  <input type="checkbox" checked={wantsInst} onChange={e => setWantsInst(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: D.blue, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: D.ink, marginBottom: 4 }}>
                      También represento a una institución educativa
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: 13, color: D.muted, lineHeight: 1.5 }}>
                      Podrás buscar docentes en el directorio y tendrás acceso dual desde tu cuenta.
                    </div>
                  </div>
                </label>

                {wantsInst && (
                  <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${D.border}`, display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ paddingTop: 16 }}>
                      <label style={lbl}>Nombre de la institución <span style={{ color: D.error }}>*</span></label>
                      <input style={inp(!!errors.instName)} value={instName}
                        onChange={e => setInstName(e.target.value)}
                        placeholder="Universidad / Escuela de Negocios..." />
                      {errors.instName && <p style={errStyle}>{errors.instName}</p>}
                    </div>
                    <div>
                      <label style={lbl}>Tipo de centro <span style={{ color: D.error }}>*</span></label>
                      <select style={inp(!!errors.instType)} value={instType} onChange={e => setInstType(e.target.value)}>
                        <option value="">Selecciona el tipo...</option>
                        {INSTITUTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {errors.instType && <p style={errStyle}>{errors.instType}</p>}
                    </div>
                  </div>
                )}
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
          )}

          {/* ── Botones ── */}
          <div style={{ marginTop: 28, display: "flex", gap: 10 }}>
            {step > 1 && (
              <button type="button" onClick={() => setStep(s => s - 1)} style={{
                fontFamily: SANS, background: D.white, color: D.muted,
                border: `1px solid ${D.border}`, padding: "12px 22px",
                borderRadius: 8, fontSize: 14, cursor: "pointer",
              }}>← Atrás</button>
            )}
            {step < TOTAL ? (
              <button type="button" onClick={next} style={{
                fontFamily: SANS, flex: 1, background: D.blue, color: D.white,
                border: "none", padding: "12px 22px", borderRadius: 8,
                fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em",
              }}>Continuar →</button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading} style={{
                fontFamily: SANS, flex: 1,
                background: loading ? D.muted : D.blue,
                color: D.white, border: "none", padding: "12px 22px",
                borderRadius: 8, fontSize: 14, fontWeight: 700,
                cursor: loading ? "default" : "pointer", letterSpacing: "-0.01em",
              }}>
                {loading ? "Creando perfil..." : "Crear mi perfil"}
              </button>
            )}
          </div>

          <p style={{ fontFamily: SANS, fontSize: 13, color: D.faint, textAlign: "center", marginTop: 18 }}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" style={{ color: D.blue, fontWeight: 500 }}>Acceder</Link>
          </p>
        </div>
      </div>
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
