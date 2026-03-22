"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  Building2,
  ArrowRight,
  CheckCircle2,
  X,
  Mail,
} from "lucide-react";

const INSTITUTION_TYPES = [
  "Universidad pública",
  "Universidad privada",
  "Business School / Escuela de Negocios",
  "Centro de FP Superior",
  "Centro de formación online",
  "Academia / Instituto privado",
  "Empresa con formación interna",
];

const PROGRAM_TYPES = [
  "Grado",
  "Máster",
  "MBA",
  "Posgrado",
  "FP Superior",
  "Formación continua",
];

const KNOWLEDGE_AREAS = [
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

const FACULTY_COUNT_OPTIONS = [
  "1 a 5",
  "5 a 15",
  "15 a 30",
  "Más de 30",
];

const URGENCY_OPTIONS = [
  "Inmediata (este cuatrimestre)",
  "Próximo semestre",
  "Planificación anual",
  "Solo explorando la plataforma",
];

type FormData = {
  institution_name: string;
  institution_type: string;
  country: string;
  city: string;
  website: string;
  cif: string;
  program_types: string[];
  knowledge_areas: string[];
  faculty_count: string;
  urgency: string;
  contact_name: string;
  contact_role: string;
  contact_email: string;
  contact_phone: string;
  accepts_terms: boolean;
  accepts_privacy: boolean;
  accepts_marketing: boolean;
};

const INITIAL_FORM: FormData = {
  institution_name: "",
  institution_type: "",
  country: "",
  city: "",
  website: "",
  cif: "",
  program_types: [],
  knowledge_areas: [],
  faculty_count: "",
  urgency: "",
  contact_name: "",
  contact_role: "",
  contact_email: "",
  contact_phone: "",
  accepts_terms: false,
  accepts_privacy: false,
  accepts_marketing: false,
};

function CheckboxTag({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
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
                ? "bg-energy-orange text-white border-energy-orange"
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

export default function ApplyInstitutionPage() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (field: keyof FormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.institution_name.trim()) newErrors.institution_name = "El nombre de la institución es obligatorio.";
    if (!form.institution_type) newErrors.institution_type = "Selecciona el tipo de centro.";
    if (!form.country.trim()) newErrors.country = "El país es obligatorio.";
    if (!form.city.trim()) newErrors.city = "La ciudad es obligatoria.";
    if (!form.contact_name.trim()) newErrors.contact_name = "El nombre del responsable es obligatorio.";
    if (!form.contact_role.trim()) newErrors.contact_role = "El cargo es obligatorio.";
    if (!form.contact_email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email))
      newErrors.contact_email = "Introduce un email válido.";
    if (!form.contact_phone.trim()) newErrors.contact_phone = "El teléfono es obligatorio.";
    if (!form.accepts_terms) newErrors.accepts_terms = "Debes aceptar los términos y condiciones.";
    if (!form.accepts_privacy) newErrors.accepts_privacy = "Debes aceptar la política de privacidad.";
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
      const res = await fetch("/api/apply/institution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          institution_name: form.institution_name.trim(),
          country: form.country.trim(),
          city: form.city.trim(),
          website: form.website.trim() || null,
          cif: form.cif.trim() || null,
          contact_name: form.contact_name.trim(),
          contact_role: form.contact_role.trim() || null,
          contact_email: form.contact_email.trim().toLowerCase(),
          contact_phone: form.contact_phone.trim(),
        }),
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
              <h1 className="text-4xl font-black text-navy">¡Solicitud recibida!</h1>
              <p className="text-lg text-gray-500 font-medium">
                Gracias, <span className="text-navy font-bold">{form.contact_name}</span>. Hemos registrado la solicitud de{" "}
                <span className="text-navy font-bold">{form.institution_name}</span>.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-talentia-blue flex items-center justify-center flex-shrink-0">
                <Mail className="text-white" size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-navy">Revisa tu bandeja de entrada</p>
                <p className="text-sm text-gray-600 font-medium mt-1">
                  Hemos enviado una confirmación a{" "}
                  <span className="font-bold text-talentia-blue">{form.contact_email}</span>. Nuestro equipo se pondrá en contacto en 48-72h.
                </p>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-left space-y-3 shadow-sm">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Próximos pasos</p>
              {[
                "Revisaremos tu solicitud y verificaremos los datos de tu institución.",
                "Te enviaremos acceso al directorio de docentes verificados.",
                "Podrás explorar perfiles y contactar directamente con el profesorado.",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-energy-orange text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-energy-orange text-xs font-black uppercase tracking-widest">
              <Building2 size={14} /> Formulario para Instituciones
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-navy leading-tight">
              Registra tu institución en FacultyMatch
            </h1>
            <p className="text-lg text-gray-500 font-medium max-w-xl">
              Accede a la red de docentes verificados y encuentra el profesorado que necesitas para tus programas.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            {/* Section 1 — Datos del Centro */}
            <section id="datos-centro" className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-navy uppercase tracking-tight">
                1. Datos del Centro
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5" data-error={errors.institution_name || undefined}>
                  <label className="text-sm font-bold text-navy">
                    Nombre de la institución <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.institution_name}
                    onChange={(e) => set("institution_name", e.target.value)}
                    placeholder="Ej: Universidad de Barcelona"
                    className={`w-full h-11 px-4 rounded-xl border text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all ${
                      errors.institution_name ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"
                    }`}
                  />
                  {errors.institution_name && (
                    <p className="text-xs text-red-500 font-medium">{errors.institution_name}</p>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-1.5" data-error={errors.institution_type || undefined}>
                  <label className="text-sm font-bold text-navy">
                    Tipo de centro <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.institution_type}
                    onChange={(e) => set("institution_type", e.target.value)}
                    className={`w-full h-11 px-4 rounded-xl border text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all appearance-none ${
                      errors.institution_type ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"
                    }`}
                  >
                    <option value="">Selecciona el tipo de centro…</option>
                    {INSTITUTION_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {errors.institution_type && (
                    <p className="text-xs text-red-500 font-medium">{errors.institution_type}</p>
                  )}
                </div>

                <div className="space-y-1.5" data-error={errors.country || undefined}>
                  <label className="text-sm font-bold text-navy">
                    País <span className="text-red-500">*</span>
                  </label>
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

                <div className="space-y-1.5" data-error={errors.city || undefined}>
                  <label className="text-sm font-bold text-navy">
                    Ciudad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="Barcelona"
                    className={`w-full h-11 px-4 rounded-xl border text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all ${
                      errors.city ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"
                    }`}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-500 font-medium">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-navy">Web institucional</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => set("website", e.target.value)}
                    placeholder="https://www.universidad.edu"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-navy">CIF / Número de registro</label>
                  <input
                    type="text"
                    value={form.cif}
                    onChange={(e) => set("cif", e.target.value)}
                    placeholder="B-12345678"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Section 2 — Necesidades de Contratación */}
            <section id="necesidades" className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-navy uppercase tracking-tight">
                2. Necesidades de Contratación
              </h2>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Tipo de programas donde buscáis profesorado</label>
                <CheckboxTag
                  options={PROGRAM_TYPES}
                  selected={form.program_types}
                  onChange={(v) => set("program_types", v)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Áreas de conocimiento que necesitáis</label>
                <CheckboxTag
                  options={KNOWLEDGE_AREAS}
                  selected={form.knowledge_areas}
                  onChange={(v) => set("knowledge_areas", v)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-navy">Número aproximado de docentes que buscáis</label>
                  <select
                    value={form.faculty_count}
                    onChange={(e) => set("faculty_count", e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all appearance-none"
                  >
                    <option value="">Selecciona un rango…</option>
                    {FACULTY_COUNT_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-navy">Urgencia</label>
                  <select
                    value={form.urgency}
                    onChange={(e) => set("urgency", e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all appearance-none"
                  >
                    <option value="">Selecciona la urgencia…</option>
                    {URGENCY_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Section 3 — Contacto y Consentimiento */}
            <section id="contacto" className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-navy uppercase tracking-tight">
                3. Contacto y Consentimiento
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5" data-error={errors.contact_name || undefined}>
                  <label className="text-sm font-bold text-navy">
                    Nombre del responsable <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.contact_name}
                    onChange={(e) => set("contact_name", e.target.value)}
                    placeholder="Ej: Ana García López"
                    className={`w-full h-11 px-4 rounded-xl border text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all ${
                      errors.contact_name ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"
                    }`}
                  />
                  {errors.contact_name && (
                    <p className="text-xs text-red-500 font-medium">{errors.contact_name}</p>
                  )}
                </div>

                <div className="space-y-1.5" data-error={errors.contact_role || undefined}>
                  <label className="text-sm font-bold text-navy">
                    Cargo / Puesto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.contact_role}
                    onChange={(e) => set("contact_role", e.target.value)}
                    placeholder="Directora Académica"
                    className={`w-full h-11 px-4 rounded-xl border text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all ${
                      errors.contact_role ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"
                    }`}
                  />
                  {errors.contact_role && (
                    <p className="text-xs text-red-500 font-medium">{errors.contact_role}</p>
                  )}
                </div>

                <div className="space-y-1.5" data-error={errors.contact_email || undefined}>
                  <label className="text-sm font-bold text-navy">
                    Email de contacto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.contact_email}
                    onChange={(e) => set("contact_email", e.target.value)}
                    placeholder="ana@universidad.edu"
                    className={`w-full h-11 px-4 rounded-xl border text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all ${
                      errors.contact_email ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"
                    }`}
                  />
                  {errors.contact_email && (
                    <p className="text-xs text-red-500 font-medium">{errors.contact_email}</p>
                  )}
                </div>

                <div className="space-y-1.5" data-error={errors.contact_phone || undefined}>
                  <label className="text-sm font-bold text-navy">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.contact_phone}
                    onChange={(e) => set("contact_phone", e.target.value)}
                    placeholder="+34 600 000 000"
                    className={`w-full h-11 px-4 rounded-xl border text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-talentia-blue transition-all ${
                      errors.contact_phone ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"
                    }`}
                  />
                  {errors.contact_phone && (
                    <p className="text-xs text-red-500 font-medium">{errors.contact_phone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label
                  data-error={errors.accepts_terms || undefined}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    errors.accepts_terms
                      ? "border-red-300 bg-red-50"
                      : form.accepts_terms
                      ? "border-talentia-blue bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.accepts_terms}
                    onChange={(e) => set("accepts_terms", e.target.checked)}
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
                {errors.accepts_terms && (
                  <p className="text-xs text-red-500 font-medium pl-4">{errors.accepts_terms}</p>
                )}

                <label
                  data-error={errors.accepts_privacy || undefined}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    errors.accepts_privacy
                      ? "border-red-300 bg-red-50"
                      : form.accepts_privacy
                      ? "border-talentia-blue bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.accepts_privacy}
                    onChange={(e) => set("accepts_privacy", e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-talentia-blue flex-shrink-0"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Acepto la{" "}
                    <Link href="/privacy" className="text-talentia-blue font-bold hover:underline">
                      Política de Privacidad
                    </Link>{" "}
                    y el tratamiento de los datos de mi institución.{" "}
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                {errors.accepts_privacy && (
                  <p className="text-xs text-red-500 font-medium pl-4">{errors.accepts_privacy}</p>
                )}

                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    form.accepts_marketing
                      ? "border-talentia-blue bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.accepts_marketing}
                    onChange={(e) => set("accepts_marketing", e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-talentia-blue flex-shrink-0"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Quiero recibir novedades, perfiles destacados y comunicaciones de FacultyMatch. (Opcional)
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
                      Registrar mi institución
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
                  Registrando tu institución y enviando confirmación por email...
                </p>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
