"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

// ─── Design tokens ─────────────────────────────────────────────────────────
const SANS = `var(--font-sans, system-ui, -apple-system, sans-serif)`;
const D = {
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
  warn:   "#92400E",
  warnBg: "#FFFBEB",
  warnBr: "#FCD34D",
};

const INSTITUTION_TYPES = [
  "Universidad pública",
  "Universidad privada",
  "Business School",
  "Centro de FP Superior",
  "Centro online",
  "Academia / Instituto",
  "Empresa con formación interna",
  "Otro",
];

const COUNTRIES = [
  "España", "México", "Argentina", "Colombia", "Chile", "Perú",
  "Estados Unidos", "Reino Unido", "Alemania", "Francia",
  "Portugal", "Italia", "Países Bajos", "Otro",
];

const PERSONAL_DOMAINS = new Set([
  "gmail.com", "googlemail.com",
  "yahoo.com", "yahoo.es", "yahoo.co.uk",
  "hotmail.com", "hotmail.es",
  "outlook.com", "outlook.es",
  "icloud.com", "me.com", "mac.com",
  "live.com", "live.es",
  "protonmail.com", "pm.me",
]);

function isPersonalDomain(email: string) {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? PERSONAL_DOMAINS.has(domain) : false;
}

const inp = (err = false): React.CSSProperties => ({
  fontFamily: SANS, width: "100%", fontSize: 14, color: D.ink,
  background: D.white, border: `1px solid ${err ? D.error : D.border}`,
  borderRadius: 8, padding: "10px 14px", outline: "none",
  boxSizing: "border-box" as const,
});

const lbl: React.CSSProperties = {
  fontFamily: SANS, fontSize: 13, fontWeight: 600,
  color: D.ink, display: "block", marginBottom: 6,
};

