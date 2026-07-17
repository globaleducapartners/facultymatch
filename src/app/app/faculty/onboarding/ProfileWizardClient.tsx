"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, ArrowRight, Save, CheckCircle2, X } from "lucide-react";
import { Step1BasicInfo } from "./steps/Step1BasicInfo";
import { Step2CareerType } from "./steps/Step2CareerType";
import { Step3Specialty } from "./steps/Step3Specialty";
import { Step4Modality } from "./steps/Step4Modality";
import { Step5Review } from "./steps/Step5Review";
import { saveWizardStep, publishProfile } from "./actions";

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
};

const STEP_LABELS = [
  "Información básica",
  "Trayectoria profesional",
  "Especialidad y acreditación",
  "Disponibilidad e idiomas",
  "Revisión final",
];

interface WizardData {
  // Step 1
  fullName: string;
  headline: string;
  country: string;
  city: string;
  bio: string;
  // Step 2
  careerType: "academica" | "profesional" | "combinado" | null;
  // Professional fields
  currentPosition: string;
  currentCompany: string;
  industrySector: string;
  yearsExperience: number;
  careerDescription: string;
  // Step 3
  unescoArea: string;
  unescoSubarea: string;
  unescoTopics: string;
  hasAneca: boolean;
  otherAccreditation: string;
  isPhd: boolean;
  researchPublications: string;
  googleScholarId: string;
  orcidId: string;
  // Step 4
  languages: any[];
  availability: string;
  academicLevel: string;
  modalities: string[];
  institutionsTaught: string[];
  currentInstitution: string;
}

interface Props {
  user: { id: string; email?: string | null };
  userMeta: Record<string, any>;
  profile: any;
  facultyProfile: any;
}

