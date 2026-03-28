import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

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

  // Pending institutions now see the dashboard with a pending banner (handled in page.tsx)
  // They can still browse faculty while waiting for approval
  return <>{children}</>;
}
