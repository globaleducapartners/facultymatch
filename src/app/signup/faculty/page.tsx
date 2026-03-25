"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, GraduationCap, ShieldCheck, Users, ArrowRight, Loader2 } from "lucide-react";

const AREAS_OPTIONS = [
  "Business & Management", "Ingeniería & Tecnología", "Salud & Ciencias",
  "Derecho & Ciencias Políticas", "Educación", "Artes & Humanidades",
  "Economía & Finanzas", "Comunicación & Marketing", "Ciencias Sociales",
  "Matemáticas & Estadística",
];

const MODALITIES_OPTIONS = ["Presencial", "Online", "Híbrido", "Internacional"];

const AVAILABILITY_OPTIONS = [
  "Disponible inmediatamente",
  "Disponible desde próximo semestre",
  "Disponible para asignaturas puntuales",
  "Disponible solo fines de semana / intensivos",
  "Disponible solo online",
  "Actualmente ocupado – disponible en 6 meses",
  "Solo por invitación directa",
];

const ACADEMIC_LEVELS = [
  "Graduado/Licenciado", "Máster", "Doctorado (PhD)", "Catedrático/Titular de Universidad",
];

const COUNTRIES = [
  "España", "México", "Argentina", "Colombia", "Chile",
  "Perú", "Venezuela", "Ecuador", "Bolivia", "Uruguay",
  "Costa Rica", "Guatemala", "Panamá", "Cuba", "República Dominicana",
  "Estados Unidos", "Reino Unido", "Alemania", "Francia", "Italia",
  "Portugal", "Países Bajos", "Bélgica", "Suiza", "Suecia", "Otro",
];

const PHONE_PREFIXES = [
  { flag: "🇪🇸", code: "+34" }, { flag: "🇲🇽", code: "+52" },
  { flag: "🇦🇷", code: "+54" }, { flag: "🇨🇴", code: "+57" },
  { flag: "🇨🇱", code: "+56" }, { flag: "🇺🇸", code: "+1" },
  { flag: "🇬🇧", code: "+44" }, { flag: "🇩🇪", code: "+49" },
];

function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: "", color: "" };
  const score = [pwd.length >= 8, /[A-Z]/.test(pwd), /[0-9]/.test(pwd)].filter(Boolean).length;
  if (score <= 1) return { score: 1, label: "Débil", color: "bg-red-500" };
  if (score === 2) return { score: 2, label: "Media", color: "bg-orange-500" };
  return { score: 3, label: "Fuerte", color: "bg-green-500" };
}

