import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import InstitutionOnboardingClient from "./InstitutionOnboardingClient";

export default async function InstitutionOnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding/institution");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "institution") {
    redirect("/onboarding");
  }

  const { data: institution } = await supabase
    .from("institutions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <InstitutionOnboardingClient
      userId={user.id}
      userEmail={user.email || ""}
      contactName={profile.full_name || ""}
      institution={institution}
    />
  );
}