export function ProfileWizardClient({ user, userMeta, profile, facultyProfile }: Props) {
  // Safeguard: if onboarding hasn't started yet, force step 0
  // This prevents a stale onboarding_step from jumping ahead
  const initialStep =
    facultyProfile?.onboarding_status === "not_started"
      ? 0
      : (facultyProfile?.onboarding_step ?? 0);
  const initialCareerType = facultyProfile?.career_type ?? null;

  const [step, setStep] = useState(initialStep);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [data, setData] = useState<WizardData>({
    fullName: profile?.full_name || userMeta?.full_name || "",
    headline: facultyProfile?.headline || "",
    country: facultyProfile?.country || userMeta?.country || "",
    city: facultyProfile?.city || userMeta?.city || "",
    bio: facultyProfile?.bio || "",
    careerType: initialCareerType,
    currentPosition: facultyProfile?.current_position || "",
    currentCompany: facultyProfile?.current_company || "",
    industrySector: facultyProfile?.industry_sector || "",
    careerDescription: facultyProfile?.career_description || "",
    yearsExperience: facultyProfile?.years_experience || 0,
    unescoArea: "",
    unescoSubarea: "",
    unescoTopics: "",
    hasAneca: !!(facultyProfile?.aneca_accreditation?.includes("ANECA")),
    otherAccreditation: facultyProfile?.aneca_accreditation?.replace("Titular de Universidad (ANECA)", "").replace(" · ", "").trim() || "",
    isPhd: facultyProfile?.is_phd ?? false,
    researchPublications: facultyProfile?.research_publications || "",
    googleScholarId: facultyProfile?.google_scholar_id || "",
    orcidId: facultyProfile?.orcid_id || "",
    languages: facultyProfile?.languages || [],
    availability: facultyProfile?.availability || "open",
    academicLevel: facultyProfile?.academic_level || "",
    institutionsTaught: facultyProfile?.institutions_taught || [],
    currentInstitution: facultyProfile?.current_institution || "",
    modalities: facultyProfile?.modalities || [],
  });

  const updateData = useCallback((partial: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...partial }));
  }, []);

  const handleSaveAndContinue = useCallback(async () => {
    setSaving(true);
    setSaveError("");
    try {
      const payload: Record<string, any> = { onboarding_step: step + 1 };

      if (data.careerType) payload.career_type = data.careerType;

      if (step === 0) {
        payload.full_name = data.fullName;
        payload.headline = data.headline;
        payload.country = data.country;
        payload.city = data.city;
        payload.bio = data.bio;
      } else if (step === 1) {
        payload.current_position = data.currentPosition;
        payload.current_company = data.currentCompany;
        payload.industry_sector = data.industrySector;
        payload.career_description = data.careerDescription;
        payload.years_experience = data.yearsExperience;
      } else if (step === 2) {
        payload.unesco_area = data.unescoArea;
        payload.unesco_subarea = data.unescoSubarea;
        payload.unesco_topics = data.unescoTopics;
        payload.has_aneca = data.hasAneca;
        payload.other_accreditation = data.otherAccreditation;
        payload.is_phd = data.isPhd;
        payload.research_publications = data.researchPublications;
        payload.google_scholar_id = data.googleScholarId;
        payload.orcid_id = data.orcidId;
      } else if (step === 3) {
        payload.languages = data.languages;
        payload.availability = data.availability;
        payload.academic_level = data.academicLevel;
        payload.institutions_taught = data.institutionsTaught;
        payload.current_institution = data.currentInstitution;
        payload.modalities = data.modalities;
      }

      await saveWizardStep(payload as any);
      setStep(prev => prev + 1);
    } catch (e) {
      console.error("Error saving step:", e);
      const msg = e instanceof Error ? e.message : "Error al guardar. Inténtalo de nuevo.";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }, [step, data]);

  const handleSaveAndExit = useCallback(async () => {
    setSaving(true);
    try {
      // Save current step state
      await saveWizardStep({ onboarding_step: step, career_type: data.careerType } as any);
      window.location.href = "/app/faculty";
    } catch (e) {
      console.error("Error saving:", e);
    } finally {
      setSaving(false);
    }
  }, [step, data.careerType]);

  const handlePublish = useCallback(async () => {
    setPublishing(true);
    try {
      // Save final step state first
      await saveWizardStep({
        onboarding_step: 5,
        career_type: data.careerType,
        languages: data.languages,
        availability: data.availability,
        academic_level: data.academicLevel,
        institutions_taught: data.institutionsTaught,
        current_institution: data.currentInstitution,
        modalities: data.modalities,
      } as any);
      await publishProfile();
      setPublished(true);
    } catch (e) {
      console.error("Error publishing:", e);
    } finally {
      setPublishing(false);
    }
  }, [data]);

  const canProceed = useCallback(() => {
    if (step === 0) {
      return data.fullName.trim().length > 0;
    }
    if (step === 1) {
      return data.careerType !== null;
    }
    if (step === 4) {
      return true; // Review step, always can proceed
    }
    return true;
  }, [step, data]);

  if (published) {
    return (
      <div style={{ fontFamily: SANS, maxWidth: 520, margin: "60px auto", textAlign: "center" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", background: D.greenBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <CheckCircle2 size={36} color={D.green} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: D.ink, margin: "0 0 8px" }}>
          ¡Perfil publicado!
        </h1>
        <p style={{ fontSize: 15, color: D.muted, lineHeight: 1.6, margin: "0 0 32px" }}>
          Tu perfil ya está visible para las instituciones. Puedes seguir editándolo en cualquier momento.
        </p>
        <a
          href="/app/faculty/profile"
          style={{
            fontFamily: SANS, fontSize: 14, fontWeight: 700, color: "#fff",
            background: D.blue, padding: "12px 32px", borderRadius: 12,
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
          }}
        >
          Ir a mi perfil
        </a>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: SANS, maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: D.ink, letterSpacing: "-0.03em", margin: 0 }}>
            Crear tu perfil
          </h1>
          <p style={{ fontSize: 13, color: D.muted, margin: "4px 0 0" }}>
            Paso {Math.min(step + 1, 5)} de 5 — {STEP_LABELS[Math.min(step, 4)]}
          </p>
        </div>
        <button
          onClick={handleSaveAndExit}
          disabled={saving}
          style={{
            fontFamily: SANS, fontSize: 12, fontWeight: 600, color: D.muted,
            background: D.white, border: `1px solid ${D.border}`, borderRadius: 8,
            padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            opacity: saving ? 0.6 : 1,
          }}
        >
          <Save size={13} /> {saving ? "Guardando…" : "Guardar y salir"}
        </button>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
        {STEP_LABELS.map((label, i) => {
          const clampedStep = Math.min(step, 4);
          const isActive = i === clampedStep;
          const isDone = i < clampedStep;
          return (
            <div
              key={i}
              style={{
                flex: 1, height: 4, borderRadius: 2,
                background: isDone ? D.blue : isActive ? D.blue : D.border,
                opacity: isActive ? 1 : 0.5,
                transition: "all 0.3s",
              }}
              title={label}
            />
          );
        })}
      </div>

      {/* Step content */}
      <div style={{
        background: D.white, border: `1px solid ${D.border}`,
        borderRadius: 16, padding: 32,
      }}>
        {step === 0 && <Step1BasicInfo data={data} updateData={updateData} user={user} avatarUrl={profile?.avatar_url || facultyProfile?.avatar_url} />}
        {step === 1 && <Step2CareerType data={data} updateData={updateData} user={user} facultyProfile={facultyProfile} />}
        {step === 2 && <Step3Specialty data={data} updateData={updateData} />}
        {step === 3 && <Step4Modality data={data} updateData={updateData} />}
        {(step === 4 || step >= 5) && <Step5Review data={data} facultyProfile={facultyProfile} userMeta={userMeta} />}
      </div>

      {/* Navigation buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button
          onClick={() => setStep(prev => Math.max(0, prev - 1))}
          disabled={step === 0}
          style={{
            fontFamily: SANS, fontSize: 14, fontWeight: 600, color: D.muted,
            background: D.white, border: `1px solid ${D.border}`, borderRadius: 10,
            padding: "11px 22px", cursor: step === 0 ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 6,
            opacity: step === 0 ? 0.4 : 1,
          }}
        >
          <ArrowLeft size={15} /> Anterior
        </button>

        {step < 4 ? (
          <button
            onClick={handleSaveAndContinue}
            disabled={!canProceed() || saving}
            style={{
              fontFamily: SANS, fontSize: 14, fontWeight: 700, color: "#fff",
              background: canProceed() ? D.blue : D.border, border: "none", borderRadius: 10,
              padding: "11px 28px", cursor: canProceed() ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", gap: 6,
              opacity: canProceed() && !saving ? 1 : 0.6,
              transition: "all 0.2s",
            }}
          >
            {saving ? "Guardando…" : "Siguiente"} {!saving && <ArrowRight size={15} />}
          </button>
        ) : (
          <button
            onClick={handlePublish}
            disabled={publishing}
            style={{
              fontFamily: SANS, fontSize: 14, fontWeight: 700, color: "#fff",
              background: D.blue, border: "none", borderRadius: 10,
              padding: "11px 28px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              opacity: publishing ? 0.6 : 1,
            }}
          >
            {publishing ? "Publicando…" : "Publicar perfil"}
          </button>
        )}
      </div>

      {/* Save error message */}
      {saveError && (
        <div style={{
          marginTop: 16, padding: "12px 14px", borderRadius: 8,
          background: "#FEF2F2", border: "1px solid #FCA5A5",
          fontFamily: SANS, fontSize: 13, color: "#DC2626",
        }}>
          {saveError}
        </div>
      )}
    </div>
  );
}