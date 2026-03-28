import { createClient, createAdminClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  const [
    { data: facultyProfile },
    { data: contacts },
    { data: profile },
  ] = await Promise.all([
    admin.from("faculty_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    admin.from("contacts").select("*"),
    admin.from("user_profiles").select("*").eq("id", user.id).single(),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    user: { id: user.id, email: user.email },
    profile,
    faculty_profile: facultyProfile,
    contacts: contacts || [],
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="facultymatch-faculty-data-${new Date().toISOString().slice(0,10)}.json"`,
    },
  });
}
