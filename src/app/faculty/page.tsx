// src/app/faculty/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Para docentes y expertos | FacultyMatch",
  description:
    "Publica tu perfil en el directorio de FacultyMatch. Las instituciones educativas te encuentran cuando buscan tu área. Tú decides si respondes.",
  keywords:
    "perfil docente, experto universitario, dar clases universidad, docencia, investigador",
};

// ─── Tokens ────────────────────────────────────────────────────────────────────
const SERIF = `var(--font-serif, 'Georgia', 'Times New Roman', serif)`;
const SANS  = `var(--font-sans, system-ui, -apple-system, sans-serif)`;

const C = {
  ink: "#0C1018", navy: "#0D2240", brass: "#B8963E",
  cream: "#F7F5F0", paper: "#FDFCF9", white: "#FFFFFF",
  muted: "#6B7280", faint: "#9CA3AF", border: "#E5E1D8",
};

const BENEFITS = [
  {
    title: "Visibilidad selectiva",
    desc: "Controla quién ve tu perfil. Bloquea instituciones específicas por nombre. Tu institución actual no tiene acceso salvo que tú lo permitas.",
  },
  {
    title: "Propuestas directas",
    desc: "Las instituciones te escriben a ti. No al revés. Recibes propuestas concretas y decides si te interesa responder, cuándo y en qué condiciones.",
  },
  {
    title: "Sin compromiso",
    desc: "El plan básico es gratuito para siempre. Publicas tu perfil, recibes solicitudes y decides sin pagar nada, sin cuotas de inscripción ni permanencia.",
  },
];

