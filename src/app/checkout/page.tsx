"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, CreditCard, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import type { PlanConfig } from "./plans";
import { PLANS } from "./plans";
import { createClient } from "@/lib/supabase-client";

// Stripe wordmark SVG (official colors)
const StripeLogo = () => (
  <svg height="20" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Stripe">
    <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V6.27h3.64l.15 1.02c.59-.47 1.6-1.24 3.34-1.24 2.97 0 5.73 2.58 5.73 7.17-.01 4.55-2.7 7.08-5.82 7.08zm-.95-9.38c-.86 0-1.48.29-1.93.77l.03 5.91c.42.44 1.03.73 1.9.73 1.46 0 2.45-1.61 2.45-3.71 0-2.12-.96-3.7-2.45-3.7zM28.24 5.07c-1.44 0-2.32-.73-2.32-1.89 0-1.15.9-1.88 2.32-1.88s2.3.73 2.3 1.88c0 1.16-.86 1.89-2.3 1.89zm2.06 15.1h-4.12V6.27h4.12v13.9zM18.55 20.3c-4.56 0-7.13-3.06-7.13-7.2C11.42 8.95 14 6.03 18.55 6.03c4.58 0 7.13 2.92 7.13 7.07 0 4.14-2.55 7.2-7.13 7.2zm0-3.49c1.58 0 2.54-1.42 2.54-3.71 0-2.3-.96-3.58-2.54-3.58-1.54 0-2.54 1.28-2.54 3.58 0 2.29.97 3.71 2.54 3.71zM10.27 6.94V6.27H6.19v13.9h4.12V12.6c0-2 2.3-2.58 3.08-2.58V6.03c-.9 0-2.44.39-3.12 1.96v-.05z" fill="#635BFF"/>
    <path d="M.14 6.94c0-1.15 1-2.12 2.12-2.12 1.15 0 2.12 1 2.12 2.12 0 .67-.33 1.27-.84 1.63l.6 4.33H1.38L2 8.57a2.12 2.12 0 0 1-1.86-1.63z" fill="#635BFF"/>
  </svg>
);

function CheckoutContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") || "faculty-pro";
  const plan: PlanConfig = PLANS[planId] || PLANS["faculty-pro"];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pre-warm auth check
    const supabase = createClient();
    supabase.auth.getUser();
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      let data: any = {};
      try { data = await res.json(); } catch { /* non-JSON response */ }
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || `Error ${res.status}: No se pudo conectar con la pasarela de pago.`);
        setLoading(false);
      }
    } catch {
      setError('Error de red. Verifica tu conexión e inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top bar */}
      <div className="border-b border-gray-100 bg-white px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-green-600">
            <Lock size={13} className="text-green-500" />
            Pago 100% seguro
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
            Powered by <StripeLogo />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-16 items-start">
        {/* Left: Order summary */}
        <div className="space-y-8">
          <div>
            <Link href={plan.backHref} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-navy transition-colors mb-6">
              <ArrowLeft size={16} /> Volver
            </Link>
            <h1 className="text-3xl font-black text-navy tracking-tight">Completa tu suscripción</h1>
            <p className="text-gray-500 font-medium mt-1">Accede a todas las funcionalidades de FacultyMatch.</p>
          </div>

          {/* Plan summary card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-talentia-blue mb-1">{plan.badge}</p>
                <h2 className="text-2xl font-black text-navy">{plan.name}</h2>
                <p className="text-gray-500 font-medium text-sm mt-1">{plan.description}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-navy">{plan.price}</p>
                <p className="text-xs text-gray-400 font-bold">{plan.period}</p>
              </div>
            </div>

            {plan.promo && (
              <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3">
                <p className="text-xs font-black text-energy-orange uppercase tracking-widest">{plan.promo}</p>
              </div>
            )}

            <div className="border-t border-gray-100 pt-6 space-y-3">
              {plan.features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-talentia-blue flex-shrink-0" />
                  <span className="text-sm font-medium text-navy">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, label: "Datos protegidos" },
              { icon: Lock, label: "SSL 256-bit" },
              { icon: CreditCard, label: "Sin permanencia" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center space-y-2">
                <Icon size={20} className="text-talentia-blue mx-auto" />
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Stripe checkout */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-navy">Método de pago</h3>
              <StripeLogo />
            </div>

            {/* Accepted cards */}
            <div className="flex items-center gap-2">
              {["VISA", "MC", "AMEX"].map(card => (
                <span key={card} className="text-[10px] font-black border border-gray-200 rounded px-2 py-1 text-gray-400 tracking-widest">{card}</span>
              ))}
              <span className="text-[10px] font-black border border-gray-200 rounded px-2 py-1 text-gray-400 tracking-widest"> Pay</span>
              <span className="text-[10px] font-black border border-gray-200 rounded px-2 py-1 text-gray-400 tracking-widest">GPay</span>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-start gap-3">
              <ShieldCheck size={18} className="text-talentia-blue flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-black text-navy">Pago procesado por Stripe</p>
                <p className="text-xs font-medium text-gray-500 mt-0.5">
                  Serás redirigido a la pasarela segura de Stripe para completar el pago con tarjeta, Apple Pay o Google Pay. FacultyMatch nunca almacena datos de tarjeta.
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:underline"
                >
                  <RefreshCw size={12} /> Intentar de nuevo
                </button>
              </div>
            )}

            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-energy-orange hover:bg-orange-600 text-white font-black h-14 rounded-xl text-base shadow-lg shadow-orange-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Redirigiendo a Stripe...
                </span>
              ) : (
                <>
                  <Lock size={18} className="mr-2" />
                  Pagar {plan.price} de forma segura
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 font-medium">
              <Lock size={11} className="text-green-500" />
              Cifrado SSL · Datos protegidos por Stripe
            </div>

            <p className="text-center text-xs text-gray-400 font-medium">
              ¿Necesitas ayuda?{" "}
              <a href="mailto:support@facultymatch.app" className="text-talentia-blue font-bold hover:underline">
                support@facultymatch.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-talentia-blue border-t-transparent" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
