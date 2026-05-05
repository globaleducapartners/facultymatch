"use client";
// src/app/LandingClient.tsx
// Componente cliente de la landing. El metadata está en page.tsx (server).

import { useState, useEffect } from "react";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";

// ─── Tokens de diseño ─────────────────────────────────────────────────────────
const SERIF = `var(--font-serif, 'Georgia', 'Times New Roman', serif)`;
const SANS  = `var(--font-sans, 'DM Sans', system-ui, -apple-system, sans-serif)`;

const C = {
  ink:    "#0C1018",
  navy:   "#0D2240",
  brass:  "#B8963E",
  cream:  "#F7F5F0",
  paper:  "#FDFCF9",
  white:  "#FFFFFF",
  muted:  "#6B7280",
  faint:  "#9CA3AF",
  border: "#E5E1D8",
};

// ─── Foto con CSS background-image (CSP-safe en todos los entornos) ───────────
function PhotoBg({
  url,
  height,
  children,
  overlay = "rgba(12,16,24,0.62)",
  position = "center 40%",
  fallback = C.navy,
}: {
  url: string;
  height: number | string;
  children?: React.ReactNode;
  overlay?: string;
  position?: string;
  fallback?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setLoaded(true);
    img.src = url;
  }, [url]);

  return (
    <div style={{ position: "relative", height, overflow: "hidden", background: fallback }}>
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${url})`,
          backgroundSize: "cover",
          backgroundPosition: position,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.7s ease",
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: overlay }} />
      {children && (
        <div style={{ position: "relative", zIndex: 2, height: height === "auto" ? undefined : "100%" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Datos del directorio ilustrativo ────────────────────────────────────────
const PROFILES = [
  { init: "MR", name: "María R.",   role: "Economía · Política fiscal",    org: "Univ. Autónoma · Madrid", kind: "Académica",   avail: true,  lang: "ES · EN", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120&h=120" },
  { init: "JL", name: "Javier L.",  role: "Dirección de operaciones",       org: "18 años en empresa",       kind: "Experto",     avail: true,  lang: "ES · EN", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120&h=120" },
  { init: "CR", name: "Carmen R.",  role: "Derecho Mercantil · Compliance", org: "UCM · Madrid",             kind: "Académica",   avail: false, lang: "ES · FR", photo: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&q=80&w=120&h=120" },
  { init: "PV", name: "Pablo V.",   role: "Marketing digital · Growth",     org: "Ex-Google · Ex-Cabify",    kind: "Profesional", avail: true,  lang: "ES · EN", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120" },
  { init: "BM", name: "Beatriz M.", role: "Inteligencia Artificial · ML",   org: "UPM Madrid",               kind: "Académica",   avail: true,  lang: "ES · EN", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120&h=120" },
  { init: "AS", name: "Álvaro S.",  role: "Liderazgo · Gestión de equipos", org: "Consultor independiente",  kind: "Experto",     avail: true,  lang: "ES",      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120&h=120" },
];

const KIND_STYLE: Record<string, { dot: string; bg: string; text: string }> = {
  Académica:   { dot: "#2563EB", bg: "#EFF6FF", text: "#1D4ED8" },
  Experto:     { dot: C.brass,   bg: "#FEF3C7", text: "#92400E" },
  Profesional: { dot: "#059669", bg: "#F0FDF4", text: "#065F46" },
};

const AREAS = [
  "Finanzas corporativas", "Inteligencia Artificial", "Liderazgo ejecutivo",
  "Derecho Mercantil", "Marketing digital", "Economía aplicada",
  "Gestión de equipos", "Transformación digital", "Data Science",
  "Estrategia empresarial", "Comunicación", "Emprendimiento",
];

// ─── Hook responsive ──────────────────────────────────────────────────────────
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

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav() {
  const isMob = useIsMobile();
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: C.white, borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{
        maxWidth: 1080, margin: "0 auto", padding: "0 40px",
        height: 58, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 5, background: C.navy,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, fontFamily: SANS }}>FM</span>
          </div>
          <span style={{ fontFamily: SERIF, fontSize: 17, color: C.ink, letterSpacing: "-0.01em" }}>
            FacultyMatch
          </span>
        </div>

        {/* Nav links — centro, solo desktop */}
        {!isMob && (
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {[
              { label: "Para docentes",      href: "/faculty" },
              { label: "Para instituciones", href: "/institutions" },
              { label: "Recursos",           href: "/resources" },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{ fontFamily: SANS, fontSize: 13, color: C.muted, textDecoration: "none", cursor: "pointer" }}>
                {l.label}
              </Link>
            ))}
          </div>
        )}

        {/* Auth */}
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/login">
            <button style={{
              fontFamily: SANS, background: "transparent",
              border: `1px solid ${C.border}`, color: C.ink,
              fontSize: 13, padding: "6px 18px", borderRadius: 6, cursor: "pointer",
            }}>
              Acceder
            </button>
          </Link>
          <Link href="/signup">
            <button style={{
              fontFamily: SANS, background: C.navy, border: "none",
              color: "#fff", fontSize: 13, fontWeight: 600,
              padding: "6px 18px", borderRadius: 6, cursor: "pointer",
            }}>
              Publicar perfil
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  const isMob = useIsMobile();
  return (
    <div style={{ position: "relative", height: isMob ? "auto" : 580, overflow: "hidden", background: C.navy }}>
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=85&w=1800"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center 30%",
        }}
      >
        <source src="https://assets.mixkit.co/videos/36827/36827-720.mp4" type="video/mp4" />
      </video>
      {/* Gradient: heavy left → transparent right so video is visible on right side */}
      <div style={{
        position: "absolute", inset: 0,
        background: isMob
          ? "rgba(12,16,24,0.72)"
          : "linear-gradient(to right, rgba(12,16,24,0.97) 0%, rgba(12,16,24,0.92) 38%, rgba(12,16,24,0.5) 62%, rgba(12,16,24,0.08) 100%)",
      }} />
      <div style={{ position: "relative", zIndex: 2, height: isMob ? undefined : "100%" }}>
        <div style={{
          maxWidth: 1080, margin: "0 auto",
          height: isMob ? undefined : "100%",
          display: "flex", flexDirection: "column",
          alignItems: "flex-start", justifyContent: "center",
          minHeight: isMob ? 500 : undefined,
          padding: isMob ? "80px 24px 64px" : "0 40px",
        }}>
          <div style={{ maxWidth: isMob ? "100%" : 520 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <div style={{ width: 20, height: "0.5px", background: "rgba(255,255,255,0.4)" }} />
              <span style={{
                fontFamily: SANS, fontSize: 10, fontWeight: 600,
                letterSpacing: "0.18em", textTransform: "uppercase" as const,
                color: "rgba(255,255,255,0.5)",
              }}>
                Talento para la educación superior
              </span>
            </div>

            <h1 style={{
              fontFamily: SERIF, fontSize: isMob ? 34 : 54, fontWeight: 400,
              color: "#fff", lineHeight: 1.08, letterSpacing: "-0.03em",
              margin: "0 0 20px",
            }}>
              En la era de la IA,<br />
              tu experiencia es el<br />
              conocimiento más demandado.
            </h1>

            <p style={{
              fontFamily: SANS, fontSize: 15, color: "rgba(255,255,255,0.62)",
              lineHeight: 1.78, margin: "0 0 36px", maxWidth: 420,
            }}>
              Directorio de docentes, investigadores y expertos para la educación superior.
              Perfiles verificados. Contacto directo. Sin intermediarios.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
              <Link href="/signup">
                <button style={{
                  fontFamily: SANS, background: "#fff", color: C.ink,
                  border: "none", padding: "13px 32px", borderRadius: 6,
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}>
                  Publicar mi perfil
                </button>
              </Link>
              <Link href="/signup?intent=institution">
                <button style={{
                  fontFamily: SANS, background: "transparent",
                  color: "rgba(255,255,255,0.82)",
                  border: "1px solid rgba(255,255,255,0.28)",
                  padding: "13px 32px", borderRadius: 6,
                  fontSize: 14, cursor: "pointer",
                }}>
                  Buscar docentes
                </button>
              </Link>
            </div>
          </div>

          {!isMob && (
            <div style={{
              position: "absolute", bottom: 26, left: "50%", transform: "translateX(-50%)",
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 7,
            }}>
              <span style={{
                fontFamily: SANS, fontSize: 9, letterSpacing: "0.16em",
                textTransform: "uppercase" as const, color: "rgba(255,255,255,0.28)",
              }}>
                Directorio
              </span>
              <div style={{ width: "0.5px", height: 24, background: "rgba(255,255,255,0.18)" }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TICKER ───────────────────────────────────────────────────────────────────
function Ticker() {
  return (
    <div style={{ background: C.navy, padding: "11px 0", overflow: "hidden" }}>
      <div style={{
        display: "flex", gap: 0,
        animation: "fm-tick 32s linear infinite",
        width: "max-content",
      }}>
        {[...AREAS, ...AREAS].map((a, i) => (
          <span key={i} style={{
            fontFamily: SANS, fontSize: 10, fontWeight: 600,
            color: "rgba(255,255,255,0.38)", letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
            padding: "0 26px",
            borderRight: "0.5px solid rgba(255,255,255,0.1)",
            whiteSpace: "nowrap" as const,
          }}>
            {a}
          </span>
        ))}
      </div>
      <style>{`@keyframes fm-tick { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}

