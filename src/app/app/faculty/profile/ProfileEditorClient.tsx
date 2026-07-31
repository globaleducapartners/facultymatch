"use client";

import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { OrcidImportModal } from "./OrcidImportModal";
import { saveOrcidImport } from "./actions";

function useIsMobile() {
  const [mob, setMob] = useState(false);
  useEffect(() => {
    const check = () => setMob(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mob;
}
import {
  Globe, MapPin, Briefcase, GraduationCap, FileText,
  Bell, BookOpen, Languages,
  Eye, CheckCircle2, Clock, Building2, ChevronRight,
  Pencil, Check, X, ExternalLink, Award, Download, Lock,
  AlertCircle,
} from "lucide-react";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { BannerUpload } from "@/components/profile/BannerUpload";
import { LanguageEditor } from "@/components/profile/LanguageEditor";
import { DegreeEditor } from "@/components/profile/DegreeEditor";
import { InstitutionsTaughtEditor } from "@/components/profile/InstitutionsTaughtEditor";
import { CVUpload } from "@/components/profile/CVUpload";
import { InstitutionSelector } from "@/components/profile/InstitutionSelector";
import { getDocumentUrl } from "@/lib/utils";

// ─── Design tokens ─────────────────────────────────────────────────────────────
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

const lbl: React.CSSProperties = {
  fontFamily: SANS, fontSize: 11, fontWeight: 700,
  letterSpacing: "0.1em", textTransform: "uppercase" as const,
  color: D.faint, display: "block", marginBottom: 6,
};

const AVAIL_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  open:          { label: "Disponible ahora",     color: D.green,   bg: D.greenBg },
  next_semester: { label: "Próximo semestre",      color: "#0891B2", bg: "#EFF9FF" },
  occasional:    { label: "Asignaturas puntuales", color: "#7C3AED", bg: "#F5F3FF" },
  weekends:      { label: "Fines de semana",       color: "#D97706", bg: "#FFFBEB" },
  online_only:   { label: "Solo online",           color: D.blue,    bg: "#EFF6FF" },
  limited:       { label: "En 6 meses",            color: D.muted,   bg: "#F3F4F6" },
  invite_only:   { label: "Por invitación",        color: D.navy,    bg: "#EEF4FF" },
};

// ─── Completeness ──────────────────────────────────────────────────────────────
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
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
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
  error?: boolean;
  tab?: string;
  saveBasicInfo: (fd: FormData) => Promise<void>;
  saveExperience: (fd: FormData) => Promise<void>;
  saveFormacion: (fd: FormData) => Promise<void>;
  saveLanguages: (fd: FormData) => Promise<void>;
  saveResearch: (fd: FormData) => Promise<void>;
  saveLinks: (fd: FormData) => Promise<void>;
  updateContactPreferences: (fd: FormData) => Promise<void>;
}

// ─── Section card ──────────────────────────────────────────────────────────────
function SectionCard({
  icon, title, isEditing, onToggleEdit, children, form,
}: {
  icon: React.ReactNode;
  title: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  children: React.ReactNode;
  form: React.ReactNode;
}) {
  return (
    <div style={{
      background: D.white, border: `1px solid ${D.border}`,
      borderRadius: 16, overflow: "hidden", marginBottom: 12,
    }}>
      <div style={{
        display: "flex", alignItems: "center", padding: "18px 22px",
        borderBottom: isEditing ? `1px solid ${D.border}` : "none",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: isEditing ? "#EFF6FF" : D.surf,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginRight: 12,
        }}>
          {icon}
        </div>
        <span style={{
          fontFamily: SANS, fontSize: 16, fontWeight: 800, color: D.ink,
          letterSpacing: "-0.02em", flex: 1,
        }}>{title}</span>
        <button
          onClick={onToggleEdit}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 20,
            border: `1px solid ${isEditing ? D.blue : D.border}`,
            background: isEditing ? "#EFF6FF" : D.white,
            color: isEditing ? D.blue : D.muted,
            fontFamily: SANS, fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}
        >
          {isEditing ? <X size={13} /> : <Pencil size={13} />}
          {isEditing ? "Cancelar" : "Editar"}
        </button>
      </div>
      {isEditing
        ? <div style={{ padding: "22px 24px" }}>{form}</div>
        : <div style={{ padding: "4px 22px 20px" }}>{children}</div>
      }
    </div>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p style={{ fontFamily: SANS, fontSize: 13, color: D.faint, fontStyle: "italic", margin: "12px 0 0" }}>
      {text}
    </p>
  );
}

