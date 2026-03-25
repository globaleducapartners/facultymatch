"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Logo } from "@/components/ui/Logo";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.resend({ type: "signup", email });
    setResent(true);
    setResending(false);
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block mb-8">
            <Logo />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto">
              <Mail size={32} className="text-energy-orange" />
            </div>
            <h1 className="text-2xl font-black text-navy">Confirma tu email</h1>
            <p className="text-gray-500 font-medium">Hemos enviado un email de verificación a:</p>
            {email && <p className="text-navy font-black text-lg break-all">{email}</p>}
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              Haz clic en el enlace del email para activar la cuenta de tu institución y acceder al panel.
              El enlace expira en 24 horas.
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
            <p className="text-sm font-medium text-navy leading-relaxed">
              Una vez confirmado, podrás empezar a buscar docentes verificados desde tu panel institucional.
              No tendrás que rellenar nada más.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={resending || resent}
              className="w-full py-3 rounded-xl border border-gray-200 text-sm font-bold text-navy hover:bg-gray-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {resending ? (
                <><Loader2 size={16} className="animate-spin" /> Enviando...</>
              ) : resent ? (
                <><CheckCircle2 size={16} className="text-green-500" /> Email reenviado ✓</>
              ) : (
                "Reenviar email de verificación"
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              <Link href="/signup/institution" className="hover:underline text-gray-500">
                ¿Email incorrecto? Volver al registro
              </Link>
            </p>

            <Link href="/login"
              className="block text-center text-sm font-bold text-talentia-blue hover:underline">
              ¿Ya confirmaste? Acceder →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InstitutionConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-talentia-blue" size={32} />
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
