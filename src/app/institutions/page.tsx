// src/app/institutions/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Para instituciones educativas | FacultyMatch",
  description:
    "Directorio de docentes, investigadores y expertos para instituciones educativas. Búsqueda por área, idioma y disponibilidad. Contacto directo. Sin comisiones.",
  keywords:
    "buscar docentes, directorio profesores, reclutamiento académico, profesorado universidad, expertos educación superior",
};

const SERIF = `var(--font-serif, 'Georgia', 'Times New Roman', serif)`;
const SANS  = `var(--font-sans, system-ui, -apple-system, sans-serif)`;

const C = {
  ink: "#0C1018", navy: "#0D2240", brass: "#B8963E",
  cream: "#F7F5F0", paper: "#FDFCF9", white: "#FFFFFF",
  muted: "#6B7280", faint: "#9CA3AF", border: "#E5E1D8",
};

const VALUES = [
  {
    title: "Verificado de verdad",
    desc: "Todos los perfiles son revisados manualmente antes de publicarse. Sin perfiles incompletos ni datos sin comprobar.",
  },
  {
    title: "Disponibilidad real",
    desc: "Cada docente indica si está activo para nuevas colaboraciones. Sin mensajes sin respuesta ni perfiles abandonados.",
  },
  {
    title: "Contacto directo",
    desc: "Escribe directamente al docente. Sin intermediarios, sin comisiones por contratación, sin procesos de intermediación.",
  },
];

const HOW = [
  { n: "I",   title: "Registra tu institución",  body: "Acceso al directorio completo desde el primer día. Sin proceso de aprobación previo." },
  { n: "II",  title: "Busca con filtros reales",  body: "Por área de conocimiento, idioma, modalidad y disponibilidad. Los resultados son exactamente lo que necesitas." },
  { n: "III", title: "Contacta directamente",     body: "Envía una solicitud al docente. Él decide si responde. Sin intermediarios ni comisiones por contratación." },
];

