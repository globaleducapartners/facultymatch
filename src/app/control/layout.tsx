import { createClient, createAdminClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import ControlSidebar from "./ControlSidebar";

export default async function ControlLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/control");

  // Setup key — upgrades authenticated user to super_admin (one-time bootstrap)
  const headersList = await headers();
  const search = headersList.get('x-url-search') || '';
  const setupKey = new URLSearchParams(search).get('setup_key');

  if (setupKey === 'FM_ADMIN_2026') {
    const admin = createAdminClient();
    await admin.from('user_profiles').upsert(
      { id: user.id, role: 'super_admin' },
      { onConflict: 'id' }
    );
    redirect('/control');
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
    redirect("/?error=no-access");
  }

  // Pending count for sidebar badge
  const admin = createAdminClient();
  const { count: pendingCount } = await admin
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'faculty')
    .or('verification_status.eq.pending,verification_status.is.null');

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <ControlSidebar
        pendingCount={pendingCount ?? 0}
        adminName={profile.full_name || user.email || 'Admin'}
      />
      <main className="flex-1 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
