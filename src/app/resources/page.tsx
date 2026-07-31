import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Recursos para docentes e instituciones | FacultyMatch",
  description:
    "Guías, estándares y mejores prácticas para el reclutamiento docente y el desarrollo de carrera académica en educación superior.",
  keywords:
    "recursos académicos, guías docentes, reclutamiento universitario, estándares académicos, educación superior",
};

const RESOURCES = [
  {
    tag: "Instituciones",
    title: "Cómo construir un claustro docente de alto impacto",
    desc: "Guía práctica para instituciones sobre selección, diversificación y fidelización de talento académico. Equilibra perfiles investigadores con expertos profesionales.",
    readTime: "8 min",
    href: "/resources/claustro-docente",
    tagColor: "#1B4FD8", tagBg: "#EFF6FF",
  },
  {
    tag: "Calidad",
    title: "Estándares de verificación FacultyMatch",
    desc: "Conoce los criterios y el proceso de auditoría que aplicamos para validar credenciales académicas, títulos de doctorado y experiencia profesional verificada.",
    readTime: "5 min",
    href: "/resources/estandares-verificacion",
    tagColor: "#065F46", tagBg: "#F0FDF4",
  },
  {
    tag: "Tendencias",
    title: "El futuro de la docencia online y microcredenciales",
    desc: "Análisis de las tendencias pedagógicas en entornos virtuales y cómo los docentes expertos pueden posicionarse en el mercado de microcredenciales internacionales.",
    readTime: "12 min",
    href: "/resources/docencia-online-microcredenciales",
    tagColor: "#92400E", tagBg: "#FEF3C7",
  },
  {
    tag: "Docentes",
    title: "Guía: Optimiza tu perfil docente en FacultyMatch",
    desc: "Mejores prácticas para destacar tu trayectoria académica. Cómo estructurar áreas de conocimiento y generar confianza en las instituciones.",
    readTime: "6 min",
    href: "/resources/optimiza-perfil-docente",
    tagColor: "#1B4FD8", tagBg: "#EFF6FF",
  },
  {
    tag: "Estructura",
    title: "Taxonomía Académica Global",
    desc: "Cómo clasificamos las disciplinas y sub-áreas siguiendo estándares internacionales. Una herramienta clave para el matching preciso entre oferta y demanda.",
    readTime: "10 min",
    href: "/resources/taxonomia-academica",
    tagColor: "#5B21B6", tagBg: "#F5F3FF",
  },
  {
    tag: "Gestión",
    title: "Estrategias de reclutamiento en 90 días",
    desc: "Plan de acción para directores académicos: desde la identificación de necesidades hasta la firma de la colaboración docente.",
    readTime: "15 min",
    href: "/resources/reclutamiento-90-dias",
    tagColor: "#9A3412", tagBg: "#FFF7ED",
  },
];

