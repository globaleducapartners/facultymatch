// Registro de los artículos de /resources: una sola fuente para la cabecera,
// los metadatos (título, descripción, imagen) y los datos estructurados.
// Las fechas de publicación y revisión son las reales del contenido.
import type { Metadata } from "next";
import { IMAGES, type ImageKey } from "@/lib/images";

export const SITE_URL = "https://www.facultymatch.app";

export type Article = {
  slug: string;
  title: string;        // <title> de la página
  headline: string;     // H1
  description: string;
  lead: string;         // entradilla
  category: string;
  readMinutes: number;
  image: ImageKey;
  published: string;    // AAAA-MM-DD
  modified: string;
};

export const ARTICLES: Article[] = [
  {
    slug: "claustro-docente",
    title: "Cómo construir un claustro docente de alto impacto | FacultyMatch",
    headline: "Cómo construir un claustro docente de alto impacto",
    description: "Guía práctica para instituciones sobre selección, diversificación y fidelización de talento académico global.",
    lead: "Guía práctica para instituciones sobre selección, diversificación y fidelización de talento académico global.",
    category: "Instituciones",
    readMinutes: 8,
    image: "universidad",
    published: "2026-03-22",
    modified: "2026-09-10",
  },
  {
    slug: "estandares-verificacion",
    title: "Estándares de Verificación FacultyMatch | Cómo validamos los perfiles",
    headline: "Estándares de Verificación FacultyMatch",
    description: "Conoce en detalle los criterios y el proceso de auditoría que aplicamos para validar credenciales académicas.",
    lead: "Conoce en detalle los criterios y el proceso de auditoría que aplicamos para validar credenciales académicas, títulos de doctorado y experiencia profesional verificada.",
    category: "Calidad",
    readMinutes: 5,
    image: "laboratorio",
    published: "2026-03-22",
    modified: "2026-09-10",
  },
  {
    slug: "docencia-online-microcredenciales",
    title: "El futuro de la docencia online y microcredenciales | FacultyMatch",
    headline: "El futuro de la docencia online y las microcredenciales",
    description: "Tendencias pedagógicas en entornos virtuales y cómo los docentes pueden posicionarse en el mercado de las microcredenciales.",
    lead: "Análisis de las tendencias pedagógicas en entornos virtuales y cómo los docentes expertos pueden posicionarse en el mercado de las microcredenciales internacionales.",
    category: "Tendencias",
    readMinutes: 12,
    image: "online",
    published: "2026-03-22",
    modified: "2026-09-10",
  },
  {
    slug: "optimiza-perfil-docente",
    title: "Guía: optimiza tu perfil docente en FacultyMatch | FacultyMatch",
    headline: "Guía: Optimiza tu Perfil Docente en FacultyMatch",
    description: "Mejores prácticas para destacar tu trayectoria académica y generar confianza en las universidades.",
    lead: "Mejores prácticas para destacar tu trayectoria académica. Cómo estructurar tus áreas de conocimiento y generar confianza en las universidades.",
    category: "Docentes",
    readMinutes: 6,
    image: "notas",
    published: "2026-03-22",
    modified: "2026-09-10",
  },
  {
    slug: "taxonomia-academica",
    title: "Taxonomía Académica Global | FacultyMatch",
    headline: "Taxonomía Académica Global: cómo clasificamos el conocimiento",
    description: "Cómo clasificamos las disciplinas y sub-áreas siguiendo los estándares internacionales para un matching preciso.",
    lead: "Descubre cómo clasificamos las disciplinas y sub-áreas siguiendo los estándares internacionales. Una herramienta clave para el matching preciso entre oferta y demanda académica.",
    category: "Estructura",
    readMinutes: 10,
    image: "taxonomia",
    published: "2026-03-22",
    modified: "2026-09-10",
  },
  {
    slug: "reclutamiento-90-dias",
    title: "Estrategias de Reclutamiento Docente en 90 días | FacultyMatch",
    headline: "Estrategias de Reclutamiento Docente en 90 días",
    description: "Plan de acción para directores académicos: desde la identificación de necesidades hasta la firma de la colaboración docente.",
    lead: "Plan de acción para directores académicos: desde la identificación de necesidades hasta la firma de la colaboración docente mediante nuestra infraestructura conectada.",
    category: "Gestión",
    readMinutes: 15,
    image: "reclutamiento",
    published: "2026-03-22",
    modified: "2026-09-10",
  },
];

export function getArticle(slug: string): Article {
  const a = ARTICLES.find((x) => x.slug === slug);
  if (!a) throw new Error(`Artículo desconocido: ${slug}`);
  return a;
}

export function articleMetadata(slug: string): Metadata {
  const a = getArticle(slug);
  const img = IMAGES[a.image];
  const url = `${SITE_URL}/resources/${a.slug}`;
  return {
    title: a.title,
    description: a.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: a.title,
      description: a.description,
      locale: "es_ES",
      publishedTime: a.published,
      modifiedTime: a.modified,
      authors: ["Equipo FacultyMatch"],
      images: [{ url: `${SITE_URL}${img.src}`, width: img.width, height: img.height, alt: img.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: a.title,
      description: a.description,
      images: [`${SITE_URL}${img.src}`],
    },
  };
}
