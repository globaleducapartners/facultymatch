import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { switchActiveMode } from "@/app/auth/actions";
import { Building2, ArrowRight } from "lucide-react";

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
    .single();

  // Institution users can view individual faculty profiles (/app/faculty/[id])
  // but not the faculty dashboard pages (profile editing, settings, etc.)
  if (profile?.role && profile.role !== "faculty" && profile.role !== "institution") {
    redirect("/app/institution");
  }

  // Check onboarding status for faculty users
  const headersList = await headers();
  const url = headersList.get("x-url") || headersList.get("x-invoke-path") || "";
  const isOnboardingRoute = url.includes("/onboarding");

  if (profile?.role === "faculty" && !isOnboardingRoute) {
    const { data: facultyProfile } = await supabase
      .from("faculty_profiles")
      .select("onboarding_status")
      .eq("id", user.id)
      .maybeSingle();

    const onboardingStatus = facultyProfile?.onboarding_status || "not_started";
    if (onboardingStatus !== "completed") {
      redirect("/app/faculty/onboarding");
    }
  }

  const showInstitutionBanner = profile?.can_switch_role === true && profile?.active_mode !== "institution";

  return (
    <>
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