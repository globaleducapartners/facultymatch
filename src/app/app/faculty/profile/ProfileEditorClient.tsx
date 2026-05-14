"use client";

import { useState, useTransition } from "react";
import {
  User, Globe, MapPin, Briefcase, GraduationCap, FileText,
  Bell, Mail, Phone, Link as LinkIcon, BookOpen, Languages,
  Eye, CheckCircle2, Clock, Building2, Star, ChevronRight,
  Pencil, Check, ExternalLink,
} from "lucide-react";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { LanguageEditor } from "@/components/profile/LanguageEditor";
import { DegreeEditor } from "@/components/profile/DegreeEditor";
import { InstitutionsTaughtEditor } from "@/components/profile/InstitutionsTaughtEditor";
import { CVUpload } from "@/components/profile/CVUpload";
import { InstitutionSelector } from "@/components/profile/InstitutionSelector";

// ─── Design tokens ────────────────────────────────────────────────────────────
const SANS = `'Inter', system-ui, -apple-system, sans-serif`;
const D = {
  blue:   "#1B4FD8",
  navy:   "#0D2240",
  gold:   "#E9A030",
  surf:   "#F2F6FC",
  white:  "#FFFFFF",
  ink:    "#0C1018",
  muted:  "#6B7280",
  faint:  "#9CA3AF",
  border: "#D8E2EF",
  green:  "#059669",
  greenBg:"#F0FDF4",
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

const saveBtn: React.CSSProperties = {
  fontFamily: SANS, background: D.blue, color: "#fff",
  border: "none", padding: "11px 28px", borderRadius: 10,
  fontSize: 14, fontWeight: 700, cursor: "pointer",
  display: "inline-flex", alignItems: "center", gap: 8,
  transition: "opacity 0.2s",
};

// ─── Section config ────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "basic",       icon: User,        label: "Datos básicos"    },
  { id: "experience",  icon: Briefcase,   label: "Experiencia"      },
  { id: "formacion",   icon: GraduationCap,label: "Formación"       },
  { id: "idiomas",     icon: Languages,   label: "Idiomas"          },
  { id: "research",    icon: BookOpen,    label: "Investigación"    },
  { id: "documents",   icon: FileText,    label: "Documentos"       },
  { id: "links",       icon: Globe,       label: "Enlaces"          },
  { id: "preferences", icon: Bell,        label: "Contacto"         },
];

const AVAIL_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  open:            { label: "Disponible ahora",      color: D.green,  bg: D.greenBg },
  next_semester:   { label: "Próximo semestre",       color: "#0891B2",bg: "#EFF9FF" },
  occasional:      { label: "Asignaturas puntuales",  color: "#7C3AED",bg: "#F5F3FF" },
  weekends:        { label: "Fines de semana",        color: "#D97706",bg: "#FFFBEB" },
  online_only:     { label: "Solo online",            color: D.blue,   bg: "#EFF6FF" },
  limited:         { label: "En 6 meses",             color: D.muted,  bg: "#F3F4F6" },
  invite_only:     { label: "Por invitación",         color: D.navy,   bg: "#EEF4FF" },
};

