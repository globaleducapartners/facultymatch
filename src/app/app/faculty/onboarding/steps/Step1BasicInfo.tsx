"use client";

import { AvatarUpload } from "@/components/profile/AvatarUpload";

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

const inp: React.CSSProperties = {
  fontFamily: SANS, width: "100%", fontSize: 14, color: D.ink,
  background: D.white, border: `1px solid ${D.border}`,
  borderRadius: 10, padding: "11px 14px", outline: "none",
  boxSizing: "border-box" as const, transition: "border-color 0.2s",
};

const selectStyle: React.CSSProperties = {
  fontFamily: SANS, width: "100%", fontSize: 14, color: D.ink,
  background: D.white, border: `1px solid ${D.border}`,
  borderRadius: 10, padding: "11px 14px", outline: "none",
  boxSizing: "border-box" as const, transition: "border-color 0.2s",
  appearance: "none" as const,
  cursor: "pointer",
};

const lbl: React.CSSProperties = {
  fontFamily: SANS, fontSize: 11, fontWeight: 700,
  letterSpacing: "0.1em", textTransform: "uppercase" as const,
  color: D.faint, display: "block", marginBottom: 6,
};

const COUNTRIES = [
  "España", "México", "Argentina", "Colombia", "Chile", "Perú",
  "Estados Unidos", "Reino Unido", "Alemania", "Francia",
  "Portugal", "Italia", "Países Bajos", "Otro",
];

interface WizardData {
  fullName: string;
  headline: string;
  country: string;
  city: string;
  bio: string;
  [key: string]: any;
}

interface Props {
  data: WizardData;
  updateData: (partial: Partial<WizardData>) => void;
  user: { id: string };
  avatarUrl?: string;
}

export function Step1BasicInfo({ data, updateData, user, avatarUrl }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h2 style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: D.ink, margin: "0 0 4px" }}>
          Información básica
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 13, color: D.muted, margin: 0 }}>
          Cuéntanos quién eres. Estos datos serán visibles en tu perfil público.
        </p>
      </div>

      <div>
        <label style={lbl}>Foto de perfil</label>
        <AvatarUpload userId={user.id} currentAvatarUrl={avatarUrl} name={data.fullName} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label style={lbl}>Nombre completo *</label>
          <input
            style={inp}
            placeholder="Ej: María García López"
            value={data.fullName}
            onChange={(e) => updateData({ fullName: e.target.value })}
            required
          />
        </div>
        <div>
          <label style={lbl}>Titular académico</label>
          <input
            style={inp}
            placeholder="Dr. | Economía | MBA"
            value={data.headline}
            onChange={(e) => updateData({ headline: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label style={lbl}>País</label>
          <select
            style={selectStyle}
            value={data.country}
            onChange={(e) => updateData({ country: e.target.value })}
          >
            <option value="">Selecciona tu país...</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Ciudad</label>
          <input
            style={inp}
            placeholder="Madrid"
            value={data.city}
            onChange={(e) => updateData({ city: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label style={lbl}>Sobre mí</label>
        <textarea
          style={{ ...inp, resize: "vertical" as const, minHeight: 100 }}
          placeholder="Describe tu trayectoria, especialidad y valor como docente…"
          value={data.bio}
          onChange={(e) => updateData({ bio: e.target.value })}
          rows={5}
        />
      </div>
    </div>
  );
}