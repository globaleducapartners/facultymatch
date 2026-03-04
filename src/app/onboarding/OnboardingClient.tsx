"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { autosaveOnboarding, saveOnboarding } from "@/app/auth/actions";
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Globe, 
  Target,
  FileText,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Trash2,
  Languages,
  GraduationCap,
  History,
  Search,
  Linkedin,
  MapPin,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";

const LANGUAGES_OPTIONS = [
  { label: "Español", value: "ES" },
  { label: "Inglés", value: "EN" },
  { label: "Francés", value: "FR" },
  { label: "Portugués", value: "PT" },
  { label: "Italiano", value: "IT" },
  { label: "Alemán", value: "DE" },
  { label: "Chino", value: "ZH" },
  { label: "Otro", value: "OTHER" }
];

const AREAS = [
  "Business & Management",
  "Ingeniería & Tecnología",
  "Ciencias de la Salud",
  "Derecho & Política",
  "Educación",
  "Artes & Humanidades",
  "Ciencias Sociales",
  "Ciencias Naturales",
  "Inteligencia Artificial",
  "Sostenibilidad",
  "Economía",
  "Psicología"
];

const MODALITIES = [
  { id: "Presencial", label: "Presencial" },
  { id: "Online", label: "Online" },
  { id: "Híbrida", label: "Híbrida" }
];

interface OnboardingClientProps {
  initialData: {
    profile: any;
    languages: any[];
    history: any[];
    areas: string[];
    levels: string[];
  }
}

