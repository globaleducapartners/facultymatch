import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Zap, Star, Mail } from "lucide-react";
import { StripeCancelButton } from "@/components/profile/StripeCancelButton";
import { formatDateTZ } from "@/lib/utils";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("plan, subscription_status, subscription_current_period_end")
    .eq("id", user.id)
    .single();

  const isPro     = profile?.plan === "institution-pro"    && profile?.subscription_status === "active";
  const isGrowth  = profile?.plan === "institution-growth" && profile?.subscription_status === "active";
  const isEssential = !isPro && !isGrowth;

  const periodEnd = profile?.subscription_current_period_end
    ? formatDateTZ(profile.subscription_current_period_end, { day: "numeric", month: "long", year: "numeric" })
    : null;

  const essentialFeatures = [
    "5 búsquedas al mes",
    "5 contactos al mes",
    "Vista de perfil básica",
    "1 usuario por cuenta",
    "Soporte por email",
  ];

  const growthFeatures = [
    "20 búsquedas al mes",
    "20 contactos al mes",
    "Filtros avanzados",
    "Shortlists y favoritos",
    "1 usuario por cuenta",
    "Soporte por email",
  ];

  const proFeatures = [
    "Búsquedas ilimitadas",
    "Contactos ilimitados",
    "Filtros avanzados completos",
    "Shortlists y favoritos sin límite",
    "Hasta 3 usuarios en la misma cuenta",
    "Soporte prioritario",
  ];

  // ── Active plan card (when subscribed) ───────────────────────────────────
  if (isPro || isGrowth) {
    const planName     = isPro ? "Plan Professional" : "Plan Growth";
    const planPrice    = isPro ? "99€/mes" : "35€/mes";
    const planFeatures = isPro ? proFeatures : growthFeatures;

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold text-navy">Plan & Facturación</h1>
          <p className="text-gray-500 font-medium">Gestiona tu suscripción.</p>
        </div>

        <div className="max-w-md">
          <div className="relative bg-white rounded-2xl border-2 border-blue-600 p-8 shadow-sm space-y-6">
            <div className="absolute -top-3 left-6">
              <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                <Zap size={11} /> Activo
              </span>
            </div>
            <div>
              <p className="font-black text-navy text-xl">{planName}</p>
              <p className="text-blue-600 font-bold text-sm mt-0.5">{planPrice}</p>
              {periodEnd && (
                <p className="text-xs text-gray-400 mt-1">Próxima renovación: {periodEnd}</p>
              )}
            </div>
            <div className="space-y-3 pt-1">
              {planFeatures.map((f) => (
                <div key={f} className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{f}</span>
                </div>
              ))}
            </div>
            {!isPro && (
              <Link
                href="/checkout?plan=institution-pro"
                className="inline-flex items-center justify-center w-full bg-[#1d4ed8] hover:bg-blue-700 text-white font-black py-3 rounded-xl text-sm transition-colors"
              >
                Mejorar a Professional — 99€/mes
              </Link>
            )}
            <div className="pt-2">
              <StripeCancelButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Free (Essential) plan: 3-column comparison ───────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-navy">Plan & Facturación</h1>
        <p className="text-gray-500 font-medium">Elige el plan que mejor se adapta a tu institución.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl">

        {/* Essential */}
        <div className="relative bg-white rounded-2xl border border-gray-200 p-7 space-y-5 flex flex-col">
          <div className="absolute -top-3 left-5">
            <span className="bg-gray-100 text-gray-600 text-xs font-black px-3 py-1 rounded-full border border-gray-200">
              Tu plan actual
            </span>
          </div>
          <div>
            <p className="font-black text-navy text-lg">Essential</p>
            <p className="text-gray-400 font-semibold text-sm mt-0.5">0 € / mes</p>
            <p className="text-xs text-gray-400 mt-1">Para empezar</p>
          </div>
          <div className="space-y-2.5 flex-1">
            {essentialFeatures.map((f) => (
              <div key={f} className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-gray-300 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-500">{f}</span>
              </div>
            ))}
          </div>
          <button
            disabled
            className="inline-flex items-center justify-center w-full bg-gray-100 text-gray-400 font-black py-2.5 rounded-xl text-sm cursor-not-allowed"
          >
            Plan actual
          </button>
        </div>

        {/* Growth */}
        <div className="relative bg-[#0D2240] rounded-2xl p-7 space-y-5 flex flex-col shadow-lg shadow-blue-900/20">
          <div className="absolute -top-3 left-5">
            <span className="bg-[#E9A030] text-[#0D2240] text-xs font-black px-3 py-1 rounded-full">
              Más popular
            </span>
          </div>
          <div>
            <p className="font-black text-white text-lg">Growth</p>
            <p className="text-[#E9A030] font-bold text-sm mt-0.5">35 € / mes</p>
            <p className="text-xs text-white/40 mt-1">Sin permanencia</p>
          </div>
          <div className="space-y-2.5 flex-1">
            {growthFeatures.map((f) => (
              <div key={f} className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-[#E9A030] flex-shrink-0 mt-0.5" />
                <span className="text-xs text-white/65">{f}</span>
              </div>
            ))}
          </div>
          <a
            href="mailto:support@facultymatch.app?subject=Solicitud%20Plan%20Growth%20Instituciones"
            className="inline-flex items-center justify-center gap-1.5 w-full bg-[#E9A030] hover:bg-amber-400 text-[#0D2240] font-black py-2.5 rounded-xl text-sm transition-colors"
          >
            <Mail size={13} /> Solicitar acceso
          </a>
          <p className="text-[10px] text-white/30 text-center">Disponible vía email · lanzamiento próximo</p>
        </div>

        {/* Professional */}
        <div className="relative bg-white rounded-2xl border-2 border-blue-600 p-7 space-y-5 flex flex-col shadow-sm">
          <div className="absolute -top-3 left-5">
            <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
              <Star size={10} /> Completo
            </span>
          </div>
          <div>
            <p className="font-black text-navy text-lg">Professional</p>
            <p className="text-blue-600 font-bold text-sm mt-0.5">99 € / mes</p>
            <p className="text-xs text-gray-400 mt-1">Sin permanencia</p>
          </div>
          <div className="space-y-2.5 flex-1">
            {proFeatures.map((f) => (
              <div key={f} className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700">{f}</span>
              </div>
            ))}
          </div>
          <Link
            href="/checkout?plan=institution-pro"
            className="inline-flex items-center justify-center w-full bg-[#1d4ed8] hover:bg-blue-700 text-white font-black py-2.5 rounded-xl text-sm transition-colors"
          >
            Activar ahora — 99€/mes
          </Link>
          <p className="text-[10px] text-gray-400 text-center">
            o{" "}
            <a
              href="mailto:support@facultymatch.app?subject=Prueba%20Professional%2014%20d%C3%ADas"
              className="text-blue-500 font-bold"
            >
              14 días de prueba gratuita
            </a>
            {" "}— sin tarjeta
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-400 max-w-4xl">
        Sin comisiones por contratación. Sin permanencia. Para soluciones enterprise escríbenos a{" "}
        <a href="mailto:support@facultymatch.app" className="text-blue-500 hover:underline">
          support@facultymatch.app
        </a>
      </p>
    </div>
  );
}
