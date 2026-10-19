import { createClient, createAdminClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { switchActiveMode } from "@/app/auth/actions";
import { Building2, ArrowRight, Clock, XCircle, AlertCircle } from "lucide-react";

const ESTADO_BANNERS: Record<string, { icon: React.ElementType; title: string; description: string; dot: string }> = {
  en_revision: {
    icon: Clock,
    title: "Tu perfil está en revisión",
    description: "Nuestro equipo está revisando tu perfil. Te notificaremos por email cuando esté verificado. Mientras tanto, no eres visible para las instituciones.",
    dot: "bg-amber-500",
  },
  rechazado: {
    icon: XCircle,
    title: "Perfil no verificado",
    description: "Tu perfil no ha superado el proceso de verificación. Revisa las notas de nuestro equipo, corrige la información y vuelve a enviarlo desde la configuración de tu perfil.",
    dot: "bg-red-600",
  },
  incompleto: {
    icon: AlertCircle,
    title: "Perfil incompleto",
    description: "Completa tu perfil al 100% para enviarlo a revisión y empezar a recibir propuestas de instituciones.",
    dot: "bg-fm-blue",
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
  // but not the faculty dashboard pages (profile editing, settings, etc.).
  // Admins necesitan lo mismo desde /control (botón "Ver perfil") — antes
  // los expulsaba a /app/institution y el botón del panel no llevaba a
  // ningún sitio útil.
  if (role && role !== "faculty" && role !== "institution" && role !== "admin" && role !== "super_admin") {
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
        <div className="mb-6 rounded-xl border border-fm-border bg-white p-5">
          <p className="flex items-center gap-2.5 text-[15px] font-semibold text-fm-ink">
            <span className={`h-2 w-2 shrink-0 rounded-full ${estadoBannerConfig.dot}`} aria-hidden />
            {estadoBannerConfig.title}
          </p>
          <p className="mt-1.5 max-w-[70ch] text-sm leading-relaxed text-[#5B6B85]">{estadoBannerConfig.description}</p>
        </div>
      )}

      {showInstitutionBanner && (
        <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-fm-border bg-white p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <Building2 size={18} className="mt-0.5 shrink-0 text-fm-blue" />
            <div>
              <p className="font-bold text-fm-navy text-sm">
                Tienes acceso como institución
              </p>
              <p className="text-fm-muted text-sm font-medium mt-0.5">
                Cambia al modo institución para gestionar contactos, favoritos y buscar docentes con todas las funcionalidades.
              </p>
            </div>
          </div>
          <form action={switchActiveMode}>
            <input type="hidden" name="mode" value="institution" />
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-fm-blue hover:opacity-90 active:scale-[0.97] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all whitespace-nowrap flex-shrink-0"
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