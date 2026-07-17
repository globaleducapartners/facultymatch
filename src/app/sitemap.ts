import { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase-server";

const BASE = "https://www.facultymatch.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient();

  // Fetch all public faculty profiles (for /docentes/[slug] URLs)
  const { data: profiles } = await admin
    .from("faculty_profiles")
    .select("profile_slug, updated_at")
    .eq("visibility", "public")
    .eq("is_active", true)
    .not("profile_slug", "is", "null");

  const docentesUrls: MetadataRoute.Sitemap = (profiles || []).map((p) => ({
    url: `${BASE}/docentes/${p.profile_slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    { url: BASE,                             lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/faculty`,                lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/docentes`,               lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/institutions`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/resources`,              lastModified: new Date(), changeFrequency: "weekly",  priority: 0.6 },
    { url: `${BASE}/legal`,                  lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/privacy`,                lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms`,                  lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    ...docentesUrls,
  ];
}
