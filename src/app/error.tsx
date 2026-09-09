"use client";

import { useEffect } from "react";

const SANS = `'Inter', system-ui, -apple-system, sans-serif`;

// Límite de error para todo el contenido de la app (todo lo que cuelga de
// src/app/layout.tsx). Sin esto, un fallo de React en cualquier página —
// incluida /app/faculty/onboarding, la pantalla en blanco que reportó
// Miguel — dejaba al usuario con una página completamente en blanco y sin
// forma de saber que algo había fallado, salvo refrescar a mano. Ahora se
// ve un mensaje claro con un botón para reintentar, y queda registrado
// (ver /api/log-client-error) en vez de desaparecer sin dejar rastro.
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error.tsx]", error);
    fetch("/api/log-client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        digest: error.digest,
        url: typeof window !== "undefined" ? window.location.href : undefined,
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <div
      style={{
        fontFamily: SANS,
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0D2240", margin: "0 0 10px" }}>
          Algo ha ido mal
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 24px", lineHeight: 1.6 }}>
          Ha habido un problema al cargar esta página. Puedes intentarlo de nuevo — si sigue
          pasando, ya lo hemos registrado y lo estamos revisando.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" as const }}>
          <button
            onClick={() => reset()}
            style={{
              fontFamily: SANS,
              background: "#1B4FD8",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
          <button
            onClick={() => { window.location.href = "/app"; }}
            style={{
              fontFamily: SANS,
              background: "#fff",
              color: "#0D2240",
              border: "1px solid #D8E2EF",
              padding: "12px 24px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
