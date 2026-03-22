import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding/role");
  }

  if (!profile.role) {
    redirect("/onboarding/role");
  }

  // Only faculty has an onboarding wizard
  if (!profile.onboarding_completed && profile.role === "faculty") {
    redirect("/onboarding");
  }

  if (profile.role === "faculty") {
    redirect("/app/faculty");
  } else if (profile?.role === "institution") {
    redirect("/app/institution");
  } else if (profile?.role === "admin" || profile?.role === "super_admin") {
    redirect("/app/admin");
  }

  redirect("/");
}
