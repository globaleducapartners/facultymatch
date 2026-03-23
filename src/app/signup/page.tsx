"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { signUp, signInWithSSO } from "@/app/auth/actions";
import { School, UserCircle, Loader2, CheckCircle2, ArrowRight, GraduationCap, Building2, Star, Users, Globe2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";

function SignupContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "faculty";
  const isSSO = searchParams.get("new_sso") === "true";
  const [role, setRole] = useState<string>(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData, isSSO);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (isSSO) {
      setSuccess(true);
      setLoading(false);
    } else if (result?.success) {
      if (role === "institution") {
        window.location.href = "/onboarding/institution";
      } else {
        window.location.href = "/onboarding";
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-6 py-12 text-center">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100 space-y-6">
          <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-green-500 mx-auto">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-black text-navy">¡Perfil creado!</h1>
          <p className="text-gray-500 font-medium">Tu cuenta ha sido configurada. Ya puedes completar tu perfil.</p>
          <Link href={role === "faculty" ? "/onboarding" : "/onboarding/institution"}>
            <Button className="w-full bg-talentia-blue hover:bg-blue-700 text-white py-6 rounded-xl font-bold mt-4">
              Completar Perfil
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isFaculty = role === "faculty";

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10 relative overflow-hidden"
        style={{ background: isFaculty ? "#0F172A" : "#0F172A" }}
      >
        {/* Gradient accent */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: isFaculty
              ? "radial-gradient(ellipse at 30% 50%, #2563EB 0%, transparent 70%)"
              : "radial-gradient(ellipse at 30% 50%, #F97316 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10">
          <Logo variant="light" />
        </div>

        <div className="relative z-10 space-y-8">
          {isFaculty ? (
            <>
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-black uppercase tracking-widest">
                  <GraduationCap size={12} />
                  Red Docente Global
                </div>
                <h2 className="text-3xl font-black text-white leading-tight">
                  Tu próxima oportunidad académica te está esperando
                </h2>
                <p className="text-gray-400 font-medium leading-relaxed">
                  Conecta con universidades y escuelas de negocio en más de 30 países.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Star, text: "Perfil visible para 500+ instituciones" },
                  { icon: Globe2, text: "Oportunidades en España, LATAM y Europa" },
                  { icon: Users, text: "Red de 12.000+ docentes verificados" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <Icon size={15} />
                    </div>
                    <span className="text-gray-300 text-sm font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-[10px] font-black uppercase tracking-widest">
                  <Building2 size={12} />
                  Panel Institucional
                </div>
                <h2 className="text-3xl font-black text-white leading-tight">
                  Encuentra el talento académico que tu institución necesita
                </h2>
                <p className="text-gray-400 font-medium leading-relaxed">
                  Accede a perfiles verificados de docentes con experiencia internacional.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Star, text: "Filtros por área, idioma y disponibilidad" },
                  { icon: Globe2, text: "Docentes en 30+ países" },
                  { icon: Users, text: "Contacto directo con el docente" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                      <Icon size={15} />
                    </div>
                    <span className="text-gray-300 text-sm font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="relative z-10 text-[10px] text-gray-600 font-medium">
          © 2026 FacultyMatch · Todos los derechos reservados
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-[#F8FAFC]">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-navy tracking-tight">
              {isSSO ? "Completa tu perfil" : "Crea tu cuenta"}
            </h1>
            <p className="text-gray-500 font-medium">
              {isSSO ? "Solo un paso más para acceder a la red" : "Únete a la red líder en educación superior"}
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("faculty")}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                role === "faculty"
                  ? "border-talentia-blue bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {role === "faculty" && (
                <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-talentia-blue rounded-full flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-white" />
                </span>
              )}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${role === "faculty" ? "bg-talentia-blue" : "bg-gray-100"}`}>
                <UserCircle size={24} className={role === "faculty" ? "text-white" : "text-gray-400"} />
              </div>
              <div className="text-center">
                <p className={`font-black text-sm ${role === "faculty" ? "text-talentia-blue" : "text-navy"}`}>Soy docente</p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">Crea tu cuenta y completa tu perfil académico para aparecer en el directorio.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole("institution")}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                role === "institution"
                  ? "border-energy-orange bg-orange-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {role === "institution" && (
                <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-energy-orange rounded-full flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-white" />
                </span>
              )}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${role === "institution" ? "bg-energy-orange" : "bg-gray-100"}`}>
                <School size={24} className={role === "institution" ? "text-white" : "text-gray-400"} />
              </div>
              <div className="text-center">
                <p className={`font-black text-sm ${role === "institution" ? "text-energy-orange" : "text-navy"}`}>Soy institución</p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">Buscar talento docente</p>
              </div>
            </button>
          </div>

          {role === "faculty" && (
            <p className="text-xs text-center text-gray-400 mt-3">
              ¿Prefieres registrarte sin crear cuenta?{" "}
              <Link href="/apply" className="text-talentia-blue hover:underline font-bold">
                Envía tu perfil aquí
              </Link>
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="role" value={role} />

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                {role === "institution" ? "Nombre del responsable" : "Nombre completo"}
              </label>
              <input
                name="fullName"
                type="text"
                required
                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium text-navy"
                placeholder={role === "institution" ? "Ej: María González" : "Ej: Carlos Ruiz"}
              />
            </div>

            {role === "institution" && (
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Nombre de la institución</label>
                <input
                  name="institutionName"
                  type="text"
                  required
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-energy-orange focus:border-transparent outline-none transition-all font-medium text-navy"
                  placeholder="Ej: Universidad Global"
                />
              </div>
            )}

            {!isSSO && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Correo electrónico</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium text-navy"
                    placeholder="nombre@universidad.edu"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Contraseña</label>
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold">
                {error}
              </div>
            )}

            <div className="space-y-3 py-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="terms_accepted" required className="mt-0.5 w-4 h-4 rounded border-gray-300 text-talentia-blue focus:ring-talentia-blue cursor-pointer" />
                <span className="text-xs font-medium text-gray-500 leading-tight">
                  Acepto los{" "}
                  <Link href="/terms" className="text-talentia-blue hover:underline font-bold">Términos y Condiciones</Link>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="privacy_accepted" required className="mt-0.5 w-4 h-4 rounded border-gray-300 text-talentia-blue focus:ring-talentia-blue cursor-pointer" />
                <span className="text-xs font-medium text-gray-500 leading-tight">
                  Acepto la{" "}
                  <Link href="/privacy" className="text-talentia-blue hover:underline font-bold">Política de Privacidad</Link>{" "}
                  (GDPR)
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="marketing_opt_in" className="mt-0.5 w-4 h-4 rounded border-gray-300 text-talentia-blue focus:ring-talentia-blue cursor-pointer" />
                <span className="text-xs font-medium text-gray-500 leading-tight">
                  Deseo recibir comunicaciones académicas
                </span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={`w-full py-7 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 group text-white ${
                role === "institution"
                  ? "bg-energy-orange hover:bg-orange-600 shadow-orange-100"
                  : "bg-talentia-blue hover:bg-blue-700 shadow-blue-100"
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isSSO ? "Finalizar configuración" : "Crear cuenta"}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {!isSSO && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                  <span className="bg-[#F8FAFC] px-4 text-gray-400">O regístrate con</span>
                </div>
              </div>

              <Button
                variant="outline"
                type="button"
                onClick={async () => {
                  const result = await signInWithSSO("google", "/dashboard");
                  if (result?.url) window.location.href = result.url;
                  else if (result?.error) setError(result.error);
                }}
                className="w-full h-12 rounded-xl font-bold border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3 text-navy transition-all bg-white"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuar con Google
              </Button>
            </>
          )}

          <p className="text-center text-gray-500 text-xs font-medium">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-talentia-blue hover:underline font-bold">
              Acceder
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <Loader2 className="animate-spin text-talentia-blue" size={32} />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
