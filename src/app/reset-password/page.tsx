"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Logo } from "@/components/ui/Logo";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.facultymatch.app'}/update-password`,
    });

    if (error) {
      setError("No hemos podido procesar tu solicitud. Verifica el email e inténtalo de nuevo.");
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block mb-8">
            <Logo />
          </Link>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-black text-navy">¡Email enviado!</h1>
            <p className="text-gray-500 font-medium leading-relaxed">
              Revisa tu bandeja de entrada en <strong className="text-navy">{email}</strong>.
              Te hemos enviado un enlace para restablecer tu contraseña.
            </p>
            <p className="text-xs text-gray-400">
              ¿No lo encuentras? Revisa la carpeta de spam.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-talentia-blue font-bold text-sm hover:underline mt-4"
            >
              <ArrowLeft size={16} /> Volver al acceso
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 space-y-6 shadow-sm">
            <div>
              <h1 className="text-2xl font-black text-navy">Recuperar contraseña</h1>
              <p className="text-gray-500 font-medium mt-1">
                Introduce tu email y te enviamos un enlace para crear una nueva contraseña.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                  Email profesional
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@universidad.edu"
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white
                             focus:ring-2 focus:ring-talentia-blue focus:border-transparent
                             outline-none transition-all font-medium text-navy shadow-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-talentia-blue hover:bg-blue-700 text-white
                           py-7 rounded-xl font-bold transition-all shadow-lg
                           shadow-blue-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Enviar enlace de recuperación"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500">
              <Link href="/login" className="text-talentia-blue font-bold hover:underline">
                ← Volver al acceso
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
