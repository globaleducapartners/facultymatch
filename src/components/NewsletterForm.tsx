"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function NewsletterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al suscribirse.");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al suscribirse.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 min-h-[240px] text-center">
        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
          <CheckCircle2 className="text-white" size={28} />
        </div>
        <p className="text-xl font-black text-white">¡Suscripción confirmada!</p>
        <p className="text-white/60 font-medium text-sm">Recibirás el próximo reporte mensual en tu correo.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] p-6 space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-white/60">Nombre</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dr. María González"
          className="w-full px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-tech-cyan font-medium"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-white/60">Correo institucional</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="nombre@universidad.edu"
          className="w-full px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-tech-cyan font-medium"
        />
      </div>
      {error && <p className="text-xs text-red-300 font-medium">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-energy-orange hover:bg-orange-500 text-white font-black h-14 rounded-xl text-base shadow-xl transition-all hover:scale-[1.02] disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Suscribiendo...
          </span>
        ) : (
          <>
            Suscribirme al Reporte Mensual
            <ArrowRight size={18} className="ml-2" />
          </>
        )}
      </Button>
    </form>
  );
}