// ─── PROFILE CARD ─────────────────────────────────────────────────────────────
function ProfileCard({ p }: { p: typeof PROFILES[0] }) {
  const [hov, setHov] = useState(false);
  const k = KIND_STYLE[p.kind];
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.white,
        border: `1px solid ${hov ? "#C8C4BC" : C.border}`,
        borderRadius: 10, padding: "20px 22px", cursor: "pointer",
        transition: "all 0.15s",
        boxShadow: hov ? "0 4px 16px rgba(12,16,24,0.07)" : "none",
        transform: hov ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{ display: "flex", gap: 13, marginBottom: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 8, flexShrink: 0,
          background: C.cream, border: `1px solid ${C.border}`,
          overflow: "hidden",
        }}>
          <div style={{
            width: "100%", height: "100%",
            backgroundImage: `url(${p.photo})`,
            backgroundSize: "cover", backgroundPosition: "center top",
          }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
            <span style={{ fontFamily: SERIF, fontSize: 14, color: C.ink }}>{p.name}</span>
            <div style={{
              width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
              background: p.avail ? "#059669" : C.faint,
            }} />
          </div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: C.muted, lineHeight: 1.4 }}>{p.role}</div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: C.faint, marginTop: 2 }}>{p.org}</div>
        </div>
      </div>
      <div style={{
        paddingTop: 12, borderTop: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 600,
          color: k.text, background: k.bg,
          padding: "2px 9px", borderRadius: 20,
        }}>
          {p.kind}
        </span>
        <span style={{ fontFamily: SANS, fontSize: 11, color: C.faint }}>{p.lang}</span>
      </div>
    </div>
  );
}

