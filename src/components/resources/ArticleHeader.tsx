import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { IMAGES } from "@/lib/images";
import { SITE_URL, getArticle } from "@/lib/articles";

const fmt = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

// Cabecera común de los artículos: categoría y lectura en una línea, título,
// entradilla, autoría y fechas visibles, foto de portada con su crédito y los
// datos estructurados Article (lo que leen buscadores y motores de IA).
export function ArticleHeader({ slug }: { slug: string }) {
  const a = getArticle(slug);
  const img = IMAGES[a.image];
  const url = `${SITE_URL}/resources/${a.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.headline,
    description: a.description,
    inLanguage: "es",
    mainEntityOfPage: url,
    datePublished: a.published,
    dateModified: a.modified,
    author: { "@type": "Organization", name: "FacultyMatch", url: SITE_URL },
    publisher: { "@type": "Organization", name: "FacultyMatch", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` } },
    image: {
      "@type": "ImageObject",
      url: `${SITE_URL}${img.src}`,
      width: img.width,
      height: img.height,
      caption: img.alt,
      creator: { "@type": "Person", name: img.author },
      creditText: `${img.author} / ${img.source}`,
      acquireLicensePage: img.url,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/resources" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-fm-blue transition-all hover:gap-3">
        <ArrowLeft size={16} /> Volver a Recursos
      </Link>

      <header className="mb-10 space-y-4">
        <p className="text-sm font-semibold text-[#5B6B85]">
          {a.category} · {a.readMinutes} min de lectura
        </p>
        <h1 className="text-balance text-[2rem] font-extrabold leading-[1.1] tracking-[-0.035em] text-fm-ink md:text-[2.75rem]">
          {a.headline}
        </h1>
        <p className="text-lg leading-relaxed text-[#5B6B85]">{a.lead}</p>
        <p className="text-sm text-[#5E6F8E]">
          Por el equipo de FacultyMatch · Publicado el <time dateTime={a.published}>{fmt(a.published)}</time>
          {a.modified !== a.published && (
            <> · Actualizado el <time dateTime={a.modified}>{fmt(a.modified)}</time></>
          )}
        </p>
      </header>

      <figure className="mb-10">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-fm-border">
          <Image
            src={img.src}
            alt={img.alt}
            title={img.title}
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>
        <figcaption className="mt-2 text-xs text-[#5E6F8E]">
          Foto: <a href={img.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-fm-blue">{img.author}</a> · {img.source}
        </figcaption>
      </figure>
    </>
  );
}
