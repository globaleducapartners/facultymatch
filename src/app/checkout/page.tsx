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

// Stripe wordmark SVG (official)
const StripeLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="58" height="22" viewBox="22 11 90 34" fillRule="evenodd" fill="#635BFF" aria-label="Stripe">
    <path d="M101.547 30.94c0-5.885-2.85-10.53-8.3-10.53-5.47 0-8.782 4.644-8.782 10.483 0 6.92 3.908 10.414 9.517 10.414 2.736 0 4.805-.62 6.368-1.494v-4.598c-1.563.782-3.356 1.264-5.632 1.264-2.23 0-4.207-.782-4.46-3.494h11.24c0-.3.046-1.494.046-2.046zM90.2 28.757c0-2.598 1.586-3.678 3.035-3.678 1.402 0 2.897 1.08 2.897 3.678zm-14.597-8.345c-2.253 0-3.7 1.057-4.506 1.793l-.3-1.425H65.73v26.805l5.747-1.218.023-6.506c.828.598 2.046 1.448 4.07 1.448 4.115 0 7.862-3.3 7.862-10.598-.023-6.667-3.816-10.3-7.84-10.3zm-1.38 15.84c-1.356 0-2.16-.483-2.713-1.08l-.023-8.53c.598-.667 1.425-1.126 2.736-1.126 2.092 0 3.54 2.345 3.54 5.356 0 3.08-1.425 5.38-3.54 5.38zm-16.4-17.196l5.77-1.24V13.15l-5.77 1.218zm0 1.747h5.77v20.115h-5.77zm-6.185 1.7l-.368-1.7h-4.966V40.92h5.747V27.286c1.356-1.77 3.655-1.448 4.368-1.195v-5.287c-.736-.276-3.425-.782-4.782 1.7zm-11.494-6.7L34.535 17l-.023 18.414c0 3.402 2.552 5.908 5.954 5.908 1.885 0 3.264-.345 4.023-.76v-4.667c-.736.3-4.368 1.356-4.368-2.046V25.7h4.368v-4.897h-4.37zm-15.54 10.828c0-.897.736-1.24 1.954-1.24a12.85 12.85 0 0 1 5.7 1.47V21.47c-1.908-.76-3.793-1.057-5.7-1.057-4.667 0-7.77 2.437-7.77 6.506 0 6.345 8.736 5.333 8.736 8.07 0 1.057-.92 1.402-2.207 1.402-1.908 0-4.345-.782-6.276-1.84v5.47c2.138.92 4.3 1.3 6.276 1.3 4.782 0 8.07-2.368 8.07-6.483-.023-6.85-8.782-5.632-8.782-8.207z"/>
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