// ─── Completeness helper ───────────────────────────────────────────────────────
function calcCompleteness(fp: any, p: any, meta: any): number {
  const fields = [
    fp?.headline, fp?.bio, fp?.country, fp?.city,
    fp?.current_institution, fp?.years_experience,
    fp?.availability, fp?.academic_level,
    fp?.degrees?.length, fp?.languages?.length,
    fp?.linkedin_url || fp?.website,
    p?.avatar_url || fp?.avatar_url,
    p?.full_name || meta?.full_name,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Props {
  user: { id: string; email?: string | null };
  userMeta: Record<string, any>;
  profile: any;
  facultyProfile: any;
  documents: any[];
  viewCount: number;
  saved: boolean;
  // Server actions
  saveBasicInfo: (fd: FormData) => Promise<void>;
  saveExperience: (fd: FormData) => Promise<void>;
  saveFormacion: (fd: FormData) => Promise<void>;
  saveLanguages: (fd: FormData) => Promise<void>;
  saveResearch: (fd: FormData) => Promise<void>;
  saveLinks: (fd: FormData) => Promise<void>;
  updateContactPreferences: (fd: FormData) => Promise<void>;
}

// ─── Live Preview Card ─────────────────────────────────────────────────────────
function ProfilePreview({ data, avatarUrl }: { data: PreviewState; avatarUrl?: string }) {
  const avail = AVAIL_LABELS[data.availability] || AVAIL_LABELS.open;
  const initials = (data.fullName || "?")
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div style={{
      background: D.white, borderRadius: 20,
      border: `1px solid ${D.border}`,
      boxShadow: "0 4px 24px rgba(7,19,38,0.07)",
      overflow: "visible", fontFamily: SANS,
    }}>
      {/* Cover band */}
      <div style={{
        height: 80,
        background: `linear-gradient(135deg, ${D.navy} 0%, ${D.blue} 100%)`,
        borderRadius: "20px 20px 0 0",
        position: "relative",
      }} />

      {/* Avatar */}
      <div style={{ padding: "0 24px", marginTop: -36 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 16,
          background: avatarUrl ? "transparent" : D.blue,
          border: `3px solid ${D.white}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(7,19,38,0.12)",
        }}>
          {avatarUrl
            ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>{initials}</span>
          }
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "12px 24px 20px" }}>
        {/* Name + PhD badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <h3 style={{ fontFamily: SANS, fontSize: 17, fontWeight: 800, color: D.ink, letterSpacing: "-0.03em", margin: 0 }}>
            {data.fullName || "Tu nombre completo"}
          </h3>
          {data.isPhd && (
            <span style={{
              fontFamily: SANS, fontSize: 10, fontWeight: 700,
              color: "#7C3AED", background: "#F5F3FF",
              border: "1px solid #DDD6FE",
              padding: "2px 7px", borderRadius: 999,
            }}>PhD</span>
          )}
        </div>

        {/* Headline */}
        <p style={{ fontFamily: SANS, fontSize: 13, color: D.muted, margin: "0 0 10px", lineHeight: 1.5 }}>
          {data.headline || <span style={{ color: D.faint, fontStyle: "italic" }}>Titular académico...</span>}
        </p>

        {/* Location + Institution */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
          {(data.city || data.country) && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <MapPin size={12} color={D.faint} />
              <span style={{ fontFamily: SANS, fontSize: 12, color: D.muted }}>
                {[data.city, data.country].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          {data.currentInstitution && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Building2 size={12} color={D.faint} />
              <span style={{ fontFamily: SANS, fontSize: 12, color: D.muted }}>{data.currentInstitution}</span>
            </div>
          )}
          {data.yearsExperience > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Briefcase size={12} color={D.faint} />
              <span style={{ fontFamily: SANS, fontSize: 12, color: D.muted }}>{data.yearsExperience} años de experiencia</span>
            </div>
          )}
        </div>

        {/* Availability badge */}
        <div style={{ marginBottom: 12 }}>
          <span style={{
            fontFamily: SANS, fontSize: 11, fontWeight: 700,
            color: avail.color, background: avail.bg,
            padding: "4px 10px", borderRadius: 999,
            display: "inline-block",
          }}>
            {avail.label}
          </span>
        </div>

        {/* Bio */}
        {data.bio && (
          <p style={{
            fontFamily: SANS, fontSize: 12, color: D.muted,
            lineHeight: 1.6, margin: "0 0 14px",
            borderTop: `1px solid ${D.border}`, paddingTop: 12,
            display: "-webkit-box", WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical" as const, overflow: "hidden",
          }}>
            {data.bio}
          </p>
        )}

        {/* Languages */}
        {data.languages.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, marginBottom: 12 }}>
            {data.languages.map((l: any, i: number) => (
              <span key={i} style={{
                fontFamily: SANS, fontSize: 11, color: D.ink,
                background: D.surf, border: `1px solid ${D.border}`,
                padding: "3px 9px", borderRadius: 999,
              }}>
                {typeof l === "string" ? l : `${l.language || l.name} ${l.level ? `· ${l.level}` : ""}`}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, paddingTop: 12, borderTop: `1px solid ${D.border}` }}>
          {data.linkedinUrl && (
            <span style={{
              fontFamily: SANS, fontSize: 11, color: D.blue,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <ExternalLink size={11} /> LinkedIn
            </span>
          )}
          {data.website && (
            <span style={{
              fontFamily: SANS, fontSize: 11, color: D.blue,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <Globe size={11} /> Web personal
            </span>
          )}
        </div>

        {/* CTA preview */}
        <div style={{
          marginTop: 16,
          display: "flex", gap: 8,
          padding: "12px", background: D.surf,
          borderRadius: 12, alignItems: "center",
          justifyContent: "center",
        }}>
          <Lock size={13} color={D.faint} />
          <span style={{ fontFamily: SANS, fontSize: 11, color: D.faint }}>
            Vista previa — los botones de contacto son visibles para instituciones
          </span>
        </div>
      </div>
    </div>
  );
}

// We need Lock for preview CTA
function Lock({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

// ─── Preview state ─────────────────────────────────────────────────────────────
interface PreviewState {
  fullName: string;
  headline: string;
  bio: string;
  country: string;
  city: string;
  isPhd: boolean;
  availability: string;
  currentInstitution: string;
  yearsExperience: number;
  languages: any[];
  linkedinUrl: string;
  website: string;
}

// ─── Main component ────────────────────────────────────────────────────────────
export function ProfileEditorClient({
  user, userMeta, profile, facultyProfile, documents, viewCount, saved,
  saveBasicInfo, saveExperience, saveFormacion, saveLanguages,
  saveResearch, saveLinks, updateContactPreferences,
}: Props) {
  const [activeSection, setActiveSection] = useState("basic");
  const [isPending, startTransition] = useTransition();

  const avatarUrl = profile?.avatar_url || facultyProfile?.avatar_url;
  const completeness = calcCompleteness(facultyProfile, profile, userMeta);

  const [preview, setPreview] = useState<PreviewState>({
    fullName:           profile?.full_name || userMeta?.full_name || "",
    headline:           facultyProfile?.headline || "",
    bio:                facultyProfile?.bio || "",
    country:            facultyProfile?.country || userMeta?.country || "",
    city:               facultyProfile?.city || userMeta?.city || "",
    isPhd:              facultyProfile?.is_phd ?? false,
    availability:       facultyProfile?.availability || "open",
    currentInstitution: facultyProfile?.current_institution || "",
    yearsExperience:    facultyProfile?.years_experience || 0,
    languages:          (facultyProfile?.languages as any[]) || [],
    linkedinUrl:        facultyProfile?.linkedin_url || "",
    website:            facultyProfile?.website || "",
  });

  const avail = AVAIL_LABELS[preview.availability] || AVAIL_LABELS.open;

  return (
    <div style={{ fontFamily: SANS }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: SANS, fontSize: 24, fontWeight: 900, color: D.ink, letterSpacing: "-0.04em", margin: "0 0 4px" }}>
          Mi perfil
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 14, color: D.muted, margin: 0 }}>
          Gestiona tu identidad académica y profesional.
        </p>
      </div>

      {/* ── Stats strip ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12, marginBottom: 24,
      }}>
        {/* Views */}
        <div style={{
          background: D.white, border: `1px solid ${D.border}`,
          borderRadius: 14, padding: "16px 20px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "#EFF6FF", display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Eye size={18} color={D.blue} />
          </div>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 900, color: D.ink, letterSpacing: "-0.04em", lineHeight: 1 }}>
              {viewCount.toLocaleString()}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: D.muted, marginTop: 2 }}>Visualizaciones</div>
          </div>
        </div>

        {/* Completeness */}
        <div style={{
          background: D.white, border: `1px solid ${D.border}`,
          borderRadius: 14, padding: "16px 20px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontFamily: SANS, fontSize: 11, color: D.muted }}>Completitud</div>
            <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 800, color: completeness >= 80 ? D.green : D.blue, letterSpacing: "-0.03em" }}>
              {completeness}%
            </div>
          </div>
          <div style={{ height: 6, background: D.surf, borderRadius: 999, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${completeness}%`,
              background: completeness >= 80 ? D.green : D.blue,
              borderRadius: 999, transition: "width 0.5s ease",
            }} />
          </div>
        </div>

        {/* Visibility */}
        <div style={{
          background: D.white, border: `1px solid ${D.border}`,
          borderRadius: 14, padding: "16px 20px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: avail.bg, display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Clock size={18} color={avail.color} />
          </div>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: avail.color }}>{avail.label}</div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: D.muted, marginTop: 2 }}>Disponibilidad</div>
          </div>
        </div>
      </div>

      {/* ── Saved banner ── */}
      {saved && (
        <div style={{
          background: D.greenBg, border: "1px solid #A7F3D0",
          borderRadius: 12, padding: "12px 20px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 10,
          fontFamily: SANS, fontSize: 14, fontWeight: 700, color: "#065F46",
        }}>
          <CheckCircle2 size={16} color="#059669" /> Cambios guardados correctamente
        </div>
      )}

      {/* ── Split view ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) 320px",
        gap: 20, alignItems: "start",
      }}>

        {/* ── LEFT: Editor ── */}
        <div>
          {/* Avatar card */}
          <div style={{
            background: D.white, border: `1px solid ${D.border}`,
            borderRadius: 16, padding: "20px 24px",
            marginBottom: 16,
            display: "flex", alignItems: "center", gap: 20,
          }}>
            <AvatarUpload
              userId={user.id}
              currentAvatarUrl={avatarUrl}
              name={preview.fullName}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: D.ink, letterSpacing: "-0.03em" }}>
                {preview.fullName || <span style={{ color: D.faint }}>Tu nombre</span>}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: D.muted, marginTop: 2 }}>
                {preview.headline || <span style={{ color: D.faint, fontStyle: "italic" }}>Añade tu titular...</span>}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: D.faint, marginTop: 4 }}>{user.email}</div>
            </div>
          </div>

          {/* Section nav pills */}
          <div style={{
            display: "flex", gap: 6, flexWrap: "wrap" as const,
            marginBottom: 16,
          }}>
            {SECTIONS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                style={{
                  fontFamily: SANS, fontSize: 13, fontWeight: 600,
                  padding: "7px 14px", borderRadius: 20,
                  border: `1px solid ${activeSection === id ? D.blue : D.border}`,
                  background: activeSection === id ? "#EFF6FF" : D.white,
                  color: activeSection === id ? D.blue : D.muted,
                  cursor: "pointer", transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          {/* Section form */}
          <div style={{
            background: D.white, border: `1px solid ${D.border}`,
            borderRadius: 16, padding: "28px 28px 24px",
          }}>

            {/* ── BÁSICOS ── */}
            {activeSection === "basic" && (
              <div>
                <SectionHeader icon={<User size={18} color={D.blue} />} title="Datos básicos" desc="Primera impresión para las instituciones" />
                <form action={saveBasicInfo} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <Field label="Nombre completo">
                      <input
                        name="fullName" style={inp} required
                        defaultValue={profile?.full_name || userMeta?.full_name}
                        onChange={e => setPreview(p => ({ ...p, fullName: e.target.value }))}
                      />
                    </Field>
                    <Field label="Titular académico">
                      <input
                        name="headline" style={inp}
                        placeholder="Dr. | Economía | MBA"
                        defaultValue={facultyProfile?.headline}
                        onChange={e => setPreview(p => ({ ...p, headline: e.target.value }))}
                      />
                    </Field>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <Field label="País">
                      <input
                        name="country" style={inp}
                        placeholder="España"
                        defaultValue={facultyProfile?.country || userMeta?.country}
                        onChange={e => setPreview(p => ({ ...p, country: e.target.value }))}
                      />
                    </Field>
                    <Field label="Ciudad">
                      <input
                        name="city" style={inp}
                        placeholder="Madrid"
                        defaultValue={facultyProfile?.city || userMeta?.city}
                        onChange={e => setPreview(p => ({ ...p, city: e.target.value }))}
                      />
                    </Field>
                  </div>
                  <Field label="Biografía profesional">
                    <textarea
                      name="bio"
                      rows={5}
                      style={{ ...inp, resize: "vertical" as const }}
                      placeholder="Describe tu trayectoria, especialidad y valor como docente..."
                      defaultValue={facultyProfile?.bio}
                      onChange={e => setPreview(p => ({ ...p, bio: e.target.value }))}
                    />
                  </Field>
                  <SaveButton pending={isPending} />
                </form>
              </div>
            )}

            {/* ── EXPERIENCIA ── */}
            {activeSection === "experience" && (
              <div>
                <SectionHeader icon={<Briefcase size={18} color={D.blue} />} title="Experiencia" desc="Tu trayectoria profesional y docente" />
                <form action={saveExperience} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <Field label="Institución actual">
                      <InstitutionSelector
                        name="currentInstitution"
                        initialValue={facultyProfile?.current_institution || ""}
                        placeholder="Buscar institución..."
                      />
                    </Field>
                    <Field label="Años de experiencia">
                      <input
                        name="yearsExperience" type="number" min={0}
                        style={inp}
                        defaultValue={facultyProfile?.years_experience ?? ""}
                        onChange={e => setPreview(p => ({ ...p, yearsExperience: parseInt(e.target.value) || 0 }))}
                      />
                    </Field>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <Field label="Nivel académico máximo">
                      <select name="academicLevel" style={{ ...inp, appearance: "none" as const }}
                        defaultValue={facultyProfile?.academic_level || ""}>
                        <option value="">Sin especificar</option>
                        <option value="Grado">Grado / Licenciatura</option>
                        <option value="Master">Máster</option>
                        <option value="Doctorado">Doctorado (PhD)</option>
                        <option value="Postdoctorado">Postdoctorado</option>
                        <option value="Catedratico">Catedrático</option>
                      </select>
                    </Field>
                    <Field label="Disponibilidad">
                      <select
                        name="availability"
                        style={{ ...inp, appearance: "none" as const }}
                        defaultValue={facultyProfile?.availability || "open"}
                        onChange={e => setPreview(p => ({ ...p, availability: e.target.value }))}
                      >
                        <option value="open">Disponible inmediatamente</option>
                        <option value="next_semester">Próximo semestre</option>
                        <option value="occasional">Asignaturas puntuales</option>
                        <option value="weekends">Solo fines de semana</option>
                        <option value="online_only">Solo online</option>
                        <option value="limited">En 6 meses</option>
                        <option value="invite_only">Solo por invitación</option>
                      </select>
                    </Field>
                  </div>

                  {/* PhD toggle */}
                  <label style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px", borderRadius: 12,
                    border: `1px solid ${D.border}`, cursor: "pointer",
                    background: D.surf,
                  }}>
                    <input
                      type="checkbox" name="isPhd"
                      style={{ width: 18, height: 18, accentColor: D.blue, flexShrink: 0, cursor: "pointer" }}
                      defaultChecked={facultyProfile?.is_phd ?? false}
                      onChange={e => setPreview(p => ({ ...p, isPhd: e.target.checked }))}
                    />
                    <div>
                      <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: D.ink }}>Soy Doctor/a (PhD)</div>
                      <div style={{ fontFamily: SANS, fontSize: 12, color: D.muted, marginTop: 2 }}>
                        Aparecerá el badge PhD en tu perfil y en el directorio
                      </div>
                    </div>
                  </label>

                  <Field label="Instituciones donde has impartido docencia">
                    <InstitutionsTaughtEditor
                      initialInstitutions={(facultyProfile?.institutions_taught as string[] | null) || []}
                    />
                  </Field>

                  <SaveButton pending={isPending} />
                </form>
              </div>
            )}

            {/* ── FORMACIÓN ── */}
            {activeSection === "formacion" && (
              <div>
                <SectionHeader icon={<GraduationCap size={18} color={D.blue} />} title="Formación académica" desc="Títulos y certificaciones" />
                <form action={saveFormacion} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <DegreeEditor initialDegrees={(facultyProfile?.degrees as any[] | null) || []} />
                  <SaveButton pending={isPending} label="Guardar formación" />
                </form>
              </div>
            )}

            {/* ── IDIOMAS ── */}
            {activeSection === "idiomas" && (
              <div>
                <SectionHeader icon={<Languages size={18} color={D.blue} />} title="Idiomas" desc="Idiomas en los que puedes impartir docencia" />
                <form action={saveLanguages} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <LanguageEditor
                    initialLanguages={(facultyProfile?.languages as any[] | null) || []}
                  />
                  <SaveButton pending={isPending} label="Guardar idiomas" />
                </form>
              </div>
            )}

            {/* ── INVESTIGACIÓN ── */}
            {activeSection === "research" && (
              <div>
                <SectionHeader icon={<BookOpen size={18} color={D.blue} />} title="Perfil investigador" desc="Acreditaciones y métricas académicas" />
                <form action={saveResearch} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <label style={{ ...lbl, marginBottom: 10 }}>Acreditaciones</label>
                    <label style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 16px", borderRadius: 12,
                      border: `1px solid ${D.border}`, cursor: "pointer",
                      background: D.surf, marginBottom: 10,
                    }}>
                      <input
                        type="checkbox" name="hasAneca"
                        style={{ width: 18, height: 18, accentColor: D.blue, flexShrink: 0 }}
                        defaultChecked={!!(facultyProfile?.aneca_accreditation?.includes("ANECA"))}
                      />
                      <div>
                        <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: D.ink }}>Acreditación ANECA — Titular de Universidad</div>
                        <div style={{ fontFamily: SANS, fontSize: 12, color: D.muted, marginTop: 2 }}>
                          Para Titular de Universidad o Catedrático
                        </div>
                      </div>
                    </label>
                    <Field label="Otra acreditación (AQU, ANECA Ayudante Doctor...)">
                      <input
                        name="otherAccreditation" style={inp}
                        placeholder="Ej: Acreditación AQU, ANECA Ayudante Doctor..."
                        defaultValue={
                          facultyProfile?.aneca_accreditation
                            ?.replace("Titular de Universidad (ANECA)", "").replace(" · ", "").trim() || ""
                        }
                      />
                    </Field>
                  </div>
                  <Field label="Publicaciones relevantes">
                    <textarea
                      name="researchPublications" rows={4}
                      style={{ ...inp, resize: "vertical" as const }}
                      placeholder="Lista tus publicaciones principales..."
                      defaultValue={facultyProfile?.research_publications}
                    />
                  </Field>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <Field label="Google Scholar ID">
                      <input name="googleScholarId" style={inp} placeholder="XXXXXXX"
                        defaultValue={facultyProfile?.google_scholar_id} />
                    </Field>
                    <Field label="ORCID iD">
                      <input name="orcidId" style={inp} placeholder="0000-0000-0000-0000"
                        defaultValue={facultyProfile?.orcid_id} />
                    </Field>
                  </div>
                  <SaveButton pending={isPending} />
                </form>
              </div>
            )}

            {/* ── DOCUMENTOS ── */}
            {activeSection === "documents" && (
              <div>
                <SectionHeader icon={<FileText size={18} color={D.blue} />} title="Curriculum Vitae" desc="Sube tu CV actualizado" />
                <CVUpload facultyId={user.id} existingDocs={documents} />
              </div>
            )}

            {/* ── ENLACES ── */}
            {activeSection === "links" && (
              <div>
                <SectionHeader icon={<Globe size={18} color={D.blue} />} title="Presencia digital" desc="Perfiles profesionales y web" />
                <form action={saveLinks} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <Field label="LinkedIn URL">
                      <input name="linkedinUrl" style={inp}
                        placeholder="https://linkedin.com/in/..."
                        defaultValue={facultyProfile?.linkedin_url}
                        onChange={e => setPreview(p => ({ ...p, linkedinUrl: e.target.value }))}
                      />
                    </Field>
                    <Field label="Web personal">
                      <input name="website" style={inp}
                        placeholder="https://..."
                        defaultValue={facultyProfile?.website}
                        onChange={e => setPreview(p => ({ ...p, website: e.target.value }))}
                      />
                    </Field>
                  </div>
                  <Field label="Teléfono">
                    <input name="phone" style={inp} placeholder="+34 600 000 000"
                      defaultValue={facultyProfile?.phone} />
                  </Field>
                  <SaveButton pending={isPending} />
                </form>
              </div>
            )}

            {/* ── CONTACTO ── */}
            {activeSection === "preferences" && (
              <div>
                <SectionHeader icon={<Bell size={18} color={D.blue} />} title="Preferencias de contacto" desc="Cómo quieres que te contacten las instituciones" />
                <form action={updateContactPreferences} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <Field label="Método preferido">
                    <select name="preferredContact" style={{ ...inp, appearance: "none" as const }}
                      defaultValue={facultyProfile?.preferred_contact_method || "email"}>
                      <option value="email">Por email</option>
                      <option value="whatsapp">Por WhatsApp</option>
                      <option value="linkedin">Por LinkedIn</option>
                      <option value="platform">Solo plataforma</option>
                    </select>
                  </Field>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <Field label="Email de contacto">
                      <input name="contactEmail" type="email" style={inp}
                        placeholder="tu@email.com"
                        defaultValue={facultyProfile?.contact_email || user.email || ""} />
                    </Field>
                    <Field label="WhatsApp">
                      <input name="contactWhatsapp" style={inp}
                        placeholder="+34 600 000 000"
                        defaultValue={facultyProfile?.contact_whatsapp} />
                    </Field>
                  </div>
                  <Field label="LinkedIn para contacto">
                    <input name="contactLinkedin" style={inp}
                      placeholder="https://linkedin.com/in/..."
                      defaultValue={facultyProfile?.contact_linkedin || facultyProfile?.linkedin_url} />
                  </Field>

                  {/* Notification toggles */}
                  <div>
                    <label style={{ ...lbl, marginBottom: 10 }}>Notificaciones</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        { name: "notifyNewOffers", label: "Nuevas oportunidades de instituciones", checked: facultyProfile?.notify_new_offers ?? true },
                        { name: "notifyMessages", label: "Mensajes directos", checked: facultyProfile?.notify_messages ?? true },
                        { name: "notifyWeeklyDigest", label: "Resumen semanal de actividad", checked: facultyProfile?.notify_weekly_digest ?? false },
                      ].map(({ name, label, checked }) => (
                        <label key={name} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "12px 16px", borderRadius: 10,
                          border: `1px solid ${D.border}`, cursor: "pointer",
                          background: D.surf,
                        }}>
                          <span style={{ fontFamily: SANS, fontSize: 13, color: D.ink }}>{label}</span>
                          <input type="checkbox" name={name} defaultChecked={checked}
                            style={{ width: 16, height: 16, accentColor: D.blue, cursor: "pointer" }} />
                        </label>
                      ))}
                    </div>
                  </div>

                  <SaveButton pending={isPending} label="Guardar preferencias" />
                </form>
              </div>
            )}

          </div>
        </div>

        {/* ── RIGHT: Sticky preview ── */}
        <div style={{ position: "sticky", top: 24 }}>
          {/* Preview label */}
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            marginBottom: 10,
          }}>
            <Eye size={14} color={D.muted} />
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: D.muted }}>
              Vista previa del perfil
            </span>
          </div>

          <ProfilePreview data={preview} avatarUrl={avatarUrl} />

          {/* Profile completion tips */}
          {completeness < 80 && (
            <div style={{
              marginTop: 14, background: D.white,
              border: `1px solid ${D.border}`,
              borderRadius: 14, padding: "16px 18px",
            }}>
              <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: D.navy, marginBottom: 8 }}>
                Mejora tu visibilidad
              </div>
              {[
                !facultyProfile?.headline && "Añade un titular profesional",
                !facultyProfile?.bio && "Escribe tu biografía",
                !facultyProfile?.current_institution && "Indica tu institución actual",
                !(facultyProfile?.languages?.length) && "Añade los idiomas que hablas",
                !(facultyProfile?.degrees?.length) && "Añade tu formación académica",
              ].filter(Boolean).slice(0, 3).map((tip, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  fontFamily: SANS, fontSize: 12, color: D.muted, marginTop: 6,
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: D.gold, flexShrink: 0 }} />
                  {tip}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────
function SectionHeader({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: "#EFF6FF", display: "flex",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 800, color: D.ink, letterSpacing: "-0.03em" }}>{title}</div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: D.muted, marginTop: 1 }}>{desc}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  );
}

function SaveButton({ pending, label = "Guardar cambios" }: { pending?: boolean; label?: string }) {
  return (
    <div style={{ paddingTop: 4 }}>
      <button type="submit" disabled={pending} style={{ ...saveBtn, opacity: pending ? 0.6 : 1 }}>
        {pending ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>↻</span> Guardando...</> : <><Check size={15} /> {label}</>}
      </button>
      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}
