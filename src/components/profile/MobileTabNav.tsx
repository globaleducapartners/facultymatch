"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

const PROFILE_TABS = [
  { value: "basic",       label: "Datos básicos" },
  { value: "experience",  label: "Experiencia" },
  { value: "formacion",   label: "Formación" },
  { value: "idiomas",     label: "Idiomas" },
  { value: "research",    label: "Investigación" },
  { value: "documents",   label: "Documentos" },
  { value: "links",       label: "Enlaces" },
  { value: "preferences", label: "Contacto" },
];

export function MobileTabNav({ currentTab }: { currentTab: string }) {
  const router = useRouter();
  const idx = PROFILE_TABS.findIndex(t => t.value === currentTab);
  const step = idx === -1 ? 1 : idx + 1;

  return (
    <div className="md:hidden space-y-2">
      {/* Progress dots */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {step} / {PROFILE_TABS.length} secciones
        </span>
        <div className="flex gap-1">
          {PROFILE_TABS.map((t) => (
            <div
              key={t.value}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                t.value === currentTab
                  ? "w-6 bg-talentia-blue"
                  : "w-2 bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Styled select */}
      <div className="relative">
        <select
          value={currentTab}
          onChange={(e) => router.push(`?tab=${e.target.value}`)}
          className="w-full appearance-none bg-white border border-gray-200 rounded-2xl px-5 py-4 pr-12 text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-talentia-blue cursor-pointer shadow-sm"
        >
          {PROFILE_TABS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  );
}