export default function ResourcesPage() {
  return (
    <div className="bg-fm-surface font-sans">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <video
          autoPlay muted loop playsInline
          poster="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1800"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "center 40%" }}
        >
          <source src="https://assets.mixkit.co/videos/6532/6532-720.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, rgba(7,19,38,0.55) 0%, rgba(7,19,38,0.75) 60%, rgba(7,19,38,0.94) 100%)" }}
        />
        <div className="relative z-[2] flex min-h-[500px] flex-col items-center justify-center px-5 py-16 text-center md:px-10 md:py-20">
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-fm-gold/35 bg-fm-gold/15 px-3.5 py-[5px]">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-fm-gold">
              Centro de conocimiento
            </span>
          </div>

          <h1 className="mb-5 max-w-[680px] text-[34px] font-black leading-[1.05] tracking-[-0.04em] text-white md:text-[54px]">
            Recursos para docentes<br />e instituciones.
          </h1>

          <p className="mb-9 max-w-[480px] text-base leading-[1.75] text-white/60">
            Guías, estándares y análisis para elevar los criterios de selección
            de talento académico en la educación superior.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/signup">
              <button className="rounded-[7px] bg-white px-[30px] py-3.5 text-sm font-bold tracking-[-0.01em] text-fm-ink">
                Publicar mi perfil
              </button>
            </Link>
            <Link href="/signup?intent=institution">
              <button className="rounded-[7px] border border-white/30 px-[30px] py-3.5 text-sm text-white/80">
                Buscar docentes
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── ARTÍCULOS ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1100px] px-5 py-12 md:px-10 md:py-20">
          <div className="mb-14 text-center">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-fm-blue/20 bg-fm-blue/[0.08] px-3.5 py-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-fm-blue">
                Guías y análisis
              </span>
            </div>
            <h2 className="mb-3 text-[32px] font-black leading-[1.1] tracking-[-0.04em] text-fm-ink">
              Lo que necesitas saber sobre talento académico.
            </h2>
            <p className="mx-auto max-w-[460px] text-[15px] leading-[1.7] text-fm-muted">
              Contenido escrito por directores de programa y especialistas en gestión académica.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {RESOURCES.map((r, i) => (
              <Link key={i} href={r.href} className="no-underline">
                <div
                  className="flex h-full cursor-pointer flex-col rounded-2xl border border-fm-border bg-white p-6 transition-shadow hover:shadow-lg"
                  style={{ borderTop: "3px solid #1B4FD8" }}
                >
                  <div className="mb-4 flex items-center gap-2.5">
                    <span
                      className="rounded-full px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.1em]"
                      style={{ color: r.tagColor, background: r.tagBg }}
                    >
                      {r.tag}
                    </span>
                    <span className="text-[11px] text-[#9CA3AF]">{r.readTime} lectura</span>
                  </div>
                  <h3 className="mb-3 text-base font-bold leading-snug tracking-[-0.02em] text-fm-ink">
                    {r.title}
                  </h3>
                  <p className="mb-5 flex-1 text-[13px] leading-[1.75] text-fm-muted">{r.desc}</p>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-fm-blue">
                    Leer artículo <span className="text-sm">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOBRE EL KNOWLEDGE CENTER ── */}
      <section className="bg-fm-surface">
        <div className="mx-auto max-w-[1100px] px-5 py-12 md:px-10 md:py-20">
          <div className="grid items-center gap-0 md:grid-cols-2 md:gap-[60px]">
            <div className="hidden h-[420px] overflow-hidden rounded-2xl md:block">
              <div
                className="h-full w-full bg-cover bg-top"
                style={{ backgroundImage: "url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=900)" }}
              />
            </div>

            <div>
              <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-fm-gold/25 bg-fm-gold/[0.12] px-3.5 py-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-fm-gold">
                  Por qué publicamos esto
                </span>
              </div>
              <h2 className="mb-[18px] text-[30px] font-black leading-[1.15] tracking-[-0.04em] text-fm-ink">
                La calidad del claustro<br />
                determina la calidad de la institución.
              </h2>
              <p className="mb-6 text-[15px] leading-[1.8] text-fm-muted">
                Estos recursos ayudan a directores de programa y coordinadores académicos a tomar mejores decisiones sobre su talento docente. Y a los propios docentes, a entender qué valoran las instituciones.
              </p>
              <div className="mb-8 flex flex-col gap-4">
                {[
                  { label: "Estándar universitario", body: "Alineado con los criterios de las agencias de calidad internacionales." },
                  { label: "Red de colaboradores",   body: "Artículos escritos por decanos y directores de programa en activo." },
                  { label: "Actualización continua", body: "El contenido se revisa y actualiza con cada cambio regulatorio relevante." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-fm-blue/20 bg-fm-blue/10">
                      <span className="text-xs font-extrabold text-fm-blue">0{i + 1}</span>
                    </div>
                    <div>
                      <h4 className="mb-0.5 text-sm font-bold tracking-[-0.02em] text-fm-ink">{item.label}</h4>
                      <p className="text-[13px] leading-[1.6] text-fm-muted">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="mailto:support@facultymatch.app">
                <button className="rounded-[7px] border border-fm-border px-6 py-[11px] text-[13px] font-semibold text-fm-navy">
                  Contactar con el equipo
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA NEWSLETTER ── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1800)",
            backgroundPosition: "center 55%",
          }}
        />
        <div className="absolute inset-0 bg-fm-dark/[0.82]" />
        <div className="relative z-[2] mx-auto max-w-[1100px] px-5 py-14 md:px-10 md:py-18">
          <div className="grid gap-8 md:grid-cols-2 md:gap-14">
            <div>
              <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-fm-gold/30 bg-fm-gold/15 px-3.5 py-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-fm-gold">
                  FacultyMatch Monthly
                </span>
              </div>
              <h2 className="mb-4 text-[28px] font-black leading-[1.15] tracking-[-0.04em] text-white">
                El reporte mensual de la educación superior.
              </h2>
              <p className="mb-5 text-[15px] leading-[1.8] text-white/55">
                Tendencias de reclutamiento, cambios regulatorios y nuevas oportunidades docentes. Una vez al mes. Sin spam.
              </p>
              <div className="flex flex-col gap-2.5">
                {["Cero spam", "Cancelable en cualquier momento", "Solo contenido relevante"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-fm-blue/30 bg-fm-blue/20">
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="#1B4FD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-white/50">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-center gap-3">
              <div className="flex overflow-hidden rounded-[9px] border border-white/15 bg-white/[0.07]">
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="flex-1 bg-transparent px-[18px] py-3.5 text-sm text-white outline-none placeholder:text-white/40"
                />
                <button className="shrink-0 bg-fm-blue px-[22px] text-[13px] font-bold tracking-[-0.01em] text-white">
                  Suscribirme
                </button>
              </div>
              <p className="text-center text-[11px] text-white/25">
                Una vez al mes. Sin spam. Cancela cuando quieras.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
