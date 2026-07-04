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

const SANS = `var(--font-sans, system-ui, -apple-system, sans-serif)`;

const D = {
  dark:   "#071326",
  navy:   "#0D2240",
  blue:   "#1B4FD8",
  gold:   "#E9A030",
  surf:   "#F2F6FC",
  white:  "#FFFFFF",
  ink:    "#0C1018",
  muted:  "#6B7280",
  faint:  "#9CA3AF",
  border: "#D8E2EF",
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
    <div style={{ background: D.surf, fontFamily: SANS }}>
      <style>{`
        .fm-hero-h1 { font-size: 54px; }
        .fm-section-pad { padding: 80px 40px; }
        .fm-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .fm-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .fm-cta-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 32px; }
        @media (max-width: 768px) {
          .fm-hero-h1 { font-size: 34px !important; }
          .fm-section-pad { padding: 48px 20px !important; }
          .fm-grid-3 { grid-template-columns: 1fr !important; }
          .fm-grid-2 { grid-template-columns: 1fr !important; gap: 0 !important; }
          .fm-cta-row { flex-direction: column !important; align-items: flex-start !important; }
          .fm-photo-hide { display: none !important; }
        }
      `}</style>

      <Navbar />

      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <video
          autoPlay muted loop playsInline
          poster="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1800"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}
        >
          <source src="https://assets.mixkit.co/videos/6532/6532-720.mp4" type="video/mp4" />
        </video>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, rgba(7,19,38,0.55) 0%, rgba(7,19,38,0.75) 60%, rgba(7,19,38,0.94) 100%)` }} />
        <div style={{
          position: "relative", zIndex: 2, minHeight: 500,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "80px 40px",
        }}>
          {/* Eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(233,160,48,0.15)", border: "1px solid rgba(233,160,48,0.35)",
            borderRadius: 20, padding: "5px 14px", marginBottom: 24,
          }}>
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: D.gold }}>
              Centro de conocimiento
            </span>
          </div>

          <h1 className="fm-hero-h1" style={{
            fontFamily: SANS, fontWeight: 900, color: "#fff",
            lineHeight: 1.05, letterSpacing: "-0.04em",
            margin: "0 0 20px", maxWidth: 680,
          }}>
            Recursos para docentes<br />e instituciones.
          </h1>

          <p style={{ fontFamily: SANS, fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.75, margin: "0 0 36px", maxWidth: 480 }}>
            Guías, estándares y análisis para elevar los criterios de selección
            de talento académico en la educación superior.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, justifyContent: "center" }}>
            <Link href="/signup">
              <button style={{ fontFamily: SANS, background: D.white, color: D.ink, border: "none", padding: "13px 30px", borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em" }}>
                Publicar mi perfil
              </button>
            </Link>
            <Link href="/signup?intent=institution">
              <button style={{ fontFamily: SANS, background: "transparent", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.28)", padding: "13px 30px", borderRadius: 7, fontSize: 14, cursor: "pointer" }}>
                Buscar docentes
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── ARTÍCULOS ── */}
      <section style={{ background: D.white }}>
        <div className="fm-section-pad" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(27,79,216,0.08)", border: "1px solid rgba(27,79,216,0.2)",
              borderRadius: 20, padding: "4px 14px", marginBottom: 16,
            }}>
              <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: D.blue }}>
                Guías y análisis
              </span>
            </div>
            <h2 style={{ fontFamily: SANS, fontSize: 32, fontWeight: 900, color: D.ink, letterSpacing: "-0.04em", margin: "0 0 12px", lineHeight: 1.1 }}>
              Lo que necesitas saber sobre talento académico.
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 15, color: D.muted, maxWidth: 460, margin: "0 auto", lineHeight: 1.7 }}>
              Contenido escrito por directores de programa y especialistas en gestión académica.
            </p>
          </div>

          <div className="fm-grid-3">
            {RESOURCES.map((r, i) => (
              <Link key={i} href={r.href} style={{ textDecoration: "none" }}>
                <div style={{
                  background: D.white, border: `1px solid ${D.border}`,
                  borderRadius: 14, padding: "28px 24px",
                  borderTop: `3px solid ${D.blue}`,
                  height: "100%", display: "flex", flexDirection: "column" as const,
                  cursor: "pointer", transition: "box-shadow 0.2s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <span style={{
                      fontFamily: SANS, fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.1em", textTransform: "uppercase" as const,
                      color: r.tagColor, background: r.tagBg,
                      padding: "3px 10px", borderRadius: 20,
                    }}>
                      {r.tag}
                    </span>
                    <span style={{ fontFamily: SANS, fontSize: 11, color: D.faint }}>
                      {r.readTime} lectura
                    </span>
                  </div>
                  <h3 style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: D.ink, lineHeight: 1.4, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
                    {r.title}
                  </h3>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: D.muted, lineHeight: 1.75, margin: "0 0 20px", flex: 1 }}>
                    {r.desc}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: SANS, fontSize: 12, color: D.blue, fontWeight: 600 }}>
                    Leer artículo <span style={{ fontSize: 14 }}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOBRE EL KNOWLEDGE CENTER ── */}
      <section style={{ background: D.surf }}>
        <div className="fm-section-pad" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="fm-grid-2">
            {/* Imagen */}
            <div className="fm-photo-hide" style={{ borderRadius: 16, overflow: "hidden", height: 420 }}>
              <div style={{
                width: "100%", height: "100%",
                backgroundImage: `url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=900)`,
                backgroundSize: "cover", backgroundPosition: "center top",
              }} />
            </div>

            {/* Contenido */}
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(233,160,48,0.12)", border: "1px solid rgba(233,160,48,0.25)",
                borderRadius: 20, padding: "4px 14px", marginBottom: 20,
              }}>
                <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: D.gold }}>
                  Por qué publicamos esto
                </span>
              </div>
              <h2 style={{ fontFamily: SANS, fontSize: 30, fontWeight: 900, color: D.ink, letterSpacing: "-0.04em", margin: "0 0 18px", lineHeight: 1.15 }}>
                La calidad del claustro<br />
                determina la calidad de la institución.
              </h2>
              <p style={{ fontFamily: SANS, fontSize: 15, color: D.muted, lineHeight: 1.8, margin: "0 0 24px" }}>
                Estos recursos ayudan a directores de programa y coordinadores académicos a tomar mejores decisiones sobre su talento docente. Y a los propios docentes, a entender qué valoran las instituciones.
              </p>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 16, marginBottom: 32 }}>
                {[
                  { label: "Estándar universitario", body: "Alineado con los criterios de las agencias de calidad internacionales." },
                  { label: "Red de colaboradores",   body: "Artículos escritos por decanos y directores de programa en activo." },
                  { label: "Actualización continua", body: "El contenido se revisa y actualiza con cada cambio regulatorio relevante." },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: "rgba(27,79,216,0.1)", border: "1px solid rgba(27,79,216,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: D.blue }}>0{i + 1}</span>
                    </div>
                    <div>
                      <h4 style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: D.ink, margin: "0 0 3px", letterSpacing: "-0.02em" }}>{item.label}</h4>
                      <p style={{ fontFamily: SANS, fontSize: 13, color: D.muted, lineHeight: 1.6, margin: 0 }}>{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="mailto:support@facultymatch.app">
                <button style={{ fontFamily: SANS, background: "transparent", color: D.navy, border: `1px solid ${D.border}`, padding: "11px 26px", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Contactar con el equipo
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA NEWSLETTER ── */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1800)`,
          backgroundSize: "cover", backgroundPosition: "center 55%",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(7,19,38,0.82)" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1100, margin: "0 auto", padding: "72px 40px" }}>
          <div className="fm-grid-2" style={{ gap: 56 }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(233,160,48,0.15)", border: "1px solid rgba(233,160,48,0.3)",
                borderRadius: 20, padding: "4px 14px", marginBottom: 20,
              }}>
                <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: D.gold }}>
                  FacultyMatch Monthly
                </span>
              </div>
              <h2 style={{ fontFamily: SANS, fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1.15, margin: "0 0 16px", letterSpacing: "-0.04em" }}>
                El reporte mensual de la educación superior.
              </h2>
              <p style={{ fontFamily: SANS, fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, margin: "0 0 20px" }}>
                Tendencias de reclutamiento, cambios regulatorios y nuevas oportunidades docentes. Una vez al mes. Sin spam.
              </p>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                {["Cero spam", "Cancelable en cualquier momento", "Solo contenido relevante"].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: "rgba(27,79,216,0.2)", border: "1px solid rgba(27,79,216,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="#1B4FD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, justifyContent: "center", gap: 12 }}>
              <div style={{ display: "flex", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 9, overflow: "hidden" }}>
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  style={{
                    flex: 1, border: "none", outline: "none",
                    background: "transparent", padding: "14px 18px",
                    fontFamily: SANS, fontSize: 14, color: "#fff",
                  }}
                />
                <button style={{
                  fontFamily: SANS, background: D.blue, color: "#fff",
                  border: "none", padding: "14px 22px",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  flexShrink: 0, letterSpacing: "-0.01em",
                }}>
                  Suscribirme
                </button>
              </div>
              <p style={{ fontFamily: SANS, fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0, textAlign: "center" as const }}>
                Una vez al mes. Sin spam. Cancela cuando quieras.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
