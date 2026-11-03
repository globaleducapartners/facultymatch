"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

// Tarjeta "Mejora tu perfil con IA" del inicio del docente (completitud < 70 %).
// Descartable: el primer cierre la oculta una semana; tras dos cierres no
// vuelve a aparecer.
const KEY = "fm_ai_improve_card";
const WEEK = 7 * 24 * 60 * 60 * 1000;

type State = { closes: number; until: number };

function read(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as State;
  } catch {}
  return { closes: 0, until: 0 };
}

export default function AiImproveCard({ progress }: { progress: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const s = read();
    setVisible(s.closes < 2 && Date.now() >= s.until);
  }, []);

  if (!visible) return null;

  function close() {
    const s = read();
    try {
      localStorage.setItem(KEY, JSON.stringify({ closes: s.closes + 1, until: Date.now() + WEEK }));
    } catch {}
    setVisible(false);
  }

  return (
    <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-fm-border bg-white p-5 pr-12 shadow-[0_18px_40px_-32px_rgba(13,34,64,0.3)]">
      <div className="min-w-0">
        <p className="text-sm font-bold text-fm-ink">Mejora tu perfil con IA</p>
        <p className="mt-0.5 text-sm text-[#5B6B85]">
          Tu perfil está al {progress}%. Sube tu CV y te proponemos cómo completarlo: tú eliges qué cambiar.
        </p>
      </div>
      <Link href="/app/faculty/profile?ia=1" className="shrink-0 rounded-[10px] bg-fm-blue px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90">
        Probar ahora
      </Link>
      <button onClick={close} aria-label="Cerrar" className="absolute right-3 top-3 rounded-md p-1 text-[#5E6F8E] hover:text-fm-ink">
        <X size={16} />
      </button>
    </div>
  );
}
