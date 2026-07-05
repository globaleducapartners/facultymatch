"use client";
// src/app/LandingClient.tsx — FacultyMatch v2: Modern, Fresh, Video-rich

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";

// ─── Design tokens ─────────────────────────────────────────────────────────
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

const SANS = `'Inter', system-ui, -apple-system, sans-serif`;

// ─── Areas ticker ──────────────────────────────────────────────────────────
const AREAS = [
  "Medicina", "Derecho", "Inteligencia Artificial", "Liderazgo ejecutivo",
  "Finanzas corporativas", "Investigación clínica", "Marketing estratégico",
  "Ingeniería", "Ciencias de la Salud", "Transformación digital",
  "Comunicación", "Emprendimiento", "Data Science", "Gestión hospitalaria",
];

// ─── Responsive hook ───────────────────────────────────────────────────────
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

// ─── Scroll animate hook ───────────────────────────────────────────────────
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

// ─── Animated counter ─────────────────────────────────────────────────────
function Counter({ to, suffix = "", duration = 1400 }: { to: number; suffix?: string; duration?: number }) {
  const { ref, inView } = useInView(0.3);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * to));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to, duration]);
  return (
    <span ref={ref} style={{ display: "inline-block" }}>
      +{val}{suffix}
    </span>
  );
}

// ─── NAV ───────────────────────────────────────────────────────────────────
function Nav() {
  const isMob = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: 64,
        background: scrolled ? "rgba(255,255,255,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? `1px solid ${D.border}` : "none",
        boxShadow: scrolled ? "0 1px 12px rgba(7,19,38,0.08)" : "none",
        transition: "all 0.3s ease",
      }}>
        <div style={{
          maxWidth: 1120, margin: "0 auto",
          height: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 32px",
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: D.blue,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 800, fontFamily: SANS }}>FM</span>
            </div>
            <span style={{
              fontFamily: SANS, fontSize: 18, fontWeight: 700,
              color: scrolled ? D.ink : "#fff",
              letterSpacing: "-0.03em",
              transition: "color 0.3s",
            }}>
              FacultyMatch
            </span>
          </Link>

          {/* Nav links — desktop */}
          {!isMob && (
            <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
              {[
                { label: "Para docentes",      href: "/faculty" },
                { label: "Para instituciones", href: "/institutions" },
                { label: "Recursos",           href: "/resources" },
              ].map((l) => (
                <Link key={l.href} href={l.href} style={{
                  fontFamily: SANS, fontSize: 14, fontWeight: 500,
                  color: scrolled ? D.muted : "rgba(255,255,255,0.8)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}>
                  {l.label}
                </Link>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!isMob && (
              <Link href="/login">
                <button style={{
                  fontFamily: SANS, fontSize: 13, fontWeight: 500,
                  background: "transparent",
                  border: scrolled ? `1px solid ${D.border}` : "1px solid rgba(255,255,255,0.35)",
                  color: scrolled ? D.ink : "#fff",
                  padding: "7px 20px", borderRadius: 8, cursor: "pointer",
                  transition: "all 0.2s",
                }}>
                  Acceder
                </button>
              </Link>
            )}
            <Link href="/signup">
              <button style={{
                fontFamily: SANS, fontSize: 13, fontWeight: 700,
                background: D.blue, border: "none",
                color: "#fff",
                padding: "7px 22px", borderRadius: 8, cursor: "pointer",
              }}>
                {isMob ? "Empezar" : "Publicar perfil"}
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: "fixed", top: 64, left: 0, right: 0, zIndex: 199,
          background: D.white, borderBottom: `1px solid ${D.border}`,
          padding: "20px 24px 28px",
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          {[
            { label: "Para docentes",      href: "/faculty" },
            { label: "Para instituciones", href: "/institutions" },
            { label: "Recursos",           href: "/resources" },
          ].map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{
              fontFamily: SANS, fontSize: 16, color: D.ink,
              fontWeight: 500, textDecoration: "none",
              padding: "12px 0", borderBottom: `1px solid ${D.border}`,
            }}>
              {l.label}
            </Link>
          ))}
          <Link href="/login" style={{ marginTop: 12 }}>
            <button onClick={() => setMenuOpen(false)} style={{
              fontFamily: SANS, width: "100%", background: "transparent",
              color: D.navy, border: `1px solid ${D.border}`,
              padding: "12px", borderRadius: 8, fontSize: 14, cursor: "pointer",
            }}>
              Acceder
            </button>
          </Link>
        </div>
      )}
    </>
  );
}

