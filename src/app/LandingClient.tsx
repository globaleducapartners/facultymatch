"use client";
// src/app/LandingClient.tsx  ← archivo nuevo
// Componente cliente de la landing. El metadata está en page.tsx (server).

import { useState, useEffect } from "react";
import Link from "next/link";

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
        <div style={{ position: "relative", zIndex: 2, height: "100%" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Datos del directorio ilustrativo ────────────────────────────────────────
const PROFILES = [
  { init: "MR", name: "María R.",   role: "Economía · Política fiscal",    org: "Univ. Autónoma · Madrid", kind: "Académica",   avail: true,  lang: "ES · EN" },
  { init: "JL", name: "Javier L.",  role: "Dirección de operaciones",       org: "18 años en empresa",       kind: "Experto",     avail: true,  lang: "ES · EN" },
  { init: "CR", name: "Carmen R.",  role: "Derecho Mercantil · Compliance", org: "UCM · Madrid",             kind: "Académica",   avail: false, lang: "ES · FR" },
  { init: "PV", name: "Pablo V.",   role: "Marketing digital · Growth",     org: "Ex-Google · Ex-Cabify",    kind: "Profesional", avail: true,  lang: "ES · EN" },
  { init: "BM", name: "Beatriz M.", role: "Inteligencia Artificial · ML",   org: "UPM Madrid",               kind: "Académica",   avail: true,  lang: "ES · EN" },
  { init: "AS", name: "Álvaro S.",  role: "Liderazgo · Gestión de equipos", org: "Consultor independiente",  kind: "Experto",     avail: true,  lang: "ES" },
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

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: C.white, borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{
        maxWidth: 1080, margin: "0 auto", padding: "0 40px",
        height: 58, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
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
          {["Directorio", "Para instituciones", "Cómo funciona", "Precios"].map((l) => (
            <span key={l} style={{ fontFamily: SANS, fontSize: 13, color: C.muted, cursor: "pointer" }}>
              {l}
            </span>
          ))}
        </div>
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
          <Link href="/signup/faculty">
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
  return (
    <PhotoBg
      url="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=85&w=1800"
      height={580}
      overlay="linear-gradient(160deg,rgba(12,16,24,0.5) 0%,rgba(12,16,24,0.7) 55%,rgba(12,16,24,0.88) 100%)"
      position="center 40%"
      fallback="linear-gradient(135deg, #0D2240 0%, #0C1018 60%)"
    >
      <div style={{
        height: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "0 40px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 30 }}>
          <div style={{ width: 32, height: "0.5px", background: "rgba(255,255,255,0.28)" }} />
          <span style={{
            fontFamily: SANS, fontSize: 10, fontWeight: 600,
            letterSpacing: "0.18em", textTransform: "uppercase" as const,
            color: "rgba(255,255,255,0.45)",
          }}>
            Talento para la educación superior
          </span>
          <div style={{ width: 32, height: "0.5px", background: "rgba(255,255,255,0.28)" }} />
        </div>

        <h1 style={{
          fontFamily: SERIF, fontSize: 58, fontWeight: 400,
          color: "#fff", lineHeight: 1.1, letterSpacing: "-0.025em",
          margin: "0 0 22px", maxWidth: 680,
        }}>
          El directorio de docentes y expertos
          para la educación superior.
        </h1>

        <p style={{
          fontFamily: SANS, fontSize: 16, color: "rgba(255,255,255,0.58)",
          lineHeight: 1.75, margin: "0 0 40px", maxWidth: 460,
        }}>
          Perfiles revisados de profesores, investigadores y profesionales.
          Búsqueda directa para instituciones. Sin intermediarios.
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/signup/faculty">
            <button style={{
              fontFamily: SANS, background: "#fff", color: C.ink,
              border: "none", padding: "13px 32px", borderRadius: 6,
              fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>
              Publicar mi perfil
            </button>
          </Link>
          <Link href="/signup/institution">
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

        <div style={{
          position: "absolute", bottom: 26,
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
      </div>
    </PhotoBg>
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
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: SERIF, fontSize: 14, color: C.navy,
        }}>
          {p.init}
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

// ─── DIRECTORY ────────────────────────────────────────────────────────────────
function Directory() {
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  return (
    <section style={{ background: C.cream, padding: "64px 40px 72px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          marginBottom: 32, flexWrap: "wrap" as const, gap: 20,
        }}>
          <div>
            <div style={{
              fontFamily: SANS, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase" as const,
              color: C.brass, marginBottom: 10,
            }}>
              Directorio
            </div>
            <h2 style={{
              fontFamily: SERIF, fontSize: 30, fontWeight: 400,
              color: C.ink, letterSpacing: "-0.025em", margin: 0, lineHeight: 1.1,
            }}>
              Perfiles disponibles ahora mismo.
            </h2>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: C.white,
            border: `1px solid ${focus ? C.navy : C.border}`,
            borderRadius: 8, padding: "0 10px 0 16px", minWidth: 260,
            boxShadow: focus ? "0 0 0 3px rgba(13,34,64,0.07)" : "none",
            transition: "all 0.15s",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke={C.faint} strokeWidth="1.4" />
              <path d="M10 10l2 2" stroke={C.faint} strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              placeholder="Área de conocimiento..."
              style={{
                flex: 1, border: "none", outline: "none",
                fontFamily: SANS, fontSize: 14, color: C.ink,
                padding: "11px 0", background: "transparent",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 22, flexWrap: "wrap" as const, alignItems: "center" }}>
          <span style={{ fontFamily: SANS, fontSize: 11, color: C.faint, marginRight: 4 }}>
            Filtrar por:
          </span>
          {["Área", "Modalidad", "Idioma", "Disponibilidad"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(filter === f ? null : f)}
              style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 500,
                background: filter === f ? C.navy : C.white,
                color: filter === f ? "#fff" : C.muted,
                border: `1px solid ${filter === f ? C.navy : C.border}`,
                padding: "4px 14px", borderRadius: 20, cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              {f}
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 14, alignItems: "center" }}>
            {Object.entries(KIND_STYLE).map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: v.dot }} />
                <span style={{ fontFamily: SANS, fontSize: 11, color: C.faint }}>{k}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3,1fr)",
          gap: 14, marginBottom: 32,
        }}>
          {PROFILES.map((p, i) => <ProfileCard key={i} p={p} />)}
        </div>

        <div style={{
          paddingTop: 24, borderTop: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <p style={{ fontFamily: SANS, fontSize: 13, color: C.faint, margin: 0 }}>
            Todos los perfiles son revisados antes de publicarse.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/signup/faculty">
              <button style={{
                fontFamily: SANS, background: C.navy, color: "#fff",
                border: "none", padding: "10px 22px", borderRadius: 6,
                fontSize: 13, fontWeight: 500, cursor: "pointer",
              }}>
                Publicar mi perfil
              </button>
            </Link>
            <Link href="/signup/institution">
              <button style={{
                fontFamily: SANS, background: "transparent", color: C.navy,
                border: `1px solid ${C.navy}`, padding: "10px 22px",
                borderRadius: 6, fontSize: 13, cursor: "pointer",
              }}>
                Acceder al directorio completo
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── TWO COLUMNS ──────────────────────────────────────────────────────────────
function TwoColumns() {
  const cols = [
    {
      url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=900",
      pos: "center 30%",
      eyebrow: "Para docentes y expertos",
      headline: "Tu perfil,\nvisible para quien\nbusca lo que enseñas.",
      body: "Crea un perfil estructurado con tu formación, experiencia y disponibilidad. Las instituciones te encuentran cuando buscan tu área. Tú decides si respondes y en qué condiciones.",
      cta: "Crear mi perfil",
      href: "/signup/faculty",
      primary: true,
    },
    {
      url: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&q=80&w=900",
      pos: "center 40%",
      eyebrow: "Para instituciones educativas",
      headline: "Busca por área,\nidioma y disponibilidad.\nContacto directo.",
      body: "Directorio estructurado de docentes, investigadores y expertos con experiencia real. Cada perfil revisado antes de publicarse. Sin comisiones por contratación.",
      cta: "Acceder al directorio",
      href: "/signup/institution",
      primary: false,
    },
  ];

  return (
    <section style={{ background: C.white, borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {cols.map((col, i) => (
          <div key={i} style={{ borderRight: i === 0 ? `1px solid ${C.border}` : "none" }}>
            <PhotoBg
              url={col.url}
              height={280}
              overlay="rgba(12,16,24,0.2)"
              position={col.pos}
              fallback={i === 0 ? "linear-gradient(135deg, #101820 0%, #0D2240 100%)" : "linear-gradient(135deg, #1C1409 0%, #2D1F08 100%)"}
            />
            <div style={{ padding: "40px 44px 48px" }}>
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
  return (
    <PhotoBg
      url="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1800"
      height={280}
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
            fontFamily: SERIF, fontSize: 21, fontWeight: 400, fontStyle: "italic" as const,
            color: "rgba(255,255,255,0.88)", lineHeight: 1.6,
            margin: "0 0 18px", letterSpacing: "-0.01em",
          }}>
            "La calidad de la educación superior depende de las personas que la imparten.
            FacultyMatch conecta a esas personas con las instituciones que las necesitan."
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
  const steps = [
    { n: "I",   title: "Crea tu perfil",          body: "Registro estructurado por área de conocimiento, formación y experiencia docente. Sin documentos adicionales. En menos de diez minutos." },
    { n: "II",  title: "Lo revisamos",             body: "Nuestro equipo revisa cada perfil antes de publicarlo en el directorio. Un proceso manual que garantiza la calidad de los perfiles." },
    { n: "III", title: "Las instituciones contactan", body: "Tu perfil aparece en las búsquedas de directores de programa. Recibes las solicitudes y decides si aceptas y en qué términos." },
  ];
  return (
    <section style={{ background: C.cream, padding: "64px 40px 72px", borderTop: `1px solid ${C.border}` }}>
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
            Tres pasos. Sin complicaciones.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
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
  return (
    <section style={{ background: C.white, borderTop: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 380 }}>
        <PhotoBg
          url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=700"
          height={380}
          overlay="rgba(12,16,24,0.08)"
          position="center top"
          fallback="linear-gradient(160deg, #1C2030 0%, #0D2240 100%)"
        />
        <div style={{ padding: "52px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
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
            Tú decides quién<br />puede ver tu perfil.
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 14, color: C.muted, lineHeight: 1.8, margin: "0 0 12px" }}>
            Puedes bloquear instituciones específicas por nombre. Tu perfil solo aparece donde tú lo decidas. Tu institución actual no tiene acceso a tu información salvo que tú lo permitas.
          </p>
          <p style={{ fontFamily: SANS, fontSize: 14, color: C.muted, lineHeight: 1.8, margin: "0 0 28px" }}>
            El control de visibilidad es tuyo en todo momento.
          </p>
          <button style={{
            fontFamily: SANS, background: "transparent", color: C.navy,
            border: `1px solid ${C.navy}`, padding: "10px 22px",
            borderRadius: 6, fontSize: 13, cursor: "pointer",
            alignSelf: "flex-start",
          }}>
            Más información sobre privacidad
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── CAMPUS CTA ───────────────────────────────────────────────────────────────
function CampusCTA() {
  return (
    <PhotoBg
      url="https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&q=80&w=1800"
      height={200}
      overlay="rgba(12,16,24,0.74)"
      position="center 50%"
      fallback="linear-gradient(135deg, #0D2240 0%, #0C1018 100%)"
    >
      <div style={{
        height: "100%", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 60px",
        maxWidth: 1080, margin: "0 auto", width: "100%",
        flexWrap: "wrap" as const, gap: 28,
      }}>
        <div>
          <p style={{
            fontFamily: SERIF, fontSize: 22,
            color: "rgba(255,255,255,0.9)", lineHeight: 1.35,
            margin: "0 0 6px",
          }}>
            Crea tu perfil. Es gratuito para docentes y expertos.
          </p>
          <p style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>
            Sin permanencia. Sin cuotas de inscripción.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <Link href="/signup/faculty">
            <button style={{
              fontFamily: SANS, background: "#fff", color: C.ink,
              border: "none", padding: "12px 28px", borderRadius: 6,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
              Publicar mi perfil
            </button>
          </Link>
          <Link href="/signup/institution">
            <button style={{
              fontFamily: SANS, background: "transparent",
              color: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.22)",
              padding: "12px 28px", borderRadius: 6,
              fontSize: 13, cursor: "pointer",
            }}>
              Soy institución
            </button>
          </Link>
        </div>
      </div>
    </PhotoBg>
  );
}

// ─── FOOTER PROPIO (la landing tiene el suyo, el global está desactivado) ─────
function LandingFooter() {
  return (
    <footer style={{
      background: C.ink, padding: "24px 40px",
      display: "flex", alignItems: "center",
      justifyContent: "space-between", flexWrap: "wrap" as const, gap: 14,
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ fontFamily: SERIF, fontSize: 15, color: "#fff" }}>FacultyMatch</span>
        <span style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.22)" }}>
          · Grupo Global Educa SL · 2026
        </span>
      </div>
      <div style={{ display: "flex", gap: 22 }}>
        {[
          { label: "Para docentes",      href: "/faculty" },
          { label: "Para instituciones", href: "/institutions" },
          { label: "Privacidad",         href: "/privacy" },
          { label: "Términos",           href: "/terms" },
          { label: "Contacto",           href: "mailto:info@facultymatch.app" },
        ].map((l) => (
          <Link key={l.label} href={l.href}>
            <span style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.26)", cursor: "pointer" }}>
              {l.label}
            </span>
          </Link>
        ))}
      </div>
    </footer>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function LandingClient() {
  return (
    <div style={{ background: C.paper }}>
      <Nav />
      <Hero />
      <Ticker />
      <Directory />
      <TwoColumns />
      <PullQuote />
      <Process />
      <Feature />
      <CampusCTA />
      <LandingFooter />
    </div>
  );
}
