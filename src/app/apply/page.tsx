"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  Plus,
  X,
  Mail,
} from "lucide-react";


const FIELDS_OPTIONS = [
  "Business & Management",
  "Ingeniería & Tecnología",
  "Salud & Ciencias",
  "Derecho & Ciencias Políticas",
  "Educación",
  "Artes & Humanidades",
  "Economía & Finanzas",
  "Comunicación & Marketing",
  "Ciencias Sociales",
  "Matemáticas & Estadística",
];

const MODALITY_OPTIONS = ["Presencial", "Online", "Híbrido", "Internacional"];

const AVAILABILITY_OPTIONS = [
  "Disponible inmediatamente",
  "Disponible desde próximo semestre",
  "Disponible para asignaturas puntuales",
  "Disponible solo fines de semana / intensivos",
  "Disponible solo online",
  "Actualmente ocupado – disponible en 6 meses",
  "Solo por invitación directa",
];

const LANGUAGE_OPTIONS = [
  "Español",
  "Inglés",
  "Francés",
  "Portugués",
  "Alemán",
  "Italiano",
  "Árabe",
  "Chino",
  "Otro",
];

const DEGREE_TYPES_OPTIONS = [
  "Grado",
  "Máster",
  "Doctorado",
  "MBA",
  "Posgrado Propio",
  "FP Superior",
  "Certificación Profesional",
  "Formación Continua",
];

const ACADEMIC_LEVEL_OPTIONS = [
  "Graduado/Licenciado",
  "Máster",
  "Doctorado (PhD)",
  "Catedrático/Titular de Universidad",
];

const HONORARIUM_OPTIONS = [
  "Menos de 30€/h",
  "Entre 30 y 60€/h",
  "Entre 60 y 100€/h",
  "Más de 100€/h",
  "Negociable / A consultar",
];

const WEEKLY_HOURS_OPTIONS = [
  "Menos de 5h",
  "Entre 5 y 10h",
  "Entre 10 y 20h",
  "Más de 20h",
];

type FormData = {
  full_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  languages: string[];
  primary_fields: string[];
  subjects: string[];
  degree_types: string[];
  current_institution: string;
  is_currently_teaching: boolean;
  past_institutions: string[];
  years_experience: string;
  linkedin_url: string;
  bio: string;
  modalities: string[];
  availability: string;
  academic_level: string;
  aneca_accreditation: boolean;
  aneca_number: string;
  honorarium_range: string;
  weekly_hours: string;
  consent_terms: boolean;
  consent_privacy: boolean;
  consent_marketing: boolean;
};

const INITIAL_FORM: FormData = {
  full_name: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  languages: [],
  primary_fields: [],
  subjects: [],
  degree_types: [],
  current_institution: "",
  is_currently_teaching: false,
  past_institutions: [],
  years_experience: "",
  linkedin_url: "",
  bio: "",
  modalities: [],
  availability: "",
  academic_level: "",
  aneca_accreditation: false,
  aneca_number: "",
  honorarium_range: "",
  weekly_hours: "",
  consent_terms: false,
  consent_privacy: false,
  consent_marketing: false,
};

function TagToggle({
  options,
  selected,
  onChange,
  color = "blue",
}: {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  color?: "blue" | "orange";
}) {
  const toggle = (opt: string) => {
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
    );
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              active
                ? color === "orange"
                  ? "bg-energy-orange text-white border-energy-orange"
                  : "bg-talentia-blue text-white border-talentia-blue"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function TagInput({
  value,
  onChange,
  placeholder,
  maxItems = 20,
}: {
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  maxItems?: number;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed) && value.length < maxItems) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all"
        />
        <button
          type="button"
          onClick={add}
          disabled={!input.trim() || value.length >= maxItems}
          className="h-11 px-4 rounded-xl bg-talentia-blue text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
        >
          <Plus size={16} /> Añadir
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 border border-blue-200 text-navy"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((t) => t !== tag))}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400">{value.length}/{maxItems}</p>
    </div>
  );
}

