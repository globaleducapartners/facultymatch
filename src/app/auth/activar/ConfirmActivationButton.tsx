"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { confirmActivation } from "./actions";

const SANS = `'Inter', system-ui, -apple-system, sans-serif`;
const D = {
  blue: "#1B4FD8",
  white: "#FFFFFF",
  border: "#D8E2EF",
};

export function ConfirmActivationButton({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      // confirmActivation() redirects in every case (success or failure) —
      // Next.js's redirect() signals via a thrown error tagged with a
      // NEXT_REDIRECT digest, which its own client runtime intercepts to
      // perform the navigation. Only a genuinely unexpected failure (e.g.
      // a dropped connection) reaches the catch below.
      await confirmActivation(token);
    } catch (e: any) {
      if (typeof e?.digest === "string" && e.digest.startsWith("NEXT_REDIRECT")) {
        throw e; // let Next.js's own handling perform the navigation
      }
      setError("Error de red. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          fontFamily: SANS, width: "100%",
          background: loading ? D.border : D.blue,
          color: D.white, border: "none", padding: "14px 22px",
          borderRadius: 12, fontSize: 15, fontWeight: 800,
          cursor: loading ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        {loading ? (
          <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Activando...</>
        ) : (
          <><CheckCircle2 size={16} /> Activar mi cuenta</>
        )}
      </button>
      {error && (
        <p style={{ fontFamily: SANS, fontSize: 12, color: "#DC2626", marginTop: 10 }}>{error}</p>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
