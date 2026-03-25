"use client";

import { useState } from "react";
import { UNESCO_FIELDS } from "@/lib/unesco-fields";
import { Button } from "@/components/ui/button";

interface Props {
  action: (formData: FormData) => Promise<void>;
}

export function SpecialtyForm({ action }: Props) {
  const [selectedArea, setSelectedArea] = useState("");

  const subareas =
    UNESCO_FIELDS.find((f) => f.label === selectedArea)?.subareas ?? [];

  return (
    <form action={action} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
            Área Principal (UNESCO)
          </label>
          <select
            name="area"
            required
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium appearance-none"
          >
            <option value="">Selecciona un área...</option>
            {UNESCO_FIELDS.map((f) => (
              <option key={f.code} value={f.label}>
                {f.code}. {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
            Subárea
          </label>
          <select
            name="subarea"
            disabled={!selectedArea}
            className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium appearance-none disabled:opacity-50"
          >
            <option value="">
              {selectedArea ? "Selecciona una subárea..." : "Primero elige un área"}
            </option>
            {subareas.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
          Temas / Topics (separados por coma)
        </label>
        <input
          name="topics"
          type="text"
          placeholder="Ej: SEO, Marketing de contenidos, Growth Hacking"
          className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
        />
      </div>

      <Button
        type="submit"
        disabled={!selectedArea}
        className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-xl transition-all shadow-lg shadow-blue-100 w-full md:w-auto disabled:opacity-50"
      >
        Añadir especialidad
      </Button>
    </form>
  );
}
