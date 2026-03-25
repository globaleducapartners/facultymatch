"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn, signInWithSSO } from "@/app/auth/actions";
import { Loader2, ArrowRight, GraduationCap, ShieldCheck, Globe } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
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

  const handleGoogleSSO = async () => {
    setSsoLoading(true);
    setError(null);
    const result = await signInWithSSO('google', next || '/dashboard');
    if (result?.url) {
      window.location.href = result.url;
    } else if (result?.error) {
      setError(result.error);
      setSsoLoading(false);
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
                  : error || (urlErrorCode === 'unexpected_failure'
                      ? 'El inicio de sesión con Google falló. Por favor, inténtalo de nuevo.'
                      : 'Error de autenticación. Por favor, inténtalo de nuevo.')}
              </div>
            )}

          {/* Google SSO — primary CTA */}
          <Button
            type="button"
            onClick={handleGoogleSSO}
            disabled={ssoLoading}
            variant="outline"
            className="w-full h-14 rounded-xl font-bold border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3 text-navy text-base transition-all shadow-sm"
          >
            {ssoLoading ? <Loader2 className="animate-spin" size={20} /> : <GoogleIcon />}
            Continuar con Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-[11px] font-black uppercase tracking-widest">
              <span className="bg-[#F8FAFC] px-4 text-gray-400">O accede con correo</span>
            </div>
          </div>

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
