import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  // Verify the caller is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { university_id, university_name } = await request.json();

  // university_id must be a valid integer (universities_es uses integer PK)
  const universityIdInt = typeof university_id === "number"
    ? university_id
    : parseInt(university_id, 10);
  if (!universityIdInt || isNaN(universityIdInt)) {
    return NextResponse.json({ error: "Invalid university_id" }, { status: 400 });
  }

  // Use admin client to bypass RLS — we've already authenticated the user above
  const admin = createAdminClient();

  const updatePayload: Record<string, unknown> = {
    verified: true,
    status: "approved",
    university_id: universityIdInt,
  };
  if (university_name) updatePayload.name = university_name;

  const { error } = await admin
    .from("institutions")
    .update(updatePayload)
    .eq("user_id", user.id);

  if (error) {
    console.error("[/api/institution/verify] update failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
