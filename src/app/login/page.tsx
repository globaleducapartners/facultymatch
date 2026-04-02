"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "@/app/auth/actions";
import { Loader2, ArrowRight, GraduationCap, ShieldCheck, Globe } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const next = searchParams.get("next");
  const urlError = searchParams.get("error");
  const urlErrorCode = searchParams.get("error_code");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Image panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-navy flex-col justify-between p-14 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200"
            alt="Docente en aula"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/95 to-talentia-blue/60"></div>
        </div>
          <div className="relative z-10">
            <Link href="/">
              <Logo variant="light" />
            </Link>
          </div>
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white leading-tight">
              La red global del talento académico.
            </h2>
            <p className="text-white/60 font-medium text-lg leading-relaxed">
              Conecta con universidades e instituciones de más de 40 países. Gestiona tu carrera académica desde un solo lugar.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: GraduationCap, text: "Perfil académico verificado" },
              { icon: ShieldCheck, text: "Privacidad y control total" },
              { icon: Globe, text: "Red global de instituciones" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/70">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-tech-cyan" />
                </div>
                <span className="font-bold text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest">© 2026 Grupo Global Educa SL</p>
        </div>
      </div>

      {/* Right: Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <Link href="/">
              <Logo />
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-black text-navy tracking-tight">Bienvenido de nuevo</h1>
            <p className="text-gray-500 font-medium mt-1">Accede a tu cuenta de FacultyMatch</p>
          </div>

            {message && (
              <div className="p-3.5 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-bold animate-in fade-in duration-500">
                {message}
              </div>
            )}

            {(error || urlError) && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold animate-in fade-in duration-500">
                {error?.toLowerCase().includes("email not confirmed")
                  ? "Debes confirmar tu email antes de acceder. Revisa tu bandeja de entrada."
                  : error || 'Error de autenticación. Por favor, inténtalo de nuevo.'}
              </div>
            )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="hidden" name="next" value={next || ""} />

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Correo electrónico</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium text-navy shadow-sm"
                placeholder="nombre@universidad.edu"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500">Contraseña</label>
                <Link href="/reset-password" className="text-[11px] font-bold text-talentia-blue hover:underline">¿Olvidaste tu contraseña?</Link>
              </div>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium shadow-sm"
                placeholder="••••••••"
              />
            </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-talentia-blue hover:bg-blue-700 text-white py-7 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 group"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    Acceder
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>


          <p className="text-center text-gray-500 text-sm font-medium">
            ¿No tienes cuenta?{" "}
            <Link href="/signup" className="text-talentia-blue font-bold hover:underline">
              Crear perfil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-talentia-blue" size={32} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
