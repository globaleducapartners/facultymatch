import { createClient, getCurrentUser, getCurrentProfile } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { ProfileWizardClient } from "./ProfileWizardClient";
import { SignupConversionPixel } from "@/components/SignupConversionPixel";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ fm_signup?: string }>;
}) {
  const { fm_signup: signupRole } = await searchParams;
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const profile = await getCurrentProfile(user.id);

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
    <>
      <SignupConversionPixel role={signupRole} />
      <ProfileWizardClient
        user={{ id: user.id, email: user.email }}
        userMeta={user.user_metadata || {}}
        profile={profile}
        facultyProfile={facultyProfile}
      />
    </>
  );
}