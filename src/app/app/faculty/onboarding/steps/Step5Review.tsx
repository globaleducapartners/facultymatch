"use client";

import { CheckCircle2, MapPin, Building2, Briefcase, GraduationCap, Globe, Clock, Award, BookOpen, Languages } from "lucide-react";

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

const AVAIL_LABELS: Record<string, string> = {
  open: "Disponible inmediatamente",
  next_semester: "Próximo semestre",
  occasional: "Asignaturas puntuales",
  weekends: "Solo fines de semana",
  online_only: "Solo online",
  limited: "En 6 meses",
  invite_only: "Solo por invitación",
};

interface WizardData {
  fullName: string;
  headline: string;
  country: string;
  city: string;
  bio: string;
  careerType: "academica" | "profesional" | "combinado" | null;
  currentPosition: string;
  currentCompany: string;
  industrySector: string;
  careerDescription: string;
  unescoArea: string;
  unescoSubarea: string;
  unescoTopics: string;
  hasAneca: boolean;
  otherAccreditation: string;
  isPhd: boolean;
  researchPublications: string;
  googleScholarId: string;
  orcidId: string;
  languages: any[];
  availability: string;
  academicLevel: string;
  modalities: string[];
  institutionsTaught: string[];
  currentInstitution: string;
  yearsExperience: number;
  [key: string]: any;
}

interface Props {
  data: WizardData;
  facultyProfile: any;
  userMeta: Record<string, any>;
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: D.surf, border: `1px solid ${D.border}`, borderRadius: 12,
      padding: 16, marginBottom: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6, background: D.white,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon}
        </div>
        <span style={{ fontSize: 14, fontWeight: 800, color: D.ink }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${D.border}`, fontSize: 13 }}>
      <span style={{ color: D.muted, fontWeight: 600 }}>{label}</span>
      <span style={{ color: D.ink, fontWeight: 700, textAlign: "right" as const, maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

export function Step5Review({ data }: Props) {
  const locationStr = [data.city, data.country].filter(Boolean).join(", ");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div>
        <h2 style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: D.ink, margin: "0 0 4px" }}>
          Revisión final
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 13, color: D.muted, margin: "0 0 20px" }}>
          Revisa todos los datos antes de publicar tu perfil.
        </p>
      </div>

      {/* Basic Info */}
      <Section icon={<CheckCircle2 size={14} color={D.blue} />} title="Información básica">
        <Row label="Nombre" value={data.fullName} />
        <Row label="Titular" value={data.headline} />
        {locationStr && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0", fontSize: 13, color: D.muted }}>
            <MapPin size={13} color={D.faint} />
            {locationStr}
          </div>
        )}
        {data.bio && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: D.faint, marginBottom: 4 }}>SOBRE MÍ</div>
            <p style={{ fontSize: 13, color: D.ink, lineHeight: 1.6, margin: 0 }}>{data.bio}</p>
          </div>
        )}
        {!data.fullName && !data.headline && !locationStr && !data.bio && (
          <p style={{ fontSize: 13, color: D.faint, fontStyle: "italic" }}>No has añadido información básica</p>
        )}
      </Section>

      {/* Career Type */}
      <Section icon={<Briefcase size={14} color={D.blue} />} title="Trayectoria profesional">
        {/*
          "combinado" shows both academic and professional info.
          "academica" shows only academic.
          "profesional" shows only professional.
        */}
        <Row label="Tipo" value={
          data.careerType === "combinado" ? "Académica + Profesional"
          : data.careerType === "academica" ? "Académica"
          : data.careerType === "profesional" ? "Profesional"
          : null
        } />
        {data.careerType === "combinado" && (
          <div style={{ marginBottom: 8, padding: 8, background: "#EFF6FF", borderRadius: 8, fontSize: 12, color: D.blue, fontWeight: 600 }}>
            Perfil combinado — incluye ambas trayectorias
          </div>
        )}
        {(data.careerType === "profesional" || data.careerType === "combinado") && (
          <>
            <Row label="Cargo" value={data.currentPosition} />
            <Row label="Empresa" value={data.currentCompany} />
            <Row label="Sector" value={data.industrySector} />
            {data.yearsExperience > 0 && <Row label="Años de experiencia" value={String(data.yearsExperience)} />}
            {data.careerDescription && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: D.faint, marginBottom: 4 }}>DESCRIPCIÓN PROFESIONAL</div>
                <p style={{ fontSize: 13, color: D.ink, lineHeight: 1.6, margin: 0 }}>{data.careerDescription}</p>
              </div>
            )}
          </>
        )}
        {!data.careerType && (
          <p style={{ fontSize: 13, color: D.faint, fontStyle: "italic" }}>No has seleccionado un tipo de trayectoria</p>
        )}
      </Section>

      {/* Specialty */}
      <Section icon={<Award size={14} color={D.blue} />} title="Especialidad y acreditación">
        <Row label="Área UNESCO" value={data.unescoArea || null} />
        <Row label="Subárea" value={data.unescoSubarea || null} />
        <Row label="Temas" value={data.unescoTopics || null} />
        {data.hasAneca && <Row label="ANECA" value="Titular de Universidad (ANECA)" />}
        <Row label="Otra acreditación" value={data.otherAccreditation || null} />
        {data.isPhd && <Row label="PhD" value="Sí" />}
        <Row label="Google Scholar" value={data.googleScholarId || null} />
        <Row label="ORCID" value={data.orcidId || null} />
        {data.researchPublications && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: D.faint, marginBottom: 4 }}>PUBLICACIONES</div>
            <p style={{ fontSize: 13, color: D.ink, lineHeight: 1.6, margin: 0 }}>{data.researchPublications}</p>
          </div>
        )}
        {!data.unescoArea && !data.unescoSubarea && !data.hasAneca && !data.isPhd && !data.researchPublications && (
          <p style={{ fontSize: 13, color: D.faint, fontStyle: "italic" }}>No has añadido especialidades ni acreditaciones</p>
        )}
      </Section>

      {/* Modality */}
      <Section icon={<Clock size={14} color={D.blue} />} title="Disponibilidad e idiomas">
        <Row label="Disponibilidad" value={AVAIL_LABELS[data.availability] || data.availability} />
        <Row label="Nivel académico" value={data.academicLevel || null} />
        <Row label="Institución actual" value={data.currentInstitution || null} />
        {data.modalities?.length > 0 && <Row label="Modalidad" value={data.modalities.join(", ")} />}
        {data.institutionsTaught?.length > 0 && (
          <Row label="Instituciones donde impartió" value={data.institutionsTaught.join(", ")} />
        )}
        {data.languages?.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: D.faint, marginBottom: 4 }}>IDIOMAS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {data.languages.map((l: any, i: number) => (
                <span key={i} style={{
                  fontSize: 12, color: D.ink, fontWeight: 600,
                  background: D.white, border: `1px solid ${D.border}`,
                  padding: "3px 10px", borderRadius: 999,
                }}>
                  {typeof l === "string" ? l : `${l.lang || l.language || l.name}${l.level ? ` · ${l.level}` : ""}`}
                </span>
              ))}
            </div>
          </div>
        )}
        {!data.availability && !data.academicLevel && !data.currentInstitution && data.languages?.length === 0 && (
          <p style={{ fontSize: 13, color: D.faint, fontStyle: "italic" }}>No has configurado disponibilidad ni idiomas</p>
        )}
      </Section>
    </div>
  );
}