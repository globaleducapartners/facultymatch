"use client";

import { useState } from "react";
import { UNESCO_FIELDS } from "@/lib/unesco-fields";
import { Award, BookOpen } from "lucide-react";
import { ChipGroup, SearchableChipGroup } from "@/components/ui/ChipGroup";

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

const ACCREDITATION_CHIPS = [
  { value: "aneca_titular", label: "ANECA — Titular de Universidad" },
  { value: "aneca_catedratico", label: "ANECA — Catedrático" },
  { value: "aneca_ayudante", label: "ANECA — Ayudante Doctor" },
  { value: "aqu", label: "AQU" },
  { value: "acsucyl", label: "ACSUCYL" },
  { value: "deva", label: "DEVA" },
  { value: "unibasq", label: "UNIBASQ" },
  { value: "acap", label: "ACAP" },
];

interface WizardData {
  unescoArea: string;
  unescoSubarea: string;
  unescoTopics: string;
  selectedAccreditations: string[];
  otherAccreditation: string;
  isPhd: boolean;
  researchPublications: string;
  googleScholarId: string;
  orcidId: string;
  [key: string]: any;
}

interface Props {
  data: WizardData;
  updateData: (partial: Partial<WizardData>) => void;
}

export function Step3Specialty({ data, updateData }: Props) {
  // Build flat list of all subareas for searchable chips
  const allSubareaChips = UNESCO_FIELDS.flatMap((f) =>
    f.subareas.map((s) => ({
      value: s,
      label: s,
      group: `${f.code}. ${f.label}`,
    }))
  );

  // Accreditation multi-select
  const getAccreditationSelected = (): string[] => {
    return data.selectedAccreditations || [];
  };

  const handleAccreditationChange = (vals: string | string[]) => {
    const arr = vals as string[];
    updateData({ selectedAccreditations: arr });
  };

  const handleSubareaChange = (val: string) => {
    const parent = UNESCO_FIELDS.find((f) => f.subareas.includes(val));
    updateData({
      unescoSubarea: val,
      unescoArea: parent ? parent.label : data.unescoArea,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h2 style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: D.ink, margin: "0 0 4px" }}>
          Especialidad y acreditación
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 13, color: D.muted, margin: 0 }}>
          Define tu área de especialización y acreditaciones académicas.
        </p>
      </div>

      {/* UNESCO Area - Searchable chips */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Award size={16} color={D.blue} />
          <span style={{ fontSize: 14, fontWeight: 700, color: D.ink }}>Área UNESCO</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Subárea de especialidad</label>
          <SearchableChipGroup
            items={allSubareaChips}
            selected={data.unescoSubarea}
            onChange={handleSubareaChange}
            placeholder="Busca tu área de especialidad…"
          />
        </div>

        {data.unescoSubarea && (
          <div style={{ fontSize: 13, color: D.muted, marginTop: -8, marginBottom: 12 }}>
            Categoría: <strong style={{ color: D.ink }}>{data.unescoArea}</strong>
          </div>
        )}

        <div>
          <label style={lbl}>Temas / Topics (separados por coma)</label>
          <input
            style={inp}
            placeholder="Ej: SEO, Marketing de contenidos, Growth Hacking"
            value={data.unescoTopics}
            onChange={(e) => updateData({ unescoTopics: e.target.value })}
          />
        </div>
      </div>

      {/* Accreditation - Multi-select chips */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <BookOpen size={16} color={D.blue} />
          <span style={{ fontSize: 14, fontWeight: 700, color: D.ink }}>Acreditaciones</span>
        </div>
        <div style={{ marginBottom: 12 }}>
          <ChipGroup
            options={ACCREDITATION_CHIPS}
            selected={getAccreditationSelected()}
            onChange={handleAccreditationChange}
            multi
            size="sm"
          />
        </div>
        {/* Optional custom accreditation */}
        <div>
          <label style={lbl}>Otra acreditación (opcional)</label>
          <input
            style={inp}
            placeholder="Ej: CERTIF, Diplomatura en Docencia Universitaria…"
            value={data.otherAccreditation}
            onChange={(e) => updateData({ otherAccreditation: e.target.value })}
          />
        </div>
      </div>

      {/* PhD chip */}
      <div>
        <label style={{ ...lbl, marginBottom: 10 }}>Doctorado</label>
        <ChipGroup
          options={[
            { value: "phd", label: "Soy Doctor/a (PhD)" },
          ]}
          selected={data.isPhd ? "phd" : ""}
          onChange={(val) => updateData({ isPhd: val === "phd" })}
          size="sm"
        />
        {data.isPhd && (
          <p style={{ fontFamily: SANS, fontSize: 12, color: D.muted, marginTop: 6 }}>
            Aparecerá el badge PhD en tu perfil y en el directorio
          </p>
        )}
      </div>

      {/* Research publications */}
      <div>
        <label style={lbl}>Publicaciones relevantes</label>
        <textarea
          style={{ ...inp, resize: "vertical" as const, minHeight: 80 }}
          placeholder="Lista tus publicaciones principales…"
          value={data.researchPublications}
          onChange={(e) => updateData({ researchPublications: e.target.value })}
          rows={4}
        />
      </div>

      {/* Scholar IDs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={lbl}>Google Scholar ID</label>
          <input
            style={inp}
            placeholder="XXXXXXX"
            value={data.googleScholarId}
            onChange={(e) => updateData({ googleScholarId: e.target.value })}
          />
        </div>
        <div>
          <label style={lbl}>ORCID iD</label>
          <input
            style={inp}
            placeholder="0000-0000-0000-0000"
            value={data.orcidId}
            onChange={(e) => updateData({ orcidId: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}