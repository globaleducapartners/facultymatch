"use client";

import { Lock, MapPin } from "lucide-react";

// Tarjeta deliberadamente anónima: nunca recibe nombre ni biografía real (ver
// el select mínimo en src/lib/faculty-search.ts). Sirve para dos casos:
//  · perfiles aún sin verificar ("aquí hay alguien que viene de camino");
//  · perfiles verificados que eligieron "Solo instituciones" (estado "privado"),
//    que solo ven las cuentas de institución.
const STATE_LABEL: Record<string, string> = {
  pendiente_verificacion: "Cuenta recién creada",
  incompleto: "Completando su perfil",
  en_revision: "En revisión por nuestro equipo",
  privado: "Verificado",
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
  const isPrivate = pending.estado_perfil === "privado";
  const stateLabel = STATE_LABEL[pending.estado_perfil] || "Pendiente de verificación";

  return (
    <div className="flex h-full select-none flex-col overflow-hidden rounded-2xl border border-fm-border bg-fm-surface">
      <div className="relative">
        <div className="h-16 bg-[#DCE8FB]" />
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white bg-white shadow-sm">
            <Lock size={18} className="text-[#9DB0CF]" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-10 text-center">
        <h3 className="text-sm font-bold text-fm-ink">{isPrivate ? "Perfil privado" : "Perfil pendiente"}</h3>

        {pending.country && (
          <div className="flex items-center justify-center gap-1 text-[#5E6F8E]">
            <MapPin size={10} />
            <span className="truncate text-[11px] font-medium">{pending.country}</span>
          </div>
        )}

        {pending.area && (
          <p className="mx-auto max-w-[170px] line-clamp-2 text-[11px] font-bold text-[#5B6B85]">{pending.area}</p>
        )}

        <p className="px-1 text-[11px] leading-snug text-[#5B6B85]">
          {isPrivate
            ? "Este docente ha preferido conservar su privacidad. Solo las cuentas de institución pueden acceder a su perfil."
            : stateLabel}
        </p>

        <div className="flex-1" />

        <div className="mt-1 flex h-9 items-center justify-center gap-1.5 rounded-[10px] border border-fm-border bg-white text-[11px] font-bold text-[#5E6F8E]">
          <Lock size={11} /> {isPrivate ? "Solo instituciones" : "No disponible todavía"}
        </div>
      </div>
    </div>
  );
}
