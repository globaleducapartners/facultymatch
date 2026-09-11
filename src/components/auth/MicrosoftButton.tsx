"use client";

import { useState } from "react";
import { signInWithSSO } from "@/app/auth/actions";

const SANS = `var(--font-sans, system-ui, -apple-system, sans-serif)`;

function MicrosoftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
      <rect x="0" y="0" width="7.3" height="7.3" fill="#F25022" />
      <rect x="8.7" y="0" width="7.3" height="7.3" fill="#7FBA00" />
      <rect x="0" y="8.7" width="7.3" height="7.3" fill="#00A4EF" />
      <rect x="8.7" y="8.7" width="7.3" height="7.3" fill="#FFB900" />
    </svg>
  );
}

// Mismo mecanismo que GoogleButton.tsx — signInWithSSO ya admitía 'azure'
// desde que se escribió, solo faltaba un botón que lo llamara.
export function MicrosoftButton({
  next,
  intent,
  referralCode,
}: {
  next?: string;
  intent?: string;
  referralCode?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithSSO("azure", next, {
        ...(intent ? { intent } : {}),
        ...(referralCode ? { ref: referralCode } : {}),
      });
      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      if (result?.url) {
        window.location.href = result.url;
        return;
      }
      setError("No se pudo iniciar el acceso con Microsoft. Inténtalo de nuevo.");
      setLoading(false);
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        style={{
          fontFamily: SANS, width: "100%",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          background: "#FFFFFF", color: "#1F2937",
          border: "1px solid #D8E2EF", borderRadius: 8,
          padding: "11px 22px", fontSize: 14, fontWeight: 600,
          cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1,
          letterSpacing: "-0.01em",
        }}
      >
        <MicrosoftIcon />
        {loading ? "Conectando con Microsoft…" : "Continuar con Microsoft"}
      </button>
      {error && (
        <p style={{ fontFamily: SANS, fontSize: 12, color: "#DC2626", marginTop: 8, textAlign: "center" }}>
          {error}
        </p>
      )}
    </div>
  );
}
