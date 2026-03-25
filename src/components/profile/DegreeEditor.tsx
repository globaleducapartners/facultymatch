"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

interface Degree {
  type: string;
  field: string;
  university: string;
  year: string;
}

const DEGREE_TYPES = [
  "Grado / Licenciatura",
  "Máster / Postgrado",
  "Doctorado (PhD)",
  "Postdoctorado",
  "FP Superior / HND",
];

const emptyDegree: Degree = { type: "Máster / Postgrado", field: "", university: "", year: "" };

interface Props {
  initialDegrees: Degree[];
}

export function DegreeEditor({ initialDegrees }: Props) {
  const [degrees, setDegrees] = useState<Degree[]>(initialDegrees ?? []);
  const [newDegree, setNewDegree] = useState<Degree>({ ...emptyDegree });

  const add = () => {
    if (!newDegree.field.trim() || !newDegree.university.trim()) return;
    setDegrees([...degrees, { ...newDegree }]);
    setNewDegree({ ...emptyDegree });
  };

  const remove = (index: number) => {
    setDegrees(degrees.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name="degrees" value={JSON.stringify(degrees)} />

      {degrees.length > 0 && (
        <div className="space-y-3">
          {degrees.map((d, i) => (
            <div
              key={i}
              className="flex items-start justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black bg-white border border-blue-200 text-talentia-blue px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {d.type}
                  </span>
                  {d.year && (
                    <span className="text-xs text-gray-400 font-medium">{d.year}</span>
                  )}
                </div>
                <p className="font-bold text-navy text-sm mt-1">{d.field}</p>
                <p className="text-xs text-gray-500 font-medium">{d.university}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors shrink-0 ml-2"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border border-dashed border-gray-200 rounded-2xl p-4 space-y-3 bg-gray-50/50">
        <h5 className="text-xs font-black uppercase tracking-widest text-gray-400">Añadir titulación</h5>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500">Tipo</label>
            <select
              value={newDegree.type}
              onChange={(e) => setNewDegree({ ...newDegree, type: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-talentia-blue outline-none text-sm font-medium appearance-none"
            >
              {DEGREE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500">Año</label>
            <input
              type="number"
              value={newDegree.year}
              onChange={(e) => setNewDegree({ ...newDegree, year: e.target.value })}
              placeholder="Ej: 2018"
              min={1950}
              max={2030}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none text-sm font-medium"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500">Área / Especialidad</label>
          <input
            type="text"
            value={newDegree.field}
            onChange={(e) => setNewDegree({ ...newDegree, field: e.target.value })}
            placeholder="Ej: Finanzas Corporativas, Inteligencia Artificial..."
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none text-sm font-medium"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500">Universidad / Centro</label>
          <input
            type="text"
            value={newDegree.university}
            onChange={(e) => setNewDegree({ ...newDegree, university: e.target.value })}
            placeholder="Ej: Universidad Complutense de Madrid"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none text-sm font-medium"
          />
        </div>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-2 px-4 py-2.5 bg-talentia-blue hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors"
        >
          <Plus size={16} /> Añadir titulación
        </button>
      </div>
    </div>
  );
}
