import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { InstitutionPendingPage } from "./InstitutionPendingPage";

export default async function InstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile?.role) {
    redirect("/onboarding/role");
  }

  if (profile.role !== "institution") {
    redirect("/app/faculty");
  }

  // Check institution approval status
  const { data: institution } = await supabase
    .from("institutions")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (institution?.status === "pending") {
    return <InstitutionPendingPage />;
  }

  return <>{children}</>;
}
