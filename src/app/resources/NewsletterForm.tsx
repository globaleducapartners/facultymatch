"use client";

import { useState } from "react";

// Antes el input + botón "Suscribirme" no tenían ningún handler — el botón
// no hacía nada. Ahora envía a /api/newsletter (que ya existía).
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot anti-spam
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
        body: JSON.stringify({ email: email.trim(), website }),
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
      <div className="flex flex-col justify-center gap-2 rounded-[10px] border border-fm-blue/25 bg-fm-blue/[0.08] px-[18px] py-4 text-sm text-[#4B5A7A]">
        <span className="font-bold text-fm-navy">Suscripción confirmada.</span>
        Recibirás el próximo reporte mensual en tu correo.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col justify-center gap-3">
      {/* Honeypot anti-spam: invisible para personas */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu correo electrónico"
          aria-label="Tu correo electrónico"
          autoComplete="email"
          className="min-w-0 flex-1 rounded-[10px] border border-[#D8E2EF] bg-white px-4 py-3 text-base text-fm-ink outline-none placeholder:text-[#5E6F8E] focus:border-fm-blue"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="shrink-0 rounded-[10px] bg-fm-blue px-6 py-3 text-sm font-bold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
        >
          {state === "loading" ? "Enviando…" : "Suscribirme"}
        </button>
      </div>
      {state === "error" ? (
        <p className="text-center text-xs text-red-600">{errorMsg}</p>
      ) : (
        <p className="text-center text-xs text-[#5E6F8E]">
          Una vez al mes. Sin spam. Cancela cuando quieras.
        </p>
      )}
    </form>
  );
}
