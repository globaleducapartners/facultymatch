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

const SERIF = `var(--font-serif, 'Georgia', 'Times New Roman', serif)`;
const SANS  = `var(--font-sans, system-ui, -apple-system, sans-serif)`;

const C = {
  ink: "#0C1018", navy: "#0D2240", brass: "#B8963E",
  cream: "#F7F5F0", paper: "#FDFCF9", white: "#FFFFFF",
  muted: "#6B7280", faint: "#9CA3AF", border: "#E5E1D8",
};

const RESOURCES = [
  {
    tag: "Instituciones",
    title: "Cómo construir un claustro docente de alto impacto",
    desc: "Guía práctica para instituciones sobre selección, diversificación y fidelización de talento académico. Aprende a equilibrar perfiles investigadores con expertos profesionales.",
    readTime: "8 min",
    href: "/resources/claustro-docente",
  },
  {
    tag: "Calidad",
    title: "Estándares de verificación FacultyMatch",
    desc: "Conoce los criterios y el proceso de auditoría que aplicamos para validar credenciales académicas, títulos de doctorado y experiencia profesional verificada.",
    readTime: "5 min",
    href: "/resources/estandares-verificacion",
  },
  {
    tag: "Tendencias",
    title: "El futuro de la docencia online y microcredenciales",
    desc: "Análisis de las tendencias pedagógicas en entornos virtuales y cómo los docentes expertos pueden posicionarse en el mercado de las microcredenciales internacionales.",
    readTime: "12 min",
    href: "/resources/docencia-online-microcredenciales",
  },
  {
    tag: "Docentes",
    title: "Guía: Optimiza tu perfil docente en FacultyMatch",
    desc: "Mejores prácticas para destacar tu trayectoria académica. Cómo estructurar tus áreas de conocimiento y generar confianza en las instituciones.",
    readTime: "6 min",
    href: "/resources/optimiza-perfil-docente",
  },
  {
    tag: "Estructura",
    title: "Taxonomía Académica Global",
    desc: "Cómo clasificamos las disciplinas y sub-áreas siguiendo estándares internacionales. Una herramienta clave para el matching preciso entre oferta y demanda.",
    readTime: "10 min",
    href: "/resources/taxonomia-academica",
  },
  {
    tag: "Gestión",
    title: "Estrategias de reclutamiento en 90 días",
    desc: "Plan de acción para directores académicos: desde la identificación de necesidades hasta la firma de la colaboración docente.",
    readTime: "15 min",
    href: "/resources/reclutamiento-90-dias",
  },
];

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Instituciones: { bg: "#EFF6FF", text: "#1D4ED8" },
  Calidad:       { bg: "#F0FDF4", text: "#065F46" },
  Tendencias:    { bg: "#FEF3C7", text: "#92400E" },
  Docentes:      { bg: "#EFF6FF", text: "#1D4ED8" },
  Estructura:    { bg: "#F5F3FF", text: "#5B21B6" },
  Gestión:       { bg: "#FFF7ED", text: "#9A3412" },
};