// ─── HERO ──────────────────────────────────────────────────────────────────
function Hero() {
  const isMob = useIsMobile();

  return (
    <div style={{
      background: D.dark,
      padding: isMob ? "120px 24px 64px" : "140px 32px 80px",
    }}>
      <div style={{
        maxWidth: 1120, margin: "0 auto",
        textAlign: "center",
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(27,79,216,0.25)", border: "1px solid rgba(27,79,216,0.4)",
          borderRadius: 999, padding: "5px 14px", marginBottom: 28,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: D.gold }} />
          <span style={{
            fontFamily: SANS, fontSize: 10, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase" as const,
            color: "rgba(255,255,255,0.8)",
          }}>
            Talento real para la educación superior
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: SANS,
          fontSize: isMob ? 34 : "clamp(38px, 4.5vw, 56px)",
          fontWeight: 900,
          color: "#fff",
          lineHeight: 1.08,
          letterSpacing: "-0.04em",
          margin: "0 auto 20px",
          maxWidth: 720,
        }}>
          En la era de la IA, lo más valioso<br />
          <span style={{ color: D.gold }}>no es tu contenido, es tu experiencia.</span>
        </h1>

        {/* Description */}
        <p style={{
          fontFamily: SANS, fontSize: isMob ? 15 : 17,
          color: "rgba(255,255,255,0.62)",
          lineHeight: 1.75, margin: "0 auto 36px", maxWidth: 560,
        }}>
          FacultyMatch conecta directivos, médicos, investigadores,
          comunicadores y expertos con universidades y escuelas de negocio.
          Tu experiencia real es el activo más buscado
          de la educación del siglo XXI.
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" as const }}>
          <Link href="/signup">
            <button style={{
              fontFamily: SANS, fontWeight: 700, fontSize: 15,
              background: D.white, color: D.ink,
              border: "none", padding: "14px 32px", borderRadius: 10,
              cursor: "pointer",
              boxShadow: "0 2px 20px rgba(255,255,255,0.15)",
            }}>
              Publicar mi perfil →
            </button>
          </Link>
          <Link href="/signup?intent=institution">
            <button style={{
              fontFamily: SANS, fontWeight: 500, fontSize: 15,
              background: "transparent",
              color: "rgba(255,255,255,0.82)",
              border: "1px solid rgba(255,255,255,0.28)",
              padding: "14px 32px", borderRadius: 10, cursor: "pointer",
            }}>
              Buscar docentes
            </button>
          </Link>
        </div>

        {/* Trust line */}
        <p style={{
          fontFamily: SANS, fontSize: 13, fontWeight: 500,
          color: "rgba(255,255,255,0.35)",
          margin: "20px 0 0",
        }}>
          Perfiles verificados a mano. Sin bots, sin currículums sin comprobar.
        </p>
      </div>

      {/* Product mockup — real screenshot in browser frame */}
      <div style={{
        maxWidth: isMob ? "calc(100% - 0px)" : 960,
        margin: isMob ? "40px auto 0" : "56px auto 0",
      }}>
        <div style={{
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.15)",
          background: "#1E1E1E",
        }}>
          {/* Browser chrome bar — macOS style */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 18px",
            background: "#2C2C2E",
          }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FFBD2E" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
          </div>
          {/* Screenshot */}
          <img
            src="/images/panel-docente-mockup.png"
            alt="Panel docente en FacultyMatch — vista del dashboard"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── TICKER ────────────────────────────────────────────────────────────────