// ─── CÓMO FUNCIONA — ilustraciones SVG ────────────────────────────────────────
function IllProfile() {
  return (
    <svg viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 80, height: 64 }}>
      <rect x="4" y="2" width="72" height="60" rx="9" fill={C.paper} stroke={C.border} strokeWidth="1.5"/>
      <circle cx="28" cy="26" r="12" fill="#DBEAFE"/>
      <circle cx="28" cy="21" r="5.5" fill="#93C5FD"/>
      <ellipse cx="28" cy="35" rx="9" ry="5" fill="#93C5FD"/>
      <rect x="46" y="19" width="24" height="3.5" rx="1.75" fill={C.border}/>
      <rect x="46" y="26" width="17" height="3" rx="1.5" fill="#E2E8F0"/>
      <rect x="46" y="33" width="20" height="3" rx="1.5" fill="#E2E8F0"/>
      <circle cx="68" cy="11" r="9" fill={C.navy}/>
      <path d="M63.5 11L67 14.5L73 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IllSearch() {
  return (
    <svg viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 80, height: 64 }}>
      <rect x="2" y="2" width="34" height="26" rx="5" fill={C.paper} stroke={C.border} strokeWidth="1"/>
      <circle cx="14" cy="14" r="5" fill={C.border}/>
      <rect x="22" y="11" width="10" height="2.5" rx="1.25" fill={C.border}/>
      <rect x="22" y="16" width="7" height="2" rx="1" fill="#E2E8F0"/>
      <rect x="44" y="2" width="34" height="26" rx="5" fill={C.paper} stroke={C.border} strokeWidth="1"/>
      <circle cx="56" cy="14" r="5" fill={C.border}/>
      <rect x="64" y="11" width="10" height="2.5" rx="1.25" fill={C.border}/>
      <rect x="64" y="16" width="7" height="2" rx="1" fill="#E2E8F0"/>
      <rect x="2" y="36" width="34" height="26" rx="5" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.5"/>
      <circle cx="14" cy="47" r="5" fill="#93C5FD"/>
      <rect x="22" y="44" width="10" height="2.5" rx="1.25" fill="#BFDBFE"/>
      <rect x="22" y="49" width="7" height="2" rx="1" fill="#BFDBFE"/>
      <circle cx="34" cy="36" r="7" fill={C.brass}/>
      <path d="M34 31L35.5 35.5H40.5L36.5 38L38 42.5L34 40L30 42.5L31.5 38L27.5 35.5H32.5Z" fill="white" opacity="0.9"/>
      <rect x="44" y="36" width="34" height="26" rx="5" fill={C.paper} stroke={C.border} strokeWidth="1"/>
      <circle cx="56" cy="47" r="5" fill={C.border}/>
      <rect x="64" y="44" width="10" height="2.5" rx="1.25" fill={C.border}/>
      <rect x="64" y="49" width="7" height="2" rx="1" fill="#E2E8F0"/>
    </svg>
  );
}
function IllMessage() {
  return (
    <svg viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 80, height: 64 }}>
      <circle cx="13" cy="18" r="11" fill="#DBEAFE"/>
      <circle cx="13" cy="13" r="5" fill="#93C5FD"/>
      <ellipse cx="13" cy="26" rx="8" ry="4" fill="#93C5FD"/>
      <rect x="60" y="6" width="18" height="22" rx="4" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1.5"/>
      <rect x="64" y="12" width="10" height="2.5" rx="1.25" fill="#FCD34D"/>
      <rect x="64" y="18" width="6" height="2" rx="1" fill="#FDE68A"/>
      <rect x="60" y="25" width="18" height="3" rx="1.5" fill="#FDE68A"/>
      <rect x="24" y="19" width="38" height="28" rx="7" fill={C.navy}/>
      <polygon points="28,47 23,57 38,47" fill={C.navy}/>
      <rect x="30" y="25" width="26" height="3.5" rx="1.75" fill="rgba(255,255,255,0.6)"/>
      <rect x="30" y="32" width="18" height="3" rx="1.5" fill="rgba(255,255,255,0.35)"/>
      <rect x="30" y="38" width="13" height="3" rx="1.5" fill="rgba(255,255,255,0.2)"/>
    </svg>
  );
}

