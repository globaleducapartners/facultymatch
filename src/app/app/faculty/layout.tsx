import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function FacultyLayout({
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

  // Institution users can view individual faculty profiles (/app/faculty/[id])
  // but not the faculty dashboard pages (profile editing, settings, etc.)
  if (profile.role !== "faculty" && profile.role !== "institution") {
    redirect("/app/institution");
  }

  return <>{children}</>;
}
