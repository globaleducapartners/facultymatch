import { createClient } from "@/lib/supabase-server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export default async function RoleSelectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "faculty") redirect("/app/faculty");
  if (profile?.role === "institution") redirect("/app/institution");
  if (profile?.role === "admin" || profile?.role === "super_admin") redirect("/control");

  // No role assigned — assign faculty by default and redirect
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  await admin.from("user_profiles").upsert({
    id: user.id,
    role: "faculty",
    full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Docente",
  }, { onConflict: "id" });

  await admin.from("faculty_profiles").upsert({
    user_id: user.id,
    visibility: "public",
    is_active: true,
    is_verified: false,
  }, { onConflict: "user_id" });

  redirect("/app/faculty");
}