function HowItWorks() {
  const isMob = useIsMobile();

  const steps = [
    {
      n: "01/",
      title: "Publica tu perfil",
      body: "Describe tu área, experiencia y disponibilidad. Verificamos cada perfil antes de publicarlo en el directorio.",
      ill: <IllProfile />,
    },
    {
      n: "02/",
      title: "Apareces ante quien te busca",
      body: "Las instituciones filtran por área, idioma y disponibilidad real. Tu perfil llega exactamente a quien lo necesita.",
      ill: <IllSearch />,
    },
    {
      n: "03/",
      title: "Contacto directo",
      body: "La institución escribe directamente. Sin intermediarios ni comisiones. Tú decides si respondes y en qué condiciones.",
      ill: <IllMessage />,
    },
  ];

  return (
    <section style={{ background: C.cream, padding: isMob ? "56px 20px 64px" : "88px 40px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: isMob ? 48 : 72 }}>
          <div style={{
            fontFamily: SANS, fontSize: 10, fontWeight: 700,
            letterSpacing: "0.15em", textTransform: "uppercase" as const,
            color: C.brass, marginBottom: 14,
          }}>Así funciona</div>
          <h2 style={{
            fontFamily: SERIF, fontSize: isMob ? 28 : 38, fontWeight: 400,
            color: C.ink, letterSpacing: "-0.03em", margin: "0 0 16px", lineHeight: 1.15,
          }}>
            Tres pasos para conectar<br />talento con oportunidad.
          </h2>
          <p style={{
            fontFamily: SANS, fontSize: 15, color: C.muted,
            margin: "0 auto", maxWidth: 380,
          }}>
            Sin intermediarios. Sin comisiones por contratación.
          </p>
        </div>

        {/* Desktop: horizontal workflow */}
        {!isMob ? (
          <div style={{ position: "relative" as const }}>
            {/* Dashed connector line between circles */}
            <div style={{
              position: "absolute" as const,
              top: 47, left: "calc(16.66% + 48px)", right: "calc(16.66% + 48px)",
              height: 2,
              backgroundImage: `repeating-linear-gradient(to right, ${C.border} 0, ${C.border} 10px, transparent 10px, transparent 20px)`,
              zIndex: 0,
            }} />
            {/* Chevron arrows on line */}
            {[33.33, 66.66].map((pct, i) => (
              <div key={i} style={{
                position: "absolute" as const,
                top: 38, left: `${pct}%`,
                transform: "translateX(-50%)",
                zIndex: 2,
                width: 20, height: 20,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: C.cream,
              }}>
                <svg viewBox="0 0 12 12" fill="none" style={{ width: 12, height: 12 }}>
                  <path d="M3 2L9 6L3 10" stroke={C.brass} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
              {steps.map((step, i) => (
                <div key={i} style={{
                  display: "flex", flexDirection: "column" as const, alignItems: "center",
                  textAlign: "center" as const,
                  padding: "0 36px",
                  position: "relative" as const, zIndex: 1,
                }}>
                  {/* Icon circle */}
                  <div style={{
                    width: 96, height: 96, borderRadius: "50%",
                    background: C.white,
                    border: `1.5px solid ${C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 32, flexShrink: 0,
                    boxShadow: "0 4px 16px rgba(12,16,24,0.07)",
                  }}>
                    {step.ill}
                  </div>

                  {/* Step number */}
                  <div style={{
                    fontFamily: SANS, fontWeight: 800, fontSize: 30,
                    color: C.brass, letterSpacing: "-0.02em", lineHeight: 1,
                    marginBottom: 12,
                  }}>
                    {step.n}
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontFamily: SERIF, fontSize: 20, fontWeight: 400,
                    color: C.ink, margin: "0 0 12px", letterSpacing: "-0.02em", lineHeight: 1.3,
                  }}>
                    {step.title}
                  </h3>

                  {/* Body */}
                  <p style={{
                    fontFamily: SANS, fontSize: 13.5, color: C.muted,
                    lineHeight: 1.8, margin: 0,
                  }}>
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Mobile: vertical timeline */
          <div>
            {steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 0 }}>
                <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", marginRight: 20, flexShrink: 0 }}>
                  {i > 0 && <div style={{ width: 2, height: 20, background: C.border }} />}
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: C.white, border: `1.5px solid ${C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(12,16,24,0.07)",
                    flexShrink: 0,
                  }}>
                    {step.ill}
                  </div>
                  {i < steps.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 20, background: C.border }} />}
                </div>
                <div style={{ paddingBottom: 36, paddingTop: 4 }}>
                  <div style={{
                    fontFamily: SANS, fontSize: 22, fontWeight: 800,
                    color: C.brass, letterSpacing: "-0.01em", lineHeight: 1,
                    marginBottom: 8,
                  }}>{step.n}</div>
                  <h3 style={{
                    fontFamily: SERIF, fontSize: 19, fontWeight: 400,
                    color: C.ink, margin: "0 0 8px", letterSpacing: "-0.02em",
                  }}>{step.title}</h3>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: C.muted, lineHeight: 1.75, margin: 0 }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 60, flexWrap: "wrap" as const }}>
          <Link href="/signup">
            <button style={{
              fontFamily: SANS, background: C.navy, color: "#fff",
              border: "none", padding: "12px 32px", borderRadius: 6,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
              Publicar mi perfil
            </button>
          </Link>
          <Link href="/signup?intent=institution">
            <button style={{
              fontFamily: SANS, background: "transparent", color: C.navy,
              border: `1px solid ${C.navy}`, padding: "12px 32px",
              borderRadius: 6, fontSize: 13, cursor: "pointer",
            }}>
              Acceder al directorio
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── TWO COLUMNS ──────────────────────────────────────────────────────────────
function TwoColumns() {
  const isMob = useIsMobile();
  const cols = [
    {
      url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=900",
      pos: "center 35%",
      eyebrow: "Para docentes y expertos",
      headline: "Tus clases son\nel extra que\nestabas esperando.",
      body: "Lo que tardaste años en aprender tiene demanda real. Hay programas ejecutivos, másters y centros de formación buscando exactamente lo que tú sabes. Publica tu perfil y deja que te encuentren.",
      cta: "Publicar mi perfil",
      href: "/signup",
      primary: true,
    },
    {
      url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=900",
      pos: "center 40%",
      eyebrow: "Para instituciones educativas",
      headline: "El docente que necesitas\nno está en LinkedIn,\nestá en FacultyMatch.",
      body: "Los mejores perfiles están ejerciendo, investigando o dirigiendo empresas. No buscan trabajo — pero están abiertos a enseñar. FacultyMatch los hace accesibles, directamente.",
      cta: "Buscar en el directorio",
      href: "/signup?intent=institution",
      primary: false,
    },
  ];

  return (
    <section style={{ background: C.white, borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr" }}>
        {cols.map((col, i) => (
          <div key={i} style={{ borderRight: i === 0 && !isMob ? `1px solid ${C.border}` : "none" }}>
            <PhotoBg
              url={col.url}
              height={280}
              overlay="rgba(12,16,24,0.08)"
              position={col.pos}
              fallback={i === 0 ? "linear-gradient(135deg, #101820 0%, #0D2240 100%)" : "linear-gradient(135deg, #1C1409 0%, #2D1F08 100%)"}
            />
            <div style={{ padding: isMob ? "28px 20px 32px" : "40px 44px 48px" }}>
              <div style={{
                fontFamily: SANS, fontSize: 10, fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase" as const,
                color: C.brass, marginBottom: 12,
              }}>
                {col.eyebrow}
              </div>
              <h2 style={{
                fontFamily: SERIF, fontSize: 23, fontWeight: 400,
                color: C.ink, letterSpacing: "-0.02em", lineHeight: 1.3,
                margin: "0 0 16px", whiteSpace: "pre-line" as const,
              }}>
                {col.headline}
              </h2>
              <p style={{ fontFamily: SANS, fontSize: 14, color: C.muted, lineHeight: 1.8, margin: "0 0 26px" }}>
                {col.body}
              </p>
              <Link href={col.href}>
                <button style={{
                  fontFamily: SANS, fontSize: 13, fontWeight: 500, cursor: "pointer",
                  padding: "10px 24px", borderRadius: 6,
                  background: col.primary ? C.navy : "transparent",
                  color: col.primary ? "#fff" : C.navy,
                  border: `1px solid ${C.navy}`,
                }}>
                  {col.cta}
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── PULL QUOTE ───────────────────────────────────────────────────────────────
function PullQuote() {
  const isMob = useIsMobile();
  return (
    <PhotoBg
      url="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1800"
      height={isMob ? 260 : 280}
      overlay="rgba(12,16,24,0.72)"
      position="center 60%"
      fallback="linear-gradient(135deg, #1C1409 0%, #2D1F08 100%)"
    >
      <div style={{
        height: "100%", display: "flex", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: "0 40px",
      }}>
        <div style={{ maxWidth: 580 }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 22 }}>
            <div style={{ width: 24, height: "0.5px", background: C.brass, opacity: 0.6 }} />
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.brass }} />
            <div style={{ width: 24, height: "0.5px", background: C.brass, opacity: 0.6 }} />
          </div>
          <blockquote style={{
            fontFamily: SERIF, fontSize: isMob ? 17 : 21, fontWeight: 400, fontStyle: "italic" as const,
            color: "rgba(255,255,255,0.88)", lineHeight: 1.6,
            margin: "0 0 18px", letterSpacing: "-0.01em",
          }}>
            "En un mundo donde la IA genera contenido infinito, la experiencia real de quien ha estado ahí es lo que más se valora."
          </blockquote>
          <div style={{
            fontFamily: SANS, fontSize: 10, color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.12em", textTransform: "uppercase" as const,
          }}>
            FacultyMatch · Educación superior
          </div>
        </div>
      </div>
    </PhotoBg>
  );
}

// ─── PROCESS ──────────────────────────────────────────────────────────────────
function Process() {
  const isMob = useIsMobile();
  const steps = [
    { n: "I",   title: "Crea tu perfil",           body: "Diez minutos. Tus áreas, tu experiencia, tu disponibilidad. Sin documentos innecesarios. Nada que no tengas ya en la cabeza." },
    { n: "II",  title: "Lo revisamos",             body: "Alguien de nuestro equipo lee tu perfil antes de publicarlo. Una persona, no un algoritmo. Eso garantiza que lo que aparece en el directorio tiene nivel." },
    { n: "III", title: "Las instituciones contactan", body: "Apareces en sus búsquedas. Ellas dan el primer paso. Tú decides si aceptas, cuándo y en qué condiciones. Sin presiones." },
  ];
  return (
    <section style={{ background: C.cream, padding: isMob ? "48px 20px 56px" : "64px 40px 72px", borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            fontFamily: SANS, fontSize: 10, fontWeight: 700,
            letterSpacing: "0.14em", textTransform: "uppercase" as const,
            color: C.brass, marginBottom: 12,
          }}>
            Cómo funciona
          </div>
          <h2 style={{
            fontFamily: SERIF, fontSize: 28, fontWeight: 400,
            color: C.ink, letterSpacing: "-0.025em", margin: 0, lineHeight: 1.15,
          }}>
            Publica hoy. Recibe tu primera propuesta esta semana.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr 1fr", gap: 18 }}>
          {steps.map((s, i) => (
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
  );
}

// ─── FEATURE PRIVACIDAD ───────────────────────────────────────────────────────
function Feature() {
  const isMob = useIsMobile();
  return (
    <section style={{ background: C.white, borderTop: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", minHeight: 380 }}>
        <PhotoBg
          url="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=700"
          height={isMob ? 240 : 380}
          overlay="rgba(12,16,24,0.06)"
          position="center center"
          fallback="linear-gradient(160deg, #1C2030 0%, #0D2240 100%)"
        />
        <div style={{ padding: isMob ? "28px 20px" : "52px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{
            fontFamily: SANS, fontSize: 10, fontWeight: 700,
            letterSpacing: "0.14em", textTransform: "uppercase" as const,
            color: C.brass, marginBottom: 14,
          }}>
            Privacidad
          </div>
          <h2 style={{
            fontFamily: SERIF, fontSize: 26, fontWeight: 400,
            color: C.ink, letterSpacing: "-0.02em", lineHeight: 1.2,
            margin: "0 0 16px",
          }}>
            Tú decides a quién<br /><em>mostrar tu perfil.</em>
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 14, color: C.muted, lineHeight: 1.8, margin: "0 0 12px" }}>
            FacultyMatch ha sido diseñado con la privacidad como criterio fundamental. Tu perfil es visible únicamente para las instituciones que tú autorices, y permanece oculto para las que expresamente excluyas.
          </p>
          <p style={{ fontFamily: SANS, fontSize: 14, color: C.muted, lineHeight: 1.8, margin: "0 0 28px" }}>
            Es habitual que directivos, investigadores y académicos combinen su actividad profesional con la docencia de forma discreta. Nuestra plataforma está diseñada para que esto sea posible, sin comprometer su posición actual.
          </p>
          <Link href="/signup">
            <button style={{
              fontFamily: SANS, background: "transparent", color: C.navy,
              border: `1px solid ${C.navy}`, padding: "10px 22px",
              borderRadius: 6, fontSize: 13, cursor: "pointer",
              alignSelf: "flex-start",
            }}>
              Controlar mi visibilidad
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}




// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function LandingClient() {
  return (
    <div style={{ background: C.paper }}>
      <Nav />
      <Hero />
      <Ticker />
      <HowItWorks />
      <TwoColumns />
      <PullQuote />
      <Process />
      <Feature />
      <Footer />
    </div>
  );
}
