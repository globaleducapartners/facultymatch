"use client";

import { useFormStatus } from "react-dom";
import { Save, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export function InstitutionSaveButton() {
  const { pending } = useFormStatus();
  const [saved, setSaved] = useState(false);

  // When pending goes from true → false, show checkmark briefly
  useEffect(() => {
    if (!pending && saved) return; // already showing saved
  }, [pending, saved]);

  // Track when a submission completes
  const prevPending = usePrevious(pending);
  useEffect(() => {
    if (prevPending && !pending) {
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 2500);
      return () => clearTimeout(t);
    }
  }, [pending, prevPending]);

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 font-bold h-12 px-10 rounded-xl transition-all shadow-lg text-white text-sm"
      style={{
        background: saved ? "#059669" : pending ? "#6B7280" : "#1B4FD8",
        boxShadow: saved ? "0 4px 12px rgba(5,150,105,0.25)" : pending ? "none" : "0 4px 16px rgba(27,79,216,0.25)",
        cursor: pending ? "default" : "pointer",
        border: "none",
        transition: "background 0.25s, box-shadow 0.25s",
      }}
    >
      {pending ? (
        <><Loader2 size={16} className="animate-spin" /> Guardando…</>
      ) : saved ? (
        <><Check size={16} /> ¡Guardado correctamente!</>
      ) : (
        <><Save size={16} /> Guardar perfil institucional</>
      )}
    </button>
  );
}

// Tiny hook to track previous value
function usePrevious<T>(value: T): T | undefined {
  const [prev, setPrev] = useState<T | undefined>(undefined);
  useEffect(() => { setPrev(value); }, [value]);
  return prev;
}
