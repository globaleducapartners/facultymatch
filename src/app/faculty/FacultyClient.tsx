"use client";
// src/app/faculty/FacultyClient.tsx — FacultyMatch v2

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const SANS = `'Inter', system-ui, -apple-system, sans-serif`;

const D = {
  dark:   "#071326",
  navy:   "#0D2240",
  blue:   "#1B4FD8",
  gold:   "#E9A030",
  white:  "#FFFFFF",
  surf:   "#F2F6FC",
  border: "#D8E2EF",
  ink:    "#080F1E",
  muted:  "#4B5A7A",
  faint:  "#8896B0",
};

function useIsMobile() {
  const [mob, setMob] = useState(false);
  useEffect(() => {
    const check = () => setMob(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mob;
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const PROFILES = [
  {
    dot: D.blue,
    label: "Docente universitario",
    desc: "Profesores titulares, investigadores y doctores que quieren ampliar su docencia en otras instituciones sin abandonar su puesto actual. Tu acreditación ANECA o ORCID te da prioridad en búsquedas.",
    examples: ["Doctor en Economía · UAM", "Catedrática de Derecho · UCM", "Investigador en IA · UPM"],
  },
  {
    dot: D.gold,
    label: "Experto profesional",
    desc: "Directivos, médicos especialistas, abogados, ingenieros o consultores con experiencia real que quieren compartir su conocimiento en programas ejecutivos y másters. El aula te necesita precisamente porque has estado en el campo.",
    examples: ["Médico especialista · 15 años", "Director de Operaciones", "Abogada Mercantil · Bufete"],
  },
  {
    dot: "#059669",
    label: "Educador independiente",
    desc: "Formadores, consultores independientes y creadores de contenido educativo que buscan respaldo institucional. Si sabes algo que vale la pena enseñar, estás en el lugar correcto.",
    examples: ["Consultor de Liderazgo", "Formador en Digital", "Especialista en Marketing"],
  },
];

const BENEFITS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={D.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
      </svg>
    ),
    title: "Visible para quien importa",
    desc: "Tu perfil llega a directores de programa, no a RRHH genérico. Estructurado exactamente como ellos necesitan verlo: área, idioma, disponibilidad, acreditación.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={D.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "Sin buscar oportunidades",
    desc: "Publicas una vez. Las instituciones te encuentran cuando necesitan exactamente lo que tú ofreces. Sin prospectar, sin networking forzado.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={D.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Privacidad total",
    desc: "Tu institución actual no sabe que estás aquí, a menos que tú quieras. Bloqueo selectivo por nombre de institución disponible en el plan gratuito.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={D.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    title: "Siempre gratuito para entrar",
    desc: "El plan básico es para siempre gratuito. Publicas, recibes solicitudes y decides. Sin pagar nada para empezar. Sin sorpresas.",
  },
];

export default function FacultyClient() {
  const isMob = useIsMobile();
  const { ref: benefitsRef, inView: benefitsVisible } = useInView(0.1);
  const { ref: profilesRef, inView: profilesVisible } = useInView(0.1);
  const pad = isMob ? "64px 24px" : "88px 32px";

  return (
    <div style={{ background: D.white, fontFamily: SANS }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        position: "relative", overflow: "hidden",
        minHeight: isMob ? "90svh" : 580,
        display: "flex", alignItems: "center",
      }}>
        {isMob ? (
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=85&w=1200)`,
            backgroundSize: "cover", backgroundPosition: "center 30%",
          }} />
        ) : (
          <video
            autoPlay muted loop playsInline
            poster="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1800"
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center 30%",
            }}
          >
            <source src="/faculty-hero.mp4" type="video/mp4" />
          </video>
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(160deg, rgba(7,19,38,0.75) 0%, rgba(7,19,38,0.88) 60%, rgba(7,19,38,0.96) 100%)",
        }} />
        <div style={{
          position: "relative", zIndex: 2,
          maxWidth: 1120, margin: "0 auto", width: "100%",
          padding: isMob ? "80px 24px 64px" : "0 32px",
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center",
        }}>
          <div className="fm-animate-up" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(27,79,216,0.2)", border: "1px solid rgba(27,79,216,0.4)",
            borderRadius: 999, padding: "5px 14px", marginBottom: 28,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: D.gold }} />
            <span style={{
              fontFamily: SANS, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase" as const,
              color: "rgba(255,255,255,0.8)",
            }}>
              Para docentes y expertos profesionales
            </span>
          </div>

          <h1 className="fm-animate-up fm-animate-up-delay-1" style={{
            fontFamily: SANS,
            fontSize: isMob ? 34 : "clamp(38px, 5vw, 60px)",
            fontWeight: 900,
            color: "#fff", lineHeight: 1.06, letterSpacing: "-0.04em",
            margin: "0 0 20px", maxWidth: 740,
          }}>
            Lo que la IA no puede sustituir
            <br />es tu experiencia.
          </h1>

          <p className="fm-animate-up fm-animate-up-delay-2" style={{
            fontFamily: SANS, fontSize: isMob ? 15 : 17,
            color: "rgba(255,255,255,0.6)", lineHeight: 1.75,
            margin: "0 0 40px", maxWidth: 520,
          }}>
            Médicos, investigadores, directivos, abogados, comunicadores.
            FacultyMatch los conecta con universidades y escuelas de negocio
            que buscan exactamente lo que ellos saben.
          </p>

          <div className="fm-animate-up fm-animate-up-delay-3" style={{
            display: "flex", gap: 12, flexWrap: "wrap" as const, justifyContent: "center",
          }}>
            <Link href="/signup">
              <button style={{
                fontFamily: SANS, background: D.white, color: D.ink,
                border: "none", padding: "14px 34px", borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: "pointer",
              }}>
                Publicar mi perfil
              </button>
            </Link>
            <Link href="/login">
              <button style={{
                fontFamily: SANS, background: "transparent",
                color: "rgba(255,255,255,0.82)",
                border: "1px solid rgba(255,255,255,0.28)",
                padding: "14px 34px", borderRadius: 10, fontSize: 15, cursor: "pointer",
              }}>
                Ya tengo cuenta
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TIPOS DE PERFIL ── */}
      <section style={{ background: D.white, padding: pad }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMob ? 44 : 60 }}>
            <div style={{
              fontFamily: SANS, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase" as const,
              color: D.gold, marginBottom: 14,
            }}>
              Quién puede publicar su perfil
            </div>
            <h2 style={{
              fontFamily: SANS,
              fontSize: isMob ? 26 : "clamp(28px, 3vw, 40px)",
              fontWeight: 800,
              color: D.ink, letterSpacing: "-0.04em",
              margin: "0 0 14px", lineHeight: 1.1,
            }}>
              No hace falta ser catedrático.
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 16, color: D.muted, maxWidth: 460, margin: "0 auto" }}>
              FacultyMatch conecta tres tipos de talento con las instituciones que los buscan.
            </p>
          </div>

          <div ref={profilesRef} style={{
            display: "grid",
            gridTemplateColumns: isMob ? "1fr" : "repeat(3,1fr)",
            gap: 20,
          }}>
            {PROFILES.map((p, i) => (
              <div key={i} style={{
                background: D.surf,
                border: `1px solid ${D.border}`,
                borderRadius: 16,
                borderTop: `3px solid ${p.dot}`,
                padding: "28px 26px",
                opacity: 1,
                transform: profilesVisible ? "translateY(0)" : "translateY(10px)",
                transition: `transform 0.6s ease ${i * 0.12}s`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: p.dot, flexShrink: 0 }} />
                  <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: D.ink }}>{p.label}</span>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 14, color: D.muted, lineHeight: 1.75, margin: "0 0 18px" }}>
                  {p.desc}
                </p>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 7 }}>
                  {p.examples.map((ex, j) => (
                    <span key={j} style={{
                      fontFamily: SANS, fontSize: 12, color: D.faint,
                      background: D.white, padding: "5px 12px", borderRadius: 999,
                      border: `1px solid ${D.border}`, display: "inline-block", alignSelf: "flex-start",
                    }}>
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIVACIDAD CALLOUT ── */}
      <section style={{ background: D.navy, padding: isMob ? "48px 24px" : "52px 32px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{
            display: "flex",
            flexDirection: isMob ? "column" as const : "row" as const,
            alignItems: isMob ? "flex-start" : "center",
            gap: isMob ? 20 : 40,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20, padding: isMob ? "28px 24px" : "32px 40px",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, flexShrink: 0,
              background: "rgba(27,79,216,0.3)", border: "1px solid rgba(27,79,216,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={D.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: SANS, fontSize: 10, fontWeight: 800,
                letterSpacing: "0.16em", textTransform: "uppercase" as const,
                color: D.gold, marginBottom: 8,
              }}>
                Tu empresa no lo sabrá
              </div>
              <h3 style={{
                fontFamily: SANS, fontSize: isMob ? 20 : 24,
                fontWeight: 800, color: "#fff", letterSpacing: "-0.03em",
                margin: "0 0 10px", lineHeight: 1.2,
              }}>
                Tu institución actual no verá tu perfil,<br />a menos que tú quieras.
              </h3>
              <p style={{
                fontFamily: SANS, fontSize: 14, color: "rgba(255,255,255,0.5)",
                lineHeight: 1.75, margin: 0, maxWidth: 520,
              }}>
                El bloqueo selectivo de instituciones está disponible en todos los planes, incluso el gratuito.
                Añade tu centro actual y nadie allí podrá ver tu perfil ni tus datos de contacto.
              </p>
            </div>
            <Link href="/signup" style={{ flexShrink: 0 }}>
              <button style={{
                fontFamily: SANS, background: D.gold, color: D.ink,
                border: "none", padding: "13px 28px", borderRadius: 10,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                whiteSpace: "nowrap" as const,
              }}>
                Publicar con privacidad →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── BENEFICIOS ── */}
      <section style={{ background: D.surf, padding: pad }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMob ? "1fr" : "1fr 1fr",
            gap: isMob ? 0 : 72, alignItems: "center",
          }}>
            {/* Foto */}
            {!isMob && (
              <div style={{ borderRadius: 20, overflow: "hidden", height: 440 }}>
                <div style={{
                  width: "100%", height: "100%",
                  backgroundImage: `url(https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800)`,
                  backgroundSize: "cover", backgroundPosition: "center top",
                }} />
              </div>
            )}
            <div ref={benefitsRef}>
              <div style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 700,
                letterSpacing: "0.16em", textTransform: "uppercase" as const,
                color: D.gold, marginBottom: 16,
              }}>
                Cómo funciona para ti
              </div>
              <h2 style={{
                fontFamily: SANS,
                fontSize: isMob ? 26 : "clamp(26px, 2.8vw, 36px)",
                fontWeight: 800,
                color: D.ink, letterSpacing: "-0.04em",
                margin: "0 0 32px", lineHeight: 1.1,
              }}>
                Lo que hace diferente<br />estar en FacultyMatch.
              </h2>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 24 }}>
                {BENEFITS.map((b, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 16, alignItems: "flex-start",
                    opacity: 1,
                    transform: benefitsVisible ? "translateX(0)" : "translateX(-8px)",
                    transition: `transform 0.5s ease ${i * 0.1}s`,
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: "rgba(27,79,216,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 1,
                    }}>
                      {b.icon}
                    </div>
                    <div>
                      <h3 style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: D.ink, margin: "0 0 5px" }}>
                        {b.title}
                      </h3>
                      <p style={{ fontFamily: SANS, fontSize: 14, color: D.muted, lineHeight: 1.7, margin: 0 }}>
                        {b.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" style={{ background: D.white, padding: pad }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{
              fontFamily: SANS, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase" as const,
              color: D.gold, marginBottom: 14,
            }}>
              Precios
            </div>
            <h2 style={{
              fontFamily: SANS,
              fontSize: isMob ? 26 : "clamp(28px, 3vw, 40px)",
              fontWeight: 800,
              color: D.ink, letterSpacing: "-0.04em", margin: 0,
            }}>
              Para docentes y expertos,<br />sin coste de entrada.
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMob ? "1fr" : "1fr 1fr",
            gap: 20, maxWidth: 780, margin: "0 auto",
          }}>
            {/* Basic */}
            <div style={{
              background: D.surf, border: `1px solid ${D.border}`,
              borderRadius: 20, padding: "36px 32px",
            }}>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: D.faint, marginBottom: 18 }}>
                Plan Basic
              </div>
              <div style={{ fontFamily: SANS, fontSize: 48, fontWeight: 900, color: D.ink, letterSpacing: "-0.05em", margin: "0 0 4px", lineHeight: 1 }}>
                0 €
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: D.faint, marginBottom: 28 }}>siempre gratuito</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 12, marginBottom: 32 }}>
                {[
                  "Perfil en el directorio",
                  "Recepción de solicitudes de instituciones",
                  "Control de disponibilidad",
                  "Visibilidad pública básica",
                  "Bloqueo de instituciones específicas",
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, background: "rgba(233,160,48,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke={D.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span style={{ fontFamily: SANS, fontSize: 14, color: D.muted }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup">
                <button style={{
                  fontFamily: SANS, width: "100%", background: "transparent",
                  color: D.navy, border: `1.5px solid ${D.navy}`,
                  padding: "13px 0", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}>
                  Empezar gratis
                </button>
              </Link>
            </div>

            {/* Pro */}
            <div style={{ background: D.navy, borderRadius: 20, padding: "36px 32px", position: "relative" as const, overflow: "hidden" }}>
              <div style={{
                position: "absolute", top: 20, right: 20,
                background: D.gold, color: D.ink,
                fontFamily: SANS, fontSize: 10, fontWeight: 800,
                letterSpacing: "0.08em", textTransform: "uppercase" as const,
                padding: "4px 10px", borderRadius: 999,
              }}>
                Popular
              </div>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: D.gold, marginBottom: 18 }}>
                Plan Professional
              </div>
              <div style={{ fontFamily: SANS, fontSize: 48, fontWeight: 900, color: "#fff", letterSpacing: "-0.05em", margin: "0 0 4px", lineHeight: 1 }}>
                29 €
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>
                al año · sin permanencia
              </div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 12, marginBottom: 32 }}>
                {[
                  "Todo lo del Plan Basic",
                  "Posicionamiento prioritario en búsquedas",
                  "Estadísticas avanzadas de visitas a tu perfil",
                  "Visibilidad preferente ante instituciones objetivo",
                  "Soporte por email prioritario",
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, background: "rgba(233,160,48,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke={D.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span style={{ fontFamily: SANS, fontSize: 14, color: "rgba(255,255,255,0.65)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/checkout?plan=faculty-pro">
                <button style={{
                  fontFamily: SANS, width: "100%", background: D.gold,
                  color: D.ink, border: "none",
                  padding: "13px 0", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
                }}>
                  Activar Professional
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{
        position: "relative", overflow: "hidden",
        background: `linear-gradient(135deg, ${D.navy} 0%, ${D.blue} 100%)`,
      }}>
        <div style={{
          maxWidth: 1120, margin: "0 auto",
          padding: isMob ? "64px 24px" : "72px 32px",
          display: "flex",
          flexDirection: isMob ? "column" as const : "row" as const,
          alignItems: isMob ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: 32,
        }}>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: D.gold, marginBottom: 12 }}>
              Empieza hoy
            </div>
            <h2 style={{
              fontFamily: SANS,
              fontSize: isMob ? 24 : "clamp(24px, 2.8vw, 36px)",
              fontWeight: 800,
              color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.1, margin: 0,
            }}>
              Publica hoy. Recibe tu primera
              <br />solicitud esta semana.
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "10px 0 0" }}>
              Sin permanencia. Sin proceso de admisión previo. Sin comisiones.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, flexShrink: 0 }}>
            <Link href="/signup">
              <button style={{
                fontFamily: SANS, background: D.white, color: D.ink,
                border: "none", padding: "14px 30px", borderRadius: 10,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}>
                Publicar mi perfil
              </button>
            </Link>
            <Link href="/signup?intent=institution">
              <button style={{
                fontFamily: SANS, background: "transparent",
                color: "rgba(255,255,255,0.75)",
                border: "1.5px solid rgba(255,255,255,0.25)",
                padding: "14px 30px", borderRadius: 10, fontSize: 14, cursor: "pointer",
              }}>
                Soy institución
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
