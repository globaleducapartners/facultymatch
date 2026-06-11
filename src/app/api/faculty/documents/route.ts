import { createAdminClient } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/faculty/documents?facultyId=xxx
 * Returns the list of documents for a given faculty member.
 * Uses the admin client to bypass RLS so all documents are returned.
 */
export async function GET(req: NextRequest) {
  try {
    const facultyId = req.nextUrl.searchParams.get("facultyId");
    if (!facultyId) {
      return NextResponse.json({ error: "facultyId is required" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data, error } = await admin
      .from("faculty_documents")
      .select("id, name, file_name, file_path, doc_type, created_at")
      .eq("faculty_id", facultyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching faculty documents:", error);
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Documents API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}