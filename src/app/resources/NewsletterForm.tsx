"use client";

import { useState } from "react";

// Antes el input + botón "Suscribirme" no tenían ningún handler — el botón
// no hacía nada. Ahora envía a /api/newsletter (que ya existía).
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || state === "loading") return;
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("error");
        setErrorMsg(data?.error || "No se pudo completar. Inténtalo de nuevo.");
        return;
      }
      setState("ok");
      setEmail("");
    } catch {
      setState("error");
      setErrorMsg("Error de red. Inténtalo de nuevo.");
    }
  }

  if (state === "ok") {
    return (
      <div className="flex flex-col justify-center gap-2 rounded-[9px] border border-fm-blue/25 bg-fm-blue/[0.12] px-[18px] py-4 text-sm text-white/85">
        <span className="font-bold text-white">Suscripción confirmada.</span>
        Recibirás el próximo reporte mensual en tu correo.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col justify-center gap-3">
      <div className="flex overflow-hidden rounded-[9px] border border-white/15 bg-white/[0.07]">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu correo electrónico"
          className="flex-1 bg-transparent px-[18px] py-3.5 text-sm text-white outline-none placeholder:text-white/40"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="shrink-0 bg-fm-blue px-[22px] text-[13px] font-bold tracking-[-0.01em] text-white disabled:opacity-60"
        >
          {state === "loading" ? "Enviando…" : "Suscribirme"}
        </button>
      </div>
      {state === "error" ? (
        <p className="text-center text-[11px] text-red-300">{errorMsg}</p>
      ) : (
        <p className="text-center text-[11px] text-white/25">
          Una vez al mes. Sin spam. Cancela cuando quieras.
        </p>
      )}
    </form>
  );
}
