import { MetadataRoute } from "next";

const BASE = "https://www.facultymatch.app";

// Buscadores y asistentes de IA (búsqueda y consulta en directo) con las mismas
// reglas que el resto: pueden leer lo público y nunca lo privado.
const AI_AGENTS = [
  "OAI-SearchBot", "ChatGPT-User", "GPTBot",
  "Claude-SearchBot", "Claude-User", "ClaudeBot",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended",
  "Bingbot", "Googlebot",
];

export default function robots(): MetadataRoute.Robots {
  const allow = [
    "/",
    "/faculty",
    "/docentes",
    "/institutions",
    "/resources",
    "/legal",
    "/privacy",
    "/terms",
    "/help",
    "/directory",
  ];
  const disallow = [
    "/login",
    "/reset-password",
    "/update-password",
    "/auth/",
    "/onboarding/",
    "/apply/",
    "/dashboard/",
    "/app/",
    "/admin-login",
    "/admin/",
    "/control/",
    "/checkout",
    "/api/",
  ];
  return {
    rules: [
      { userAgent: AI_AGENTS, allow, disallow },
      {
        userAgent: "*",
        // Only allow public content pages to be indexed
        allow: [
          "/",
          "/faculty",
          "/faculty/",       // legacy profile URLs, redirect to /docentes/[slug]
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