export default function ApplyPage() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (field: keyof FormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.full_name.trim()) newErrors.full_name = "El nombre es obligatorio.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Introduce un email válido.";
    if (!form.phone.trim()) newErrors.phone = "El teléfono es obligatorio.";
    if (!form.country.trim()) newErrors.country = "El país es obligatorio.";
    if (!form.consent_terms)
      newErrors.consent_terms = "Debes aceptar los términos y condiciones.";
    if (!form.consent_privacy)
      newErrors.consent_privacy = "Debes aceptar la política de privacidad.";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorEl = document.querySelector("[data-error]");
      firstErrorEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        country: form.country.trim() || null,
        city: form.city.trim() || null,
        languages: form.languages.length > 0 ? form.languages : null,
        primary_fields: form.primary_fields.length > 0 ? form.primary_fields : null,
        subjects: form.subjects.length > 0 ? form.subjects : null,
        degree_types: form.degree_types.length > 0 ? form.degree_types : null,
        current_institution: form.current_institution.trim() || null,
        is_currently_teaching: form.is_currently_teaching,
        past_institutions: form.past_institutions.length > 0 ? form.past_institutions : null,
        years_experience: form.years_experience
          ? parseInt(form.years_experience, 10)
          : null,
        linkedin_url: form.linkedin_url.trim() || null,
        bio: form.bio.trim() || null,
        modalities: form.modalities.length > 0 ? form.modalities : null,
        availability: form.availability || null,
        academic_level: form.academic_level || null,
        aneca_accreditation: form.aneca_accreditation,
        aneca_number: form.aneca_number.trim() || null,
        honorarium_range: form.honorarium_range || null,
        weekly_hours: form.weekly_hours || null,
        consent_terms: form.consent_terms,
        consent_terms_at: new Date().toISOString(),
        consent_privacy: form.consent_privacy,
        consent_privacy_at: new Date().toISOString(),
        consent_marketing: form.consent_marketing,
        consent_marketing_at: form.consent_marketing ? new Date().toISOString() : null,
      };

      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al enviar. Inténtalo de nuevo.");

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al enviar. Inténtalo de nuevo.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6 py-24">
          <div className="max-w-lg w-full text-center space-y-8">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="text-green-500" size={48} />
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-black text-navy">
                ¡Perfil recibido!
              </h1>
              <p className="text-lg text-gray-500 font-medium">
                Gracias, <span className="text-navy font-bold">{form.full_name}</span>. Tu solicitud ha sido registrada correctamente.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-talentia-blue flex items-center justify-center flex-shrink-0">
                <Mail className="text-white" size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-navy">Confirma tu correo electrónico</p>
                <p className="text-sm text-gray-600 font-medium mt-1">
                  Hemos enviado un enlace de acceso a <span className="font-bold text-talentia-blue">{form.email}</span>. Haz clic en el enlace para acceder a tu perfil y empezar a recibir ofertas de instituciones.
                </p>
                <p className="text-xs text-gray-400 font-medium mt-2">Si no lo ves, revisa tu carpeta de spam.</p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-left space-y-3 shadow-sm">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Próximos pasos</p>
              {[
                "Confirma tu email haciendo clic en el enlace que te hemos enviado.",
                "Revisaremos tu perfil y verificaremos tu experiencia en 48h.",
                "Tu perfil estará visible para instituciones universitarias verificadas.",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-talentia-blue text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{step}</p>
                </div>
              ))}
            </div>
            <Link href="/">
              <Button className="bg-talentia-blue text-white font-bold h-12 px-8 rounded-xl">
                Volver al inicio
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 px-6 lg:px-12 py-12">
        <div className="max-w-3xl mx-auto space-y-10">
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-talentia-blue text-xs font-black uppercase tracking-widest">
              <GraduationCap size={14} /> Formulario para Docentes
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-navy leading-tight">
              Únete a la red de talento académico
            </h1>
            <p className="text-lg text-gray-500 font-medium max-w-xl">
              Completa tu perfil y conecta con instituciones universitarias de todo el mundo. Es gratis.
            </p>
            <p className="text-sm text-gray-400 font-medium mb-6">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-talentia-blue font-bold hover:underline">
                Accede aquí
              </Link>
              {" "}· Este formulario es para nuevos docentes que quieren unirse a la red.
            </p>
          </div>

          {/* Progress bar */}
          {(() => {
            const requiredFields = [form.full_name, form.email, form.phone, form.country];
            const areasOk = form.primary_fields.length > 0 ? 1 : 0;
            const filled = requiredFields.filter(Boolean).length + areasOk;
            const progress = Math.round((filled / 5) * 100);
            return (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Perfil completado
                  </span>
                  <span className="text-xs font-black text-talentia-blue">{progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-talentia-blue rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })()}

          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            {/* Personal Info */}
            <section id="datos-personales" className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-navy uppercase tracking-tight">
                1. Datos personales
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5" data-error={errors.full_name}>
                  <label className="text-sm font-bold text-navy">
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => set("full_name", e.target.value)}
                    placeholder="Ej: María González Pérez"
                    className={`w-full h-11 px-4 rounded-xl border text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all ${
                      errors.full_name ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"
                    }`}
                  />
                  {errors.full_name && (
                    <p className="text-xs text-red-500 font-medium">{errors.full_name}</p>
                  )}
                </div>

                <div className="space-y-1.5" data-error={errors.email}>
                  <label className="text-sm font-bold text-navy">
                    Email profesional <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="maria@universidad.edu"
                    className={`w-full h-11 px-4 rounded-xl border text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all ${
                      errors.email ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 font-medium">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5" data-error={errors.phone}>
                  <label className="text-sm font-bold text-navy">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+34 600 000 000"
                    className={`w-full h-11 px-4 rounded-xl border text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all ${
                      errors.phone ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 font-medium">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-navy">LinkedIn</label>
                  <input
                    type="url"
                    value={form.linkedin_url}
                    onChange={(e) => set("linkedin_url", e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all"
                  />
                </div>

                <div className="space-y-1.5" data-error={errors.country}>
                  <label className="text-sm font-bold text-navy">País <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                    placeholder="España"
                    className={`w-full h-11 px-4 rounded-xl border text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all ${
                      errors.country ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"
                    }`}
                  />
                  {errors.country && (
                    <p className="text-xs text-red-500 font-medium">{errors.country}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-navy">Ciudad</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="Madrid"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Academic Profile */}
            <section id="perfil-academico" className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-navy uppercase tracking-tight">
                2. Perfil académico
              </h2>

              {/* CAMPO 5: Nivel académico */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">
                  Nivel académico más alto <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.academic_level}
                  onChange={(e) => set("academic_level", e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all appearance-none"
                >
                  <option value="">Selecciona tu nivel…</option>
                  {ACADEMIC_LEVEL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* CAMPO 6: Acreditación ANECA */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => set("aneca_accreditation", !form.aneca_accreditation)}
                    className={`w-11 h-6 rounded-full flex items-center transition-colors flex-shrink-0 ${form.aneca_accreditation ? "bg-talentia-blue" : "bg-gray-200"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform mx-0.5 ${form.aneca_accreditation ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                  <span className="text-sm font-bold text-navy">¿Tienes acreditación ANECA?</span>
                </label>
                {form.aneca_accreditation && (
                  <input
                    type="text"
                    value={form.aneca_number}
                    onChange={(e) => set("aneca_number", e.target.value)}
                    placeholder="Número de acreditación ANECA (opcional)"
                    className="w-full h-11 px-4 rounded-xl border border-blue-200 text-sm font-medium bg-blue-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all"
                  />
                )}
              </div>

              {/* Áreas de conocimiento */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Áreas de conocimiento principales</label>
                <TagToggle
                  options={FIELDS_OPTIONS}
                  selected={form.primary_fields}
                  onChange={(v) => set("primary_fields", v)}
                />
              </div>

              {/* CAMPO 2: Asignaturas — TagInput */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Asignaturas / Materias que imparte</label>
                <TagInput
                  value={form.subjects}
                  onChange={(v) => set("subjects", v)}
                  placeholder="Ej: Macroeconomía · Enter para añadir"
                  maxItems={20}
                />
              </div>

              {/* CAMPO 3: Titulaciones donde puede impartir — chip multi-select */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Titulaciones / Grados donde puede impartir</label>
                <TagToggle
                  options={DEGREE_TYPES_OPTIONS}
                  selected={form.degree_types}
                  onChange={(v) => set("degree_types", v)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-navy">Años de experiencia docente</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={form.years_experience}
                    onChange={(e) => set("years_experience", e.target.value)}
                    placeholder="Ej: 8"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all"
                  />
                </div>
              </div>

              {/* CAMPO 4: Instituciones donde ha impartido — TagInput */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Instituciones donde has impartido docencia</label>
                <TagInput
                  value={form.past_institutions}
                  onChange={(v) => set("past_institutions", v)}
                  placeholder="Ej: Universidad Complutense · Enter para añadir"
                  maxItems={10}
                />
              </div>

              {/* Current institution */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => set("is_currently_teaching", !form.is_currently_teaching)}
                    className={`w-11 h-6 rounded-full flex items-center transition-colors flex-shrink-0 ${form.is_currently_teaching ? "bg-talentia-blue" : "bg-gray-200"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform mx-0.5 ${form.is_currently_teaching ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                  <span className="text-sm font-bold text-navy">Actualmente soy docente en una institución</span>
                </label>
                {form.is_currently_teaching && (
                  <input
                    type="text"
                    value={form.current_institution}
                    onChange={(e) => set("current_institution", e.target.value)}
                    placeholder="Nombre de la institución actual"
                    className="w-full h-11 px-4 rounded-xl border border-blue-200 text-sm font-medium bg-blue-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all"
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Bio profesional</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  rows={4}
                  placeholder="Describe tu experiencia docente e investigadora en 2-4 frases..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all resize-none"
                />
              </div>
            </section>

            {/* Languages & Availability */}
            <section id="idiomas-disponibilidad" className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-navy uppercase tracking-tight">
                3. Idiomas y disponibilidad
              </h2>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Idiomas de impartición</label>
                <TagToggle
                  options={LANGUAGE_OPTIONS}
                  selected={form.languages}
                  onChange={(v) => set("languages", v)}
                  color="orange"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Modalidades</label>
                <TagToggle
                  options={MODALITY_OPTIONS}
                  selected={form.modalities}
                  onChange={(v) => set("modalities", v)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Disponibilidad</label>
                <select
                  value={form.availability}
                  onChange={(e) => set("availability", e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all appearance-none"
                >
                  <option value="">Selecciona tu disponibilidad…</option>
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* CAMPO 8: Horas disponibles por semana */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Horas disponibles por semana</label>
                <select
                  value={form.weekly_hours}
                  onChange={(e) => set("weekly_hours", e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all appearance-none"
                >
                  <option value="">Selecciona un rango…</option>
                  {WEEKLY_HOURS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* CAMPO 7: Honorario orientativo */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Honorario orientativo por hora</label>
                <select
                  value={form.honorarium_range}
                  onChange={(e) => set("honorarium_range", e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all appearance-none"
                >
                  <option value="">Selecciona un rango…</option>
                  {HONORARIUM_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400">Dato privado. Solo se usa para el filtro de compatibilidad.</p>
              </div>
            </section>

            {/* Consent */}
            <section id="consentimiento" className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-lg font-black text-navy uppercase tracking-tight">
                4. Consentimiento y privacidad
              </h2>

              <div className="space-y-3">
                <label
                  data-error={errors.consent_terms}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    errors.consent_terms
                      ? "border-red-300 bg-red-50"
                      : form.consent_terms
                      ? "border-talentia-blue bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.consent_terms}
                    onChange={(e) => set("consent_terms", e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-talentia-blue flex-shrink-0"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Acepto los{" "}
                    <Link href="/terms" className="text-talentia-blue font-bold hover:underline">
                      Términos y Condiciones
                    </Link>{" "}
                    de FacultyMatch. <span className="text-red-500">*</span>
                  </span>
                </label>
                {errors.consent_terms && (
                  <p className="text-xs text-red-500 font-medium pl-4">{errors.consent_terms}</p>
                )}

                <label
                  data-error={errors.consent_privacy}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    errors.consent_privacy
                      ? "border-red-300 bg-red-50"
                      : form.consent_privacy
                      ? "border-talentia-blue bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.consent_privacy}
                    onChange={(e) => set("consent_privacy", e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-talentia-blue flex-shrink-0"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Acepto la{" "}
                    <Link href="/privacy" className="text-talentia-blue font-bold hover:underline">
                      Política de Privacidad
                    </Link>{" "}
                    y el tratamiento de mis datos personales con fines de matching académico.{" "}
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                {errors.consent_privacy && (
                  <p className="text-xs text-red-500 font-medium pl-4">{errors.consent_privacy}</p>
                )}

                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    form.consent_marketing
                      ? "border-talentia-blue bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.consent_marketing}
                    onChange={(e) => set("consent_marketing", e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-talentia-blue flex-shrink-0"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Quiero recibir novedades, oportunidades académicas y comunicaciones de FacultyMatch. (Opcional)
                  </span>
                </label>
              </div>
            </section>

            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <X className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-700 font-medium">{serverError}</p>
              </div>
            )}

            <div className="flex flex-col items-center gap-3 pb-12">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-energy-orange hover:bg-orange-600 text-white font-black h-14 px-10 rounded-xl text-base shadow-xl shadow-orange-100 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      Enviar mi perfil
                      <ArrowRight size={20} />
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-400 font-medium text-center sm:text-left">
                  Tus datos son privados y seguros.
                </p>
              </div>
              {loading && (
                <p className="text-xs text-gray-400 text-center animate-pulse">
                  Guardando tu perfil y enviando confirmación por email...
                </p>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
