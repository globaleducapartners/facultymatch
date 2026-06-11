"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

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

interface UniversitySuggestion {
  id: number;
  name: string;
  acronym: string | null;
  domain: string | null;
  city: string | null;
  autonomous_community: string | null;
}

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

  // Autocomplete state
  const [suggestions,     setSuggestions]     = useState<UniversitySuggestion[]>([]);
  const [showDropdown,    setShowDropdown]    = useState(false);
  const [isSearching,     setIsSearching]     = useState(false);
  const [selectedFromList, setSelectedFromList] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 2 fields
  const [contactEmail, setContactEmail] = useState(userEmail);
  const [terms,        setTerms]        = useState(false);

  const warnPersonal = step === 2 && !!contactEmail && isPersonalDomain(contactEmail);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function searchUniversities(query: string) {
    if (query.length < 2) { setSuggestions([]); setShowDropdown(false); return; }
    setIsSearching(true);
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase
        .from("universities_es")
        .select("id, name, acronym, domain, city, autonomous_community")
        .ilike("name", `%${query}%`)
        .limit(8);
      setSuggestions(data || []);
      setShowDropdown((data?.length ?? 0) > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }

  function handleInstNameChange(value: string) {
    setInstName(value);
    setSelectedFromList(false);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchUniversities(value), 280);
  }

  function selectUniversity(u: UniversitySuggestion) {
    setInstName(u.name);
    setSelectedFromList(true);
    setShowDropdown(false);
    // Auto-fill country and website when selecting from list
    if (!country) setCountry("España");
    if (u.city && !city) setCity(u.city);
    if (u.domain && !website) setWebsite(`https://www.${u.domain}`);
    if (!instType) setInstType("Universidad pública");
  }

  function validateStep1() {
    const e: Record<string, string> = {};
    if (!instName.trim()) e.instName = "El nombre es obligatorio.";
    if (!instType)         e.instType = "Selecciona el tipo de institución.";
    if (!country)          e.country  = "Selecciona el país.";
    if (!website.trim())   e.website  = "La web institucional es obligatoria.";
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
            ? "Busca tu universidad o añade una nueva institución."
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

            {/* Institution name with autocomplete */}
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <label style={lbl}>
                Nombre de la institución <span style={{ color: D.error }}>*</span>
              </label>
              <p style={{ fontFamily: SANS, fontSize: 12, color: D.faint, margin: "0 0 8px" }}>
                Escribe para buscar entre las universidades registradas, o introduce una nueva.
              </p>
              <div style={{ position: "relative" }}>
                <input
                  style={inp(!!fieldErrors.instName)}
                  value={instName}
                  onChange={e => handleInstNameChange(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                  placeholder="Ej: Universidad Complutense de Madrid..."
                  autoComplete="off"
                />
                {isSearching && (
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: D.faint }}>
                    Buscando…
                  </span>
                )}
                {selectedFromList && (
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#059669" }}>✓</span>
                )}
              </div>

              {/* Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0,
                  background: D.white, border: `1px solid ${D.border}`,
                  borderRadius: 8, boxShadow: "0 8px 24px rgba(13,34,64,0.12)",
                  zIndex: 50, marginTop: 2, maxHeight: 260, overflowY: "auto",
                }}>
                  {suggestions.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => selectUniversity(u)}
                      style={{
                        width: "100%", textAlign: "left", padding: "10px 14px",
                        background: "none", border: "none", cursor: "pointer",
                        borderBottom: `1px solid ${D.border}`, display: "flex",
                        alignItems: "center", justifyContent: "space-between", gap: 8,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = D.surf)}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}
                    >
                      <div>
                        <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: D.ink, margin: 0 }}>{u.name}</p>
                        {(u.city || u.domain) && (
                          <p style={{ fontFamily: SANS, fontSize: 11, color: D.faint, margin: "2px 0 0" }}>
                            {[u.city, u.domain].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                      {u.acronym && (
                        <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: D.blue, background: "rgba(27,79,216,0.08)", padding: "2px 8px", borderRadius: 20, flexShrink: 0 }}>
                          {u.acronym}
                        </span>
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowDropdown(false)}
                    style={{
                      width: "100%", textAlign: "center", padding: "9px 14px",
                      background: D.surf, border: "none", cursor: "pointer",
                      fontFamily: SANS, fontSize: 12, color: D.muted, fontWeight: 600,
                    }}
                  >
                    + Añadir «{instName}» como nueva institución
                  </button>
                </div>
              )}

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
              <label style={lbl}>Web institucional <span style={{ color: D.error }}>*</span></label>
              <p style={{ fontFamily: SANS, fontSize: 12, color: D.faint, margin: "0 0 8px" }}>
                Es obligatoria. Debe coincidir con el dominio de tu correo (ej: universidad.es).
              </p>
              <input
                style={inp(!!fieldErrors.website)}
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://www.tuuniversidad.es"
                type="url"
              />
              {fieldErrors.website && (
                <p style={{ fontFamily: SANS, fontSize: 12, color: D.error, marginTop: 4 }}>{fieldErrors.website}</p>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Summary of step 1 */}
            <div style={{
              background: D.surf, border: `1px solid ${D.border}`,
              borderRadius: 10, padding: "14px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
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
              {warnPersonal && !fieldErrors.contactEmail && (
                <div style={{
                  display: "flex", gap: 10, alignItems: "flex-start",
                  background: D.warnBg, border: `1px solid ${D.warnBr}`,
                  borderRadius: 8, padding: "10px 14px", marginTop: 8,
                }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
                  <p style={{ fontFamily: SANS, fontSize: 12, color: D.warn, margin: 0, lineHeight: 1.5 }}>
                    Este parece un email personal. Te recomendamos usar el email corporativo de tu institución para más credibilidad.
                  </p>
                </div>
              )}
            </div>

            {/* Freemium info */}
            <div style={{
              background: "rgba(27,79,216,0.04)", border: "1px solid rgba(27,79,216,0.15)",
              borderRadius: 10, padding: "14px 16px",
            }}>
              <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: D.blue, margin: "0 0 6px" }}>
                Plan Esencial — Gratis
              </p>
              <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                {[
                  "5 búsquedas por mes incluidas",
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
