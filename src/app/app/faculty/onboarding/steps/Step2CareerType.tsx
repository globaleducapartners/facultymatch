"use client";

import { useState } from "react";
import { OrcidImportModal } from "../../profile/OrcidImportModal";
import { saveOrcidImportFromWizard } from "../actions";
import { GraduationCap, Briefcase, PlusCircle } from "lucide-react";
import { ChipGroup } from "@/components/ui/ChipGroup";

const SANS = `'Inter', system-ui, -apple-system, sans-serif`;
const D = {
  blue:    "#1B4FD8",
  navy:    "#0D2240",
  gold:    "#E9A030",
  white:   "#FFFFFF",
  ink:     "#0C1018",
  muted:   "#6B7280",
  faint:   "#9CA3AF",
  border:  "#D8E2EF",
  surf:    "#F2F6FC",
  green:   "#059669",
};

const inp: React.CSSProperties = {
  fontFamily: SANS, width: "100%", fontSize: 14, color: D.ink,
  background: D.white, border: `1px solid ${D.border}`,
  borderRadius: 10, padding: "11px 14px", outline: "none",
  boxSizing: "border-box" as const, transition: "border-color 0.2s",
};

const lbl: React.CSSProperties = {
  fontFamily: SANS, fontSize: 11, fontWeight: 700,
  letterSpacing: "0.1em", textTransform: "uppercase" as const,
  color: D.faint, display: "block", marginBottom: 6,
};

const crossLinkStyle: React.CSSProperties = {
  fontFamily: SANS, fontSize: 12, fontWeight: 600, color: D.blue,
  background: "none", border: "none", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  padding: 8,
};

const SECTOR_CHIPS = [
  { value: "Tecnología", label: "Tecnología" },
  { value: "Salud", label: "Salud" },
  { value: "Finanzas", label: "Finanzas" },
  { value: "Consultoría", label: "Consultoría" },
  { value: "Marketing y Comunicación", label: "Marketing y Comunicación" },
  { value: "Industria", label: "Industria" },
  { value: "Retail", label: "Retail" },
  { value: "Educación", label: "Educación" },
  { value: "Legal", label: "Legal" },
  { value: "Recursos Humanos", label: "Recursos Humanos" },
  { value: "Energía", label: "Energía" },
  { value: "Construcción", label: "Construcción" },
];

const EXP_YEARS_CHIPS = [
  { value: "1-3", label: "1-3 años" },
  { value: "4-7", label: "4-7 años" },
  { value: "8-15", label: "8-15 años" },
  { value: "15+", label: "+15 años" },
];

interface WizardData {
  careerType: "academica" | "profesional" | "combinado" | null;
  currentPosition: string;
  currentCompany: string;
  industrySector: string;
  yearsExperience: number;
  careerDescription: string;
  [key: string]: any;
}

interface Props {
  data: WizardData;
  updateData: (partial: Partial<WizardData>) => void;
  user: { id: string };
  facultyProfile: any;
}

