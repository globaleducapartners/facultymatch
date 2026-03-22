import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function AppPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

    if (!profile.role) {
      redirect("/onboarding/role");
    }

      // Only faculty has an onboarding wizard; institutions go straight to dashboard
      if (!profile.onboarding_completed && profile.role === "faculty") {
        redirect("/onboarding");
      }

      if (profile.role === "faculty") {
      redirect("/app/faculty");
    }

    if (profile.role === "institution") {
      redirect("/app/institution");
    }

  if (profile.role === "admin" || profile.role === "super_admin") {
    redirect("/app/admin");
  }

  redirect("/");
}
