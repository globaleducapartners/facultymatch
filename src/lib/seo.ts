// Datos estructurados compartidos (schema.org). Solo hechos que ya son públicos
// en la web; las cuentas de redes se añaden cuando estén confirmadas.
export const SITE_URL = "https://www.facultymatch.app";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "FacultyMatch",
  legalName: "Grupo Global Educa SL",
  url: SITE_URL,
  logo: `${SITE_URL}/apple-touch-icon.png`,
  description:
    "Directorio de docentes, investigadores y expertos verificados para universidades y escuelas de negocio. Las instituciones buscan por área de conocimiento y contactan directamente.",
  // Cuentas oficiales (las mismas que el pie de la web).
  sameAs: [
    "https://www.linkedin.com/company/facultymatch",
    "https://www.instagram.com/facultymatch.app/",
  ],
  email: "support@facultymatch.app",
  telephone: "+34616684214",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Avenida Constitución, 4",
    postalCode: "30008",
    addressLocality: "Murcia",
    addressCountry: "ES",
  },
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "FacultyMatch",
  url: SITE_URL,
  inLanguage: "es",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export type FaqItem = { q: string; a: string };

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

// Clave pública de IndexNow (se sirve en /{clave}.txt; no es un secreto).
export const INDEXNOW_KEY = "5a2d0a86a018abdd4038b17f6aa47d96";
