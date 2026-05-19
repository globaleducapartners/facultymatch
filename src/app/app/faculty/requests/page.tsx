import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { RequestsClient } from "./RequestsClient";

export default async function RequestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: facultyProfile } = await supabase
    .from("faculty_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  const { data: requests } = await supabase
    .from("contacts")
    .select("*, institution:institutions(name, country)")
    .eq("faculty_id", facultyProfile?.id ?? user.id)
    .order("created_at", { ascending: false });

  const all = (requests as any[]) ?? [];
  const pendingRequests = all.filter(r => r.status === "sent" || r.status === "pending");
  const repliedRequests = all.filter(r => r.status === "replied");
  const archivedRequests = all.filter(r => r.status === "archived");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-navy">Solicitudes</h1>
        <p className="text-gray-500 font-medium">Gestiona tus contactos e invitaciones institucionales.</p>
      </div>
      <RequestsClient
        pendingRequests={pendingRequests}
        repliedRequests={repliedRequests}
        archivedRequests={archivedRequests}
      />
    </div>
  );
}