// ─── Component ─────────────────────────────────────────────────────────────
export function BecomeInstitutionClient({
  userEmail,
  registerAction,
}: {
  userEmail: string;
  registerAction: (formData: FormData) => Promise<{ error: string } | void>;
}) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Step 1 fields
  const [instName, setInstName] = useState("");
  const [instType, setInstType] = useState("");
  const [country,  setCountry]  = useState("");
  const [city,     setCity]     = useState("");
  const [website,  setWebsite]  = useState("");

  // Step 2 fields
  const [contactEmail, setContactEmail] = useState(userEmail);
  const [terms,        setTerms]        = useState(false);

  const warnPersonal = step === 2 && !!contactEmail && isPersonalDomain(contactEmail);

  function validateStep1() {
    const e: Record<string, string> = {};
    if (!instName.trim()) e.instName = "El nombre es obligatorio.";
    if (!instType)         e.instType = "Selecciona el tipo de institución.";
    if (!country)          e.country  = "Selecciona el país.";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e: Record<string, string> = {};
    if (!contactEmail.trim() || !/\S+@\S+\.\S+/.test(contactEmail))
      e.contactEmail = "Email no válido.";
    if (!terms) e.terms = "Debes aceptar los términos para continuar.";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  }

  function goNext() {
    if (step === 1 && !validateStep1()) return;
    setStep(2);
  }

  function handleSubmit() {
    if (!validateStep2()) return;
    setServerError("");
    const fd = new FormData();
    fd.set("name",         instName.trim());
    fd.set("type",         instType);
    fd.set("country",      country);
    fd.set("city",         city);
    fd.set("website",      website.trim());
    fd.set("contactEmail", contactEmail.trim().toLowerCase());

    startTransition(async () => {
      const result = await registerAction(fd);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", fontFamily: SANS }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        {/* Progress pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {[1, 2].map(n => (
            <div key={n} style={{
              flex: 1, height: 4, borderRadius: 4,
              background: n <= step ? D.blue : D.border,
              transition: "background 0.25s",
            }} />
          ))}
        </div>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(27,79,216,0.08)", border: "1px solid rgba(27,79,216,0.2)",
          borderRadius: 20, padding: "4px 12px", marginBottom: 12,
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: D.blue }}>
            Paso {step} de 2
          </span>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 900, color: D.ink, margin: "0 0 6px", letterSpacing: "-0.04em" }}>
          {step === 1 ? "Registra tu institución" : "Email institucional y acceso"}
        </h1>
        <p style={{ fontSize: 14, color: D.muted, margin: 0 }}>
          {step === 1
            ? "Datos básicos de tu centro para aparecer en el directorio."
            : "Confirma el email de contacto y acepta las condiciones."}
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: D.white,
        border: `1px solid ${D.border}`,
        borderRadius: 16,
        padding: "28px 32px",
        boxShadow: "0 2px 12px rgba(13,34,64,0.06)",
      }}>

        {/* Server error */}
        {serverError && (
          <div style={{
            background: D.errBg, border: `1px solid #FCA5A5`,
            borderRadius: 8, padding: "12px 16px", marginBottom: 20,
          }}>
            <p style={{ fontFamily: SANS, fontSize: 13, color: D.error, margin: 0 }}>{serverError}</p>
          </div>
        )}

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={lbl}>Nombre de la institución <span style={{ color: D.error }}>*</span></label>
              <input
                style={inp(!!fieldErrors.instName)}
                value={instName}
                onChange={e => setInstName(e.target.value)}
                placeholder="Universidad Complutense de Madrid..."
              />
              {fieldErrors.instName && (
                <p style={{ fontFamily: SANS, fontSize: 12, color: D.error, marginTop: 4 }}>{fieldErrors.instName}</p>
              )}
            </div>

            <div>
              <label style={lbl}>Tipo de institución <span style={{ color: D.error }}>*</span></label>
              <select style={inp(!!fieldErrors.instType)} value={instType} onChange={e => setInstType(e.target.value)}>
                <option value="">Selecciona el tipo...</option>
                {INSTITUTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {fieldErrors.instType && (
                <p style={{ fontFamily: SANS, fontSize: 12, color: D.error, marginTop: 4 }}>{fieldErrors.instType}</p>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={lbl}>País <span style={{ color: D.error }}>*</span></label>
                <select style={inp(!!fieldErrors.country)} value={country} onChange={e => setCountry(e.target.value)}>
                  <option value="">Selecciona país...</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {fieldErrors.country && (
                  <p style={{ fontFamily: SANS, fontSize: 12, color: D.error, marginTop: 4 }}>{fieldErrors.country}</p>
                )}
              </div>
              <div>
                <label style={lbl}>Ciudad <span style={{ fontWeight: 400, color: D.faint }}>(opcional)</span></label>
                <input
                  style={inp()}
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Madrid, Barcelona..."
                />
              </div>
            </div>

            <div>
              <label style={lbl}>Web institucional <span style={{ fontWeight: 400, color: D.faint }}>(opcional)</span></label>
              <input
                style={inp()}
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://www.tuuniversidad.es"
                type="url"
              />
            </div>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Summary of step 1 */}
            <div style={{
              background: D.surf,
              border: `1px solid ${D.border}`,
              borderRadius: 10,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}>
              <div>
                <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: D.faint, margin: "0 0 2px" }}>
                  Institución
                </p>
                <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: D.ink, margin: 0 }}>{instName}</p>
                <p style={{ fontFamily: SANS, fontSize: 12, color: D.muted, margin: "2px 0 0" }}>{instType} · {country}</p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  fontFamily: SANS, fontSize: 12, fontWeight: 600, color: D.blue,
                  background: "none", border: "none", cursor: "pointer", padding: "4px 8px",
                  borderRadius: 6, flexShrink: 0,
                }}
              >
                Editar
              </button>
            </div>

            {/* Email */}
            <div>
              <label style={lbl}>
                Email de contacto institucional <span style={{ color: D.error }}>*</span>
              </label>
              <p style={{ fontFamily: SANS, fontSize: 12, color: D.faint, margin: "0 0 8px" }}>
                Usa el email de tu dominio corporativo (p. ej. tu@universidad.es).
              </p>
              <input
                type="email"
                style={inp(!!fieldErrors.contactEmail)}
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="contacto@universidad.es"
              />
              {fieldErrors.contactEmail && (
                <p style={{ fontFamily: SANS, fontSize: 12, color: D.error, marginTop: 4 }}>{fieldErrors.contactEmail}</p>
              )}
              {/* Personal domain warning */}
              {warnPersonal && !fieldErrors.contactEmail && (
                <div style={{
                  display: "flex", gap: 10, alignItems: "flex-start",
                  background: D.warnBg, border: `1px solid ${D.warnBr}`,
                  borderRadius: 8, padding: "10px 14px", marginTop: 8,
                }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
                  <p style={{ fontFamily: SANS, fontSize: 12, color: D.warn, margin: 0, lineHeight: 1.5 }}>
                    Este parece un email personal (Gmail, Hotmail, etc.). Te recomendamos usar el email corporativo
                    de tu institución para más credibilidad ante los docentes.
                  </p>
                </div>
              )}
            </div>

            {/* Freemium info */}
            <div style={{
              background: "rgba(27,79,216,0.04)",
              border: "1px solid rgba(27,79,216,0.15)",
              borderRadius: 10,
              padding: "14px 16px",
            }}>
              <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: D.blue, margin: "0 0 6px" }}>
                Plan Esencial — Gratis
              </p>
              <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                {[
                  "2 búsquedas por mes incluidas",
                  "Acceso al directorio completo de docentes",
                  "Filtros por área, idioma, país y acreditación",
                  "Actualiza a Pro para búsquedas ilimitadas",
                ].map(t => (
                  <li key={t} style={{ fontFamily: SANS, fontSize: 12, color: D.muted, lineHeight: 1.6 }}>{t}</li>
                ))}
              </ul>
            </div>

            {/* Terms */}
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
              {fieldErrors.terms && (
                <p style={{ fontFamily: SANS, fontSize: 12, color: D.error, marginTop: 4 }}>{fieldErrors.terms}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        {step > 1 && (
          <button
            type="button"
            onClick={() => { setStep(1); setServerError(""); }}
            style={{
              fontFamily: SANS, background: D.white, color: D.muted,
              border: `1px solid ${D.border}`, padding: "12px 22px",
              borderRadius: 8, fontSize: 14, cursor: "pointer",
            }}
          >
            ← Atrás
          </button>
        )}

        {step === 1 ? (
          <button
            type="button"
            onClick={goNext}
            style={{
              fontFamily: SANS, flex: 1, background: D.blue, color: D.white,
              border: "none", padding: "13px 22px", borderRadius: 8,
              fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em",
            }}
          >
            Continuar →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            style={{
              fontFamily: SANS, flex: 1,
              background: isPending ? D.muted : D.blue,
              color: D.white, border: "none", padding: "13px 22px",
              borderRadius: 8, fontSize: 14, fontWeight: 700,
              cursor: isPending ? "default" : "pointer", letterSpacing: "-0.01em",
            }}
          >
            {isPending ? "Registrando institución..." : "Registrar institución y acceder →"}
          </button>
        )}
      </div>

      <p style={{ fontFamily: SANS, fontSize: 12, color: D.faint, textAlign: "center", marginTop: 16 }}>
        ¿Quieres permanecer solo como docente?{" "}
        <Link href="/app/faculty" style={{ color: D.blue, fontWeight: 500 }}>Volver al panel</Link>
      </p>
    </div>
  );
}
