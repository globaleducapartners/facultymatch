import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Use DB profile + user_metadata fallback so Topbar always has display info
  // Apply field-level fallbacks — even when profile exists but some fields are null
  const umeta = user.user_metadata || {};
  const displayProfile = {
    ...(profile || {}),
    full_name: profile?.full_name || umeta.full_name || user.email?.split("@")[0] || "Usuario",
    avatar_url: profile?.avatar_url || umeta.avatar_url || null,
    role: profile?.role || umeta.role || null,
    verification_status: profile?.verification_status || "pending",
  };

  return (
    <div className="min-h-screen bg-[#F2F6FC] flex flex-col">
      <Topbar user={{ id: user.id, email: user.email }} profile={displayProfile} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}