export default function OnboardingClient({ initialData }: OnboardingClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      full_name: initialData.profile.full_name || "",
      headline: initialData.profile.headline || "",
      location: initialData.profile.location || "",
      visibility: initialData.profile.visibility || "public",
      bio: initialData.profile.bio || "",
      availability: initialData.profile.availability || "",
      linkedin_url: initialData.profile.linkedin_url || "",
      languages: initialData.languages.length > 0 ? initialData.languages : [{ language: "", level: "Nativo" }],
      history: initialData.history.length > 0 ? initialData.history : [{ institution: "", role: "", from: "", to: "" }],
      faculty_areas: initialData.areas || [],
      levels: initialData.levels || [],
      modalities: initialData.profile.modalities || [],
      degrees: initialData.profile.degrees || [""]
    }
  });

  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
    control,
    name: "languages"
  });

  const { fields: historyFields, append: appendHistory, remove: removeHistory } = useFieldArray({
    control,
    name: "history"
  });

  const { fields: degreeFields, append: appendDegree, remove: removeDegree } = useFieldArray({
    control,
    name: "degrees" as any
  });

  const watchedFields = watch();
  const selectedAreas = watchedFields.faculty_areas;
  const selectedModalities = watchedFields.modalities;

  // Resume Logic: Skip to step 2 if step 1 essentials are filled
  useEffect(() => {
    const isStep1Complete = 
      initialData.profile.headline && 
      initialData.profile.location && 
      initialData.languages.length > 0;
    
    if (isStep1Complete) {
      setStep(2);
    }
  }, []);

  // Autosave Logic
  useEffect(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(async () => {
      const formData = new FormData();
      Object.entries(watchedFields).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (key === "languages" || key === "history") {
            formData.append(key, JSON.stringify(value));
          } else {
            value.forEach(v => formData.append(key, v));
          }
        } else {
          formData.append(key, value as string);
        }
      });

      setIsAutosaving(true);
      await autosaveOnboarding(formData);
      setIsAutosaving(false);
    }, 1200);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [watchedFields]);

  const onSubmit = async (data: any) => {
    if (step === 1) {
      setStep(2);
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (key === "languages" || key === "history") {
          formData.append(key, JSON.stringify(value));
        } else {
          value.forEach(v => formData.append(key, v as string));
        }
      } else {
        formData.append(key, value as string);
      }
    });

    const result = await saveOnboarding(formData);
    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Perfil completado con éxito");
      router.push("/app/faculty");
    }
  };

  const toggleArea = (area: string) => {
    const current = [...selectedAreas];
    const index = current.indexOf(area);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(area);
    }
    setValue("faculty_areas", current);
  };

  const toggleModality = (mod: string) => {
    const current = [...selectedModalities];
    const index = current.indexOf(mod);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(mod);
    }
    setValue("modalities", current);
  };

  const progress = step === 1 ? 50 : 100;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-talentia-blue/10 selection:text-talentia-blue">
      {/* Top Navigation & Progress */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 lg:px-12 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />
          
          <div className="flex flex-col items-center gap-2 flex-1 max-w-md px-8">
            <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-widest text-gray-400">
              <span>Paso {step}/2</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-talentia-blue shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "circOut" }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAutosaving && (
              <span className="text-[10px] font-bold text-gray-400 animate-pulse flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                Guardando...
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={() => router.push("/app/faculty")} className="text-gray-400 font-bold text-xs hover:text-navy">
              Saltar
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-12 px-6">
        <div className="max-w-2xl w-full">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-10"
                >
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-talentia-blue text-[10px] font-black uppercase tracking-widest">
                      <Sparkles size={12} />
                      Primeros Pasos
                    </div>
                    <h1 className="text-4xl font-black text-navy tracking-tight leading-tight">
                      Configura tu perfil <span className="text-talentia-blue">profesional</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg">Los campos marcados con * son imprescindibles para empezar.</p>
                  </div>

                  <div className="grid gap-8">
                    {/* Basic Info Group */}
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                          <UserCircle size={14} className="text-talentia-blue" />
                          Nombre Completo *
                        </label>
                        <input 
                          {...register("full_name", { required: true })}
                          placeholder="Tu nombre y apellidos"
                          className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-talentia-blue/10 focus:border-talentia-blue outline-none transition-all font-bold text-navy"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                          <Target size={14} className="text-talentia-blue" />
                          Titular Académico *
                        </label>
                        <input 
                          {...register("headline", { required: true })}
                          placeholder="Ej: PhD en Inteligencia Artificial aplicada a Finanzas"
                          className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-talentia-blue/10 focus:border-talentia-blue outline-none transition-all font-bold text-navy"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                            <MapPin size={14} className="text-talentia-blue" />
                            Ubicación *
                          </label>
                          <input 
                            {...register("location", { required: true })}
                            placeholder="Ej: Madrid, España"
                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-talentia-blue/10 focus:border-talentia-blue outline-none transition-all font-bold text-navy text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                            <Eye size={14} className="text-talentia-blue" />
                            Visibilidad
                          </label>
                          <select 
                            {...register("visibility")}
                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-talentia-blue/10 focus:border-talentia-blue outline-none transition-all font-bold text-navy text-sm appearance-none cursor-pointer"
                          >
                            <option value="public">Público</option>
                            <option value="hidden">Privado</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* GDPR Consent Section */}
                    <div className="space-y-4 p-6 bg-white border border-gray-100 rounded-[24px] shadow-sm">
                      <div className="flex items-start gap-3 cursor-pointer group">
                        <div className="pt-0.5">
                          <input 
                            type="checkbox" 
                            {...register("terms_accepted", { required: true })}
                            className="w-4 h-4 rounded border-gray-300 text-talentia-blue focus:ring-talentia-blue cursor-pointer transition-all"
                          />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tight text-gray-500 leading-tight group-hover:text-navy transition-colors">
                          Acepto los <Link href="/terms" className="text-talentia-blue hover:underline font-bold">Términos y Condiciones</Link> *
                        </span>
                      </div>
                      <div className="flex items-start gap-3 cursor-pointer group">
                        <div className="pt-0.5">
                          <input 
                            type="checkbox" 
                            {...register("privacy_accepted", { required: true })}
                            className="w-4 h-4 rounded border-gray-300 text-talentia-blue focus:ring-talentia-blue cursor-pointer transition-all"
                          />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tight text-gray-500 leading-tight group-hover:text-navy transition-colors">
                          Acepto la <Link href="/privacy" className="text-talentia-blue hover:underline font-bold">Política de Privacidad</Link> (GDPR) *
                        </span>
                      </div>
                    </div>

                    {/* Languages Multi-select Chips */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <Languages size={14} className="text-talentia-blue" />
                          Idiomas (Selecciona al menos uno) *
                        </label>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => appendLanguage({ language: "", level: "Nativo" })}
                          className="text-talentia-blue font-black text-[10px] uppercase tracking-tighter hover:bg-blue-50 rounded-full h-8"
                        >
                          <Plus size={14} className="mr-1" /> Añadir otro
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {languageFields.map((field, idx) => (
                          <motion.div 
                            layout
                            key={field.id} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex gap-3 items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm"
                          >
                            <select 
                              {...register(`languages.${idx}.language` as const, { required: true })}
                              className="flex-1 px-4 py-2.5 rounded-xl border-none bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none font-bold text-navy text-sm appearance-none cursor-pointer"
                            >
                              <option value="">Idioma...</option>
                              {LANGUAGES_OPTIONS.map(l => <option key={l.value} value={l.label}>{l.label}</option>)}
                            </select>
                            <select 
                              {...register(`languages.${idx}.level` as const)}
                              className="w-32 px-4 py-2.5 rounded-xl border-none bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none font-bold text-navy text-sm appearance-none cursor-pointer text-center"
                            >
                              <option value="Nativo">Nativo</option>
                              <option value="C2">C2</option>
                              <option value="C1">C1</option>
                              <option value="B2">B2</option>
                              <option value="B1">B1</option>
                            </select>
                            {languageFields.length > 1 && (
                              <button type="button" onClick={() => removeLanguage(idx)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                <Trash2 size={18} />
                              </button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-10"
                >
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-talentia-blue text-[10px] font-black uppercase tracking-widest">
                      <Sparkles size={12} />
                      Perfil Enriquecido
                    </div>
                    <h1 className="text-4xl font-black text-navy tracking-tight leading-tight">
                      Tu <span className="text-talentia-blue">experiencia</span> marca la diferencia
                    </h1>
                    <p className="text-gray-500 font-medium text-lg">Esta información es opcional pero ayuda a las instituciones a encontrarte.</p>
                  </div>

                  <div className="grid gap-10">
                    {/* Bio Section */}
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                        <FileText size={14} className="text-talentia-blue" />
                        Biografía Profesional
                      </label>
                      <textarea 
                        {...register("bio")}
                        rows={5}
                        placeholder="Resume tu trayectoria académica y logros..."
                        className="w-full px-6 py-5 rounded-[24px] border border-gray-100 bg-white focus:ring-4 focus:ring-talentia-blue/10 focus:border-talentia-blue outline-none transition-all font-medium text-navy resize-none leading-relaxed shadow-sm"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                      {/* LinkedIn URL */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                          <Linkedin size={14} className="text-talentia-blue" />
                          LinkedIn URL
                        </label>
                        <input 
                          {...register("linkedin_url")}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-white focus:ring-4 focus:ring-talentia-blue/10 focus:border-talentia-blue outline-none transition-all font-bold text-navy text-sm shadow-sm"
                        />
                      </div>
                      
                      {/* Availability */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                          <Globe size={14} className="text-talentia-blue" />
                          Disponibilidad
                        </label>
                        <input 
                          {...register("availability")}
                          placeholder="Ej: Inmediata, Tardes..."
                          className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-white focus:ring-4 focus:ring-talentia-blue/10 focus:border-talentia-blue outline-none transition-all font-bold text-navy text-sm shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Modalities Chips */}
                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                        <MapPin size={14} className="text-talentia-blue" />
                        Modalidades
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {MODALITIES.map(mod => (
                          <button
                            key={mod.id}
                            type="button"
                            onClick={() => toggleModality(mod.id)}
                            className={`px-6 py-3 rounded-2xl text-sm font-black transition-all border-2 ${
                              selectedModalities.includes(mod.id) 
                                ? "bg-talentia-blue border-talentia-blue text-white shadow-lg shadow-blue-200" 
                                : "bg-white border-gray-100 text-gray-400 hover:border-talentia-blue hover:text-talentia-blue"
                            }`}
                          >
                            {mod.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Areas Section */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                          <Target size={14} className="text-talentia-blue" />
                          Áreas de Especialidad
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {AREAS.map((area) => (
                          <label 
                            key={area}
                            onClick={() => toggleArea(area)}
                            className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all group ${
                              selectedAreas.includes(area) 
                                ? 'border-talentia-blue bg-blue-50/50' 
                                : 'bg-white border-gray-100 hover:border-talentia-blue'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                              selectedAreas.includes(area) ? 'bg-talentia-blue border-talentia-blue text-white' : 'border-gray-200 group-hover:border-talentia-blue'
                            }`}>
                              {selectedAreas.includes(area) && <CheckCircle2 size={12} />}
                            </div>
                            <span className={`font-bold transition-colors text-sm ${
                              selectedAreas.includes(area) ? 'text-talentia-blue' : 'text-navy group-hover:text-talentia-blue'
                            }`}>{area}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Degrees Section */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <GraduationCap size={14} className="text-talentia-blue" />
                          Titulaciones Academicas
                        </label>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => appendDegree("")}
                          className="text-talentia-blue font-black text-[10px] uppercase tracking-tighter hover:bg-blue-50 rounded-full h-8"
                        >
                          <Plus size={14} className="mr-1" /> Añadir otra
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {degreeFields.map((field, idx) => (
                          <motion.div 
                            layout
                            key={field.id} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex gap-3 items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm"
                          >
                            <input 
                              {...register(`degrees.${idx}` as any)}
                              placeholder="Ej: PhD en Inteligencia Artificial (MIT)"
                              className="flex-1 px-4 py-2.5 rounded-xl border-none bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none font-bold text-navy text-sm"
                            />
                            {degreeFields.length > 1 && (
                              <button type="button" onClick={() => removeDegree(idx)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                <Trash2 size={18} />
                              </button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Teaching History Section */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <History size={14} className="text-talentia-blue" />
                          Historial Docente
                        </label>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => appendHistory({ institution: "", role: "", from: "", to: "" })}
                          className="text-talentia-blue font-black text-[10px] uppercase tracking-tighter hover:bg-blue-50 rounded-full h-8"
                        >
                          <Plus size={14} className="mr-1" /> Añadir institución
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {historyFields.map((field, idx) => (
                          <motion.div 
                            layout
                            key={field.id} 
                            className="p-6 bg-white border border-gray-100 rounded-[24px] shadow-sm space-y-4 relative group"
                          >
                            {historyFields.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => removeHistory(idx)}
                                className="absolute top-4 right-4 p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Institución</span>
                                <input 
                                  {...register(`history.${idx}.institution` as const)}
                                  placeholder="Nombre de la universidad"
                                  className="w-full px-4 py-2.5 rounded-xl border-none bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none font-bold text-navy text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Rol</span>
                                <input 
                                  {...register(`history.${idx}.role` as const)}
                                  placeholder="Ej: Profesor Titular"
                                  className="w-full px-4 py-2.5 rounded-xl border-none bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none font-bold text-navy text-sm"
                                />
                              </div>
                            </div>
                            <div className="flex gap-4 items-center max-w-xs">
                              <input 
                                type="number"
                                {...register(`history.${idx}.from` as const)}
                                placeholder="Desde"
                                className="w-full px-4 py-2.5 rounded-xl border-none bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none font-bold text-navy text-sm text-center"
                              />
                              <span className="text-gray-300 font-bold">—</span>
                              <input 
                                type="number"
                                {...register(`history.${idx}.to` as const)}
                                placeholder="Hasta"
                                className="w-full px-4 py-2.5 rounded-xl border-none bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none font-bold text-navy text-sm text-center"
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sticky Navigation Footer */}
            <div className="flex items-center justify-between pt-10 border-t border-gray-100 bg-[#F8FAFC]/80 backdrop-blur-sm sticky bottom-0 pb-6 z-40">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                disabled={step === 1 || loading}
                className="font-black text-gray-400 hover:text-navy disabled:opacity-0 transition-all flex items-center gap-2 px-6 h-14 rounded-2xl"
              >
                <ArrowLeft size={20} />
                Atrás
              </Button>

              <div className="flex items-center gap-4">
                <p className="text-xs text-gray-400 font-bold hidden sm:block">
                  {step === 1 ? "Casi listo para continuar..." : "Tu perfil será visible para instituciones verificadas."}
                </p>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-talentia-blue hover:bg-navy text-white px-12 h-16 rounded-[24px] font-black text-lg shadow-2xl shadow-blue-200 flex items-center gap-3 group transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? <Loader2 size={24} className="animate-spin" /> : (
                    <>
                      {step === 1 ? "Continuar" : "Finalizar Perfil"}
                      <ArrowRight size={24} className="group-hover:translate-x-1.5 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
