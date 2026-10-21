import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { NewsletterForm } from "./NewsletterForm";
import { DarkBand, Row, SectionRows } from "@/components/sections/skeleton";
import { IMAGES, type ImageKey } from "@/lib/images";

export const metadata: Metadata = {
  alternates: { canonical: "/resources" },
  title: "Recursos para docentes e instituciones | FacultyMatch",
  description:
    "Guías, estándares y mejores prácticas para el reclutamiento docente y el desarrollo de carrera académica en educación superior.",
  keywords:
    "recursos académicos, guías docentes, reclutamiento universitario, estándares académicos, educación superior",
};

const RESOURCES: { tag: string; title: string; desc: string; readTime: string; href: string; image: ImageKey }[] = [
  {
    tag: "Instituciones",
    title: "Cómo construir un claustro docente de alto impacto",
    desc: "Guía práctica para instituciones sobre selección, diversificación y fidelización de talento académico. Equilibra perfiles investigadores con expertos profesionales.",
    readTime: "8 min",
    href: "/resources/claustro-docente",
    image: "universidad",
  },
  {
    tag: "Calidad",
    title: "Estándares de verificación FacultyMatch",
    desc: "Conoce los criterios y el proceso de auditoría que aplicamos para validar credenciales académicas, títulos de doctorado y experiencia profesional verificada.",
    readTime: "5 min",
    href: "/resources/estandares-verificacion",
    image: "laboratorio",
  },
  {
    tag: "Tendencias",
    title: "El futuro de la docencia online y microcredenciales",
    desc: "Análisis de las tendencias pedagógicas en entornos virtuales y cómo los docentes expertos pueden posicionarse en el mercado de microcredenciales internacionales.",
    readTime: "12 min",
    href: "/resources/docencia-online-microcredenciales",
    image: "online",
  },
  {
    tag: "Docentes",
    title: "Guía: Optimiza tu perfil docente en FacultyMatch",
    desc: "Mejores prácticas para destacar tu trayectoria académica. Cómo estructurar áreas de conocimiento y generar confianza en las instituciones.",
    readTime: "6 min",
    href: "/resources/optimiza-perfil-docente",
    image: "notas",
  },
  {
    tag: "Estructura",
    title: "Taxonomía Académica Global",
    desc: "Cómo clasificamos las disciplinas y sub-áreas siguiendo estándares internacionales. Una herramienta clave para el matching preciso entre oferta y demanda.",
    readTime: "10 min",
    href: "/resources/taxonomia-academica",
    image: "taxonomia",
  },
  {
    tag: "Gestión",
    title: "Estrategias de reclutamiento en 90 días",
    desc: "Plan de acción para directores académicos: desde la identificación de necesidades hasta la firma de la colaboración docente.",
    readTime: "15 min",
    href: "/resources/reclutamiento-90-dias",
    image: "reclutamiento",
  },
];

