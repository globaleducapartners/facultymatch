import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim();

  if (!name || name.length < 3) {
    return NextResponse.json({ exists: false });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("institutions")
    .select("name")
    .ilike("name", name)
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ exists: !!data });
}
