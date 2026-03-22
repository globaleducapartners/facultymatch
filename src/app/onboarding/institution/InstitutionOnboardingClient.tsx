"use client";

import { useState } from "react";
import { saveInstitutionOnboarding } from "@/app/auth/actions";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Building2,
  Globe,
  MapPin,
  FileText,
  ArrowRight,
  Loader2,
  Sparkles,
  Link as LinkIcon,
  Mail,
  CheckCircle2,
} from "lucide-react";

const INSTITUTION_TYPES = [
  { id: "university", label: "Universidad" },
  { id: "business_school", label: "Business School" },
  { id: "institute", label: "Instituto / Centro" },
  { id: "online_platform", label: "Plataforma Online" },
  { id: "corporate", label: "Formación Corporativa" },
  { id: "other", label: "Otro" },
];

interface Props {
  userId: string;
  userEmail: string;
  contactName: string;
  institution: any;
}

export default function InstitutionOnboardingClient({
  userId,
  userEmail,
  contactName,
  institution,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: institution?.name || "",
    type: institution?.type || "university",
    country: institution?.country || "",
    location: institution?.location || "",
    website: institution?.website || "",
    description: institution?.description || "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("El nombre de la institución es obligatorio.");
      return;
    }
    setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    const result = await saveInstitutionOnboarding(fd);

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

      toast.success("¡Perfil institucional creado!");
      window.location.href = "/app/institution";
    };

  const initials = contactName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 lg:px-12 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <Logo />
          <div className="flex flex-col items-center gap-1.5 flex-1 max-w-sm">
            <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-widest text-gray-400">
              <span>Perfil Institucional</span>
              <span>1 paso</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-energy-orange"
                initial={{ width: 0 }}
                animate={{ width: "60%" }}
                transition={{ duration: 0.5, ease: "circOut" }}
              />
            </div>
          </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const fd = new FormData();
                fd.append("name", form.name || "Mi Institución");
                Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
                await saveInstitutionOnboarding(fd);
                window.location.href = "/app/institution";
              }}
              className="text-gray-400 font-bold text-xs hover:text-navy shrink-0"
            >
              Saltar
            </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-12 px-6 pb-8">
        <div className="max-w-2xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-10"
          >
            {/* Title */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-energy-orange text-[10px] font-black uppercase tracking-widest">
                <Sparkles size={12} />
                Perfil Institucional
              </div>
              <h1 className="text-4xl font-black text-navy tracking-tight leading-tight">
                Configura tu <span className="text-energy-orange">institución</span>
              </h1>
              <p className="text-gray-500 font-medium text-lg">
                Los docentes verán esta información. Complétala para atraer el mejor talento.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Main info */}
              <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                    <Building2 size={14} className="text-energy-orange" />
                    Nombre de la institución *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    required
                    placeholder="Ej: UCAM Universidad Católica de Murcia"
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-energy-orange outline-none transition-all font-bold text-navy"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                      <Building2 size={14} className="text-energy-orange" />
                      Tipo de institución
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => set("type", e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-energy-orange outline-none transition-all font-bold text-navy appearance-none cursor-pointer"
                    >
                      {INSTITUTION_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                      <Globe size={14} className="text-energy-orange" />
                      País
                    </label>
                    <input
                      value={form.country}
                      onChange={(e) => set("country", e.target.value)}
                      placeholder="Ej: España"
                      className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-energy-orange outline-none transition-all font-bold text-navy text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                    <MapPin size={14} className="text-energy-orange" />
                    Ciudad / Localización
                  </label>
                  <input
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="Ej: Madrid, España"
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-energy-orange outline-none transition-all font-bold text-navy text-sm"
                  />
                </div>
              </div>

              {/* Online presence */}
              <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Globe size={14} className="text-energy-orange" />
                  Presencia digital
                </h3>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                    <LinkIcon size={14} className="text-energy-orange" />
                    Web institucional
                  </label>
                  <input
                    value={form.website}
                    onChange={(e) => set("website", e.target.value)}
                    placeholder="https://www.tuuniversidad.edu"
                    type="url"
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-energy-orange outline-none transition-all font-bold text-navy text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <FileText size={14} className="text-energy-orange" />
                  Descripción institucional
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={5}
                  placeholder="Describe brevemente tu institución, programas académicos y el perfil de docentes que buscas..."
                  className="w-full px-6 py-5 rounded-[24px] border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-energy-orange outline-none transition-all font-medium text-navy resize-none leading-relaxed"
                />
              </div>

              {/* Contact info */}
              <div className="bg-orange-50/50 p-6 rounded-[24px] border border-orange-100 space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-energy-orange flex items-center gap-2">
                  <Mail size={14} />
                  Persona de contacto
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-energy-orange/10 flex items-center justify-center text-energy-orange font-black text-sm shrink-0">
                    {initials}
                  </div>
                  <div>
                    <p className="font-bold text-navy text-sm">{contactName}</p>
                    <p className="text-xs text-gray-400">{userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={async () => {
                      // Mark onboarding complete even when skipping
                      const fd = new FormData();
                      fd.append("name", form.name || "Mi Institución");
                      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
                      await saveInstitutionOnboarding(fd);
                      window.location.href = "/app/institution";
                    }}
                    className="text-gray-400 font-bold hover:text-navy"
                  >
                    Completar después
                  </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-energy-orange hover:bg-orange-600 text-white px-12 h-16 rounded-[24px] font-black text-lg shadow-2xl shadow-orange-200 flex items-center gap-3 group transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      Acceder al Panel
                      <ArrowRight
                        size={24}
                        className="group-hover:translate-x-1.5 transition-transform"
                      />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
