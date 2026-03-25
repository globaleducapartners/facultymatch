"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

interface Language {
  lang: string;
  level: string;
}

const CEFR_LEVELS = ["Nativo", "C2", "C1", "B2", "B1", "A2", "A1"];

interface Props {
  initialLanguages: Language[];
}

export function LanguageEditor({ initialLanguages }: Props) {
  const [languages, setLanguages] = useState<Language[]>(initialLanguages ?? []);
  const [newLang, setNewLang] = useState("");
  const [newLevel, setNewLevel] = useState("B2");

  const add = () => {
    const trimmed = newLang.trim();
    if (!trimmed) return;
    if (languages.some((l) => l.lang.toLowerCase() === trimmed.toLowerCase())) return;
    setLanguages([...languages, { lang: trimmed, level: newLevel }]);
    setNewLang("");
    setNewLevel("B2");
  };

  const remove = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name="languages" value={JSON.stringify(languages)} />

      {languages.length > 0 && (
        <div className="space-y-2">
          {languages.map((l, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-navy text-sm">{l.lang}</span>
                <span className="text-xs font-bold bg-white border border-blue-200 text-talentia-blue px-2 py-0.5 rounded-full">
                  {l.level}
                </span>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={newLang}
          onChange={(e) => setNewLang(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Ej: Inglés, Francés, Alemán..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none text-sm font-medium"
        />
        <select
          value={newLevel}
          onChange={(e) => setNewLevel(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none text-sm font-medium appearance-none"
        >
          {CEFR_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={add}
          className="px-4 py-2.5 bg-talentia-blue hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-1"
        >
          <Plus size={16} /> Añadir
        </button>
      </div>
      <p className="text-xs text-gray-400">
        Añade todos los idiomas en los que puedes impartir docencia.
      </p>
    </div>
  );
}
