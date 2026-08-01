"use client";

import { useState } from "react";
import { LanguageEditor } from "@/components/profile/LanguageEditor";
import { InstitutionSelector } from "@/components/profile/InstitutionSelector";
import { InstitutionsTaughtEditor } from "@/components/profile/InstitutionsTaughtEditor";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { Globe, Clock, Monitor } from "lucide-react";

const SANS = `'Inter', system-ui, -apple-system, sans-serif`;
const D = {
  blue:    "#1B4FD8",
  navy:    "#0D2240",
  white:   "#FFFFFF",
  ink:     "#0C1018",
  muted:   "#6B7280",
  faint:   "#9CA3AF",
  border:  "#D8E2EF",
  surf:    "#F2F6FC",
};

const lbl: React.CSSProperties = {
  fontFamily: SANS, fontSize: 11, fontWeight: 700,
  letterSpacing: "0.1em", textTransform: "uppercase" as const,
  color: D.faint, display: "block", marginBottom: 6,
};

const inp: React.CSSProperties = {
  fontFamily: SANS, width: "100%", fontSize: 14, color: D.ink,
  background: D.white, border: `1px solid ${D.border}`,
  borderRadius: 10, padding: "11px 14px", outline: "none",
  boxSizing: "border-box" as const, transition: "border-color 0.2s",
};

const MODALITY_CHIPS = [
  { value: "Presencial", label: "Presencial" },
  { value: "Online", label: "Online" },
  { value: "Híbrida", label: "Híbrida" },
];

const AVAILABILITY_CHIPS = [
  { value: "open", label: "Disponible inmediatamente" },
  { value: "next_semester", label: "Próximo semestre" },
  { value: "occasional", label: "Asignaturas puntuales" },
  { value: "weekends", label: "Solo fines de semana" },
  { value: "online_only", label: "Solo online" },
  { value: "limited", label: "En 6 meses" },
  { value: "invite_only", label: "Solo por invitación" },
];

interface WizardData {
  languages: any[];
  availability: string;
  academicLevel: string;
  modalities: string[];
  institutionsTaught: string[];
  currentInstitution: string;
  [key: string]: any;
}

interface Props {
  data: WizardData;
  updateData: (partial: Partial<WizardData>) => void;
}

export function Step4Modality({ data, updateData }: Props) {
  const [langKey, setLangKey] = useState(0);

  const handleLanguageChip = (langName: string) => {
    const existing = (data.languages || []).find(
      (l: any) => l.lang?.toLowerCase() === langName.toLowerCase()
    );
    if (existing) return; // already added
    const updated = [...(data.languages || []), { lang: langName, level: "B2" }];
    updateData({ languages: updated });
    setLangKey((k) => k + 1);
  };

  const LANG_CHIPS = [
    "Español", "Inglés", "Francés", "Alemán",
    "Portugués", "Italiano", "Catalán", "Euskera",
    "Chino", "Japonés", "Árabe", "Ruso",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h2 style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: D.ink, margin: "0 0 4px" }}>
          Disponibilidad e idiomas
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 13, color: D.muted, margin: 0 }}>
          Configura tu disponibilidad, modalidad, nivel académico e idiomas.
        </p>
      </div>

      {/* Modality - Multi-select chips */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Monitor size={16} color={D.blue} />
          <span style={{ fontSize: 14, fontWeight: 700, color: D.ink }}>Modalidad</span>
        </div>
        <ChipGroup
          options={MODALITY_CHIPS}
          selected={data.modalities || []}
          onChange={(val) => updateData({ modalities: val as string[] })}
          multi
          size="md"
        />
      </div>

      {/* Availability - Single-select chips */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Clock size={16} color={D.blue} />
          <span style={{ fontSize: 14, fontWeight: 700, color: D.ink }}>Disponibilidad</span>
        </div>
        <div style={{ marginBottom: 16 }}>
          <ChipGroup
            options={AVAILABILITY_CHIPS}
            selected={data.availability}
            onChange={(val) => updateData({ availability: val as string })}
            size="sm"
          />
        </div>
      </div>

      {/* Languages - Chips for common languages + text input for custom */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Globe size={16} color={D.blue} />
          <span style={{ fontSize: 14, fontWeight: 700, color: D.ink }}>Idiomas</span>
        </div>
        <label style={lbl}>Idiomas comunes (selecciona para añadir con nivel B2)</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {LANG_CHIPS.map((lang) => {
            const isAdded = (data.languages || []).some(
              (l: any) => l.lang?.toLowerCase() === lang.toLowerCase()
            );
            return (
              <button
                key={lang}
                type="button"
                onClick={() => handleLanguageChip(lang)}
                style={{
                  fontFamily: SANS,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  outline: "none",
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: 12,
                  padding: "6px 14px",
                  background: isAdded ? "#1B4FD8" : "#F2F6FC",
                  color: isAdded ? "#FFFFFF" : "#4B5A7A",
                  border: isAdded ? "1px solid #1B4FD8" : "1px solid #D8E2EF",
                  transition: "all 0.15s ease",
                }}
              >
                {lang}
                {isAdded && <span style={{ fontSize: 10, marginLeft: 2 }}>✓</span>}
              </button>
            );
          })}
        </div>
        <LanguageEditor
          key={langKey}
          initialLanguages={data.languages}
          onChange={(languages) => updateData({ languages })}
        />
      </div>

      {/* Academic Level */}
      <div>
        <label style={lbl}>Nivel académico máximo</label>
        <select
          style={{ ...inp, appearance: "none" as const }}
          value={data.academicLevel}
          onChange={(e) => updateData({ academicLevel: e.target.value })}
        >
          <option value="">Sin especificar</option>
          <option value="Grado">Grado / Licenciatura</option>
          <option value="Master">Máster</option>
          <option value="Doctorado">Doctorado (PhD)</option>
          <option value="Postdoctorado">Postdoctorado</option>
          <option value="Catedratico">Catedrático</option>
        </select>
      </div>

      {/* Institution */}
      <div>
        <label style={lbl}>Institución actual</label>
        <InstitutionSelector
          name="currentInstitution"
          initialValue={data.currentInstitution}
          placeholder="Escribe el centro donde impartes formación, si actualmente no tienes, déjalo en blanco, no pasa nada"
          onChange={(value) => updateData({ currentInstitution: value })}
        />
      </div>

      <div>
        <label style={lbl}>Instituciones donde has impartido docencia</label>
        <InstitutionsTaughtEditor
          initialInstitutions={data.institutionsTaught}
          onChange={(institutions) => updateData({ institutionsTaught: institutions })}
        />
      </div>
    </div>
  );
}