"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, CreditCard, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import type { PlanConfig } from "./plans";
import { PLANS } from "./plans";
import { createClient } from "@/lib/supabase-client";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") || "faculty-pro";
  const plan: PlanConfig = PLANS[planId] || PLANS["faculty-pro"];

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId, userEmail }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setError(data.error || 'Error al procesar el pago. Inténtalo de nuevo.');
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
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
          <Lock size={14} className="text-green-500" />
          Pago seguro
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
            <h3 className="text-xl font-black text-navy">Método de pago</h3>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-start gap-3">
              <ShieldCheck size={18} className="text-talentia-blue flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-black text-navy">Pago procesado por Stripe</p>
                <p className="text-xs font-medium text-gray-500 mt-0.5">
                  Serás redirigido a la pasarela segura de Stripe para completar el pago con tarjeta, Apple Pay o Google Pay.
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-700">{error}</p>
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

            <p className="text-center text-xs text-gray-400 font-medium">
              ¿Necesitas ayuda?{" "}
              <a href="https://wa.me/34616684214" target="_blank" rel="noopener noreferrer" className="text-talentia-blue font-bold hover:underline">
                Contacta por WhatsApp
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
