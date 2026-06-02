"use client";

import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";

export function StripeCancelButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePortal = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido");
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "No se pudo abrir el portal. Escríbenos a support@facultymatch.app");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePortal}
        disabled={loading}
        className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <CreditCard size={14} />
        )}
        {loading ? "Abriendo portal..." : "Gestionar o cancelar suscripción"}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}
