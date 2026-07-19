import { createClient, createAdminClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { switchActiveMode } from "@/app/auth/actions";
import { Building2, ArrowRight, Clock, XCircle, AlertCircle } from "lucide-react";

const ESTADO_BANNERS: Record<string, { icon: React.ElementType; title: string; description: string; color: string }> = {
  en_revision: {
    icon: Clock,
    title: "Tu perfil está en revisión",
    description: "Nuestro equipo está revisando tu perfil. Te notificaremos por email cuando esté verificado. Mientras tanto, no eres visible para las instituciones.",
    color: "bg-amber-50 border-amber-200 text-amber-800",
  },
  rechazado: {
    icon: XCircle,
    title: "Perfil no verificado",
    description: "Tu perfil no ha superado el proceso de verificación. Revisa las notas de nuestro equipo, corrige la información y vuelve a enviarlo desde la configuración de tu perfil.",
    color: "bg-red-50 border-red-200 text-red-800",
  },
  incompleto: {
    icon: AlertCircle,
    title: "Perfil incompleto",
    description: "Completa tu perfil al 100% para enviarlo a revisión y empezar a recibir propuestas de instituciones.",
    color: "bg-blue-50 border-blue-200 text-blue-800",
  },
};

export default async function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, can_switch_role, active_mode")
    .eq("id", user.id)
    .maybeSingle();

  // Use user_metadata fallback if DB profile is missing
  const role = profile?.role || (user.user_metadata?.role as string) || null;

  // Institution users can view individual faculty profiles (/app/faculty/[id])
  // but not the faculty dashboard pages (profile editing, settings, etc.)
  if (role && role !== "faculty" && role !== "institution") {
    redirect("/app/institution");
  }

  // Check onboarding status for faculty users
  let url = "";
  try {
    const headersList = await headers();
    url = headersList.get("x-url") || headersList.get("x-invoke-path") || "";
  } catch {
    // headers() may throw in edge cases — fall back to empty
  }
  const isOnboardingRoute = url.includes("/onboarding");

  // Fetch faculty profile data for estado_perfil (used for redirects + banner)
  let estadoPerfil: string | undefined;
  if (role === "faculty" && !isOnboardingRoute) {
    const admin = createAdminClient();
    const { data: facultyProfile } = await admin
      .from("faculty_profiles")
      .select("onboarding_status, estado_perfil")
      .eq("id", user.id)
      .maybeSingle();

    estadoPerfil = facultyProfile?.estado_perfil;

    // User must confirm email first — redirect to verification page
    // (this catches both: new users and users who haven't completed activation)
    if (estadoPerfil === "pendiente_verificacion") {
      redirect("/auth/verificar-email");
    }

    // If email is confirmed but onboarding is incomplete, send to wizard
    const onboardingStatus = facultyProfile?.onboarding_status || "not_started";
    if (onboardingStatus !== "completed") {
      redirect("/app/faculty/onboarding");
    }
  }

  const showInstitutionBanner = profile?.can_switch_role === true && profile?.active_mode !== "institution";

  // Estado banner — only defined for faculty users
  const estadoBannerConfig = role === "faculty" && estadoPerfil
    ? ESTADO_BANNERS[estadoPerfil] ?? null
    : null;

  return (
    <>
      {/* Estado banner (en_revision, rechazado, incompleto) */}
      {estadoBannerConfig && (
        <div className={`${estadoBannerConfig.color} border rounded-2xl p-4 mb-6 flex items-start gap-3`}>
          <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0">
            <estadoBannerConfig.icon size={18} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">{estadoBannerConfig.title}</p>
            <p className="text-sm font-medium mt-0.5 opacity-80">{estadoBannerConfig.description}</p>
          </div>
        </div>
      )}

      {showInstitutionBanner && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Building2 size={18} className="text-[#1B4FD8]" />
            </div>
            <div>
              <p className="font-bold text-[#0D2240] text-sm">
                Tienes acceso como institución
              </p>
              <p className="text-slate-600 text-sm font-medium mt-0.5">
                Cambia al modo institución para gestionar contactos, favoritos y buscar docentes con todas las funcionalidades.
              </p>
            </div>
          </div>
          <form action={switchActiveMode}>
            <input type="hidden" name="mode" value="institution" />
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[#1B4FD8] hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap flex-shrink-0"
            >
              <Building2 size={14} /> Ir a modo institución <ArrowRight size={14} />
            </button>
          </form>
        </div>
      )}
      {children}
    </>
  );
}