export function Step2CareerType({ data, updateData, user, facultyProfile }: Props) {
  const [orcidOpen, setOrcidOpen] = useState(false);

  const handleSaveOrcid = async (payload: any) => {
    await saveOrcidImportFromWizard(payload);
    updateData({ careerType: "academica" });
  };

  const isAcademic = data.careerType === "academica" || data.careerType === "combinado";
  const isProfessional = data.careerType === "profesional" || data.careerType === "combinado";

  const handleSectorChange = (val: string | string[]) => {
    updateData({ industrySector: val as string });
  };

  const handleYearsChange = (val: string | string[]) => {
    const range = val as string;
    // Store the upper bound of the range as a number for DB compatibility
    if (range === "1-3") updateData({ yearsExperience: 3 });
    else if (range === "4-7") updateData({ yearsExperience: 7 });
    else if (range === "8-15") updateData({ yearsExperience: 15 });
    else if (range === "15+") updateData({ yearsExperience: 20 });
    else updateData({ yearsExperience: 0 });
  };

  const yearsAsRange = (): string => {
    const y = data.yearsExperience;
    if (y <= 3) return "1-3";
    if (y <= 7) return "4-7";
    if (y <= 15) return "8-15";
    return "15+";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h2 style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: D.ink, margin: "0 0 4px" }}>
          Trayectoria profesional
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 13, color: D.muted, margin: 0 }}>
          Selecciona el tipo de trayectoria que mejor describe tu perfil.
        </p>
      </div>

      {/* Career type cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Academic card */}
        <button
          type="button"
          onClick={() => updateData({ careerType: isAcademic ? (data.careerType === "combinado" ? "profesional" : null) : "academica" })}
          style={{
            fontFamily: SANS, cursor: "pointer", textAlign: "left" as const,
            padding: 24, borderRadius: 14, border: `2px solid ${isAcademic ? D.blue : D.border}`,
            background: isAcademic ? "#EFF6FF" : D.white,
            transition: "all 0.2s", display: "flex", flexDirection: "column" as const, gap: 12,
            outline: "none",
          }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: isAcademic ? D.blue : D.surf,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <GraduationCap size={24} color={isAcademic ? "#fff" : D.navy} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: D.ink, marginBottom: 4 }}>
              Académica
            </div>
            <div style={{ fontSize: 12, color: D.muted, lineHeight: 1.5 }}>
              Docencia universitaria, investigación, acreditaciones ANECA, publicaciones científicas y perfil investigador.
            </div>
          </div>
        </button>

        {/* Professional card */}
        <button
          type="button"
          onClick={() => updateData({ careerType: isProfessional ? (data.careerType === "combinado" ? "academica" : null) : "profesional" })}
          style={{
            fontFamily: SANS, cursor: "pointer", textAlign: "left" as const,
            padding: 24, borderRadius: 14, border: `2px solid ${isProfessional ? D.blue : D.border}`,
            background: isProfessional ? "#EFF6FF" : D.white,
            transition: "all 0.2s", display: "flex", flexDirection: "column" as const, gap: 12,
            outline: "none",
          }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: isProfessional ? D.blue : D.surf,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Briefcase size={24} color={isProfessional ? "#fff" : D.navy} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: D.ink, marginBottom: 4 }}>
              Profesional
            </div>
            <div style={{ fontSize: 12, color: D.muted, lineHeight: 1.5 }}>
              Experiencia en empresa, formación profesional, cargos directivos y conocimientos prácticos del sector.
            </div>
          </div>
        </button>
      </div>

      {/* Academic section */}
      {isAcademic && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{
            background: D.surf, border: `1px solid ${D.border}`, borderRadius: 12, padding: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <GraduationCap size={18} color={D.blue} />
              <span style={{ fontSize: 14, fontWeight: 700, color: D.ink }}>Perfil académico</span>
            </div>
            <p style={{ fontSize: 13, color: D.muted, lineHeight: 1.6, margin: "0 0 16px" }}>
              Importa automáticamente tu trayectoria desde ORCID. Tus datos académicos (afiliaciones, titulaciones, publicaciones) se rellenarán al instante.
            </p>
            <button
              type="button"
              onClick={() => setOrcidOpen(true)}
              style={{
                fontFamily: SANS, background: D.blue, color: "#fff",
                border: "none", padding: "11px 22px", borderRadius: 10,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              Importar desde ORCID
            </button>
          </div>

          {/* Tip for academic users without ORCID */}
          {data.careerType === "academica" && (
            <div style={{
              background: "#F0FDF4", border: "1px solid #BBF7D0",
              borderRadius: 12, padding: "14px 18px",
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 8,
                background: D.green, display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 1,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "#166534", margin: "0 0 4px" }}>
                  ¿No tienes ORCID? No hay problema
                </p>
                <p style={{ fontFamily: SANS, fontSize: 12, color: "#15803D", margin: 0, lineHeight: 1.6 }}>
                  Puedes continuar y añadir tu especialidad, acreditaciones y publicaciones en los siguientes pasos. Todo de forma manual y sin prisas.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Professional section with chips */}
      {isProfessional && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={lbl}>Cargo / Rol actual</label>
              <input
                style={inp}
                placeholder="Ej: Director de Marketing"
                value={data.currentPosition}
                onChange={(e) => updateData({ currentPosition: e.target.value })}
              />
            </div>
            <div>
              <label style={lbl}>Empresa actual</label>
              <input
                style={inp}
                placeholder="Ej: TechCorp S.L."
                value={data.currentCompany}
                onChange={(e) => updateData({ currentCompany: e.target.value })}
              />
            </div>
          </div>

          {/* Sector chips */}
          <div>
            <label style={lbl}>Sector profesional</label>
            <ChipGroup
              options={SECTOR_CHIPS}
              selected={data.industrySector}
              onChange={handleSectorChange}
              allowOther
              otherPlaceholder="Especifica tu sector…"
              size="sm"
            />
          </div>

          {/* Years of experience chips */}
          <div>
            <label style={lbl}>Años de experiencia</label>
            <ChipGroup
              options={EXP_YEARS_CHIPS}
              selected={yearsAsRange()}
              onChange={handleYearsChange}
              size="sm"
            />
          </div>

          <div>
            <label style={lbl}>Descripción de tu trayectoria profesional</label>
            <textarea
              style={{ ...inp, resize: "vertical" as const, minHeight: 80 }}
              placeholder="Describe tu experiencia profesional, logros y áreas de expertise…"
              value={data.careerDescription}
              onChange={(e) => updateData({ careerDescription: e.target.value })}
              rows={4}
            />
          </div>
        </div>
      )}

      {/* Cross-link: add the other track */}
      {data.careerType === "academica" && (
        <button
          type="button"
          onClick={() => updateData({ careerType: "combinado" })}
          style={crossLinkStyle}
        >
          <PlusCircle size={14} /> ¿También tienes experiencia profesional? Añádela aquí
        </button>
      )}
      {data.careerType === "profesional" && (
        <button
          type="button"
          onClick={() => updateData({ careerType: "combinado" })}
          style={crossLinkStyle}
        >
          <PlusCircle size={14} /> ¿También tienes perfil académico / ORCID? Añádelo aquí
        </button>
      )}

      {/* ORCID Modal */}
      {orcidOpen && (
        <OrcidImportModal
          user={user}
          facultyProfile={facultyProfile}
          onClose={() => setOrcidOpen(false)}
          onSave={handleSaveOrcid}
        />
      )}
    </div>
  );
}