function SaveButton({ label = "Guardar cambios" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} style={{
      fontFamily: SANS, background: D.blue, color: "#fff",
      border: "none", padding: "11px 28px", borderRadius: 10,
      fontSize: 14, fontWeight: 700, cursor: "pointer",
      display: "inline-flex", alignItems: "center", gap: 8,
      opacity: pending ? 0.6 : 1, transition: "opacity 0.2s",
    }}>
      {pending
        ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>↻</span> Guardando…</>
        : <><Check size={15} /> {label}</>
      }
      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </button>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function ProfileEditorClient({
  user, userMeta, profile, facultyProfile, documents, viewCount, saved, error, tab,
  saveBasicInfo, saveExperience, saveFormacion, saveLanguages,
  saveResearch, saveLinks, updateContactPreferences,
}: Props) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [bannerPickerOpen, setBannerPickerOpen] = useState(false);
  const [orcidImportOpen, setOrcidImportOpen] = useState(false);
  const isMob = useIsMobile();

  // Auto-open section based on tab query param
  useEffect(() => {
    if (tab) setEditingSection(tab);
  }, [tab]);

  const avatarUrl = profile?.avatar_url || facultyProfile?.avatar_url;
  const bannerUrl = (facultyProfile as any)?.banner_url || null;
  const completeness = calcCompleteness(facultyProfile, profile, userMeta);

  const fullName    = profile?.full_name || userMeta?.full_name || "";
  const headline    = facultyProfile?.headline || "";
  const city        = facultyProfile?.city || userMeta?.city || "";
  const country     = facultyProfile?.country || userMeta?.country || "";
  const availability = facultyProfile?.availability || "open";
  const avail       = AVAIL_LABELS[availability] || AVAIL_LABELS.open;
  const locationStr = [city, country].filter(Boolean).join(", ");
  const initials    = fullName.split(" ").slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? "").join("");

  const toggle = (id: string) => setEditingSection(prev => prev === id ? null : id);
  const isEditing = (id: string) => editingSection === id;

  return (
    <div style={{ fontFamily: SANS }}>

      {/* Saved banner */}
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

      {/* Error banner */}
      {error && (
        <div style={{
          background: D.redBg, border: "1px solid #FECACA",
          borderRadius: 12, padding: "12px 20px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 10,
          fontFamily: SANS, fontSize: 14, fontWeight: 700, color: "#991B1B",
        }}>
          <AlertCircle size={16} color={D.red} /> No se pudo guardar. Inténtalo de nuevo.
        </div>
      )}

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "minmax(0,1fr) 290px", gap: 20, alignItems: "start" }}>

        {/* ── LEFT column ── */}
        <div>

          {/* ── Profile Header Card ── */}
          <div style={{
            background: D.white, border: `1px solid ${D.border}`,
            borderRadius: 16, overflow: "hidden", marginBottom: 12,
          }}>
            {/* Cover banner */}
            <div style={{
              height: 168,
              background: bannerUrl
                ? "transparent"
                : `linear-gradient(135deg, ${D.navy} 0%, ${D.blue} 55%, #4F7FE8 100%)`,
              position: "relative",
              overflow: "hidden",
            }}>
              {bannerUrl && (
                <img
                  src={bannerUrl}
                  alt=""
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                />
              )}
              <div style={{ position: "absolute", zIndex: 2, display: "flex", gap: 8, top: 14, right: 14 }}>
                <button
                  onClick={() => setBannerPickerOpen(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "rgba(0,0,0,0.38)",
                    border: "1px solid rgba(255,255,255,0.35)",
                    borderRadius: 8, padding: "6px 13px",
                    color: "#fff", fontFamily: SANS, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", backdropFilter: "blur(6px)",
                  }}
                >
                  <Pencil size={12} /> Banner
                </button>
                <button
                  onClick={() => toggle("basic")}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "rgba(0,0,0,0.38)",
                    border: "1px solid rgba(255,255,255,0.35)",
                    borderRadius: 8, padding: "6px 13px",
                    color: "#fff", fontFamily: SANS, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", backdropFilter: "blur(6px)",
                  }}
                >
                  <Pencil size={12} /> Editar perfil
                </button>
              </div>
            </div>


            {/* Avatar + identity */}
            <div style={{ padding: "0 24px 24px" }}>
              {/* Avatar */}
              <div style={{ marginTop: -60, marginBottom: 14, position: "relative", zIndex: 2 }}>
                <div style={{
                  width: 120, height: 120, borderRadius: "50%",
                  background: avatarUrl ? "transparent" : D.navy,
                  border: `4px solid ${D.white}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(7,19,38,0.18)",
                }}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ color: "#fff", fontSize: 34, fontWeight: 800 }}>{initials || "?"}</span>
                  }
                </div>
              </div>

              {/* Name + PhD */}
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" as const, gap: 8, marginBottom: 6 }}>
                <h1 style={{ fontFamily: SANS, fontSize: 23, fontWeight: 900, color: D.ink, letterSpacing: "-0.04em", margin: 0 }}>
                  {fullName || <span style={{ color: D.faint, fontWeight: 400 }}>Tu nombre completo</span>}
                </h1>
                {facultyProfile?.is_phd && (
                  <span style={{
                    fontFamily: SANS, fontSize: 11, fontWeight: 700,
                    color: "#7C3AED", background: "#F5F3FF",
                    border: "1px solid #DDD6FE", padding: "2px 8px", borderRadius: 999,
                  }}>PhD</span>
                )}
              </div>

              {/* Headline */}
              {headline
                ? <p style={{ fontFamily: SANS, fontSize: 15, color: D.ink, margin: "0 0 12px", lineHeight: 1.5 }}>{headline}</p>
                : <p style={{ fontFamily: SANS, fontSize: 15, color: D.faint, fontStyle: "italic", margin: "0 0 12px" }}>Añade tu titular académico…</p>
              }

              {/* Meta row */}
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 14, marginBottom: 14 }}>
                {facultyProfile?.current_institution && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Building2 size={14} color={D.muted} />
                    <span style={{ fontFamily: SANS, fontSize: 13, color: D.ink, fontWeight: 600 }}>
                      {facultyProfile.current_institution}
                    </span>
                  </div>
                )}
                {locationStr && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <MapPin size={14} color={D.muted} />
                    <span style={{ fontFamily: SANS, fontSize: 13, color: D.muted }}>{locationStr}</span>
                  </div>
                )}
                {facultyProfile?.years_experience > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Briefcase size={14} color={D.muted} />
                    <span style={{ fontFamily: SANS, fontSize: 13, color: D.muted }}>
                      {facultyProfile.years_experience} años de experiencia
                    </span>
                  </div>
                )}
              </div>

              {/* Views + availability */}
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" as const, gap: 12, marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Eye size={14} color={D.blue} />
                  <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: D.blue }}>
                    {viewCount.toLocaleString()} visualizaciones
                  </span>
                </div>
                <span style={{
                  fontFamily: SANS, fontSize: 12, fontWeight: 700,
                  color: avail.color, background: avail.bg,
                  padding: "3px 10px", borderRadius: 999,
                }}>
                  {avail.label}
                </span>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
                <button
                  onClick={() => toggle("basic")}
                  style={{
                    fontFamily: SANS, fontSize: 13, fontWeight: 700,
                    padding: "8px 18px", borderRadius: 20,
                    background: D.blue, color: D.white, border: "none",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <Pencil size={13} /> Editar perfil
                </button>
                <a
                  href="/app/faculty/profile/print"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: SANS, fontSize: 13, fontWeight: 700,
                    padding: "8px 18px", borderRadius: 20,
                    background: D.white, color: D.ink, border: `1.5px solid ${D.border}`,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                    textDecoration: "none",
                  }}
                >
                  <FileText size={13} /> CV / Imprimir
                </a>
                {facultyProfile?.linkedin_url && (
                  <a
                    href={facultyProfile.linkedin_url}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      fontFamily: SANS, fontSize: 13, fontWeight: 700,
                      padding: "8px 18px", borderRadius: 20,
                      background: D.white, color: D.ink, border: `1.5px solid ${D.border}`,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                      textDecoration: "none",
                    }}
                  >
                    <ExternalLink size={13} /> LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Inline basic-info edit form */}
            {isEditing("basic") && (
              <div style={{ borderTop: `1px solid ${D.border}`, padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: D.ink }}>Información básica</span>
                  <button onClick={() => setEditingSection(null)} style={{ background: "none", border: "none", cursor: "pointer", color: D.faint }}>
                    <X size={18} />
                  </button>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={lbl}>Foto de perfil</label>
                  <AvatarUpload userId={user.id} currentAvatarUrl={avatarUrl} name={fullName} />
                </div>
                <form action={saveBasicInfo} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 16 }}>
                    <Field label="Nombre completo">
                      <input name="fullName" style={inp} required
                        defaultValue={profile?.full_name || userMeta?.full_name} />
                    </Field>
                    <Field label="Titular académico">
                      <input name="headline" style={inp} placeholder="Dr. | Economía | MBA"
                        defaultValue={facultyProfile?.headline} />
                    </Field>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 16 }}>
                    <Field label="País">
                      <input name="country" style={inp} placeholder="España"
                        defaultValue={facultyProfile?.country || userMeta?.country} />
                    </Field>
                    <Field label="Ciudad">
                      <input name="city" style={inp} placeholder="Madrid"
                        defaultValue={facultyProfile?.city || userMeta?.city} />
                    </Field>
                  </div>
                  <Field label="Sobre mí">
                    <textarea name="bio" rows={5} style={{ ...inp, resize: "vertical" as const }}
                      placeholder="Describe tu trayectoria, especialidad y valor como docente…"
                      defaultValue={facultyProfile?.bio} />
                  </Field>
                  <div style={{ display: "flex", gap: 8 }}>
                    <SaveButton />
                    <button type="button" onClick={() => setEditingSection(null)} style={{
                      fontFamily: SANS, fontSize: 14, fontWeight: 600, padding: "11px 20px",
                      borderRadius: 10, border: `1px solid ${D.border}`, background: D.white,
                      color: D.muted, cursor: "pointer",
                    }}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* ── Sobre mí (standalone, only when bio exists and not editing basic) ── */}
          {!isEditing("basic") && facultyProfile?.bio && (
            <div style={{
              background: D.white, border: `1px solid ${D.border}`,
              borderRadius: 16, padding: "18px 22px", marginBottom: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 800, color: D.ink }}>Sobre mí</span>
                <button onClick={() => toggle("basic")} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 20,
                  border: `1px solid ${D.border}`, background: D.white,
                  color: D.muted, fontFamily: SANS, fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>
                  <Pencil size={12} /> Editar
                </button>
              </div>
              <p style={{ fontFamily: SANS, fontSize: 14, color: D.ink, lineHeight: 1.75, margin: 0 }}>
                {facultyProfile.bio}
              </p>
            </div>
          )}

          {/* ── EXPERIENCIA ── */}
          <SectionCard
            icon={<Briefcase size={16} color={D.blue} />}
            title="Experiencia"
            isEditing={isEditing("experience")}
            onToggleEdit={() => toggle("experience")}
            children={
              <div>
                {facultyProfile?.current_institution ? (
                  <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 8, background: D.surf,
                      border: `1px solid ${D.border}`, display: "flex", alignItems: "center",
                      justifyContent: "center", flexShrink: 0,
                    }}>
                      <Building2 size={22} color={D.navy} />
                    </div>
                    <div>
                      <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: D.ink }}>
                        {facultyProfile.current_institution}
                      </div>
                      {facultyProfile?.academic_level && (
                        <div style={{ fontFamily: SANS, fontSize: 13, color: D.muted, marginTop: 2 }}>
                          {facultyProfile.academic_level}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" as const }}>
                        {facultyProfile?.years_experience > 0 && (
                          <span style={{
                            fontFamily: SANS, fontSize: 11, color: D.muted,
                            background: D.surf, border: `1px solid ${D.border}`,
                            padding: "2px 8px", borderRadius: 999,
                          }}>{facultyProfile.years_experience} años</span>
                        )}
                        <span style={{
                          fontFamily: SANS, fontSize: 11, fontWeight: 700,
                          color: avail.color, background: avail.bg,
                          padding: "2px 8px", borderRadius: 999,
                        }}>{avail.label}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState text="Añade tu institución actual y experiencia docente" />
                )}
                {((facultyProfile?.institutions_taught as string[] | null)?.length ?? 0) > 0 && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${D.border}` }}>
                    <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: D.muted, marginBottom: 8 }}>
                      También ha impartido en:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                      {((facultyProfile?.institutions_taught || []) as string[]).map((inst: string, i: number) => (
                        <span key={i} style={{
                          fontFamily: SANS, fontSize: 12, color: D.ink,
                          background: D.surf, border: `1px solid ${D.border}`,
                          padding: "3px 10px", borderRadius: 999,
                        }}>{inst}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            }
            form={
              <form action={saveExperience} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 16 }}>
                  <Field label="Institución actual">
                    <InstitutionSelector name="currentInstitution"
                      initialValue={facultyProfile?.current_institution || ""}
                      placeholder="Buscar institución…" />
                  </Field>
                  <Field label="Años de experiencia">
                    <input name="yearsExperience" type="number" min={0} style={inp}
                      defaultValue={facultyProfile?.years_experience ?? ""} />
                  </Field>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 16 }}>
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
                    <select name="availability" style={{ ...inp, appearance: "none" as const }}
                      defaultValue={facultyProfile?.availability || "open"}>
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
                <label style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", borderRadius: 12,
                  border: `1px solid ${D.border}`, cursor: "pointer", background: D.surf,
                }}>
                  <input type="checkbox" name="isPhd"
                    style={{ width: 18, height: 18, accentColor: D.blue, flexShrink: 0, cursor: "pointer" }}
                    defaultChecked={facultyProfile?.is_phd ?? false} />
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: D.ink }}>Soy Doctor/a (PhD)</div>
                    <div style={{ fontFamily: SANS, fontSize: 12, color: D.muted, marginTop: 2 }}>
                      Aparecerá el badge PhD en tu perfil y en el directorio
                    </div>
                  </div>
                </label>
                <Field label="Instituciones donde has impartido docencia">
                  <InstitutionsTaughtEditor
                    initialInstitutions={(facultyProfile?.institutions_taught as string[] | null) || []} />
                </Field>
                <SaveButton />
              </form>
            }
          />

          {/* ── FORMACIÓN ── */}
          <SectionCard
            icon={<GraduationCap size={16} color={D.blue} />}
            title="Formación académica"
            isEditing={isEditing("formacion")}
            onToggleEdit={() => toggle("formacion")}
            children={
              <div>
                {((facultyProfile?.degrees as any[] | null)?.length ?? 0) > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
                    {((facultyProfile?.degrees || []) as any[]).map((deg: any, i: number) => (
                      <div key={i} style={{ display: "flex", gap: 14 }}>
                        <div style={{
                          width: 46, height: 46, borderRadius: 8, background: "#F5F3FF",
                          border: "1px solid #DDD6FE", display: "flex", alignItems: "center",
                          justifyContent: "center", flexShrink: 0,
                        }}>
                          <GraduationCap size={22} color="#7C3AED" />
                        </div>
                        <div>
                          <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: D.ink }}>
                            {deg.type || deg.title || deg.degree || "Titulación"}
                          </div>
                          {deg.field && (
                            <div style={{ fontFamily: SANS, fontSize: 13, color: D.blue, fontWeight: 600, marginTop: 1 }}>
                              {deg.field}
                            </div>
                          )}
                          <div style={{ fontFamily: SANS, fontSize: 13, color: D.muted, marginTop: 1 }}>
                            {deg.university || deg.institution || deg.school || ""}
                          </div>
                          {deg.year && (
                            <div style={{ fontFamily: SANS, fontSize: 12, color: D.faint, marginTop: 2 }}>{deg.year}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState text="Añade tu formación académica y titulaciones" />
                )}
              </div>
            }
            form={
              <form action={saveFormacion} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <DegreeEditor initialDegrees={(facultyProfile?.degrees as any[] | null) || []} />
                <SaveButton label="Guardar formación" />
              </form>
            }
          />

          {/* ── IDIOMAS ── */}
          <SectionCard
            icon={<Languages size={16} color={D.blue} />}
            title="Idiomas"
            isEditing={isEditing("idiomas")}
            onToggleEdit={() => toggle("idiomas")}
            children={
              <div>
                {((facultyProfile?.languages as any[] | null)?.length ?? 0) > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginTop: 12 }}>
                    {((facultyProfile?.languages || []) as any[]).map((l: any, i: number) => (
                      <span key={i} style={{
                        fontFamily: SANS, fontSize: 13, color: D.ink, fontWeight: 600,
                        background: D.surf, border: `1px solid ${D.border}`,
                        padding: "5px 12px", borderRadius: 999,
                      }}>
                        {typeof l === "string" ? l : `${l.lang || l.language || l.name}${l.level ? ` · ${l.level}` : ""}`}
                      </span>
                    ))}
                  </div>
                ) : (
                  <EmptyState text="Indica los idiomas en que puedes impartir docencia" />
                )}
              </div>
            }
            form={
              <form action={saveLanguages} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <LanguageEditor initialLanguages={(facultyProfile?.languages as any[] | null) || []} />
                <SaveButton label="Guardar idiomas" />
              </form>
            }
          />

          {/* ── INVESTIGACIÓN ── */}
          <SectionCard
            icon={<BookOpen size={16} color={D.blue} />}
            title="Perfil investigador"
            isEditing={isEditing("research")}
            onToggleEdit={() => toggle("research")}
            children={
              <div>
                {facultyProfile?.aneca_accreditation || facultyProfile?.google_scholar_id || facultyProfile?.orcid_id || facultyProfile?.research_publications ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                    {facultyProfile?.aneca_accreditation && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Award size={15} color={D.gold} />
                        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: D.ink }}>
                          {facultyProfile.aneca_accreditation}
                        </span>
                      </div>
                    )}
                    {facultyProfile?.google_scholar_id && (
                      <div style={{ fontFamily: SANS, fontSize: 13, color: D.muted }}>
                        Google Scholar: <span style={{ color: D.blue, fontWeight: 600 }}>{facultyProfile.google_scholar_id}</span>
                      </div>
                    )}
                    {facultyProfile?.orcid_id && (
                      <div style={{ fontFamily: SANS, fontSize: 13, color: D.muted }}>
                        ORCID: <span style={{ color: D.blue, fontWeight: 600 }}>{facultyProfile.orcid_id}</span>
                      </div>
                    )}
                    {facultyProfile?.research_publications && (
                      <p style={{ fontFamily: SANS, fontSize: 13, color: D.muted, lineHeight: 1.65, margin: 0 }}>
                        {facultyProfile.research_publications}
                      </p>
                    )}
                  </div>
                ) : (
                  <EmptyState text="Añade tus acreditaciones, publicaciones e IDs académicos" />
                )}
              </div>
            }
            form={
              <form action={saveResearch} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={{ ...lbl, marginBottom: 10 }}>Acreditaciones</label>
                  <label style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12,
                    border: `1px solid ${D.border}`, cursor: "pointer", background: D.surf, marginBottom: 10,
                  }}>
                    <input type="checkbox" name="hasAneca"
                      style={{ width: 18, height: 18, accentColor: D.blue, flexShrink: 0 }}
                      defaultChecked={!!(facultyProfile?.aneca_accreditation?.includes("ANECA"))} />
                    <div>
                      <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: D.ink }}>
                        Acreditación ANECA — Titular de Universidad
                      </div>
                      <div style={{ fontFamily: SANS, fontSize: 12, color: D.muted, marginTop: 2 }}>
                        Para Titular de Universidad o Catedrático
                      </div>
                    </div>
                  </label>
                  <Field label="Otra acreditación (AQU, ANECA Ayudante Doctor...)">
                    <input name="otherAccreditation" style={inp}
                      placeholder="Ej: Acreditación AQU, ANECA Ayudante Doctor…"
                      defaultValue={
                        facultyProfile?.aneca_accreditation
                          ?.replace("Titular de Universidad (ANECA)", "").replace(" · ", "").trim() || ""
                      } />
                  </Field>
                </div>
                <Field label="Publicaciones relevantes">
                  <textarea name="researchPublications" rows={4}
                    style={{ ...inp, resize: "vertical" as const }}
                    placeholder="Lista tus publicaciones principales…"
                    defaultValue={facultyProfile?.research_publications} />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 16 }}>
                  <Field label="Google Scholar ID">
                    <input name="googleScholarId" style={inp} placeholder="XXXXXXX"
                      defaultValue={facultyProfile?.google_scholar_id} />
                  </Field>
                  <Field label="ORCID iD">
                    <input name="orcidId" style={inp} placeholder="0000-0000-0000-0000"
                      defaultValue={facultyProfile?.orcid_id} />
                  </Field>
                </div>
                <button
                  type="button"
                  onClick={() => setOrcidImportOpen(true)}
                  style={{
                    fontFamily: SANS, background: "#EFF6FF", color: D.blue,
                    border: `1px solid ${D.blue}`, padding: "10px 20px", borderRadius: 10,
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    width: "100%",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  Importar mi trayectoria desde ORCID
                </button>
                <SaveButton />
              </form>
            }
          />

          {/* ── DOCUMENTOS ── */}
          <SectionCard
            icon={<FileText size={16} color={D.blue} />}
            title="Curriculum Vitae"
            isEditing={isEditing("documents")}
            onToggleEdit={() => toggle("documents")}
            children={
              <div>
                {documents.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                    {documents.map((doc: any) => (
                      <div key={doc.id} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 14px", borderRadius: 10,
                        background: D.surf, border: `1px solid ${D.border}`,
                      }}>
                        <FileText size={16} color={D.blue} />
                        <span style={{ fontFamily: SANS, fontSize: 13, color: D.ink, flex: 1 }}>
                          {doc.name || doc.file_name || "CV.pdf"}
                        </span>
                        <a href={getDocumentUrl(doc.file_path)} target="_blank" rel="noopener noreferrer"
                          style={{ color: D.blue, display: "flex", alignItems: "center" }}>
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState text="Sube tu CV actualizado en formato PDF" />
                )}
              </div>
            }
            form={<CVUpload facultyId={user.id} existingDocs={documents} />}
          />

          {/* ── PRESENCIA DIGITAL ── */}
          <SectionCard
            icon={<Globe size={16} color={D.blue} />}
            title="Presencia digital"
            isEditing={isEditing("links")}
            onToggleEdit={() => toggle("links")}
            children={
              <div>
                {facultyProfile?.linkedin_url || facultyProfile?.website || facultyProfile?.phone ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                    {facultyProfile?.linkedin_url && (
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 6, background: "#0A66C2",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <ExternalLink size={14} color="#fff" />
                        </div>
                        <a href={facultyProfile.linkedin_url} target="_blank" rel="noopener noreferrer"
                          style={{ fontFamily: SANS, fontSize: 13, color: D.blue, textDecoration: "none", fontWeight: 600 }}>
                          LinkedIn
                        </a>
                      </div>
                    )}
                    {facultyProfile?.website && (
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 6, background: D.surf,
                          border: `1px solid ${D.border}`, display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Globe size={14} color={D.navy} />
                        </div>
                        <a href={facultyProfile.website} target="_blank" rel="noopener noreferrer"
                          style={{ fontFamily: SANS, fontSize: 13, color: D.blue, textDecoration: "none" }}>
                          {facultyProfile.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                    {facultyProfile?.phone && (
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 6, background: D.surf,
                          border: `1px solid ${D.border}`, display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Bell size={14} color={D.navy} />
                        </div>
                        <span style={{ fontFamily: SANS, fontSize: 13, color: D.muted }}>{facultyProfile.phone}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState text="Añade tu LinkedIn, web personal o teléfono" />
                )}
              </div>
            }
            form={
              <form action={saveLinks} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 16 }}>
                  <Field label="LinkedIn URL">
                    <input name="linkedinUrl" style={inp} placeholder="https://linkedin.com/in/…"
                      defaultValue={facultyProfile?.linkedin_url} />
                  </Field>
                  <Field label="Web personal">
                    <input name="website" style={inp} placeholder="https://…"
                      defaultValue={facultyProfile?.website} />
                  </Field>
                </div>
                <Field label="Teléfono">
                  <input name="phone" style={inp} placeholder="+34 600 000 000"
                    defaultValue={facultyProfile?.phone} />
                </Field>
                <SaveButton />
              </form>
            }
          />

          {/* ── CONTACTO ── */}
          <SectionCard
            icon={<Bell size={16} color={D.blue} />}
            title="Preferencias de contacto"
            isEditing={isEditing("preferences")}
            onToggleEdit={() => toggle("preferences")}
            children={
              <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 10, marginTop: 12 }}>
                <div style={{ padding: "12px 14px", background: D.surf, borderRadius: 10, border: `1px solid ${D.border}` }}>
                  <div style={{ fontFamily: SANS, fontSize: 11, color: D.faint, marginBottom: 4 }}>Método preferido</div>
                  <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: D.ink, textTransform: "capitalize" as const }}>
                    {facultyProfile?.preferred_contact_method || "Email"}
                  </div>
                </div>
                <div style={{ padding: "12px 14px", background: D.surf, borderRadius: 10, border: `1px solid ${D.border}` }}>
                  <div style={{ fontFamily: SANS, fontSize: 11, color: D.faint, marginBottom: 4 }}>Email de contacto</div>
                  <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: D.ink, overflow: "hidden", textOverflow: "ellipsis" as const, whiteSpace: "nowrap" as const }}>
                    {facultyProfile?.contact_email || user.email || "—"}
                  </div>
                </div>
              </div>
            }
            form={
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
                <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 16 }}>
                  <Field label="Email de contacto">
                    <input name="contactEmail" type="email" style={inp}
                      placeholder="tu@email.com"
                      defaultValue={facultyProfile?.contact_email || user.email || ""} />
                  </Field>
                  <Field label="WhatsApp">
                    <input name="contactWhatsapp" style={inp} placeholder="+34 600 000 000"
                      defaultValue={facultyProfile?.contact_whatsapp} />
                  </Field>
                </div>
                <Field label="LinkedIn para contacto">
                  <input name="contactLinkedin" style={inp}
                    placeholder="https://linkedin.com/in/…"
                    defaultValue={facultyProfile?.contact_linkedin || facultyProfile?.linkedin_url} />
                </Field>
                <div>
                  <label style={{ ...lbl, marginBottom: 10 }}>Notificaciones</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { name: "notifyNewOffers",    label: "Nuevas oportunidades de instituciones", checked: facultyProfile?.notify_new_offers ?? true },
                      { name: "notifyMessages",     label: "Mensajes directos",                     checked: facultyProfile?.notify_messages ?? true },
                      { name: "notifyWeeklyDigest", label: "Resumen semanal de actividad",           checked: facultyProfile?.notify_weekly_digest ?? false },
                    ].map(({ name, label, checked }) => (
                      <label key={name} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 16px", borderRadius: 10,
                        border: `1px solid ${D.border}`, cursor: "pointer", background: D.surf,
                      }}>
                        <span style={{ fontFamily: SANS, fontSize: 13, color: D.ink }}>{label}</span>
                        <input type="checkbox" name={name} defaultChecked={checked}
                          style={{ width: 16, height: 16, accentColor: D.blue, cursor: "pointer" }} />
                      </label>
                    ))}
                  </div>
                </div>
                <SaveButton label="Guardar preferencias" />
              </form>
            }
          />

        </div>

        {/* ── RIGHT sidebar ── */}
        <div style={{ position: "sticky", top: 24 }}>

          {/* Completeness card */}
          <div style={{
            background: D.white, border: `1px solid ${D.border}`,
            borderRadius: 16, padding: "20px", marginBottom: 12,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: D.ink, letterSpacing: "-0.02em", marginBottom: 14 }}>
              Progreso del perfil
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: SANS, fontSize: 12, color: D.muted }}>
                {completeness < 60 ? "Empieza a completar tu perfil" : completeness < 80 ? "Casi completo" : "Perfil completo"}
              </span>
              <span style={{ fontFamily: SANS, fontSize: 22, fontWeight: 900, color: completeness >= 80 ? D.green : D.blue, letterSpacing: "-0.04em" }}>
                {completeness}%
              </span>
            </div>
            <div style={{ height: 8, background: D.surf, borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${completeness}%`,
                background: completeness >= 80 ? D.green : D.blue,
                borderRadius: 999, transition: "width 0.5s ease",
              }} />
            </div>
          </div>

          {/* Visibility card */}
          <div style={{
            background: D.white, border: `1px solid ${D.border}`,
            borderRadius: 16, padding: "20px", marginBottom: 12,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: D.ink, letterSpacing: "-0.02em", marginBottom: 14 }}>
              Visibilidad
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: avail.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Clock size={16} color={avail.color} />
              </div>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: avail.color }}>{avail.label}</div>
                <div style={{ fontFamily: SANS, fontSize: 11, color: D.faint, marginTop: 2 }}>Estado actual</div>
              </div>
            </div>
            <div style={{ paddingTop: 14, borderTop: `1px solid ${D.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Eye size={14} color={D.blue} />
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: D.blue }}>
                  {viewCount.toLocaleString()} visualizaciones
                </span>
              </div>
            </div>
          </div>

          {/* Certificado de perfil verificado — solo si estado_perfil === 'verificado' */}
          {facultyProfile?.estado_perfil === "verificado" ? (
            <a
              href="/api/perfil-pdf"
              download
              style={{
                display: "block", background: D.white,
                border: `1px solid ${D.border}`, borderRadius: 16,
                padding: "20px", marginBottom: 12,
                textDecoration: "none", cursor: "pointer",
              }}
              onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.borderColor = D.blue; }}
              onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.borderColor = D.border; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: "#EFF6FF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Download size={16} color={D.blue} />
                </div>
                <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: D.ink, letterSpacing: "-0.02em" }}>
                  Certificado de perfil verificado
                </span>
              </div>
              <p style={{ fontFamily: SANS, fontSize: 12, color: D.muted, lineHeight: 1.5, margin: 0 }}>
                Descarga tu certificado oficial de FacultyMatch, que acredita que tu perfil ha sido revisado y verificado por nuestro equipo.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 12 }}>
                <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: D.blue }}>
                  Descargar certificado
                </span>
                <ChevronRight size={13} color={D.blue} />
              </div>
            </a>
          ) : (
            <div style={{
              display: "block", background: D.surf,
              border: `1px dashed ${D.border}`, borderRadius: 16,
              padding: "20px", marginBottom: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: D.white,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Lock size={16} color={D.faint} />
                </div>
                <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: D.faint, letterSpacing: "-0.02em" }}>
                  Certificado de perfil verificado
                </span>
              </div>
              <p style={{ fontFamily: SANS, fontSize: 12, color: D.muted, lineHeight: 1.5, margin: 0 }}>
                Cuando tu perfil esté verificado, podrás descargar aquí tu certificado oficial.
              </p>
            </div>
          )}

          {/* Tips card */}
          {completeness < 80 && (() => {
            const tips = [
              !facultyProfile?.headline          && { label: "Añade un titular profesional",  section: "basic"      },
              !facultyProfile?.bio               && { label: "Escribe tu biografía",            section: "basic"      },
              !facultyProfile?.current_institution && { label: "Indica tu institución actual", section: "experience" },
              !(facultyProfile?.languages?.length) && { label: "Añade los idiomas que hablas", section: "idiomas"    },
              !(facultyProfile?.degrees?.length)   && { label: "Añade tu formación académica", section: "formacion"  },
            ].filter(Boolean).slice(0, 4) as { label: string; section: string }[];

            if (!tips.length) return null;
            return (
              <div style={{
                background: D.white, border: `1px solid ${D.border}`,
                borderRadius: 16, padding: "20px",
              }}>
                <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: D.navy, marginBottom: 14 }}>
                  Mejora tu visibilidad
                </div>
                {tips.map((tip, i) => (
                  <button key={i} onClick={() => setEditingSection(tip.section)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, width: "100%",
                      fontFamily: SANS, fontSize: 13, color: D.ink, textAlign: "left" as const,
                      background: "none", border: "none", cursor: "pointer",
                      padding: "9px 0",
                      borderBottom: i < tips.length - 1 ? `1px solid ${D.border}` : "none",
                    }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: D.gold, flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{tip.label}</span>
                    <ChevronRight size={13} color={D.faint} />
                  </button>
                ))}
              </div>
            );
          })()}

        </div>
      </div>

      {/* Banner picker — modal flotante */}
      {bannerPickerOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setBannerPickerOpen(false);
          }}
        >
          <div style={{ width: "100%", maxWidth: 480 }}>
            <BannerUpload
              userId={user.id}
              currentBannerUrl={bannerUrl}
              onClose={() => setBannerPickerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ORCID Import Modal */}
      {orcidImportOpen && (
        <OrcidImportModal
          user={{ id: user.id }}
          facultyProfile={facultyProfile}
          onClose={() => setOrcidImportOpen(false)}
          onSave={saveOrcidImport}
        />
      )}
    </div>
  );
}
