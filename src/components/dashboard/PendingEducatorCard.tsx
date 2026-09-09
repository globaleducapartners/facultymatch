"use client";

import { Lock, MapPin } from "lucide-react";

// Tarjeta deliberadamente anónima: nunca recibe nombre ni biografía real (ver
// el select mínimo en institution/search/page.tsx) — solo transmite "aquí
// hay alguien todavía sin verificar", nunca datos identificables de una
// persona que ni siquiera ha pasado la revisión.
const STATE_LABEL: Record<string, string> = {
  pendiente_verificacion: "Cuenta recién creada",
  incompleto: "Completando su perfil",
  en_revision: "En revisión por nuestro equipo",
};

interface PendingEducatorCardProps {
  pending: {
    id: string;
    estado_perfil: string;
    area: string | null;
    country: string | null;
  };
}

export function PendingEducatorCard({ pending }: PendingEducatorCardProps) {
  const stateLabel = STATE_LABEL[pending.estado_perfil] || "Pendiente de verificación";

  return (
    <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 overflow-hidden h-full flex flex-col select-none">
      {/* Cover + avatar placeholder */}
      <div className="relative">
        <div className="h-16 bg-gray-200" />
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-8">
          <div className="w-16 h-16 rounded-full border-[3px] border-white shadow bg-gray-300 flex items-center justify-center">
            <Lock size={18} className="text-gray-400" />
          </div>
        </div>
      </div>

      <div className="pt-10 px-4 pb-4 flex flex-col gap-2 flex-1 text-center">
        <h3 className="text-sm font-black text-gray-400">Perfil pendiente</h3>

        {/* Barras "borrosas" en vez de texto real — no hay bio que mostrar */}
        <div className="flex flex-col items-center gap-1.5 py-1">
          <div className="h-2 w-4/5 bg-gray-200 rounded-full" />
          <div className="h-2 w-3/5 bg-gray-200 rounded-full" />
        </div>

        {pending.country && (
          <div className="flex items-center justify-center gap-1 text-gray-300">
            <MapPin size={10} />
            <span className="text-[11px] font-medium truncate">{pending.country}</span>
          </div>
        )}

        {pending.area && (
          <div className="flex justify-center mt-1">
            <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-lg truncate max-w-[140px]">
              {pending.area}
            </span>
          </div>
        )}

        <div className="flex-1" />

        <div className="mt-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full inline-block">
            {stateLabel}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-gray-200 bg-white text-[11px] font-bold text-gray-400">
          <Lock size={11} /> No disponible todavía
        </div>
      </div>
    </div>
  );
}
