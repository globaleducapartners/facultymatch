"use client";

import { useState, useCallback } from "react";
import { X, Check, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface OrcidImportData {
  nombre_completo: string;
  afiliaciones: Array<{ institucion: string; fecha_inicio: string | null; fecha_fin: string | null }>;
  titulos: Array<{ titulo: string; institucion: string; anio: string | null }>;
  publicaciones_count: number;
  citas_count: number;
  temas_investigacion: string[];
}

interface Props {
  user: { id: string };
  facultyProfile: any;
  onClose: () => void;
  onSave: (data: OrcidSavePayload) => Promise<void>;
}

export interface OrcidSavePayload {
  orcid: string;
  saveAfiliaciones: boolean;
  saveTitulos: boolean;
  savePublicaciones: boolean;
  saveCitas: boolean;
  saveTemas: boolean;
  importData: OrcidImportData;
  institutionChoice: "import" | "existing" | "merge";
  degreesChoice: "import" | "existing" | "merge";
}

// ─── Design tokens (same as parent) ─────────────────────────────────────────

const SANS = `'Inter', system-ui, -apple-system, sans-serif`;
const D = {
  blue:    "#1B4FD8",
  navy:    "#0D2240",
  gold:    "#E9A030",
  surf:    "#F2F6FC",
  white:   "#FFFFFF",
  ink:     "#0C1018",
  muted:   "#6B7280",
  faint:   "#9CA3AF",
  border:  "#D8E2EF",
  green:   "#059669",
  greenBg: "#F0FDF4",
  red:     "#DC2626",
  redBg:   "#FEF2F2",
};

const inp: React.CSSProperties = {
  fontFamily: SANS, width: "100%", fontSize: 14, color: D.ink,
  background: D.white, border: `1px solid ${D.border}`,
  borderRadius: 10, padding: "11px 14px", outline: "none",
  boxSizing: "border-box" as const, transition: "border-color 0.2s",
};

// ─── Steps ──────────────────────────────────────────────────────────────────

type Step = "input" | "loading" | "review" | "saving" | "done" | "error";

// ─── Component ──────────────────────────────────────────────────────────────

export function OrcidImportModal({ user, facultyProfile, onClose, onSave }: Props) {
  const [step, setStep] = useState<Step>("input");
  const [orcid, setOrcid] = useState(facultyProfile?.orcid_id || "");
  const [orcidError, setOrcidError] = useState("");
  const [importData, setImportData] = useState<OrcidImportData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Checkboxes for review
  const [saveAfiliaciones, setSaveAfiliaciones] = useState(true);
  const [saveTitulos, setSaveTitulos] = useState(true);
  const [savePublicaciones, setSavePublicaciones] = useState(true);
  const [saveCitas, setSaveCitas] = useState(true);
  const [saveTemas, setSaveTemas] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Conflict resolution
  const [institutionChoice, setInstitutionChoice] = useState<"import" | "existing" | "merge">("import");
  const [degreesChoice, setDegreesChoice] = useState<"import" | "existing" | "merge">("import");

  // Existence checks
  const hasExistingInstitution = !!facultyProfile?.current_institution;
  const hasExistingDegrees = (facultyProfile?.degrees as any[] | null)?.length > 0;

  const ORCID_REGEX = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;

  const handleImport = useCallback(async () => {
    const trimmed = orcid.trim();
    if (!ORCID_REGEX.test(trimmed)) {
      setOrcidError('El formato debe ser "0000-0000-0000-0000"');
      return;
    }
    setOrcidError("");
    setStep("loading");

    try {
      const res = await fetch("/api/import-orcid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orcid: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || data.details || "Error al importar datos");
        setStep("error");
        return;
      }

      setImportData(data as OrcidImportData);
      setStep("review");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Error de conexión");
      setStep("error");
    }
  }, [orcid]);

  const handleConfirm = useCallback(async () => {
    if (!importData) return;
    setStep("saving");

    try {
      await onSave({
        orcid: orcid.trim(),
        saveAfiliaciones,
        saveTitulos,
        savePublicaciones,
        saveCitas,
        saveTemas,
        importData,
        institutionChoice,
        degreesChoice,
      });
      setStep("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Error al guardar");
      setStep("error");
    }
  }, [importData, orcid, saveAfiliaciones, saveTitulos, savePublicaciones, saveCitas, saveTemas, institutionChoice, degreesChoice, onSave]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px", fontFamily: SANS,
      }}
      onClick={(e) => { if (e.target === e.currentTarget && step !== "saving") onClose(); }}
    >
      <div style={{
        width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto",
        background: D.white, borderRadius: 20, padding: "28px 32px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: D.surf,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={D.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: D.ink, letterSpacing: "-0.03em" }}>
              Importar desde ORCID
            </span>
          </div>
          {step !== "saving" && (
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: D.faint, padding: 4 }}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* ─── Step: Input ─── */}
        {step === "input" && (
          <div>
            <p style={{ fontSize: 13, color: D.muted, lineHeight: 1.6, marginBottom: 20 }}>
              Introduce tu ORCID iD para importar automáticamente tu trayectoria académica y profesional desde ORCID y OpenAlex.
              Los datos se mostrarán para que los revises antes de guardarlos.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <input
                  style={{
                    ...inp,
                    borderColor: orcidError ? D.red : D.border,
                  }}
                  placeholder="0000-0000-0000-0000"
                  value={orcid}
                  onChange={(e) => { setOrcid(e.target.value); setOrcidError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleImport(); }}
                />
                {orcidError && (
                  <p style={{ fontSize: 12, color: D.red, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                    <AlertCircle size={12} /> {orcidError}
                  </p>
                )}
              </div>
              <button
                onClick={handleImport}
                style={{
                  fontFamily: SANS, background: D.blue, color: "#fff",
                  border: "none", padding: "11px 22px", borderRadius: 10,
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
                }}
              >
                Importar mi trayectoria
              </button>
            </div>
            <p style={{ fontSize: 11, color: D.faint, marginTop: 12 }}>
              Los datos se obtienen de las APIs públicas de{" "}
              <a href="https://orcid.org" target="_blank" rel="noopener noreferrer" style={{ color: D.blue }}>ORCID</a> y{" "}
              <a href="https://openalex.org" target="_blank" rel="noopener noreferrer" style={{ color: D.blue }}>OpenAlex</a>.
            </p>
          </div>
        )}

        {/* ─── Step: Loading ─── */}
        {step === "loading" && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <Loader2 size={36} color={D.blue} style={{ animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: D.ink, marginBottom: 8 }}>Importando tu trayectoria…</p>
            <p style={{ fontSize: 13, color: D.muted }}>Consultando ORCID y OpenAlex</p>
            <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
          </div>
        )}

        {/* ─── Step: Error ─── */}
        {step === "error" && (
          <div>
            <div style={{
              background: D.redBg, border: "1px solid #FECACA",
              borderRadius: 12, padding: "16px 20px", marginBottom: 20,
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <AlertCircle size={18} color={D.red} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: D.red, margin: 0 }}>Error al importar</p>
                <p style={{ fontSize: 13, color: D.red, marginTop: 4 }}>{errorMsg}</p>
              </div>
            </div>
            <button
              onClick={() => setStep("input")}
              style={{
                fontFamily: SANS, background: D.blue, color: "#fff",
                border: "none", padding: "11px 22px", borderRadius: 10,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}
            >
              Volver a intentar
            </button>
          </div>
        )}

        {/* ─── Step: Review ─── */}
        {step === "review" && importData && (
          <div>
            {/* Name confirmation */}
            <div style={{
              background: D.surf, borderRadius: 12, padding: "14px 18px",
              marginBottom: 20, border: `1px solid ${D.border}`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: D.faint, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                Nombre detectado
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: D.ink }}>
                {importData.nombre_completo}
              </div>
            </div>

            {/* Sections to import */}
            <p style={{ fontSize: 12, fontWeight: 700, color: D.muted, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Selecciona los datos que quieres importar
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Afiliaciones */}
              {importData.afiliaciones.length > 0 && (
                <ReviewSection
                  title="Afiliaciones laborales"
                  count={importData.afiliaciones.length}
                  checked={saveAfiliaciones}
                  onToggle={() => setSaveAfiliaciones(!saveAfiliaciones)}
                  isExpanded={expandedSection === "afiliaciones"}
                  onToggleExpand={() => setExpandedSection(expandedSection === "afiliaciones" ? null : "afiliaciones")}
                  hasConflict={hasExistingInstitution}
                  conflictChoice={institutionChoice}
                  onConflictChoice={setInstitutionChoice}
                  existingValue={facultyProfile?.current_institution}
                  importedValue={importData.afiliaciones.map(a => a.institucion).join(", ")}
                >
                  {importData.afiliaciones.map((a, i) => (
                    <div key={i} style={{
                      padding: "8px 0", borderBottom: i < importData.afiliaciones.length - 1 ? `1px solid ${D.border}` : "none",
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: D.ink }}>{a.institucion}</div>
                      <div style={{ fontSize: 12, color: D.muted, marginTop: 2 }}>
                        {a.fecha_inicio ? `${a.fecha_inicio.substring(0, 4)}` : "—"} {a.fecha_fin ? `- ${a.fecha_fin.substring(0, 4)}` : "- Presente"}
                      </div>
                    </div>
                  ))}
                </ReviewSection>
              )}

              {/* Títulos */}
              {importData.titulos.length > 0 && (
                <ReviewSection
                  title="Títulos académicos"
                  count={importData.titulos.length}
                  checked={saveTitulos}
                  onToggle={() => setSaveTitulos(!saveTitulos)}
                  isExpanded={expandedSection === "titulos"}
                  onToggleExpand={() => setExpandedSection(expandedSection === "titulos" ? null : "titulos")}
                  hasConflict={hasExistingDegrees}
                  conflictChoice={degreesChoice}
                  onConflictChoice={setDegreesChoice}
                  existingValue={hasExistingDegrees ? `${(facultyProfile?.degrees as any[]).length} títulos guardados` : undefined}
                  importedValue={`${importData.titulos.length} títulos desde ORCID`}
                >
                  {importData.titulos.map((t, i) => (
                    <div key={i} style={{
                      padding: "8px 0", borderBottom: i < importData.titulos.length - 1 ? `1px solid ${D.border}` : "none",
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: D.ink }}>{t.titulo || "Titulación"}</div>
                      <div style={{ fontSize: 12, color: D.muted, marginTop: 2 }}>
                        {t.institucion} {t.anio ? `· ${t.anio}` : ""}
                      </div>
                    </div>
                  ))}
                </ReviewSection>
              )}

              {/* Publicaciones */}
              {importData.publicaciones_count > 0 && (
                <ReviewToggle
                  title="Publicaciones"
                  checked={savePublicaciones}
                  onToggle={() => setSavePublicaciones(!savePublicaciones)}
                >
                  <span style={{ fontSize: 22, fontWeight: 900, color: D.blue }}>
                    {importData.publicaciones_count.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 13, color: D.muted, marginLeft: 6 }}>publicaciones en OpenAlex</span>
                </ReviewToggle>
              )}

              {/* Citas */}
              {importData.citas_count > 0 && (
                <ReviewToggle
                  title="Citas"
                  checked={saveCitas}
                  onToggle={() => setSaveCitas(!saveCitas)}
                >
                  <span style={{ fontSize: 22, fontWeight: 900, color: D.green }}>
                    {importData.citas_count.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 13, color: D.muted, marginLeft: 6 }}>citas en OpenAlex</span>
                </ReviewToggle>
              )}

              {/* Temas */}
              {importData.temas_investigacion.length > 0 && (
                <ReviewToggle
                  title="Temas de investigación"
                  count={importData.temas_investigacion.length}
                  checked={saveTemas}
                  onToggle={() => setSaveTemas(!saveTemas)}
                  isExpanded={expandedSection === "temas"}
                  onToggleExpand={() => setExpandedSection(expandedSection === "temas" ? null : "temas")}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {importData.temas_investigacion.map((tema, i) => (
                      <span key={i} style={{
                        fontSize: 12, color: D.ink, fontWeight: 600,
                        background: D.surf, border: `1px solid ${D.border}`,
                        padding: "3px 10px", borderRadius: 999,
                      }}>{tema}</span>
                    ))}
                  </div>
                </ReviewToggle>
              )}
            </div>

            {/* No data */}
            {importData.afiliaciones.length === 0 && importData.titulos.length === 0 && importData.publicaciones_count === 0 && importData.citas_count === 0 && importData.temas_investigacion.length === 0 && (
              <div style={{
                background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 12,
                padding: "16px 20px", marginBottom: 20,
                display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <AlertCircle size={18} color="#EA580C" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#9A3412", margin: 0 }}>Sin datos públicos</p>
                  <p style={{ fontSize: 13, color: "#9A3412", marginTop: 4 }}>
                    Este ORCID tiene datos básicos de nombre pero no se encontraron afiliaciones, títulos, publicaciones ni temas de investigación públicos.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginTop: 24, paddingTop: 20, borderTop: `1px solid ${D.border}` }}>
              <button
                onClick={handleConfirm}
                disabled={importData.afiliaciones.length === 0 && importData.titulos.length === 0 && importData.publicaciones_count === 0 && importData.citas_count === 0 && importData.temas_investigacion.length === 0}
                style={{
                  fontFamily: SANS, background: D.blue, color: "#fff",
                  border: "none", padding: "11px 28px", borderRadius: 10,
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  opacity: importData.afiliaciones.length === 0 && importData.titulos.length === 0 && importData.publicaciones_count === 0 && importData.citas_count === 0 && importData.temas_investigacion.length === 0 ? 0.5 : 1,
                }}
              >
                <Check size={15} /> Confirmar e importar
              </button>
              <button
                onClick={onClose}
                style={{
                  fontFamily: SANS, fontSize: 14, fontWeight: 600, padding: "11px 20px",
                  borderRadius: 10, border: `1px solid ${D.border}`, background: D.white,
                  color: D.muted, cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* ─── Step: Saving ─── */}
        {step === "saving" && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <Loader2 size={36} color={D.blue} style={{ animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: D.ink, marginBottom: 8 }}>Guardando datos seleccionados…</p>
          </div>
        )}

        {/* ─── Step: Done ─── */}
        {step === "done" && (
          <div style={{ textAlign: "center", padding: "30px 20px" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: D.greenBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <Check size={28} color={D.green} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 800, color: D.ink, marginBottom: 8 }}>
              Datos importados correctamente
            </p>
            <p style={{ fontSize: 13, color: D.muted, marginBottom: 24 }}>
              Tu perfil ha sido actualizado con los datos seleccionados.
            </p>
            <button
              onClick={onClose}
              style={{
                fontFamily: SANS, background: D.blue, color: "#fff",
                border: "none", padding: "11px 28px", borderRadius: 10,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}
            >
              <Check size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ReviewSection({
  title, count, checked, onToggle, isExpanded, onToggleExpand,
  hasConflict, conflictChoice, onConflictChoice, existingValue, importedValue, children,
}: {
  title: string;
  count: number;
  checked: boolean;
  onToggle: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  hasConflict?: boolean;
  conflictChoice?: string;
  onConflictChoice?: (v: "import" | "existing" | "merge") => void;
  existingValue?: string;
  importedValue?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      border: `1px solid ${D.border}`, borderRadius: 12, overflow: "hidden",
      background: checked ? D.white : "#F9FAFB",
    }}>
      <div style={{
        display: "flex", alignItems: "center", padding: "12px 14px",
        gap: 10, cursor: "pointer",
      }}
        onClick={onToggle}
      >
        <div style={{
          width: 20, height: 20, borderRadius: 4,
          border: `2px solid ${checked ? D.blue : D.border}`,
          background: checked ? D.blue : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "all 0.15s",
        }}>
          {checked && <Check size={14} color="#fff" strokeWidth={3} />}
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: D.ink, flex: 1 }}>
          {title} ({count})
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: D.faint, padding: 2 }}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && checked && (
        <div style={{ padding: "0 14px 12px 44px" }}>
          {hasConflict && existingValue && (
            <div style={{
              background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 8,
              padding: "10px 12px", marginBottom: 10,
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#9A3412", marginBottom: 8 }}>
                Ya tienes datos guardados en este campo. ¿Qué deseas hacer?
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {([
                  { value: "import" as const, label: "Usar datos de ORCID" },
                  { value: "existing" as const, label: "Conservar mis datos actuales" },
                  { value: "merge" as const, label: "Combinar ambos" },
                ]).map((opt) => (
                  <label key={opt.value} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "4px 0",
                    cursor: "pointer", fontSize: 12, color: D.ink,
                  }}>
                    <input
                      type="radio"
                      name={`conflict-${title}`}
                      checked={conflictChoice === opt.value}
                      onChange={() => onConflictChoice?.(opt.value)}
                      style={{ accentColor: D.blue }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          )}
          {children}
        </div>
      )}

      {isExpanded && !checked && (
        <div style={{ padding: "0 14px 12px 44px" }}>
          <p style={{ fontSize: 12, color: D.faint, fontStyle: "italic" }}>
            Este campo no se importará.
          </p>
        </div>
      )}
    </div>
  );
}

function ReviewToggle({
  title, count, checked, onToggle, children, isExpanded, onToggleExpand,
}: {
  title: string;
  count?: number;
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}) {
  return (
    <div style={{
      border: `1px solid ${D.border}`, borderRadius: 12, overflow: "hidden",
      background: checked ? D.white : "#F9FAFB",
    }}>
      <div
        style={{
          display: "flex", alignItems: "center", padding: "12px 14px",
          gap: 10, cursor: "pointer",
        }}
        onClick={onToggle}
      >
        <div style={{
          width: 20, height: 20, borderRadius: 4,
          border: `2px solid ${checked ? D.blue : D.border}`,
          background: checked ? D.blue : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "all 0.15s",
        }}>
          {checked && <Check size={14} color="#fff" strokeWidth={3} />}
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: D.ink, flex: 1 }}>
          {title}{count !== undefined ? ` (${count})` : ""}
        </span>
        {onToggleExpand && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: D.faint, padding: 2 }}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>
      {isExpanded && checked && (
        <div style={{ padding: "0 14px 12px 44px" }}>
          {children}
        </div>
      )}
    </div>
  );
}