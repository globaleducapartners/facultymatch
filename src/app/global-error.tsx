"use client";

import { useEffect, useState } from "react";
import { autoReloadOnChunkError } from "@/lib/chunk-error";

// Red de seguridad para un fallo en el propio layout raíz (src/app/layout.tsx)
// — algo que src/app/error.tsx NO puede capturar, porque ese límite vive
// dentro del layout raíz, no fuera de él. Muy poco probable, pero sin esto
// ese caso concreto deja al usuario con una página en blanco sin ningún
// mensaje, sin recuperación posible salvo refrescar a mano.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    console.error("[global-error.tsx]", error);
    if (autoReloadOnChunkError(error)) {
      setReloading(true);
      return;
    }
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

  if (reloading) {
    return (
      <html lang="es">
        <body style={{ margin: 0 }} />
      </html>
    );
  }

  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
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
              Ha habido un problema al cargar la página. Ya lo hemos registrado.
            </p>
            <button
              onClick={() => reset()}
              style={{
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
          </div>
        </div>
      </body>
    </html>
  );
}
