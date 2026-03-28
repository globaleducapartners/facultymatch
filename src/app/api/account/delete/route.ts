import { createClient, createAdminClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role } = await request.json();
  const admin = createAdminClient();

  try {
    if (role === "institution") {
      await admin.from("institutions").delete().eq("user_id", user.id);
      await admin.from("contacts").delete().eq("institution_id", user.id);
      await admin.from("favorites").delete().eq("institution_id", user.id);
    } else if (role === "faculty") {
      const { data: fp } = await admin.from("faculty_profiles").select("id").eq("user_id", user.id).maybeSingle();
      if (fp) {
        await admin.from("contacts").delete().eq("faculty_id", fp.id);
        await admin.from("favorites").delete().eq("faculty_id", fp.id);
        await admin.from("faculty_profiles").delete().eq("user_id", user.id);
      }
    }

    await admin.from("user_profiles").delete().eq("id", user.id);
    await admin.auth.admin.deleteUser(user.id);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("[delete-account]", e);
    return NextResponse.json({ error: e.message || "Error eliminando cuenta" }, { status: 500 });
  }
}
