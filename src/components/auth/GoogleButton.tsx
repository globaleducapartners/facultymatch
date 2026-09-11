"use client";

import { useState } from "react";
import { signInWithSSO } from "@/app/auth/actions";

const SANS = `var(--font-sans, system-ui, -apple-system, sans-serif)`;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9C16.66 14.2 17.64 11.9 17.64 9.2z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}

// Antes signInWithSSO() existía pero ningún botón lo llamaba — código muerto.
// Este componente lo conecta desde /login y /signup.
export function GoogleButton({
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
      const result = await signInWithSSO("google", next, {
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
      setError("No se pudo iniciar el acceso con Google. Inténtalo de nuevo.");
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
        <GoogleIcon />
        {loading ? "Conectando con Google…" : "Continuar con Google"}
      </button>
      {error && (
        <p style={{ fontFamily: SANS, fontSize: 12, color: "#DC2626", marginTop: 8, textAlign: "center" }}>
          {error}
        </p>
      )}
    </div>
  );
}
