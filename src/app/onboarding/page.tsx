import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding");
  }

  // Fetch all profile data for pre-filling
  const { data: profile } = await supabase
    .from("faculty_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: languages } = await supabase.from("faculty_languages").select("language, level").eq("faculty_id", user.id);
  const { data: history } = await supabase.from("faculty_teaching_history").select("institution_name, role, year_from, year_to").eq("faculty_id", user.id);
  const { data: areas } = await supabase.from("faculty_areas").select("area").eq("faculty_id", user.id);
  const { data: levels } = await supabase.from("faculty_levels").select("level").eq("faculty_id", user.id);

  const initialData = {
    profile: profile || {},
    languages: (languages || []).map(l => ({ language: l.language, level: l.level || "" })),
    history: (history || []).map(h => ({ 
      institution: h.institution_name, 
      role: h.role || "", 
      from: h.year_from?.toString() || "", 
      to: h.year_to?.toString() || "" 
    })),
    areas: (areas || []).map(a => a.area),
    levels: (levels || []).map(l => l.level)
  };

  return <OnboardingClient initialData={initialData} />;
}