export default function ResourcesPage() {
  return (
    <div className="bg-fm-surface font-sans">
      <Navbar />

      {/* ── HERO ── */}
      
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(720px 440px at 18% 4%, rgba(27,79,216,0.3), transparent 60%), linear-gradient(160deg, #0B1B33 0%, #071326 72%)",
          }}
        />
        <div className="relative z-[2] mx-auto grid w-full max-w-[1100px] items-center gap-10 px-5 py-16 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:px-10 md:py-0 md:min-h-[520px]">
          <div className="text-center md:text-left">

            <h1 className="mb-5 text-balance text-[34px] font-extrabold leading-[1.08] tracking-[-0.03em] text-white md:text-[clamp(34px,4vw,50px)]">
              Recursos para docentes e instituciones.
            </h1>

            <p className="mx-auto mb-9 max-w-[480px] text-base leading-[1.75] text-white/70 md:mx-0">
              Guías, estándares y análisis para elevar los criterios de selección
              de talento académico en la educación superior.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center md:justify-start">
              <Link
                href="/signup"
                className="rounded-[10px] bg-white px-8 py-3.5 text-center text-sm font-bold tracking-[-0.01em] text-fm-ink transition-all duration-150 ease-out hover:opacity-90 active:scale-[0.97]"
              >
                Publicar mi perfil
              </Link>
              <Link
                href="/signup?intent=institution"
                className="rounded-[10px] border border-white/30 px-8 py-3.5 text-center text-sm text-white/80 transition-transform duration-150 ease-out active:scale-[0.97]"
              >
                Buscar docentes
              </Link>
            </div>
          </div>

          <div className="relative mx-auto aspect-[3/2] w-full max-w-[440px] overflow-hidden rounded-2xl border border-white/10 md:mx-0 md:max-w-none">
            <Image
              src={IMAGES.recursos.src}
              alt={IMAGES.recursos.alt}
              title={IMAGES.recursos.title}
              fill
              sizes="(min-width: 768px) 45vw, 90vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* ── ARTÍCULOS ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1180px] px-6 py-16 md:px-8 md:py-[104px]">
          <div className="mx-auto mb-12 max-w-[640px] text-center md:mb-16">
            <h2 className="mb-3.5 text-balance text-[1.7rem] font-extrabold leading-[1.15] tracking-[-0.035em] text-fm-ink md:text-[clamp(1.7rem,3.4vw,2.5rem)]">
              Lo que necesitas saber sobre talento académico.
            </h2>
            <p className="text-base text-[#5B6B85]">
              Contenido escrito por directores de programa y especialistas en gestión académica.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {RESOURCES.map((r, i) => (
              <Link key={i} href={r.href} className="no-underline">
                <article className="flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#E1E7F5] bg-white transition-shadow hover:shadow-sm">
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={IMAGES[r.image].src}
                      alt={IMAGES[r.image].alt}
                      title={IMAGES[r.image].title}
                      fill
                      sizes="(min-width: 768px) 360px, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                  <p className="mb-3 font-mono text-xs font-semibold text-[#5E6F8E]">
                    {r.tag} · {r.readTime} de lectura
                  </p>
                  <h3 className="mb-3 text-[17px] font-bold leading-snug tracking-[-0.02em] text-fm-ink">
                    {r.title}
                  </h3>
                  <p className="mb-5 flex-1 text-sm leading-[1.7] text-[#5B6B85]">{r.desc}</p>
                  <div className="text-sm font-bold text-fm-blue">Leer artículo →</div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOBRE EL KNOWLEDGE CENTER ── */}
      <SectionRows>
        <Row
          title="La calidad del claustro determina la calidad de la institución."
          body={
            <>
              <p>
                Estos recursos ayudan a directores de programa y coordinadores académicos a tomar mejores decisiones sobre su talento docente. Y a los propios docentes, a entender qué valoran las instituciones.
              </p>
              <p className="mt-4 text-sm">
                ¿Hablamos? Llámanos al{" "}
                <a href="tel:+34616684214" className="font-semibold text-fm-navy hover:text-fm-blue">
                  +34 616 684 214
                </a>
                .
              </p>
            </>
          }
          bullets={[
            <><b>Criterio universitario.</b> Alineado con los estándares de las agencias de calidad y acreditación.</>,
            <><b>Enfoque práctico.</b> Guías pensadas para decisiones reales de selección de profesorado.</>,
            <><b>Se mantiene al día.</b> Revisamos el contenido cuando cambia la normativa relevante.</>,
          ]}
          href="mailto:support@facultymatch.app"
          cta="Contactar con el equipo →"
        >
          <div className="relative aspect-[4/3.1] overflow-hidden rounded-[14px]">
            <Image
              src={IMAGES.jornada.src}
              alt={IMAGES.jornada.alt}
              title={IMAGES.jornada.title}
              fill
              sizes="(min-width: 768px) 520px, 100vw"
              className="object-cover"
            />
          </div>
        </Row>
      </SectionRows>

      {/* ── PRENSA ── */}
      {/* Sello de "hablan de nosotros" — solo el nombre del medio enlazado, sin
          reproducir cifras del artículo (es de mediados de 2026 y ya no
          coincide con los datos reales del directorio). */}
      <section className="border-y border-fm-border bg-white px-6 py-10 md:px-8">
        <div className="mx-auto flex max-w-[900px] flex-col items-center gap-4 text-center">
          <a
            href="https://alicanteplaza.es/alicanteplaza/empresas/asi-es-facultymatch-el-linkedin-de-docentes-impulsada-por-un-noveldense-para-universidades-y-escuelas-de-negocio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-lg font-extrabold tracking-[-0.02em] text-fm-ink transition-colors hover:text-fm-blue"
          >
            Alicante Plaza
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50">
              <path d="M7 17L17 7M17 7H8M17 7V16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

      {/* ── CTA NEWSLETTER ── */}
      <div id="newsletter" className="scroll-mt-16">
        <DarkBand>
          <h2 className="mx-auto max-w-[22ch] text-balance text-[1.5rem] font-extrabold leading-[1.12] tracking-[-0.035em] text-fm-ink md:text-[clamp(1.5rem,2.8vw,2.1rem)]">
            El reporte mensual de la educación superior.
          </h2>
          <p className="mx-auto mt-3.5 max-w-[52ch] text-base text-[#5B6B85]">
            Tendencias de reclutamiento, cambios regulatorios y nuevas oportunidades docentes. Una vez al mes.
          </p>
          <div className="mx-auto mt-7 max-w-[460px]">
            <NewsletterForm />
          </div>
        </DarkBand>
      </div>
    </div>
  );
}
