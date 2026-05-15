import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { PrintProfileClient } from "./PrintProfileClient";

export default async function PrintProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: faculty }, { data: expertise }] = await Promise.all([
    supabase.from("user_profiles").select("full_name, avatar_url").eq("id", user.id).single(),
    supabase.from("faculty_profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("faculty_expertise").select("*").eq("faculty_id", user.id),
  ]);

  return (
    <PrintProfileClient
      profile={profile}
      faculty={faculty}
      expertise={expertise ?? []}
      userEmail={user.email ?? ""}
    />
  );
}
