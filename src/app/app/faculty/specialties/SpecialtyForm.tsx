"use client";

import { useState } from "react";
import { UNESCO_FIELDS } from "@/lib/unesco-fields";
import { Check } from "lucide-react";

const SANS = `'Inter', system-ui, -apple-system, sans-serif`;
const D = {
  blue:   "#1B4FD8",
  ink:    "#0C1018",
  muted:  "#6B7280",
  faint:  "#9CA3AF",
  border: "#D8E2EF",
  surf:   "#F2F6FC",
  white:  "#FFFFFF",
};

const inp: React.CSSProperties = {
  fontFamily: SANS, width: "100%", fontSize: 14, color: D.ink,
  background: D.white, border: `1px solid ${D.border}`,
  borderRadius: 10, padding: "11px 14px", outline: "none",
  boxSizing: "border-box" as const, transition: "border-color 0.2s",
  appearance: "none" as const,
};

const lbl: React.CSSProperties = {
  fontFamily: SANS, fontSize: 11, fontWeight: 700,
  letterSpacing: "0.1em", textTransform: "uppercase" as const,
  color: D.faint, display: "block", marginBottom: 6,
};

interface Props {
  action: (formData: FormData) => Promise<void>;
}

export function SpecialtyForm({ action }: Props) {
  const [selectedArea, setSelectedArea] = useState("");

  const subareas = UNESCO_FIELDS.find((f) => f.label === selectedArea)?.subareas ?? [];

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label style={lbl}>Área Principal (UNESCO)</label>
          <select
            name="area"
            required
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            style={inp}
          >
            <option value="">Selecciona un área...</option>
            {UNESCO_FIELDS.map((f) => (
              <option key={f.code} value={f.label}>
                {f.code}. {f.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={lbl}>Subárea</label>
          <select
            name="subarea"
            disabled={!selectedArea}
            style={{ ...inp, opacity: !selectedArea ? 0.5 : 1 }}
          >
            <option value="">
              {selectedArea ? "Selecciona una subárea..." : "Primero elige un área"}
            </option>
            {subareas.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label style={lbl}>Temas / Topics (separados por coma)</label>
        <input
          name="topics"
          type="text"
          placeholder="Ej: SEO, Marketing de contenidos, Growth Hacking"
          style={inp}
        />
        <p style={{ fontFamily: SANS, fontSize: 11, color: D.faint, margin: "6px 0 0" }}>
          Opcional — ayudan a las instituciones a encontrarte con búsquedas más específicas
        </p>
      </div>

      <div>
        <button
          type="submit"
          disabled={!selectedArea}
          style={{
            fontFamily: SANS, background: selectedArea ? D.blue : D.border, color: "#fff",
            border: "none", padding: "11px 28px", borderRadius: 10,
            fontSize: 14, fontWeight: 700, cursor: selectedArea ? "pointer" : "not-allowed",
            display: "inline-flex", alignItems: "center", gap: 8,
            opacity: selectedArea ? 1 : 0.7, transition: "all 0.2s",
          }}
        >
          <Check size={15} /> Añadir especialidad
        </button>
      </div>
    </form>
  );
}