export default function SignupFacultyPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+34");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [academicLevel, setAcademicLevel] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [anecaAccreditation, setAnecaAccreditation] = useState(false);
  const [country, setCountry] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [availability, setAvailability] = useState("");
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const pwStrength = getPasswordStrength(password);

  const toggleArea = (area: string) => {
    setSelectedAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) :
      prev.length < 3 ? [...prev, area] : prev
    );
  };

  const toggleModality = (mod: string) => {
    setSelectedModalities(prev =>
      prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
    );
  };

  const clearError = (key: string) => setErrors(p => ({ ...p, [key]: "" }));

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "El nombre es obligatorio.";
    if (!lastName.trim()) errs.lastName = "Los apellidos son obligatorios.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Introduce un email válido.";
    if (password.length < 8) errs.password = "Mínimo 8 caracteres.";
    else if (pwStrength.score < 2) errs.password = "Contraseña demasiado débil.";
    if (password !== confirmPassword) errs.confirmPassword = "Las contraseñas no coinciden.";
    if (!academicLevel) errs.academicLevel = "Selecciona tu nivel académico.";
    if (selectedAreas.length === 0) errs.areas = "Selecciona al menos un área.";
    if (!country) errs.country = "Selecciona tu país.";
    if (!consentTerms) errs.consentTerms = "Debes aceptar los Términos y Condiciones.";
    if (!consentPrivacy) errs.consentPrivacy = "Debes aceptar la Política de Privacidad.";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTimeout(() => {
        const el = document.querySelector("[data-error='true']");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    setLoading(true);
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.facultymatch.app";
      const phoneFormatted = phone.trim() ? `${phonePrefix} ${phone.trim()}` : null;

      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback?next=/app/faculty`,
          data: {
            full_name: fullName,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            role: "faculty",
            academic_level: academicLevel,
            knowledge_areas: selectedAreas,
            country,
            linkedin_url: linkedinUrl.trim() || null,
            modalities: selectedModalities,
            availability: availability || null,
            aneca_accreditation: anecaAccreditation,
            phone: phoneFormatted,
            terms_accepted: true,
            privacy_accepted: true,
            marketing_opt_in: marketingOptIn,
            consent_version: "v1",
          },
        },
      });

      if (signUpError) {
        const msg = signUpError.message.toLowerCase();
        if (msg.includes("already registered") || msg.includes("already been registered") || signUpError.status === 400) {
          setServerError("duplicate_email");
        } else {
          setServerError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      // Non-blocking: insert in faculty_leads for captación
      fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email: email.trim().toLowerCase(),
          phone: phoneFormatted,
          country,
          primary_fields: selectedAreas,
          modalities: selectedModalities,
          availability: availability || null,
          academic_level: academicLevel,
          aneca_accreditation: anecaAccreditation,
          linkedin_url: linkedinUrl.trim() || null,
          consent_terms: true,
          consent_terms_at: new Date().toISOString(),
          consent_privacy: true,
          consent_privacy_at: new Date().toISOString(),
          consent_marketing: marketingOptIn,
          consent_marketing_at: marketingOptIn ? new Date().toISOString() : null,
        }),
      }).catch(() => {});

      router.push(`/signup/faculty/confirm?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Error inesperado. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full h-11 px-4 rounded-xl border text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all ${
      errors[field] ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"
    }`;

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[40%] shrink-0 p-10 relative overflow-hidden"
        style={{ background: "#0B1220" }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(ellipse at 30% 50%, #2563EB 0%, transparent 70%)" }}
        />
        <div className="relative z-10">
          <Link href="/"><Logo variant="light" /></Link>
        </div>
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-black uppercase tracking-widest">
              <GraduationCap size={12} /> Red Docente Global
            </div>
            <h2 className="text-3xl font-black text-white leading-tight">
              La red académica que trabaja para ti
            </h2>
          </div>
          <div className="space-y-3">
            {[
              { icon: ShieldCheck, text: "Perfil verificado" },
              { icon: Users, text: "Visible para 500+ instituciones" },
              { icon: GraduationCap, text: "Control total de tu privacidad" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Icon size={15} />
                </div>
                <span className="text-gray-300 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-[10px] text-gray-600 font-medium">
          © 2026 FacultyMatch · Grupo Global Educa SL
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-[#F8FAFC] overflow-y-auto">
        <div className="lg:hidden mb-8 self-start">
          <Link href="/"><Logo /></Link>
        </div>

        <div className="w-full max-w-xl space-y-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
              Paso 1 de 1 · Gratis para siempre
            </p>
            <h1 className="text-3xl font-black text-navy">Crea tu perfil docente</h1>
            <p className="text-gray-500 font-medium mt-1">Tarda menos de 3 minutos</p>
          </div>

          {serverError === "duplicate_email" && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
              Este email ya está registrado.{" "}
              <Link href={`/login`} className="font-bold underline">¿Quieres acceder?</Link>
            </div>
          )}
          {serverError && serverError !== "duplicate_email" && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-8">

            {/* DATOS PERSONALES */}
            <section className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
                Datos personales
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div data-error={!!errors.firstName} className="space-y-1.5">
                  <label className="text-sm font-bold text-navy">Nombre <span className="text-red-500">*</span></label>
                  <input type="text" value={firstName} placeholder="María"
                    onChange={e => { setFirstName(e.target.value); clearError("firstName"); }}
                    className={inputClass("firstName")} />
                  {errors.firstName && <p className="text-xs text-red-500 font-medium">{errors.firstName}</p>}
                </div>
                <div data-error={!!errors.lastName} className="space-y-1.5">
                  <label className="text-sm font-bold text-navy">Apellidos <span className="text-red-500">*</span></label>
                  <input type="text" value={lastName} placeholder="García López"
                    onChange={e => { setLastName(e.target.value); clearError("lastName"); }}
                    className={inputClass("lastName")} />
                  {errors.lastName && <p className="text-xs text-red-500 font-medium">{errors.lastName}</p>}
                </div>
              </div>
              <div data-error={!!errors.email} className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Email profesional <span className="text-red-500">*</span></label>
                <input type="email" value={email} placeholder="maria@universidad.edu"
                  onChange={e => { setEmail(e.target.value); clearError("email"); }}
                  className={inputClass("email")} />
                {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Teléfono <span className="text-gray-400 font-normal text-xs">(opcional)</span></label>
                <div className="flex gap-2">
                  <select value={phonePrefix} onChange={e => setPhonePrefix(e.target.value)}
                    className="h-11 px-3 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all">
                    {PHONE_PREFIXES.map(p => (
                      <option key={p.code} value={p.code}>{p.flag} {p.code}</option>
                    ))}
                  </select>
                  <input type="tel" value={phone} placeholder="600 000 000"
                    onChange={e => setPhone(e.target.value)}
                    className="flex-1 h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all" />
                </div>
              </div>
            </section>

            {/* ACCESO A LA PLATAFORMA */}
            <section className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
                Acceso a la plataforma
              </p>
              <div data-error={!!errors.password} className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Contraseña <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password}
                    placeholder="Mínimo 8 caracteres"
                    onChange={e => { setPassword(e.target.value); clearError("password"); }}
                    className={`w-full h-11 px-4 pr-12 rounded-xl border text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all ${errors.password ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"}`} />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= pwStrength.score ? pwStrength.color : "bg-gray-200"}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-bold ${pwStrength.score === 1 ? "text-red-500" : pwStrength.score === 2 ? "text-orange-500" : "text-green-600"}`}>
                      {pwStrength.label}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-400">Mínimo 8 caracteres · 1 mayúscula · 1 número</p>
                {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password}</p>}
              </div>
              <div data-error={!!errors.confirmPassword} className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Confirmar contraseña <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showConfirm ? "text" : "password"} value={confirmPassword}
                    placeholder="Repite la contraseña"
                    onChange={e => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
                    className={`w-full h-11 px-4 pr-12 rounded-xl border text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all ${
                      errors.confirmPassword ? "border-red-400 ring-1 ring-red-300" :
                      confirmPassword && confirmPassword === password ? "border-green-400" : "border-gray-200"
                    }`} />
                  <button type="button" onClick={() => setShowConfirm(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 font-medium">{errors.confirmPassword}</p>}
                {confirmPassword && confirmPassword === password && !errors.confirmPassword && (
                  <p className="text-xs text-green-600 font-medium">✓ Las contraseñas coinciden</p>
                )}
              </div>
            </section>

            {/* PERFIL ACADÉMICO */}
            <section className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
                Perfil académico
              </p>
              <div data-error={!!errors.academicLevel} className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Nivel académico <span className="text-red-500">*</span></label>
                <select value={academicLevel} onChange={e => { setAcademicLevel(e.target.value); clearError("academicLevel"); }}
                  className={`w-full h-11 px-4 rounded-xl border text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all appearance-none ${errors.academicLevel ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"}`}>
                  <option value="">Selecciona tu nivel…</option>
                  {ACADEMIC_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                {errors.academicLevel && <p className="text-xs text-red-500 font-medium">{errors.academicLevel}</p>}
              </div>
              <div data-error={!!errors.areas} className="space-y-1.5">
                <label className="text-sm font-bold text-navy">
                  Áreas de conocimiento <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal text-xs ml-2">máx. 3</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {AREAS_OPTIONS.map(area => {
                    const active = selectedAreas.includes(area);
                    const disabled = !active && selectedAreas.length >= 3;
                    return (
                      <button key={area} type="button" onClick={() => { toggleArea(area); clearError("areas"); }}
                        disabled={disabled}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          active ? "bg-talentia-blue text-white border-talentia-blue" :
                          disabled ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed" :
                          "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                        }`}>
                        {area}
                      </button>
                    );
                  })}
                </div>
                {errors.areas && <p className="text-xs text-red-500 font-medium">{errors.areas}</p>}
              </div>
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setAnecaAccreditation(p => !p)}>
                <div className={`w-11 h-6 rounded-full flex items-center transition-colors flex-shrink-0 ${anecaAccreditation ? "bg-talentia-blue" : "bg-gray-200"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform mx-0.5 ${anecaAccreditation ? "translate-x-5" : "translate-x-0"}`} />
                </div>
                <span className="text-sm font-bold text-navy select-none">¿Tienes acreditación ANECA?</span>
              </div>
              <div data-error={!!errors.country} className="space-y-1.5">
                <label className="text-sm font-bold text-navy">País <span className="text-red-500">*</span></label>
                <select value={country} onChange={e => { setCountry(e.target.value); clearError("country"); }}
                  className={`w-full h-11 px-4 rounded-xl border text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all appearance-none ${errors.country ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"}`}>
                  <option value="">Selecciona tu país…</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.country && <p className="text-xs text-red-500 font-medium">{errors.country}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">LinkedIn <span className="text-gray-400 font-normal text-xs">(opcional)</span></label>
                <input type="url" value={linkedinUrl} placeholder="https://linkedin.com/in/..."
                  onChange={e => setLinkedinUrl(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all" />
              </div>
            </section>

            {/* DISPONIBILIDAD */}
            <section className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
                Disponibilidad
              </p>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Modalidad</label>
                <div className="flex flex-wrap gap-2">
                  {MODALITIES_OPTIONS.map(mod => {
                    const active = selectedModalities.includes(mod);
                    return (
                      <button key={mod} type="button" onClick={() => toggleModality(mod)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          active ? "bg-talentia-blue text-white border-talentia-blue" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                        }`}>
                        {mod}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Disponibilidad</label>
                <select value={availability} onChange={e => setAvailability(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all appearance-none">
                  <option value="">Selecciona tu disponibilidad…</option>
                  {AVAILABILITY_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </section>

            {/* CONSENTIMIENTO */}
            <section className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
                Consentimiento
              </p>
              <div className="space-y-3">
                <div>
                  <label data-error={!!errors.consentTerms}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      errors.consentTerms ? "border-red-300 bg-red-50" : consentTerms ? "border-talentia-blue bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                    }`}>
                    <input type="checkbox" checked={consentTerms}
                      onChange={e => { setConsentTerms(e.target.checked); clearError("consentTerms"); }}
                      className="mt-0.5 h-4 w-4 rounded accent-talentia-blue flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">
                      Acepto los{" "}
                      <Link href="/terms" className="text-talentia-blue font-bold hover:underline">Términos y Condiciones</Link>{" "}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.consentTerms && <p className="text-xs text-red-500 font-medium mt-1 pl-1">{errors.consentTerms}</p>}
                </div>
                <div>
                  <label data-error={!!errors.consentPrivacy}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      errors.consentPrivacy ? "border-red-300 bg-red-50" : consentPrivacy ? "border-talentia-blue bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                    }`}>
                    <input type="checkbox" checked={consentPrivacy}
                      onChange={e => { setConsentPrivacy(e.target.checked); clearError("consentPrivacy"); }}
                      className="mt-0.5 h-4 w-4 rounded accent-talentia-blue flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">
                      Acepto la{" "}
                      <Link href="/privacy" className="text-talentia-blue font-bold hover:underline">Política de Privacidad</Link>{" "}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.consentPrivacy && <p className="text-xs text-red-500 font-medium mt-1 pl-1">{errors.consentPrivacy}</p>}
                </div>
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  marketingOptIn ? "border-talentia-blue bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                }`}>
                  <input type="checkbox" checked={marketingOptIn} onChange={e => setMarketingOptIn(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-talentia-blue flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700">
                    Quiero recibir comunicaciones de FacultyMatch{" "}
                    <span className="text-gray-400">(opcional)</span>
                  </span>
                </label>
              </div>
            </section>

            <Button type="submit" disabled={loading}
              className="w-full bg-energy-orange hover:bg-orange-600 text-white font-black h-14 rounded-xl text-base shadow-xl shadow-orange-100 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? (
                <><Loader2 className="animate-spin" size={20} /> Creando tu cuenta...</>
              ) : (
                <>Crear mi cuenta <ArrowRight size={20} /></>
              )}
            </Button>

            <p className="text-center text-xs text-gray-400 font-medium">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-talentia-blue font-bold hover:underline">Acceder aquí</Link>
              {" · "}
              <Link href="/apply" className="text-gray-500 hover:underline">Enviar perfil sin cuenta</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
