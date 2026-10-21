import { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase-server";
import { ARTICLES } from "@/lib/articles";

const BASE = "https://www.facultymatch.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient();

  // Fetch all public faculty profiles (for /docentes/[slug] URLs)
  const { data: profiles } = await admin
    .from("faculty_profiles")
    .select("profile_slug, updated_at")
    .eq("visibility", "public")
    .eq("is_active", true)
    .eq("estado_perfil", "verificado")
    .not("profile_slug", "is", "null");

  const docentesUrls: MetadataRoute.Sitemap = (profiles || []).map((p) => ({
    url: `${BASE}/docentes/${p.profile_slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Fechas reales de última modificación (no "ahora" en cada rastreo).
  const SITE_UPDATED = new Date("2026-10-21");
  const LEGAL_UPDATED = new Date("2026-03-22");
  const newest = (ds: (Date | undefined)[]) => ds.filter(Boolean).sort((a, b) => b!.getTime() - a!.getTime())[0];

  const articleUrls: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${BASE}/resources/${a.slug}`,
    lastModified: new Date(a.modified),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  const directoryUpdated =
    newest((profiles || []).map((p) => (p.updated_at ? new Date(p.updated_at) : undefined))) || SITE_UPDATED;

  return [
    { url: BASE,                   lastModified: SITE_UPDATED, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/faculty`,      lastModified: SITE_UPDATED, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/institutions`, lastModified: SITE_UPDATED, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/docentes`,     lastModified: directoryUpdated, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/resources`,    lastModified: SITE_UPDATED, changeFrequency: "weekly",  priority: 0.7 },
    ...articleUrls,
    { url: `${BASE}/help`,         lastModified: SITE_UPDATED, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/creditos`,     lastModified: SITE_UPDATED, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE}/legal`,        lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacy`,      lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`,        lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    ...docentesUrls,
  ];
}
