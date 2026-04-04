import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Zap, Star } from "lucide-react";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("plan, subscription_status, subscription_current_period_end")
    .eq("id", user.id)
    .single();

  const isPro = profile?.plan === "institution-pro" && profile?.subscription_status === "active";
  const periodEnd = profile?.subscription_current_period_end
    ? new Date(profile.subscription_current_period_end).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const essentialFeatures = [
    "Visualización básica de perfiles de docentes (sin datos de contacto)",
    "2 búsquedas al mes",
    "1 usuario por cuenta",
    "Soporte por email",
  ];

  const proFeatures = [
    "Búsquedas ilimitadas",
    "Filtros avanzados (Doctorado, Idioma, Disponibilidad, Modalidad)",
    "Acceso a datos de contacto de docentes verificados",
    "Hasta 3 usuarios en la misma cuenta institucional",
    "Soporte prioritario",
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-navy">Plan & Facturación</h1>
        <p className="text-gray-500 font-medium">Gestiona tu suscripción.</p>
      </div>

      {isPro ? (
        /* ── Pro active: single highlighted card ── */
        <div className="max-w-md">
          <div className="relative bg-white rounded-2xl border-2 border-blue-600 p-8 shadow-sm space-y-6">
            <div className="absolute -top-3 left-6">
              <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                <Zap size={11} /> Activo
              </span>
            </div>
            <div>
              <p className="font-black text-navy text-xl">Plan Professional</p>
              <p className="text-blue-600 font-bold text-sm mt-0.5">99€/mes</p>
              {periodEnd && (
                <p className="text-xs text-gray-400 mt-1">Próxima renovación: {periodEnd}</p>
              )}
            </div>
            <div className="space-y-3 pt-1">
              {proFeatures.map((f) => (
                <div key={f} className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{f}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 pt-2">
              Para cancelar o modificar tu suscripción escríbenos a{" "}
              <a href="mailto:support@facultymatch.app" className="text-blue-600 font-bold">
                support@facultymatch.app
              </a>
            </p>
          </div>
        </div>
      ) : (
        /* ── Essential: two-column comparison ── */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            {/* Essential card */}
            <div className="relative bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
              <div className="absolute -top-3 left-6">
                <span className="bg-gray-100 text-gray-600 text-xs font-black px-3 py-1 rounded-full border border-gray-200">
                  Tu plan actual
                </span>
              </div>
              <div>
                <p className="font-black text-navy text-xl">Plan Essential</p>
                <p className="text-gray-400 font-semibold text-sm mt-0.5">Gratuito</p>
              </div>
              <div className="space-y-3 pt-1">
                {essentialFeatures.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-500">{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/checkout?plan=institution-pro"
                className="inline-flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-3 rounded-xl text-sm transition-colors"
              >
                Activar Plan Professional — 99€/mes
              </Link>
            </div>

            {/* Professional card */}
            <div className="relative bg-white rounded-2xl border-2 border-blue-600 p-8 space-y-6 shadow-sm">
              <div className="absolute -top-3 left-6">
                <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                  <Star size={11} /> Recomendado
                </span>
              </div>
              <div>
                <p className="font-black text-navy text-xl">Plan Professional</p>
                <p className="text-blue-600 font-bold text-sm mt-0.5">99€/mes</p>
              </div>
              <div className="space-y-3 pt-1">
                {proFeatures.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/checkout?plan=institution-pro"
                className="inline-flex items-center justify-center w-full bg-[#1d4ed8] hover:bg-blue-700 text-white font-black py-3 rounded-xl text-sm transition-colors"
              >
                Activar ahora — 99€/mes
              </Link>
            </div>
          </div>

          <p className="text-xs text-gray-400 max-w-3xl">
            ¿Necesitas una solución para tu organización? Escríbenos a{" "}
            <a href="mailto:support@facultymatch.app" className="text-blue-500 hover:underline">
              support@facultymatch.app
            </a>
          </p>
        </>
      )}
    </div>
  );
}