export default function ResourcesPage() {
  return (
    <div style={{ background: C.paper, fontFamily: SANS }}>
      <style>{`
        .fm-hero-h1 { font-size: 54px; }
        .fm-section-pad { padding: 72px 40px; }
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
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1800"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 40%",
          }}
        >
          <source src="https://assets.mixkit.co/videos/6532/6532-720.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(160deg, rgba(12,16,24,0.5) 0%, rgba(12,16,24,0.72) 60%, rgba(12,16,24,0.92) 100%)",
        }} />
        <div style={{
          position: "relative", zIndex: 2, minHeight: 460,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "80px 40px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <div style={{ width: 28, height: "0.5px", background: "rgba(255,255,255,0.28)" }} />
            <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.45)" }}>
              Centro de conocimiento
            </span>
            <div style={{ width: 28, height: "0.5px", background: "rgba(255,255,255,0.28)" }} />
          </div>

          <h1 className="fm-hero-h1" style={{ fontFamily: SERIF, fontWeight: 400, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.025em", margin: "0 0 20px", maxWidth: 680 }}>
            Recursos para docentes
            e instituciones.
          </h1>

          <p style={{ fontFamily: SANS, fontSize: 16, color: "rgba(255,255,255,0.58)", lineHeight: 1.75, margin: "0 0 38px", maxWidth: 480 }}>
            Guías, estándares y análisis para elevar los criterios de selección
            de talento académico en la educación superior.
          </p>

          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/signup">
              <button style={{ fontFamily: SANS, background: "#fff", color: C.ink, border: "none", padding: "13px 32px", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Publicar mi perfil
              </button>
            </Link>
            <Link href="/signup?intent=institution">
              <button style={{ fontFamily: SANS, background: "transparent", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.28)", padding: "13px 32px", borderRadius: 6, fontSize: 14, cursor: "pointer" }}>
                Buscar docentes
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── ARTÍCULOS ── */}
      <section style={{ background: C.white }}>
        <div className="fm-section-pad" style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: C.brass, marginBottom: 12 }}>
              Guías y análisis
            </div>
            <h2 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 400, color: C.ink, letterSpacing: "-0.025em", margin: "0 0 12px", lineHeight: 1.1 }}>
              Lo que necesitas saber sobre talento académico.
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 15, color: C.muted, maxWidth: 460, margin: "0 auto" }}>
              Contenido escrito por directores de programa y especialistas en gestión académica.
            </p>
          </div>

          <div className="fm-grid-3">
            {RESOURCES.map((r, i) => {
              const tc = TAG_COLORS[r.tag] ?? { bg: C.cream, text: C.muted };
              return (
                <Link key={i} href={r.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: C.cream, border: `1px solid ${C.border}`,
                    borderRadius: 12, padding: "28px 26px",
                    borderTop: `3px solid ${C.brass}`,
                    height: "100%", display: "flex", flexDirection: "column" as const,
                    cursor: "pointer",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: tc.text, background: tc.bg, padding: "3px 10px", borderRadius: 20 }}>
                        {r.tag}
                      </span>
                      <span style={{ fontFamily: SANS, fontSize: 11, color: C.faint }}>
                        {r.readTime} lectura
                      </span>
                    </div>
                    <h3 style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 400, color: C.ink, lineHeight: 1.35, margin: "0 0 12px" }}>
                      {r.title}
                    </h3>
                    <p style={{ fontFamily: SANS, fontSize: 13, color: C.muted, lineHeight: 1.75, margin: "0 0 20px", flex: 1 }}>
                      {r.desc}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: SANS, fontSize: 12, color: C.brass, fontWeight: 500 }}>
                      Leer artículo
                      <span style={{ fontSize: 14 }}>→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SOBRE EL KNOWLEDGE CENTER ── */}
      <section style={{ background: C.cream }}>
        <div className="fm-section-pad" style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div className="fm-grid-2">
            {/* Foto */}
            <div className="fm-photo-hide" style={{ borderRadius: 14, overflow: "hidden", height: 420 }}>
              <div style={{
                width: "100%", height: "100%",
                backgroundImage: `url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=900)`,
                backgroundSize: "cover", backgroundPosition: "center top",
              }} />
            </div>

            {/* Contenido */}
            <div>
              <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: C.brass, marginBottom: 16 }}>
                Por qué publicamos esto
              </div>
              <h2 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 400, color: C.ink, letterSpacing: "-0.025em", margin: "0 0 18px", lineHeight: 1.2 }}>
                La calidad del claustro<br />
                determina la calidad de la institución.
              </h2>
              <p style={{ fontFamily: SANS, fontSize: 15, color: C.muted, lineHeight: 1.8, margin: "0 0 20px" }}>
                Estos recursos ayudan a directores de programa y coordinadores académicos a tomar mejores decisiones sobre su talento docente. Y a los propios docentes, a entender qué valoran las instituciones.
              </p>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 14, marginBottom: 32 }}>
                {[
                  { label: "Estándar universitario", body: "Alineado con los criterios de las agencias de calidad internacionales." },
                  { label: "Red de colaboradores",   body: "Artículos escritos por decanos y directores de programa en activo." },
                  { label: "Actualización continua", body: "El contenido se revisa y actualiza con cada cambio regulatorio relevante." },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: C.white, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <span style={{ fontFamily: SERIF, fontSize: 11, color: C.brass, fontStyle: "italic" }}>{["I", "II", "III"][i]}</span>
                    </div>
                    <div>
                      <h4 style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 400, color: C.ink, margin: "0 0 3px" }}>{item.label}</h4>
                      <p style={{ fontFamily: SANS, fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0 }}>{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="mailto:support@facultymatch.app">
                <button style={{ fontFamily: SANS, background: "transparent", color: C.navy, border: `1px solid ${C.navy}`, padding: "11px 26px", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
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
        <div style={{ position: "absolute", inset: 0, background: "rgba(12,16,24,0.78)" }} />
        <div style={{
          position: "relative", zIndex: 2,
          maxWidth: 1080, margin: "0 auto",
          padding: "64px 40px",
        }}>
          <div className="fm-grid-2" style={{ gap: 48 }}>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: C.brass, marginBottom: 14 }}>
                FacultyMatch Monthly
              </div>
              <h2 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 400, color: "#fff", lineHeight: 1.25, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
                El reporte mensual de la educación superior.
              </h2>
              <p style={{ fontFamily: SANS, fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, margin: "0 0 20px" }}>
                Tendencias de reclutamiento, cambios regulatorios y nuevas oportunidades docentes. Una vez al mes. Sin spam.
              </p>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                {["Cero spam", "Cancelable en cualquier momento", "Solo contenido relevante"].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.brass, flexShrink: 0 }} />
                    <span style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, justifyContent: "center", gap: 12 }}>
              <div style={{ display: "flex", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, overflow: "hidden" }}>
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  style={{
                    flex: 1, border: "none", outline: "none",
                    background: "transparent", padding: "13px 18px",
                    fontFamily: SANS, fontSize: 14,
                    color: "#fff",
                  }}
                />
                <button style={{ fontFamily: SANS, background: C.brass, color: "#fff", border: "none", padding: "13px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0, borderRadius: "0 7px 7px 0" }}>
                  Suscribirme
                </button>
              </div>
              <p style={{ fontFamily: SANS, fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0, textAlign: "center" as const }}>
                Más de 8.000 académicos ya suscritos
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
