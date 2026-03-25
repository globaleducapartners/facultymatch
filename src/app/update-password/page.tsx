"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Logo } from "@/components/ui/Logo";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("No se pudo actualizar la contraseña. El enlace puede haber expirado. Solicita uno nuevo.");
      setLoading(false);
    } else {
      setDone(true);
      setTimeout(() => router.push("/login?message=Contraseña actualizada correctamente"), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block mb-8"><Logo /></Link>
        </div>

        {done ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-black text-navy">¡Contraseña actualizada!</h1>
            <p className="text-gray-500 font-medium">Redirigiendo al acceso...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 space-y-6 shadow-sm">
            <div>
              <h1 className="text-2xl font-black text-navy">Nueva contraseña</h1>
              <p className="text-gray-500 font-medium mt-1">
                Elige una contraseña segura para tu cuenta.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold">
                {error}
                {error.includes("expirado") && (
                  <Link href="/reset-password" className="block mt-2 underline">
                    Solicitar nuevo enlace
                  </Link>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white
                               focus:ring-2 focus:ring-talentia-blue focus:border-transparent
                               outline-none transition-all font-medium text-navy shadow-sm pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                  Confirmar contraseña
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white
                             focus:ring-2 focus:ring-talentia-blue focus:border-transparent
                             outline-none transition-all font-medium text-navy shadow-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !password || !confirm}
                className="w-full bg-talentia-blue hover:bg-blue-700 text-white
                           py-7 rounded-xl font-bold transition-all shadow-lg shadow-blue-100"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Guardar nueva contraseña"
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