export default function FacultyPage() {
  return (
    <div style={{ background: C.paper, fontFamily: SANS }}>
      <style>{`
        .fm-hero { height: 520px; display: flex; align-items: center; justify-content: center; }
        .fm-hero-h1 { font-size: 52px; }
        .fm-section-pad { padding: 72px 40px; }
        .fm-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        .fm-grid-2-eq { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 760px; margin: 0 auto; }
        .fm-cta-row { display: flex; align-items: center; justify-content: space-between; padding: 64px 40px; }
        @media (max-width: 768px) {
          .fm-hero { height: auto !important; min-height: 480px; padding: 80px 24px !important; }
          .fm-hero-h1 { font-size: 32px !important; }
          .fm-section-pad { padding: 48px 20px !important; }
          .fm-grid-3 { grid-template-columns: 1fr !important; }
          .fm-grid-2-eq { grid-template-columns: 1fr !important; }
          .fm-cta-row { flex-direction: column !important; padding: 48px 20px !important; text-align: center; }
        }
      `}</style>

      <Navbar />

      {/* ── HERO ── */}
      <section
        className="fm-hero"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=85&w=1800"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 40%",
          }}
        >
          <source src="https://assets.mixkit.co/videos/24261/24261-720.mp4" type="video/mp4" />
        </video>
        <div
          style={{
            position: "absolute", inset: 0,
            background: "rgba(12,16,24,0.65)",
          }}
        />
        <div
          style={{
            position: "relative", zIndex: 2,
            display: "flex", flexDirection: "column",
            alignItems: "center",
            textAlign: "center", padding: "0 40px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <div style={{ width: 28, height: "0.5px", background: "rgba(255,255,255,0.28)" }} />
            <span style={{
              fontFamily: SANS, fontSize: 10, fontWeight: 600,
              letterSpacing: "0.18em", textTransform: "uppercase" as const,
              color: "rgba(255,255,255,0.45)",
            }}>
              Para docentes y expertos
            </span>
            <div style={{ width: 28, height: "0.5px", background: "rgba(255,255,255,0.28)" }} />
          </div>

          <h1
            className="fm-hero-h1"
            style={{
              fontFamily: SERIF, fontWeight: 400,
              color: "#fff", lineHeight: 1.1,
              letterSpacing: "-0.025em", margin: "0 0 20px", maxWidth: 660,
            }}
          >
            Tu experiencia tiene demanda real.
          </h1>

          <p style={{
            fontFamily: SANS, fontSize: 16,
            color: C.cream, lineHeight: 1.7,
            margin: "0 0 38px", maxWidth: 460,
          }}>
            Publica tu perfil. Las instituciones te encuentran.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, justifyContent: "center" }}>
            <Link href="/signup?intent=faculty">
              <button style={{
                fontFamily: SANS, background: "#fff", color: C.ink,
                border: "none", padding: "13px 32px", borderRadius: 6,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>
                Publicar mi perfil
              </button>
            </Link>
            <Link href="/login">
              <button style={{
                fontFamily: SANS, background: "transparent",
                color: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.28)",
                padding: "13px 32px", borderRadius: 6,
                fontSize: 14, cursor: "pointer",
              }}>
                Ya tengo cuenta
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3 BENEFICIOS ── */}
      <section style={{ background: C.white }}>
        <div className="fm-section-pad" style={{ maxWidth: 1080, margin: "0 auto" }}>
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
              Tú pones el conocimiento.<br />
              Las instituciones ponen el interés.
            </h2>
          </div>

          <div className="fm-grid-3">
            {BENEFITS.map((b, i) => (
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
                      {b.title}
                    </h3>
                    <p style={{
                      fontFamily: SANS, fontSize: 13,
                      color: C.muted, lineHeight: 1.75, margin: 0,
                    }}>
                      {b.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" style={{ background: C.cream }}>
        <div className="fm-section-pad" style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{
              fontFamily: SANS, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase" as const,
              color: C.brass, marginBottom: 12,
            }}>
              Precios
            </div>
            <h2 style={{
              fontFamily: SERIF, fontSize: 30, fontWeight: 400,
              color: C.ink, letterSpacing: "-0.025em", margin: 0,
            }}>
              Empieza gratis. Sin permanencia.
            </h2>
          </div>

          <div className="fm-grid-2-eq">
            {/* Básico */}
            <div style={{
              background: C.white, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "32px 30px",
            }}>
              <div style={{
                fontFamily: SANS, fontSize: 10, fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase" as const,
                color: C.faint, marginBottom: 16,
              }}>
                Básico
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 38, color: C.ink, margin: "0 0 4px" }}>
                0 €
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: C.faint, marginBottom: 24 }}>
                siempre gratuito
              </div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 28 }}>
                {[
                  "Perfil en el directorio",
                  "Recepción de solicitudes",
                  "Control de disponibilidad",
                  "Visibilidad pública",
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.brass, flexShrink: 0 }} />
                    <span style={{ fontFamily: SANS, fontSize: 13, color: C.muted }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup?intent=faculty">
                <button style={{
                  fontFamily: SANS, width: "100%", background: "transparent",
                  color: C.navy, border: `1px solid ${C.navy}`,
                  padding: "11px 0", borderRadius: 6, fontSize: 13,
                  fontWeight: 500, cursor: "pointer",
                }}>
                  Empezar gratis
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
                9,99 €
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>
                primer año · sin permanencia
              </div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 28 }}>
                {[
                  "Todo lo del plan Básico",
                  "Bloqueo de instituciones específicas",
                  "Oculto para tu institución actual",
                  "Posicionamiento prioritario",
                  "Estadísticas de visitas",
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.brass, flexShrink: 0 }} />
                    <span style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/checkout?plan=faculty-pro">
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
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&q=80&w=1800)`,
          backgroundSize: "cover", backgroundPosition: "center 50%",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(12,16,24,0.76)" }} />
        <div
          className="fm-cta-row"
          style={{ position: "relative", zIndex: 2, maxWidth: 1080, margin: "0 auto", flexWrap: "wrap" as const, gap: 32 }}
        >
          <div>
            <div style={{
              fontFamily: SANS, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase" as const,
              color: C.brass, marginBottom: 12,
            }}>
              Empieza hoy
            </div>
            <p style={{ fontFamily: SERIF, fontSize: 26, color: "rgba(255,255,255,0.9)", lineHeight: 1.35, margin: 0 }}>
              Crea tu perfil. Es gratuito<br />
              para docentes y expertos.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "8px 0 0" }}>
              Sin permanencia. Sin cuotas de inscripción.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/signup?intent=faculty">
              <button style={{
                fontFamily: SANS, background: "#fff", color: C.ink,
                border: "none", padding: "13px 28px", borderRadius: 6,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>
                Publicar mi perfil
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
                Soy institución
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
