import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import RoleSelectClient from "./RoleSelectClient";

export default async function RoleSelectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding/role");
  }

  // If user already has a role, redirect to the appropriate dashboard
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "faculty") redirect("/app/faculty");
  if (profile?.role === "institution") redirect("/app/institution");
  if (profile?.role === "admin" || profile?.role === "super_admin") redirect("/app/admin");

  return <RoleSelectClient userId={user.id} />;
}
