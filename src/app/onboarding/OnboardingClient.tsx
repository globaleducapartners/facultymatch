"use client";

import { useState, useEffect } from "react";
import { saveOnboarding } from "@/app/auth/actions";
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Globe, 
  UserCircle, 
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
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";

const STEPS = [
  { id: 1, title: "Información Básica", icon: UserCircle },
  { id: 2, title: "Experiencia y Áreas", icon: Target },
  { id: 3, title: "Bio y Privacidad", icon: Eye },
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

const TEACHING_LEVELS = [
  "Grado",
  "Máster",
  "Doctorado",
  "Executive Education"
];

const LANGUAGE_LEVELS = [
  "Nativo",
  "C2 (Maestría)",
  "C1 (Avanzado)",
  "B2 (Intermedio-Alto)",
  "B1 (Intermedio)"
];

interface OnboardingClientProps {
  initialData: {
    profile: any;
    languages: { language: string, level: string }[];
    history: { institution: string, role: string, from: string, to: string }[];
    areas: string[];
    levels: string[];
  }
}

export default function OnboardingClient({ initialData }: OnboardingClientProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Custom states pre-filled with initialData
  const [languages, setLanguages] = useState<{ language: string, level: string }[]>(
    initialData.languages.length > 0 ? initialData.languages : [{ language: "", level: "" }]
  );
  const [teachingHistory, setTeachingHistory] = useState<{ institution: string, role: string, from: string, to: string }[]>(
    initialData.history.length > 0 ? initialData.history : [{ institution: "", role: "", from: "", to: "" }]
  );
  const [selectedLevels, setSelectedLevels] = useState<string[]>(initialData.levels);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(initialData.areas);
  const [areaSearch, setAreaSearch] = useState("");

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const addLanguage = () => setLanguages([...languages, { language: "", level: "" }]);
  const removeLanguage = (index: number) => setLanguages(languages.filter((_, i) => i !== index));
  const updateLanguage = (index: number, field: string, value: string) => {
    const newLangs = [...languages];
    newLangs[index] = { ...newLangs[index], [field]: value };
    setLanguages(newLangs);
  };

  const addHistory = () => setTeachingHistory([...teachingHistory, { institution: "", role: "", from: "", to: "" }]);
  const removeHistory = (index: number) => setTeachingHistory(teachingHistory.filter((_, i) => i !== index));
  const updateHistory = (index: number, field: string, value: string) => {
    const newHistory = [...teachingHistory];
    newHistory[index] = { ...newHistory[index], [field]: value };
    setTeachingHistory(newHistory);
  };

  const toggleLevel = (level: string) => {
    setSelectedLevels(prev => 
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const toggleArea = (area: string) => {
    setSelectedAreas(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const filteredAreas = AREAS.filter(area => 
    area.toLowerCase().includes(areaSearch.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < STEPS.length) {
      nextStep();
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    // Add custom field data as strings/arrays
    formData.append("languages", JSON.stringify(languages.filter(l => l.language)));
    formData.append("history", JSON.stringify(teachingHistory.filter(h => h.institution)));
    selectedLevels.forEach(level => formData.append("levels", level));
    selectedAreas.forEach(area => formData.append("areas", area));

    const result = await saveOnboarding(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-6 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-10">
        <Logo />
        <div className="flex items-center gap-2">
          {STEPS.map((s) => (
            <div 
              key={s.id}
              className={`h-1.5 w-8 rounded-full transition-all ${
                step >= s.id ? "bg-talentia-blue" : "bg-gray-100"
              }`}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-12 px-6">
        <div className="max-w-2xl w-full">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Basic Info + Languages + Levels */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-navy tracking-tight">Información Académica</h1>
                  <p className="text-gray-500 font-medium">Establece las bases de tu perfil profesional.</p>
                </div>

                <div className="grid gap-8">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Titular Académico</label>
                      <input 
                        name="headline"
                        required
                        defaultValue={initialData.profile.headline || ""}
                        placeholder="Ej: PhD en Economía Circular"
                        className="w-full px-5 py-3.5 rounded-xl border border-gray-100 bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">País / Ubicación</label>
                      <input 
                        name="location"
                        required
                        defaultValue={initialData.profile.location || ""}
                        placeholder="Ej: Madrid, España"
                        className="w-full px-5 py-3.5 rounded-xl border border-gray-100 bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Languages Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                        <Languages size={14} className="text-talentia-blue" />
                        Idiomas
                      </label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={addLanguage}
                        className="text-talentia-blue font-bold text-xs"
                      >
                        <Plus size={14} className="mr-1" /> Añadir otro
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {languages.map((lang, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                          <input 
                            placeholder="Idioma (Ej: Inglés)"
                            value={lang.language}
                            onChange={(e) => updateLanguage(idx, "language", e.target.value)}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-100 bg-white focus:ring-2 focus:ring-talentia-blue outline-none font-medium text-sm"
                          />
                          <select 
                            value={lang.level}
                            onChange={(e) => updateLanguage(idx, "level", e.target.value)}
                            className="w-40 px-4 py-3 rounded-xl border border-gray-100 bg-white focus:ring-2 focus:ring-talentia-blue outline-none font-medium text-sm appearance-none"
                          >
                            <option value="">Nivel...</option>
                            {LANGUAGE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                          {languages.length > 1 && (
                            <button type="button" onClick={() => removeLanguage(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Teaching Levels Chips */}
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                      <GraduationCap size={14} className="text-talentia-blue" />
                      Nivel Docente
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TEACHING_LEVELS.map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => toggleLevel(level)}
                          className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                            selectedLevels.includes(level) 
                              ? "bg-talentia-blue border-talentia-blue text-white shadow-lg shadow-blue-100" 
                              : "bg-white border-gray-100 text-gray-400 hover:border-talentia-blue hover:text-talentia-blue"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Areas & Teaching History */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-navy tracking-tight">Experiencia y Especialidad</h1>
                  <p className="text-gray-500 font-medium">Cuéntanos dónde has enseñado y en qué áreas destacas.</p>
                </div>

                <div className="grid gap-8">
                  {/* Areas with Search */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                        <Target size={14} className="text-talentia-blue" />
                        Áreas / Facultades
                      </label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          placeholder="Buscar áreas (Ej: Inteligencia Artificial...)"
                          value={areaSearch}
                          onChange={(e) => setAreaSearch(e.target.value)}
                          className="w-full pl-11 pr-5 py-3.5 rounded-xl border border-gray-100 bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {filteredAreas.map((area) => (
                        <label 
                          key={area}
                          onClick={() => toggleArea(area)}
                          className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all group ${
                            selectedAreas.includes(area) 
                              ? 'border-talentia-blue bg-blue-50/30' 
                              : 'bg-white border-gray-100 hover:border-talentia-blue'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                            selectedAreas.includes(area) ? 'bg-talentia-blue border-talentia-blue text-white' : 'border-gray-200'
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

                  {/* Teaching History */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                        <History size={14} className="text-talentia-blue" />
                        Historial Docente
                      </label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={addHistory}
                        className="text-talentia-blue font-bold text-xs"
                      >
                        <Plus size={14} className="mr-1" /> Añadir institución
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {teachingHistory.map((h, idx) => (
                        <div key={idx} className="p-5 bg-white border border-gray-100 rounded-2xl space-y-4 relative group">
                          {teachingHistory.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => removeHistory(idx)}
                              className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                          <div className="grid sm:grid-cols-2 gap-4">
                            <input 
                              placeholder="Institución / Centro"
                              value={h.institution}
                              onChange={(e) => updateHistory(idx, "institution", e.target.value)}
                              className="px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none font-bold text-sm"
                            />
                            <input 
                              placeholder="Rol (Ej: Profesor Asociado)"
                              value={h.role}
                              onChange={(e) => updateHistory(idx, "role", e.target.value)}
                              className="px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none font-medium text-sm"
                            />
                          </div>
                          <div className="flex gap-4 items-center">
                            <div className="flex-1 flex gap-2 items-center">
                              <input 
                                type="number"
                                placeholder="Desde (Año)"
                                value={h.from}
                                onChange={(e) => updateHistory(idx, "from", e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none font-medium text-sm"
                              />
                              <span className="text-gray-300">—</span>
                              <input 
                                type="number"
                                placeholder="Hasta (Opcional)"
                                value={h.to}
                                onChange={(e) => updateHistory(idx, "to", e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none font-medium text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Bio & Privacy */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-navy tracking-tight">Finaliza tu perfil</h1>
                  <p className="text-gray-500 font-medium">Añade una breve biografía y elige quién puede ver tu perfil.</p>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                      <FileText size={14} className="text-talentia-blue" />
                      Biografía Profesional
                    </label>
                    <textarea 
                      name="bio"
                      required
                      defaultValue={initialData.profile.bio || ""}
                      rows={6}
                      placeholder="Resume tu trayectoria académica, áreas de investigación y logros principales..."
                      className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Privacidad del Perfil</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex flex-col p-5 bg-white border border-gray-100 rounded-2xl cursor-pointer hover:border-talentia-blue transition-all group has-[:checked]:border-talentia-blue has-[:checked]:bg-blue-50/30">
                          <input type="radio" name="visibility" value="public" defaultChecked={initialData.profile.visibility === 'public'} className="hidden" />
                          <div className="flex items-center gap-2 mb-2">
                            <Eye size={18} className="text-talentia-blue" />
                            <span className="font-bold text-navy">Público</span>
                          </div>
                          <p className="text-xs text-gray-400 font-medium leading-relaxed">Visible para todas las instituciones verificadas en la red.</p>
                        </label>

                        <label className="flex flex-col p-5 bg-white border border-gray-100 rounded-2xl cursor-pointer hover:border-talentia-blue transition-all group has-[:checked]:border-talentia-blue has-[:checked]:bg-blue-50/30">
                          <input type="radio" name="visibility" value="hidden" defaultChecked={initialData.profile.visibility === 'hidden'} className="hidden" />
                          <div className="flex items-center gap-2 mb-2">
                            <EyeOff size={18} className="text-gray-400" />
                            <span className="font-bold text-navy">Privado</span>
                          </div>
                          <p className="text-xs text-gray-400 font-medium leading-relaxed">Sólo las instituciones que tú autorices podrán ver tu perfil completo.</p>
                        </label>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-100">
              <Button
                type="button"
                variant="ghost"
                onClick={prevStep}
                disabled={step === 1 || loading}
                className="font-bold text-gray-400 hover:text-navy disabled:opacity-0 transition-all flex items-center gap-2 px-0"
              >
                <ArrowLeft size={20} />
                Atrás
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="bg-talentia-blue hover:bg-navy text-white px-10 h-16 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 flex items-center gap-2 group transition-all"
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : (
                  <>
                    {step === STEPS.length ? "Guardar Cambios" : "Continuar"}
                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
