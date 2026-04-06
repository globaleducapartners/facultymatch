import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const domain = searchParams.get("domain")?.trim();

  const admin = createAdminClient();

  // Domain lookup — returns all universities matching an exact email domain
  if (domain) {
    const { data } = await admin
      .from("universities_es")
      .select("id, name, acronym, domain")
      .eq("domain", domain);
    return NextResponse.json({ universities: data || [] });
  }

  if (!q || q.length < 2) {
    return NextResponse.json({ universities: [] });
  }

  const { data } = await admin
    .from("universities_es")
    .select("id, name, acronym, domain")
    .or(`name.ilike.%${q}%,acronym.ilike.%${q}%`)
    .limit(8);

  return NextResponse.json({ universities: data || [] });
}
