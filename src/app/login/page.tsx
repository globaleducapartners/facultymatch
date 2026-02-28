"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signInWithSSO } from "@/app/auth/actions";
import { School, Loader2, Globe, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-6 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <div className="bg-talentia-blue p-2 rounded-xl text-white shadow-lg shadow-blue-100">
              <Globe size={28} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-3xl font-black tracking-tight text-navy leading-none">Talentia</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Red Global de Talento Académico</span>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-navy tracking-tight">Bienvenido</h1>
          <p className="text-gray-500 font-medium mt-2">Accede a tu cuenta de Talentia</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-100">
          {message && (
            <div className="p-3.5 rounded-xl bg-green-50 border border-green-100 text-green-600 text-xs font-bold mb-6 text-center animate-in fade-in duration-500">
              {message}
            </div>
          )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Correo electrónico</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full px-5 py-3.5 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
                    placeholder="nombre@universidad.edu"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Contraseña</label>
                    <Link href="#" className="text-[10px] font-bold text-talentia-blue uppercase tracking-wider hover:underline">¿Olvidaste tu contraseña?</Link>
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full px-5 py-3.5 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold animate-in shake-100 duration-500">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-talentia-blue hover:bg-blue-700 text-white py-7 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 group"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    Acceder
                    <CustomArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="bg-white px-4 text-gray-400">O accede con</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={() => signInWithSSO('google')}
                className="h-14 rounded-xl font-bold border-gray-100 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button 
                variant="outline" 
                onClick={() => signInWithSSO('azure')}
                className="h-14 rounded-xl font-bold border-gray-100 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M13 1h10v10H13z"/><path fill="#05a6f0" d="M1 13h10v10H1z"/><path fill="#ffba08" d="M13 13h10v10H13z"/>
                </svg>
                Microsoft
              </Button>
            </div>

          <p className="text-center text-gray-500 text-xs font-bold uppercase tracking-widest mt-8">
            ¿No tienes cuenta?{" "}
            <Link href="/signup" className="text-talentia-blue hover:underline">
              Crear perfil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function CustomArrowRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
