"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Cookie } from "lucide-react";
import { getConsent, saveConsent, OPEN_COOKIE_SETTINGS_EVENT, type ConsentStatus } from "@/lib/consent";

// Aceptar y rechazar tienen exactamente el mismo aspecto y tamaño (la AEPD exige
// que rechazar sea tan fácil y visible como aceptar).
const choiceButton =
  "flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold text-white bg-navy rounded-xl hover:opacity-90 transition-opacity";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<ConsentStatus | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!getConsent()) {
      // Small delay so it doesn't flash on first load
      timer = setTimeout(() => setVisible(true), 1000);
    }
    // «Configurar cookies» (pie de página): reabre el aviso para cambiar la decisión.
    const reopen = () => {
      setCurrent(getConsent()?.status ?? null);
      setVisible(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
    };
  }, []);

  const choose = (status: ConsentStatus) => {
    saveConsent(status);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6" role="dialog" aria-label="Preferencias de cookies">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-black/10 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Cookie size={20} className="text-talentia-blue" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-navy text-sm">Tu privacidad y las cookies</p>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              En FacultyMatch (Grupo Global Educa SL) usamos cookies técnicas, necesarias para que la plataforma funcione.
              Si aceptas, activaremos también cookies de análisis (Google Analytics, a través de Google Tag Manager) y de
              publicidad (píxel de Meta, para medir nuestras campañas en Facebook e Instagram), con transferencia de datos
              a EE. UU., y la medición del origen de las visitas. Puedes rechazarlas sin perder ninguna función y cambiar tu
              decisión cuando quieras desde «Configurar cookies», al pie de la web. Más información en la{" "}
              <Link href="/cookies" className="text-talentia-blue hover:underline font-bold">
                Política de cookies
              </Link>
              .
              {current && (
                <span className="block mt-1 text-gray-400">
                  Tu decisión actual: {current === "accepted" ? "cookies de análisis y publicidad aceptadas" : "cookies de análisis y publicidad rechazadas"}.
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
          <button onClick={() => choose("rejected")} className={choiceButton}>
            Rechazar todas
          </button>
          <button onClick={() => choose("accepted")} className={choiceButton}>
            Aceptar todas
          </button>
          <button
            onClick={() => choose("rejected")}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar (equivale a rechazar las cookies opcionales)"
            title="Cerrar (equivale a rechazar las cookies opcionales)"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
