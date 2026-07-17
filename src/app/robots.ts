import { MetadataRoute } from "next";

const BASE = "https://www.facultymatch.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Only allow public content pages to be indexed
        allow: [
          "/",
          "/faculty",
          "/faculty/",       // public faculty profiles (/faculty/[id])
          "/docentes",
          "/docentes/",      // public faculty profiles (/docentes/[slug])
          "/institutions",
          "/resources",
          "/resources/",
          "/legal",
          "/privacy",
          "/terms",
          "/help",
          "/directory",
        ],
        // Block all internal / auth / utility routes
        disallow: [
          // Auth flows — no indexing
          "/login",
          "/reset-password",
          "/update-password",
          "/auth/",

          // Signup confirmation steps — only reachable via the form flow
          "/signup/faculty/confirm",
          "/signup/institution/confirm",

          // Old / legacy onboarding routes
          "/onboarding/",
          "/apply/",
          "/dashboard/",

          // Authenticated app — behind auth guard
          "/app/",

          // Internal admin & control panels
          "/admin-login",
          "/admin/",
          "/control/",

          // Checkout & API
          "/checkout",
          "/api/",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
