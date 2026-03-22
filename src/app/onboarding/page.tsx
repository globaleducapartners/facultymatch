import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding");
  }

  // Role check
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!userProfile) {
    redirect("/onboarding/role");
  }

  if (userProfile.role === "institution") {
    redirect("/app/institution");
  }
  if (userProfile.role === "admin" || userProfile.role === "super_admin") {
    redirect("/app/admin");
  }

  // Fetch all profile data for pre-filling
  const { data: profile } = await supabase
    .from("faculty_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const initialData = {
    profile: {
      ...(profile ?? {}),
      full_name: userProfile.full_name
    },
    languages: profile?.languages || [],
    history: (profile?.institutions_taught || []).map((h: any) => ({ 
      institution: h.institution || h.institution_name, 
      role: h.role || "", 
      from: (h.from || h.year_from)?.toString() || "", 
      to: (h.to || h.year_to)?.toString() || "" 
    })),
    areas: profile?.faculty_areas || [],
    levels: profile?.levels || []
  };

  return <OnboardingClient initialData={initialData} />;
}
