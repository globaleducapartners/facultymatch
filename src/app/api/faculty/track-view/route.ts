import { createAdminClient } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { facultyId } = await req.json();
    if (!facultyId || typeof facultyId !== "string") {
      return NextResponse.json({ error: "facultyId is required" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Atomic increment via RPC function (SECURITY DEFINER, bypasses RLS)
    const { error: rpcError } = await admin.rpc("increment_faculty_view_count", {
      p_faculty_id: facultyId,
    });

    if (rpcError) {
      // Fallback: direct read-then-update using the admin client (bypasses RLS)
      // This has a tiny race window but only fires if the RPC function hasn't been created yet
      const { data: current, error: readError } = await admin
        .from("faculty_profiles")
        .select("view_count")
        .eq("id", facultyId)
        .single();

      if (readError) {
        console.error("Error reading view_count:", readError);
        return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
      }

      const { error: updateError } = await admin
        .from("faculty_profiles")
        .update({ view_count: (current?.view_count ?? 0) + 1 })
        .eq("id", facultyId);

      if (updateError) {
        console.error("Error updating view_count:", updateError);
        return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Track view error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}