export default function InstitutionsPage() {
  return (
    <div style={{ background: C.paper, fontFamily: SANS }}>
      <style>{`
        .fm-hero-section { height: 520px; overflow: hidden; position: relative; }
        .fm-hero-h1 { font-size: 52px; }
        .fm-pad { padding: 72px 40px; }
        .fm-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        .fm-grid-2-eq { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 760px; margin: 0 auto; }
        .fm-cta-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 32px; padding: 64px 40px; max-width: 1080px; margin: 0 auto; width: 100%; }
        @media (max-width: 768px) {
          .fm-hero-section { height: auto !important; min-height: 480px; padding: 80px 0 60px; }
          .fm-hero-h1 { font-size: 32px !important; }
          .fm-pad { padding: 48px 20px !important; }
          .fm-grid-3 { grid-template-columns: 1fr !important; }
          .fm-grid-2-eq { grid-template-columns: 1fr !important; }
          .fm-cta-inner { flex-direction: column; align-items: flex-start; padding: 48px 20px !important; }
        }
      `}</style>

      <Navbar />

      {/* ── HERO ── */}
      <section className="fm-hero-section">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=85&w=1800"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 40%",
          }}
        >
          <source src="https://assets.mixkit.co/videos/4503/4503-720.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(12,16,24,0.65)",
        }} />
        <div style={{
          position: "relative", zIndex: 2,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          minHeight: "inherit",
          textAlign: "center", padding: "0 40px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <div style={{ width: 28, height: "0.5px", background: "rgba(255,255,255,0.28)" }} />
            <span style={{
              fontFamily: SANS, fontSize: 10, fontWeight: 600,
              letterSpacing: "0.18em", textTransform: "uppercase" as const,
              color: "rgba(255,255,255,0.45)",
            }}>
              Para instituciones educativas
            </span>
            <div style={{ width: 28, height: "0.5px", background: "rgba(255,255,255,0.28)" }} />
          </div>

          <h1
            className="fm-hero-h1"
            style={{
              fontFamily: SERIF, fontWeight: 400,
              color: "#fff", lineHeight: 1.1,
              letterSpacing: "-0.025em", margin: "0 0 20px", maxWidth: 680,
            }}
          >
            El docente que necesitas no está en LinkedIn. Está aquí.
          </h1>

          <p style={{
            fontFamily: SANS, fontSize: 16,
            color: C.cream, lineHeight: 1.7,
            margin: "0 0 38px", maxWidth: 480,
          }}>
            Investigadores, doctores y expertos que combinan su carrera con la docencia.
            Perfiles revisados. Contacto directo.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, justifyContent: "center" }}>
            <Link href="/directory">
              <button style={{
                fontFamily: SANS, background: "#fff", color: C.ink,
                border: "none", padding: "13px 32px", borderRadius: 6,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>
                Ver el directorio
              </button>
            </Link>
            <Link href="/signup?intent=institution">
              <button style={{
                fontFamily: SANS, background: "transparent",
                color: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.28)",
                padding: "13px 32px", borderRadius: 6,
                fontSize: 14, cursor: "pointer",
              }}>
                Registrar mi institución
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3 VALORES ── */}
      <section style={{ background: C.white }}>
        <div className="fm-pad" style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{
              fontFamily: SANS, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase" as const,
              color: C.brass, marginBottom: 12,
            }}>
              Por qué FacultyMatch
            </div>
            <h2 style={{
              fontFamily: SERIF, fontSize: 30, fontWeight: 400,
              color: C.ink, letterSpacing: "-0.025em",
              margin: "0 0 12px", lineHeight: 1.15,
            }}>
              El directorio que los responsables de programa<br />
              llevan años necesitando.
            </h2>
          </div>

          <div className="fm-grid-3">
            {VALUES.map((v, i) => (
              <div
                key={i}
                style={{
                  background: C.cream, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: "28px 26px",
                  borderTop: `3px solid ${C.brass}`,
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: C.white, border: `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 2,
                  }}>
                    <span style={{ fontFamily: SERIF, fontSize: 11, color: C.brass, fontStyle: "italic" }}>
                      {["I", "II", "III"][i]}
                    </span>
                  </div>
                  <div>
                    <h3 style={{
                      fontFamily: SERIF, fontSize: 16, fontWeight: 400,
                      color: C.ink, margin: "0 0 8px",
                    }}>
                      {v.title}
                    </h3>
                    <p style={{
                      fontFamily: SANS, fontSize: 13,
                      color: C.muted, lineHeight: 1.75, margin: 0,
                    }}>
                      {v.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section style={{ background: C.cream }}>
        <div className="fm-pad" style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{
              fontFamily: SANS, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase" as const,
              color: C.brass, marginBottom: 12,
            }}>
              Cómo funciona
            </div>
            <h2 style={{
              fontFamily: SERIF, fontSize: 30, fontWeight: 400,
              color: C.ink, letterSpacing: "-0.025em", margin: 0, lineHeight: 1.15,
            }}>
              Regístrate hoy. Contacta tu primer perfil esta semana.
            </h2>
          </div>
          <div className="fm-grid-3">
            {HOW.map((s, i) => (
              <div key={i} style={{
                background: C.white, border: `1px solid ${C.border}`,
                borderRadius: 10, padding: "28px 26px",
                borderTop: `3px solid ${C.brass}`,
              }}>
                <div style={{
                  fontFamily: SERIF, fontSize: 24, color: C.brass,
                  opacity: 0.45, marginBottom: 14, letterSpacing: "-0.02em",
                }}>
                  {s.n}
                </div>
                <h3 style={{
                  fontFamily: SERIF, fontSize: 16, fontWeight: 400,
                  color: C.ink, margin: "0 0 10px",
                }}>
                  {s.title}
                </h3>
                <p style={{ fontFamily: SANS, fontSize: 14, color: C.muted, lineHeight: 1.75, margin: 0 }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" style={{ background: C.white }}>
        <div className="fm-pad" style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{
              fontFamily: SANS, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase" as const,
              color: C.brass, marginBottom: 12,
            }}>
              Precios para instituciones
            </div>
            <h2 style={{
              fontFamily: SERIF, fontSize: 30, fontWeight: 400,
              color: C.ink, letterSpacing: "-0.025em", margin: "0 0 10px",
            }}>
              Empieza gratis. Escala cuando lo necesites.
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 15, color: C.muted, maxWidth: 460, margin: "0 auto" }}>
              Sin comisiones por contratación. Pagas por acceso al directorio, no por cada perfil que encuentres.
            </p>
          </div>

          <div className="fm-grid-2-eq">
            {/* Essential */}
            <div style={{
              background: C.cream, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "32px 30px",
            }}>
              <div style={{
                fontFamily: SANS, fontSize: 10, fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase" as const,
                color: C.faint, marginBottom: 16,
              }}>
                Essential
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 38, color: C.ink, margin: "0 0 4px" }}>
                0 €<span style={{ fontSize: 16, color: C.faint }}>/mes</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: C.faint, marginBottom: 24 }}>
                para empezar
              </div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 28 }}>
                {[
                  "Registro gratuito",
                  "2 búsquedas al mes",
                  "Visualización básica de perfiles",
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.brass, flexShrink: 0 }} />
                    <span style={{ fontFamily: SANS, fontSize: 13, color: C.muted }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup?intent=institution">
                <button style={{
                  fontFamily: SANS, width: "100%", background: "transparent",
                  color: C.navy, border: `1px solid ${C.navy}`,
                  padding: "11px 0", borderRadius: 6, fontSize: 13,
                  fontWeight: 500, cursor: "pointer",
                }}>
                  Registrar mi institución
                </button>
              </Link>
            </div>

            {/* Professional */}
            <div style={{ background: C.navy, borderRadius: 14, padding: "32px 30px" }}>
              <div style={{
                fontFamily: SANS, fontSize: 10, fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase" as const,
                color: C.brass, marginBottom: 16,
              }}>
                Professional
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 38, color: "#fff", margin: "0 0 4px" }}>
                99 €<span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>/mes</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>
                sin permanencia
              </div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 28 }}>
                {[
                  "Búsquedas ilimitadas",
                  "Filtros avanzados completos",
                  "Contacto directo con docentes",
                  "Shortlists y favoritos sin límite",
                  "Hasta 3 usuarios por institución",
                  "Soporte prioritario",
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.brass, flexShrink: 0 }} />
                    <span style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/checkout?plan=institution-pro">
                <button style={{
                  fontFamily: SANS, width: "100%", background: C.brass,
                  color: "#fff", border: "none", padding: "11px 0",
                  borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>
                  Activar Professional
                </button>
              </Link>
            </div>
          </div>

          <p style={{ fontFamily: SANS, fontSize: 12, color: C.faint, textAlign: "center", marginTop: 20 }}>
            Sin comisiones por contratación. Sin permanencia. Cancela cuando quieras.
          </p>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1800)`,
          backgroundSize: "cover", backgroundPosition: "center 50%",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(12,16,24,0.78)" }} />
        <div className="fm-cta-inner">
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{
              fontFamily: SANS, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase" as const,
              color: C.brass, marginBottom: 12,
            }}>
              Empieza hoy
            </div>
            <p style={{ fontFamily: SERIF, fontSize: 26, color: "rgba(255,255,255,0.9)", lineHeight: 1.35, margin: 0 }}>
              El directorio está disponible.<br />
              Tu próximo docente, también.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "8px 0 0" }}>
              Registro gratuito. Sin proceso de validación previo.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, position: "relative", zIndex: 2, flexWrap: "wrap" as const }}>
            <Link href="/directory">
              <button style={{
                fontFamily: SANS, background: "#fff", color: C.ink,
                border: "none", padding: "13px 28px", borderRadius: 6,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>
                Ver el directorio
              </button>
            </Link>
            <Link href="/signup?intent=institution">
              <button style={{
                fontFamily: SANS, background: "transparent",
                color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.22)",
                padding: "13px 28px", borderRadius: 6,
                fontSize: 14, cursor: "pointer",
              }}>
                Registrar mi institución
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
