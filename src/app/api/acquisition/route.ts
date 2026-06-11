import { createAdminClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, utmSource, utmMedium, utmCampaign, referrerUrl } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Determine acquisition_channel
    let channel = "direct";
    if (utmSource) {
      channel = utmSource;
    } else if (referrerUrl) {
      const url = referrerUrl.toLowerCase();
      if (url.includes("google.") || url.includes("bing.") || url.includes("yahoo.")) {
        channel = "organic_search";
      } else if (url.includes("linkedin")) {
        channel = "linkedin";
      } else if (url.includes("facebook") || url.includes("instagram")) {
        channel = "social";
      } else if (url.includes("x.com") || url.includes("twitter")) {
        channel = "social";
      } else if (url.includes("facultymatch.app") || url.includes("localhost")) {
        channel = "direct";
      } else {
        channel = "referral";
      }
    }

    // Only write if fields are empty (don't over-write existing data)
    const { data: existing } = await admin
      .from("user_profiles")
      .select("acquisition_channel, utm_source")
      .eq("id", userId)
      .single();

    if (existing?.acquisition_channel || existing?.utm_source) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const update: Record<string, string | null> = {
      acquisition_channel: channel,
      utm_source: utmSource || null,
      utm_medium: utmMedium || null,
      utm_campaign: utmCampaign || null,
      referrer_url: referrerUrl || null,
    };

    const { error } = await admin
      .from("user_profiles")
      .update(update)
      .eq("id", userId);

    if (error) {
      console.error("[Acquisition] update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Acquisition] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}