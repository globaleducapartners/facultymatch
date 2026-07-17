import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { ProfileWizardClient } from "./ProfileWizardClient";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: facultyProfile } = await supabase
    .from("faculty_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // If onboarding is already completed, redirect to profile
  if (facultyProfile?.onboarding_status === "completed") {
    redirect("/app/faculty/profile");
  }

  return (
    <ProfileWizardClient
      user={{ id: user.id, email: user.email }}
      userMeta={user.user_metadata || {}}
      profile={profile}
      facultyProfile={facultyProfile}
    />
  );
}