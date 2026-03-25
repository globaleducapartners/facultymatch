"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface Props {
  userEmail: string;
}

export function StripeUpgradeButton({ userEmail }: Props) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ plan: "faculty-pro", userEmail }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Not available");
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      window.location.href = "mailto:support@facultymatch.app?subject=Upgrade%20to%20Pro";
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-talentia-blue to-blue-600 hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 text-white font-black h-12 rounded-xl transition-all shadow-lg shadow-blue-100 uppercase tracking-widest text-xs"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Sparkles size={16} />
      )}
      Actualizar al Plan Profesional
    </button>
  );
}