function Ticker() {
  return (
    <div style={{
      background: D.blue, padding: "12px 0",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", gap: 0,
        animation: "fm-tick 36s linear infinite",
        width: "max-content",
      }}>
        {[...AREAS, ...AREAS].map((a, i) => (
          <span key={i} style={{
            fontFamily: SANS, fontSize: 11, fontWeight: 700,
            color: "rgba(255,255,255,0.75)", letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            padding: "0 28px",
            borderRight: "1px solid rgba(255,255,255,0.18)",
            whiteSpace: "nowrap" as const,
          }}>
            {a}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── STATS STRIP ──────────────────────────────────────────────────────────
function StatsStrip() {
  const isMob = useIsMobile();
  const { ref, inView } = useInView(0.2);

  const stats = [
    { display: "91", label: "universidades en España" },
    { display: "1,76M", label: "Estudiantes universitarios matriculados" },
    { display: "200k", label: "Alumnos internacionales cada curso" },
    { display: "4K", label: "Titulaciones de máster impartidas en España" },
  ];

  return (
    <div ref={ref} style={{
      background: D.dark,
      padding: isMob ? "48px 24px" : "56px 32px",
    }}>
      <div style={{
        maxWidth: 1120, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: isMob ? "1fr 1fr" : "repeat(4,1fr)",
        gap: isMob ? "36px 20px" : 0,
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            textAlign: "center",
            borderRight: !isMob && i < stats.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
            padding: isMob ? 0 : "0 24px",
          }}>
            <div style={{
              fontFamily: SANS,
              fontSize: isMob ? 40 : "clamp(42px, 4.5vw, 60px)",
              fontWeight: 900,
              color: D.gold,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              marginBottom: 8,
              opacity: 1,
              transition: `transform 0.5s ease ${i * 0.12}s`,
              transform: inView ? "translateY(0)" : "translateY(10px)",
            }}>
              {s.display}
            </div>
            <div style={{
              fontFamily: SANS, fontSize: 13, fontWeight: 500,
              color: "rgba(255,255,255,0.45)", letterSpacing: "0.01em",
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────
function HowItWorks() {
  const isMob = useIsMobile();
  const { ref, inView } = useInView(0.1);

  const steps = [
    {
      n: "01",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={D.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      title: "Publica en 10 minutos",
      body: "Describes tu área, tu trayectoria y tu disponibilidad. Nada que no tengas ya en la cabeza. Un especialista de nuestro equipo revisa y aprueba cada perfil.",
    },
    {
      n: "02",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={D.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
      ),
      title: "Llegas a quien te busca",
      body: "Las instituciones filtran por área, idioma y disponibilidad real. Tu perfil aparece exactamente cuando alguien necesita lo que tú ofreces. Sin prospectar.",
    },
    {
      n: "03",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={D.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      title: "Tú decides el sí",
      body: "La institución contacta directamente. Sin intermediarios ni comisiones. Tú pones las condiciones, el ritmo y el precio. Tú aceptas o rechazas.",
    },
  ];

  return (
    <section style={{ background: D.white, padding: isMob ? "64px 24px" : "88px 32px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: isMob ? 48 : 72 }}>
          <div style={{
            fontFamily: SANS, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase" as const,
            color: D.gold, marginBottom: 14,
          }}>
            Cómo funciona
          </div>
          <h2 style={{
            fontFamily: SANS,
            fontSize: isMob ? 28 : "clamp(30px, 3.5vw, 44px)",
            fontWeight: 800,
            color: D.ink, letterSpacing: "-0.04em",
            margin: "0 0 16px", lineHeight: 1.1,
          }}>
            De la experiencia al aula.<br />En tres pasos.
          </h2>
          <p style={{
            fontFamily: SANS, fontSize: 16, color: D.muted,
            maxWidth: 400, margin: "0 auto",
          }}>
            Sin intermediarios. Sin comisiones por contratación.
          </p>
        </div>

        <div ref={ref} style={{ position: "relative" as const }}>
          {/* Connector line — desktop */}
          {!isMob && (
            <div style={{
              position: "absolute" as const, top: 52,
              left: "calc(16.66% + 56px)", right: "calc(16.66% + 56px)",
              height: 1,
              background: `repeating-linear-gradient(to right, ${D.border} 0, ${D.border} 8px, transparent 8px, transparent 18px)`,
              zIndex: 0,
            }} />
          )}

          <div style={{
            display: "grid",
            gridTemplateColumns: isMob ? "1fr" : "repeat(3,1fr)",
            gap: isMob ? 32 : 24,
          }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                display: "flex", flexDirection: isMob ? "row" as const : "column" as const,
                alignItems: isMob ? "flex-start" : "center",
                textAlign: isMob ? "left" as const : "center" as const,
                gap: isMob ? 20 : 0,
                opacity: 1,
                transform: inView ? "translateY(0)" : "translateY(12px)",
                transition: `transform 0.6s ease ${i * 0.15}s`,
                position: "relative" as const, zIndex: 1,
              }}>
                {/* Icon circle */}
                <div style={{
                  width: 108, height: 108, borderRadius: "50%",
                  background: D.surf,
                  border: `2px solid ${D.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  marginBottom: isMob ? 0 : 28,
                  boxShadow: "0 4px 24px rgba(7,19,38,0.06)",
                }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    {step.icon}
                    <span style={{
                      fontFamily: SANS, fontSize: 11, fontWeight: 900,
                      color: D.gold, letterSpacing: "0.05em",
                    }}>
                      {step.n}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 style={{
                    fontFamily: SANS, fontSize: 17, fontWeight: 700,
                    color: D.ink, margin: "0 0 10px", letterSpacing: "-0.025em",
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    fontFamily: SANS, fontSize: 14, color: D.muted,
                    lineHeight: 1.75, margin: 0,
                  }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 60, flexWrap: "wrap" as const }}>
          <Link href="/signup">
            <button style={{
              fontFamily: SANS, background: D.blue, color: "#fff",
              border: "none", padding: "13px 32px", borderRadius: 10,
              fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>
              Publicar mi perfil
            </button>
          </Link>
          <Link href="/signup?intent=institution">
            <button style={{
              fontFamily: SANS, background: "transparent", color: D.navy,
              border: `1.5px solid ${D.navy}`, padding: "13px 32px",
              borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>
              Acceder al directorio
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── TWO SPLIT SECTIONS ───────────────────────────────────────────────────
function SplitDocentes() {
  const isMob = useIsMobile();
  const { ref, inView } = useInView(0.1);

  return (
    <section style={{
      background: D.surf,
      padding: isMob ? "64px 24px" : "0",
      overflow: "hidden",
    }}>
      <div ref={ref} style={{
        maxWidth: 1120, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: isMob ? "1fr" : "1fr 1fr",
        minHeight: isMob ? "auto" : 520,
      }}>
        {/* Image */}
        <div style={{
          position: "relative" as const,
          overflow: "hidden",
          height: isMob ? 280 : "auto",
          order: isMob ? -1 : 1,
          borderRadius: isMob ? 16 : 0,
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=900)`,
            backgroundSize: "cover", backgroundPosition: "center 25%",
            transform: inView ? "scale(1)" : "scale(1.05)",
            transition: "transform 0.9s ease",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, transparent 50%, rgba(7,19,38,0.35) 100%)",
          }} />
        </div>

        {/* Text */}
        <div style={{
          padding: isMob ? "36px 0 0" : "64px 64px 64px 32px",
          display: "flex", flexDirection: "column" as const, justifyContent: "center",
          opacity: 1,
          transform: inView ? "translateX(0)" : "translateX(-10px)",
          transition: "transform 0.7s ease",
        }}>
          <div style={{
            fontFamily: SANS, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase" as const,
            color: D.gold, marginBottom: 16,
          }}>
            Para docentes y expertos
          </div>
          <h2 style={{
            fontFamily: SANS,
            fontSize: isMob ? 26 : "clamp(26px, 2.8vw, 38px)",
            fontWeight: 800,
            color: D.ink, letterSpacing: "-0.04em",
            margin: "0 0 18px", lineHeight: 1.1,
          }}>
            Transforma la educación<br />con tu experiencia.<br /><span style={{ color: D.blue }}>Tú eres el valor diferencial.</span>
          </h2>
          <p style={{
            fontFamily: SANS, fontSize: 15, color: D.muted,
            lineHeight: 1.8, margin: "0 0 28px",
          }}>
            Años de experiencia en medicina, consultoría, investigación
            o dirección tienen una demanda real en programas máster,
            escuelas de negocio y educación ejecutiva. FacultyMatch
            te hace visible exactamente ante quien necesita lo que tú sabes.
          </p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 12, marginBottom: 32 }}>
            {[
              "Perfil verificado y estructurado por área UNESCO",
              "Las instituciones vienen a ti — sin prospectar",
              "Control total de tu visibilidad y privacidad",
              "Plan básico siempre gratuito para docentes",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6,
                  background: "rgba(233,160,48,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: 1,
                }}>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke={D.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ fontFamily: SANS, fontSize: 14, color: D.muted, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
          <Link href="/faculty">
            <button style={{
              fontFamily: SANS, fontSize: 14, fontWeight: 700,
              background: D.navy, color: "#fff",
              border: "none", padding: "13px 28px",
              borderRadius: 10, cursor: "pointer", alignSelf: "flex-start",
            }}>
              Ver cómo funciona para docentes →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function SplitInstituciones() {
  const isMob = useIsMobile();
  const { ref, inView } = useInView(0.1);

  return (
    <section style={{
      background: D.white,
      padding: isMob ? "64px 24px" : "0",
      overflow: "hidden",
    }}>
      <div ref={ref} style={{
        maxWidth: 1120, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: isMob ? "1fr" : "1fr 1fr",
        minHeight: isMob ? "auto" : 520,
      }}>
        {/* Text */}
        <div style={{
          padding: isMob ? "0 0 36px" : "64px 32px 64px 64px",
          display: "flex", flexDirection: "column" as const, justifyContent: "center",
          opacity: 1,
          transform: inView ? "translateX(0)" : "translateX(-10px)",
          transition: "transform 0.7s ease",
        }}>
          <div style={{
            fontFamily: SANS, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase" as const,
            color: D.gold, marginBottom: 16,
          }}>
            Para instituciones educativas
          </div>
          <h2 style={{
            fontFamily: SANS,
            fontSize: isMob ? 26 : "clamp(26px, 2.8vw, 38px)",
            fontWeight: 800,
            color: D.ink, letterSpacing: "-0.04em",
            margin: "0 0 18px", lineHeight: 1.1,
          }}>
            El docente que buscas<br />no está en LinkedIn.
          </h2>
          <p style={{
            fontFamily: SANS, fontSize: 15, color: D.muted,
            lineHeight: 1.8, margin: "0 0 28px",
          }}>
            Los mejores perfiles están en activo: dirigiendo hospitales,
            liderando equipos o investigando en laboratorios. No publican
            su CV en portales de empleo — pero están abiertos a enseñar.
            FacultyMatch los hace accesibles, verificados y directos.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 32 }}>
            {[
              "Área UNESCO",
              "Acreditación ANECA",
              "Idioma de impartición",
              "Modalidad",
              "Disponibilidad real",
              "Tipo de perfil",
            ].map((f, i) => (
              <div key={i} style={{
                background: D.surf,
                border: `1px solid ${D.border}`,
                borderRadius: 8, padding: "9px 14px",
                fontFamily: SANS, fontSize: 13, fontWeight: 600,
                color: D.navy,
                display: "flex", alignItems: "center", gap: 7,
              }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: D.gold, flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>
          <Link href="/institutions">
            <button style={{
              fontFamily: SANS, fontSize: 14, fontWeight: 700,
              background: D.blue, color: "#fff",
              border: "none", padding: "13px 28px",
              borderRadius: 10, cursor: "pointer", alignSelf: "flex-start",
            }}>
              Acceder al directorio →
            </button>
          </Link>
        </div>

        {/* Image */}
        <div style={{
          position: "relative" as const,
          overflow: "hidden",
          height: isMob ? 280 : "auto",
          order: isMob ? -1 : 1,
          borderRadius: isMob ? 16 : 0,
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&q=85&w=900)`,
            backgroundSize: "cover", backgroundPosition: "center 40%",
            transform: inView ? "scale(1)" : "scale(1.05)",
            transition: "transform 0.9s ease",
          }} />
        </div>
      </div>
    </section>
  );
}

// ─── SECTOR METRICS ────────────────────────────────────────────────────────
function SectorMetrics() {
  const isMob = useIsMobile();
  const { ref, inView } = useInView(0.1);

  return (
    <section style={{
      background: D.white,
      padding: isMob ? "64px 24px" : "88px 32px",
    }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: isMob ? 48 : 64 }}>
          <div style={{
            fontFamily: SANS, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase" as const,
            color: D.gold, marginBottom: 14,
          }}>
            Sector educación superior en España
          </div>
          <h2 style={{
            fontFamily: SANS,
            fontSize: isMob ? 28 : "clamp(30px, 3.5vw, 44px)",
            fontWeight: 800,
            color: D.ink, letterSpacing: "-0.04em",
            margin: 0, lineHeight: 1.1,
          }}>
            Un mercado en crecimiento<br />que necesita talento docente.
          </h2>
        </div>

        <div ref={ref} style={{
          display: "grid",
          gridTemplateColumns: isMob ? "1fr" : "repeat(4,1fr)",
          gap: 16,
        }}>
          {[
            { value: "91", label: "universidades", detail: "50 públicas y 41 privadas", icon: "🏛️" },
            { value: "50+", label: "escuelas de negocio", detail: "Activas en todo el país", icon: "🎯" },
            { value: "4.200+", label: "másteres al año", detail: "Nuevos programas cada curso", icon: "📋" },
            { value: "600K+", label: "estudiantes de máster", detail: "Matriculados anualmente", icon: "👨‍🎓" },
          ].map((m, i) => (
            <div key={i} style={{
              background: D.surf,
              border: `1px solid ${D.border}`,
              borderRadius: 16,
              padding: isMob ? "28px 20px" : "32px 24px",
              textAlign: "center",
              opacity: 1,
              transform: inView ? "translateY(0)" : "translateY(12px)",
              transition: `transform 0.5s ease ${i * 0.1}s`,
            }}>
              <div style={{
                fontSize: 32, marginBottom: 12, lineHeight: 1,
              }}>
                {m.icon}
              </div>
              <div style={{
                fontFamily: SANS,
                fontSize: isMob ? 36 : "clamp(36px, 3.5vw, 48px)",
                fontWeight: 900,
                color: D.navy,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                marginBottom: 8,
              }}>
                {m.value}
              </div>
              <div style={{
                fontFamily: SANS, fontSize: 14, fontWeight: 700,
                color: D.ink, marginBottom: 4,
              }}>
                {m.label}
              </div>
              <div style={{
                fontFamily: SANS, fontSize: 12, fontWeight: 500,
                color: D.muted,
              }}>
                {m.detail}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          maxWidth: 640, margin: "40px auto 0",
          textAlign: "center",
          padding: isMob ? "24px 20px" : "32px 40px",
          background: D.surf,
          border: `1px solid ${D.border}`,
          borderRadius: 16,
        }}>
          <p style={{
            fontFamily: SANS, fontSize: 14, color: D.muted,
            lineHeight: 1.7, margin: "0 0 20px",
          }}>
            <strong style={{ color: D.navy }}>Fuente:</strong> Ministerio de Ciencia, Innovación y Universidades.
            Datos del curso 2023-2024. La educación superior en España genera
            una demanda constante de profesionales con experiencia real que
            puedan impartir docencia en programas de máster y formación ejecutiva.
          </p>
          <Link href="/signup">
            <button style={{
              fontFamily: SANS, fontSize: 14, fontWeight: 700,
              background: D.blue, color: "#fff",
              border: "none", padding: "12px 28px", borderRadius: 10,
              cursor: "pointer",
            }}>
              Publicar mi perfil →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── MATCHING SPEED ────────────────────────────────────────────────────────
function MatchingSpeed() {
  const isMob = useIsMobile();
  const { ref, inView } = useInView(0.15);

  return (
    <section style={{
      background: D.dark,
      padding: isMob ? "64px 24px" : "80px 32px",
    }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMob ? "1fr" : "1fr 1fr",
          gap: isMob ? 40 : 80,
          alignItems: "center",
        }}>
          {/* Left: data */}
          <div ref={ref} style={{
            opacity: 1,
            transform: inView ? "translateY(0)" : "translateY(12px)",
            transition: "transform 0.6s ease",
          }}>
            <div style={{
              fontFamily: SANS, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase" as const,
              color: D.gold, marginBottom: 16,
            }}>
              Resultados reales
            </div>
            <h2 style={{
              fontFamily: SANS,
              fontSize: isMob ? 28 : "clamp(30px, 3.5vw, 44px)",
              fontWeight: 800,
              color: "#fff", letterSpacing: "-0.04em",
              margin: "0 0 18px", lineHeight: 1.08,
            }}>
              Los docentes reciben su<br />
              primer contacto en una<br />
              <span style={{ color: D.gold }}>media de 3 días.</span>
            </h2>
            <p style={{
              fontFamily: SANS, fontSize: 15, color: "rgba(255,255,255,0.6)",
              lineHeight: 1.8, margin: "0 0 32px", maxWidth: 440,
            }}>
              Las instituciones educativas buscan profesionales con experiencia real.
              No esperan a que el perfil perfecto aparezca — lo encuentran en FacultyMatch.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
              <Link href="/signup">
                <button style={{
                  fontFamily: SANS, fontWeight: 700, fontSize: 14,
                  background: D.white, color: D.ink,
                  border: "none", padding: "13px 30px", borderRadius: 10,
                  cursor: "pointer",
                }}>
                  Publicar mi perfil →
                </button>
              </Link>
              <Link href="/signup?intent=institution">
                <button style={{
                  fontFamily: SANS, fontWeight: 600, fontSize: 14,
                  background: "transparent",
                  color: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  padding: "13px 30px", borderRadius: 10, cursor: "pointer",
                }}>
                  Buscar docentes
                </button>
              </Link>
            </div>
          </div>

          {/* Right: stats */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}>
            {[
              { value: "3 días", label: "Tiempo medio hasta primer contacto", highlight: true },
              { value: "100%", label: "Perfiles revisados a mano", highlight: false },
              { value: "Directo", label: "Sin intermediarios ni comisiones", highlight: false },
              { value: "Real", label: "Experiencia confirmada, no currículums", highlight: false },
            ].map((s, i) => (
              <div key={i} style={{
                background: s.highlight ? "rgba(233,160,48,0.12)" : "rgba(255,255,255,0.04)",
                border: s.highlight ? "1px solid rgba(233,160,48,0.3)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: isMob ? "20px 16px" : "24px 20px",
                opacity: 1,
                transform: inView ? "translateY(0)" : "translateY(12px)",
                transition: `transform 0.5s ease ${i * 0.1}s`,
              }}>
                <div style={{
                  fontFamily: SANS,
                  fontSize: isMob ? 22 : "clamp(22px, 2.5vw, 30px)",
                  fontWeight: 900,
                  color: s.highlight ? D.gold : "#fff",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  marginBottom: 6,
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontFamily: SANS, fontSize: 12, fontWeight: 500,
                  color: "rgba(255,255,255,0.45)", lineHeight: 1.4,
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PRIVACY FEATURE ──────────────────────────────────────────────────────
function PrivacyFeature() {
  const isMob = useIsMobile();
  const { ref, inView } = useInView(0.15);

  return (
    <section style={{
      background: D.white,
      padding: isMob ? "64px 24px" : "0",
      overflow: "hidden",
    }}>
      <div ref={ref} style={{
        maxWidth: 1120, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: isMob ? "1fr" : "1fr 1fr",
        minHeight: isMob ? "auto" : 460,
        alignItems: "center",
      }}>
        {/* Image */}
        <div style={{
          position: "relative" as const,
          overflow: "hidden",
          height: isMob ? 240 : 460,
          order: isMob ? -1 : 1,
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=700)`,
            backgroundSize: "cover", backgroundPosition: "center center",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(7,19,38,0.08)",
          }} />
        </div>

        {/* Text */}
        <div style={{
          padding: isMob ? "36px 0 0" : "60px 60px 60px 64px",
          display: "flex", flexDirection: "column" as const, justifyContent: "center",
          opacity: 1,
          transform: inView ? "translateX(0)" : "translateX(10px)",
          transition: "transform 0.7s ease 0.1s",
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "rgba(27,79,216,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={D.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div style={{
            fontFamily: SANS, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase" as const,
            color: D.gold, marginBottom: 14,
          }}>
            Privacidad
          </div>
          <h2 style={{
            fontFamily: SANS,
            fontSize: isMob ? 24 : "clamp(24px, 2.6vw, 34px)",
            fontWeight: 800,
            color: D.ink, letterSpacing: "-0.04em",
            margin: "0 0 18px", lineHeight: 1.1,
          }}>
            Tú controlas quién<br />ve tu perfil.
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 14, color: D.muted, lineHeight: 1.8, margin: "0 0 12px" }}>
            Muchos de nuestros docentes combinan su carrera profesional
            con la enseñanza de forma discreta. FacultyMatch está diseñado
            para esto: puedes bloquear instituciones específicas por nombre,
            incluido tu empleador actual.
          </p>
          <p style={{ fontFamily: SANS, fontSize: 14, color: D.muted, lineHeight: 1.8, margin: "0 0 28px" }}>
            Tu perfil es visible únicamente para quien tú decidas. Sin
            comprometer tu posición actual ni tu reputación profesional.
          </p>
          <Link href="/signup">
            <button style={{
              fontFamily: SANS, fontSize: 14, fontWeight: 600,
              background: "transparent", color: D.navy,
              border: `1.5px solid ${D.navy}`,
              padding: "12px 26px", borderRadius: 10, cursor: "pointer",
              alignSelf: "flex-start",
            }}>
              Gestionar mi privacidad
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── CTA FINAL ─────────────────────────────────────────────────────────────
function CtaFinal() {
  const isMob = useIsMobile();
  return (
    <section style={{
      background: `linear-gradient(135deg, ${D.navy} 0%, ${D.blue} 100%)`,
      padding: isMob ? "72px 24px" : "80px 32px",
      textAlign: "center",
    }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700,
          letterSpacing: "0.16em", textTransform: "uppercase" as const,
          color: D.gold, marginBottom: 18,
        }}>
          Únete a la red
        </div>
        <h2 style={{
          fontFamily: SANS,
          fontSize: isMob ? 28 : "clamp(30px, 3.5vw, 48px)",
          fontWeight: 900,
          color: "#fff", letterSpacing: "-0.04em",
          margin: "0 0 18px", lineHeight: 1.08,
        }}>
          Únete a la red de talento<br />para la educación superior.
        </h2>
        <p style={{
          fontFamily: SANS, fontSize: 16,
          color: "rgba(255,255,255,0.62)",
          lineHeight: 1.7, margin: "0 0 40px",
        }}>
          Publicar tu perfil es gratuito para docentes y expertos.
          Las instituciones empiezan con acceso básico sin coste.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" as const }}>
          <Link href="/signup">
            <button style={{
              fontFamily: SANS, fontSize: 15, fontWeight: 700,
              background: D.white, color: D.navy,
              border: "none", padding: "15px 36px", borderRadius: 10,
              cursor: "pointer",
              boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
            }}>
              Soy docente o experto →
            </button>
          </Link>
          <Link href="/signup?intent=institution">
            <button style={{
              fontFamily: SANS, fontSize: 15, fontWeight: 600,
              background: "transparent",
              color: "rgba(255,255,255,0.85)",
              border: "1.5px solid rgba(255,255,255,0.35)",
              padding: "15px 36px", borderRadius: 10, cursor: "pointer",
            }}>
              Soy institución
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── ROOT ──────────────────────────────────────────────────────────────────
export default function LandingClient() {
  return (
    <div style={{ background: D.surf, fontFamily: SANS }}>
      <Nav />
      <Hero />
      <Ticker />
      <StatsStrip />
      <HowItWorks />
      <SplitDocentes />
      <SplitInstituciones />
      <SectorMetrics />
      <MatchingSpeed />
      <PrivacyFeature />
      <CtaFinal />
      <Footer />
    </div>
  );
}
