import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Zap } from "lucide-react";

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-navy">Plan & Facturación</h1>
        <p className="text-gray-500 font-medium">Gestiona tu suscripción.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-xl space-y-6">
        {isPro ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Zap size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-black text-navy text-lg">Plan Professional activo</p>
                {periodEnd && (
                  <p className="text-sm text-gray-500">Próxima renovación: {periodEnd}</p>
                )}
              </div>
            </div>
            <div className="space-y-3 pt-2">
              {["Búsquedas ilimitadas","Filtros avanzados","Contacto directo con docentes","Soporte prioritario"].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{f}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 pt-2">
              Para cancelar o modificar tu suscripción escríbenos a{" "}
              <a href="mailto:info@facultymatch.app" className="text-blue-600 font-bold">info@facultymatch.app</a>
            </p>
          </>
        ) : (
          <>
            <div>
              <p className="font-black text-navy text-lg mb-1">Plan Essential (gratuito)</p>
              <p className="text-gray-500 text-sm">Accede al plan Professional para búsquedas ilimitadas y contacto directo con docentes.</p>
            </div>
            <div className="space-y-3">
              {["Búsquedas ilimitadas","Filtros avanzados (Doctorado, Idioma, Disponibilidad)","Contacto directo con docentes verificados","Soporte prioritario"].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-gray-300 flex-shrink-0" />
                  <span className="text-sm text-gray-500">{f}</span>
                </div>
              ))}
            </div>
            <Link
              href="/checkout?plan=institution-pro"
              className="inline-flex items-center justify-center w-full bg-[#1d4ed8] hover:bg-blue-700 text-white font-black py-3 rounded-xl text-sm transition-colors"
            >
              Activar Plan Professional — 99€/mes
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
