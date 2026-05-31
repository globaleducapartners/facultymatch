"use client";
// src/app/institutions/InstitutionsClient.tsx — FacultyMatch v2

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

const KIND_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  Académica:   { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  Experto:     { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  Profesional: { bg: "#F0FDF4", text: "#065F46", border: "#BBF7D0" },
};

const AVATAR_COLORS: string[] = [
  "#1B4FD8", "#0D2240", "#059669", "#7C3AED", "#DC2626", "#0891B2",
];

const SAMPLE_PROFILES = [
  {
    init: "MR", name: "Dr. Miguel Rodríguez", role: "Economía · Política fiscal",
    org: "Universidad Autónoma · Madrid", kind: "Académica" as const,
    avail: true, lang: "ES · EN", area: "Economía", years: "12 años exp.",
    color: AVATAR_COLORS[0],
  },
  {
    init: "JL", name: "Javier Llamas", role: "Director de Operaciones",
    org: "Ex-Amazon · Ex-Inditex", kind: "Experto" as const,
    avail: true, lang: "ES · EN · FR", area: "Operaciones", years: "18 años exp.",
    color: AVATAR_COLORS[1],
  },
  {
    init: "CR", name: "Dra. Carmen Ramos", role: "Derecho Mercantil · Compliance",
    org: "UCM · Abogada en activo", kind: "Académica" as const,
    avail: false, lang: "ES · FR", area: "Derecho", years: "9 años exp.",
    color: AVATAR_COLORS[2],
  },
  {
    init: "PV", name: "Pablo Velasco", role: "Marketing Digital · Growth",
    org: "Ex-Google · Ex-Cabify", kind: "Profesional" as const,
    avail: true, lang: "ES · EN", area: "Marketing", years: "14 años exp.",
    color: AVATAR_COLORS[3],
  },
  {
    init: "BM", name: "Dra. Beatriz Morales", role: "Inteligencia Artificial · ML",
    org: "UPM · Investigadora senior", kind: "Académica" as const,
    avail: true, lang: "ES · EN", area: "IA & Datos", years: "8 años exp.",
    color: AVATAR_COLORS[4],
  },
  {
    init: "AS", name: "Ana Sánchez", role: "Liderazgo · Gestión de personas",
    org: "Directora RRHH · Multinacional", kind: "Experto" as const,
    avail: true, lang: "ES · EN", area: "Liderazgo", years: "16 años exp.",
    color: AVATAR_COLORS[5],
  },
];

const FILTERS = [
  { label: "Área UNESCO",      desc: "Desde Economía hasta Ciencias de la Salud" },
  { label: "Acreditación",     desc: "ANECA, ORCID, titulación doctoral" },
  { label: "Idioma",           desc: "Español, inglés, francés y más" },
  { label: "Modalidad",        desc: "Presencial, online o híbrida" },
  { label: "Disponibilidad",   desc: "Inmediata, próximo semestre, solo online" },
  { label: "Tipo de perfil",   desc: "Académico, profesional o educador independiente" },
];

const HOW = [
  {
    n: "I",
    title: "Registra tu institución",
    body: "Acceso al directorio completo desde el primer día. Sin proceso de aprobación previo. En cinco minutos estás dentro.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={D.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    ),
  },
  {
    n: "II",
    title: "Busca con filtros reales",
    body: "Por área de conocimiento, acreditación, idioma y disponibilidad. Los resultados son exactamente lo que necesitas para tu programa.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={D.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
      </svg>
    ),
  },
  {
    n: "III",
    title: "Contacta directamente",
    body: "Envía una solicitud al docente. Él decide si responde. Sin intermediarios ni comisiones por contratación. Tú negociais directamente.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={D.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
];

export default function InstitutionsClient() {
  const isMob = useIsMobile();
  const pad = isMob ? "64px 24px" : "88px 32px";
  const { ref: directoryRef, inView: directoryVisible } = useInView(0.1);
  const { ref: howRef, inView: howVisible } = useInView(0.1);

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
            backgroundImage: `url(https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=85&w=1200)`,
            backgroundSize: "cover", backgroundPosition: "center 30%",
          }} />
        ) : (
          <video
            autoPlay muted loop playsInline
            poster="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=85&w=1800"
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center 30%",
            }}
          >
            <source src="https://assets.mixkit.co/videos/48165/48165-720.mp4" type="video/mp4" />
          </video>
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(160deg, rgba(7,19,38,0.78) 0%, rgba(7,19,38,0.88) 60%, rgba(7,19,38,0.96) 100%)",
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
              Para universidades y escuelas de negocio
            </span>
          </div>

          <h1 className="fm-animate-up fm-animate-up-delay-1" style={{
            fontFamily: SANS,
            fontSize: isMob ? 32 : "clamp(36px, 4.8vw, 58px)",
            fontWeight: 900,
            color: "#fff", lineHeight: 1.06, letterSpacing: "-0.04em",
            margin: "0 0 20px", maxWidth: 760,
          }}>
            El directorio que ningún<br />portal de empleo puede tener.
          </h1>

          <p className="fm-animate-up fm-animate-up-delay-2" style={{
            fontFamily: SANS, fontSize: isMob ? 15 : 17,
            color: "rgba(255,255,255,0.6)", lineHeight: 1.75,
            margin: "0 0 40px", maxWidth: 540,
          }}>
            Médicos en activo, investigadores, directivos y especialistas
            que nunca publican su CV en LinkedIn. Aquí están disponibles,
            verificados, con contacto directo y sin comisiones de contratación.
          </p>

          <div className="fm-animate-up fm-animate-up-delay-3" style={{
            display: "flex", gap: 12, flexWrap: "wrap" as const, justifyContent: "center",
          }}>
            <Link href="/signup?intent=institution">
              <button style={{
                fontFamily: SANS, background: D.white, color: D.ink,
                border: "none", padding: "14px 34px", borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: "pointer",
              }}>
                Acceder al directorio
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

      {/* ── PREVIEW DIRECTORIO ── */}
      <section style={{ background: D.surf, padding: pad }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{
            display: "flex", alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 40, flexWrap: "wrap" as const, gap: 20,
          }}>
            <div>
              <div style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 700,
                letterSpacing: "0.16em", textTransform: "uppercase" as const,
                color: D.gold, marginBottom: 12,
              }}>
                Muestra del directorio
              </div>
              <h2 style={{
                fontFamily: SANS,
                fontSize: isMob ? 24 : "clamp(26px, 2.8vw, 36px)",
                fontWeight: 800,
                color: D.ink, letterSpacing: "-0.04em", margin: 0, lineHeight: 1.1,
              }}>
                Una muestra real de los perfiles disponibles.
              </h2>
            </div>
            <Link href="/signup?intent=institution">
              <button style={{
                fontFamily: SANS, background: D.blue, color: "#fff",
                border: "none", padding: "11px 24px", borderRadius: 10,
                fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0,
              }}>
                Ver el directorio completo
              </button>
            </Link>
          </div>

          <div ref={directoryRef} style={{
            display: "grid",
            gridTemplateColumns: isMob ? "1fr" : "repeat(3,1fr)",
            gap: 14, marginBottom: 20,
          }}>
            {SAMPLE_PROFILES.map((p, i) => {
              const k = KIND_STYLE[p.kind];
              return (
                <div key={i} style={{
                  background: D.white, border: `1px solid ${D.border}`,
                  borderRadius: 16, padding: "20px 20px 16px",
                  boxShadow: "0 2px 12px rgba(7,19,38,0.06)",
                  opacity: directoryVisible ? 1 : 0,
                  transform: directoryVisible ? "translateY(0)" : "translateY(20px)",
                  transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`,
                  display: "flex", flexDirection: "column" as const, gap: 14,
                }}>
                  {/* Header row */}
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                      background: p.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: SANS, fontSize: 14, fontWeight: 800, color: "#fff",
                      letterSpacing: "-0.02em",
                    }}>
                      {p.init}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 2 }}>
                        <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: D.ink, letterSpacing: "-0.02em" }}>{p.name}</span>
                        <div style={{
                          display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
                          background: p.avail ? "#F0FDF4" : "#F3F4F6",
                          borderRadius: 20, padding: "2px 8px",
                        }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: p.avail ? "#059669" : D.faint }} />
                          <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: p.avail ? "#059669" : D.faint, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                            {p.avail ? "Disponible" : "No disponible"}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontFamily: SANS, fontSize: 12, color: D.muted, lineHeight: 1.4 }}>{p.role}</div>
                      <div style={{ fontFamily: SANS, fontSize: 11, color: D.faint, marginTop: 2 }}>{p.org}</div>
                    </div>
                  </div>

                  {/* Tags row */}
                  <div style={{
                    display: "flex", gap: 6, flexWrap: "wrap" as const,
                    paddingTop: 10, borderTop: `1px solid ${D.border}`,
                  }}>
                    <span style={{
                      fontFamily: SANS, fontSize: 10, fontWeight: 700,
                      color: k.text, background: k.bg, border: `1px solid ${k.border}`,
                      padding: "3px 9px", borderRadius: 999,
                    }}>
                      {p.kind}
                    </span>
                    <span style={{
                      fontFamily: SANS, fontSize: 10, fontWeight: 600,
                      color: D.muted, background: D.surf, border: `1px solid ${D.border}`,
                      padding: "3px 9px", borderRadius: 999,
                    }}>
                      {p.area}
                    </span>
                    <span style={{
                      fontFamily: SANS, fontSize: 10, color: D.faint,
                      background: D.surf, border: `1px solid ${D.border}`,
                      padding: "3px 9px", borderRadius: 999, marginLeft: "auto",
                    }}>
                      {p.years}
                    </span>
                  </div>

                  {/* Language */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={D.faint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <span style={{ fontFamily: SANS, fontSize: 11, color: D.faint }}>{p.lang}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ fontFamily: SANS, fontSize: 13, color: D.faint, textAlign: "center" }}>
            Todos los perfiles son revisados manualmente antes de publicarse en el directorio.
          </p>
        </div>
      </section>

      {/* ── FILTROS ── */}
      <section style={{ background: D.white, padding: pad }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMob ? "1fr" : "1fr 1fr",
            gap: isMob ? 0 : 72, alignItems: "center",
          }}>
            <div>
              <div style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 700,
                letterSpacing: "0.16em", textTransform: "uppercase" as const,
                color: D.gold, marginBottom: 16,
              }}>
                Búsqueda estructurada
              </div>
              <h2 style={{
                fontFamily: SANS,
                fontSize: isMob ? 26 : "clamp(26px, 2.8vw, 36px)",
                fontWeight: 800,
                color: D.ink, letterSpacing: "-0.04em",
                margin: "0 0 18px", lineHeight: 1.1,
              }}>
                Búsqueda pensada para<br />quien contrata, no para<br />quien busca trabajo.
              </h2>
              <p style={{ fontFamily: SANS, fontSize: 15, color: D.muted, lineHeight: 1.8, margin: "0 0 32px" }}>
                No hay keywords que interpretar ni CVs confusos. El directorio
                está estructurado exactamente con los criterios que usan los
                directores de programa al seleccionar profesorado.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {FILTERS.map((f, i) => (
                  <div key={i} style={{
                    background: D.surf, border: `1px solid ${D.border}`,
                    borderRadius: 10, padding: "12px 16px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: D.gold, flexShrink: 0 }} />
                      <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: D.ink }}>{f.label}</span>
                    </div>
                    <p style={{ fontFamily: SANS, fontSize: 12, color: D.faint, lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            {!isMob && (
              <div style={{ borderRadius: 20, overflow: "hidden", height: 480 }}>
                <div style={{
                  width: "100%", height: "100%",
                  backgroundImage: `url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800)`,
                  backgroundSize: "cover", backgroundPosition: "center",
                }} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section style={{ background: D.surf, padding: pad }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMob ? 44 : 60 }}>
            <div style={{
              fontFamily: SANS, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase" as const,
              color: D.gold, marginBottom: 14,
            }}>
              Cómo funciona
            </div>
            <h2 style={{
              fontFamily: SANS,
              fontSize: isMob ? 26 : "clamp(28px, 3vw, 40px)",
              fontWeight: 800,
              color: D.ink, letterSpacing: "-0.04em", margin: 0, lineHeight: 1.1,
            }}>
              Tres pasos. Sin proceso<br />de selección previo.
            </h2>
          </div>
          <div ref={howRef} style={{
            display: "grid",
            gridTemplateColumns: isMob ? "1fr" : "repeat(3,1fr)",
            gap: 20,
          }}>
            {HOW.map((s, i) => (
              <div key={i} style={{
                background: D.white, border: `1px solid ${D.border}`,
                borderRadius: 16, padding: "28px 26px",
                borderTop: `3px solid ${D.blue}`,
                opacity: howVisible ? 1 : 0,
                transform: howVisible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s`,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "rgba(27,79,216,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16,
                }}>
                  {s.icon}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 28, fontWeight: 900, color: D.gold, opacity: 0.5, marginBottom: 10, letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {s.n}
                </div>
                <h3 style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: D.ink, margin: "0 0 10px" }}>{s.title}</h3>
                <p style={{ fontFamily: SANS, fontSize: 14, color: D.muted, lineHeight: 1.75, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POR QUÉ NO LINKEDIN ── */}
      <section style={{ background: D.white, padding: pad }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{
              fontFamily: SANS, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase" as const,
              color: D.gold, marginBottom: 14,
            }}>
              Por qué no LinkedIn
            </div>
            <h2 style={{
              fontFamily: SANS,
              fontSize: isMob ? 26 : "clamp(28px, 3vw, 40px)",
              fontWeight: 800,
              color: D.ink, letterSpacing: "-0.04em", margin: "0 0 16px",
            }}>
              LinkedIn tiene 50 millones de perfiles.<br />Nosotros tenemos los que enseñan.
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 15, color: D.muted, maxWidth: 520, margin: "0 auto" }}>
              No todos los profesionales quieren dar clases — ni saben que pueden.
              FacultyMatch solo incluye perfiles que se han registrado explícitamente
              para dar docencia y están disponibles ahora.
            </p>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMob ? "1fr" : "1fr 1fr",
            gap: 16, maxWidth: 840, margin: "0 auto",
          }}>
            {[
              {
                feature: "Disponibilidad docente",
                fm: "Filtro real: inmediata, próximo semestre, solo online",
                li: "No existe. Hay que contactar y preguntar uno a uno",
              },
              {
                feature: "Perfiles verificados",
                fm: "Revisados manualmente antes de publicarse",
                li: "Cualquiera puede escribir que da clases en su perfil",
              },
              {
                feature: "Tiempo hasta el primer contacto",
                fm: "Media de 3 días hábiles",
                li: "+2 semanas de media (mensajes frecuentemente ignorados)",
              },
              {
                feature: "Comisión por contratación",
                fm: "0 € — nunca",
                li: "No aplica, pero el proceso manual tiene un coste oculto alto",
              },
            ].map((row, i) => (
              <div key={i} style={{
                background: D.surf, border: `1px solid ${D.border}`,
                borderRadius: 14, padding: "20px 22px",
              }}>
                <div style={{
                  fontFamily: SANS, fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase" as const,
                  color: D.faint, marginBottom: 14,
                }}>
                  {row.feature}
                </div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                      background: "rgba(5,150,105,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, color: D.blue, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>FacultyMatch </span>
                      <p style={{ fontFamily: SANS, fontSize: 13, color: D.ink, margin: "2px 0 0", lineHeight: 1.5 }}>{row.fm}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                      background: "rgba(220,38,38,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 2l8 8M10 2l-8 8" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, color: D.faint, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>LinkedIn </span>
                      <p style={{ fontFamily: SANS, fontSize: 13, color: D.muted, margin: "2px 0 0", lineHeight: 1.5 }}>{row.li}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
              Precios para instituciones
            </div>
            <h2 style={{
              fontFamily: SANS,
              fontSize: isMob ? 26 : "clamp(28px, 3vw, 40px)",
              fontWeight: 800,
              color: D.ink, letterSpacing: "-0.04em", margin: "0 0 12px",
            }}>
              Empieza gratis. Escala cuando lo necesites.
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 16, color: D.muted, maxWidth: 460, margin: "0 auto" }}>
              Sin comisiones por contratación. Pagas por acceso al directorio, no por cada perfil que encuentres.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMob ? "1fr" : "1fr 1fr",
            gap: 20, maxWidth: 780, margin: "0 auto",
          }}>
            {/* Essential */}
            <div style={{
              background: D.surf, border: `1px solid ${D.border}`,
              borderRadius: 20, padding: "36px 32px",
            }}>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: D.faint, marginBottom: 18 }}>
                Plan Essential
              </div>
              <div style={{ fontFamily: SANS, fontSize: 48, fontWeight: 900, color: D.ink, letterSpacing: "-0.05em", margin: "0 0 4px", lineHeight: 1 }}>
                0 €
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: D.faint, marginBottom: 28 }}>para empezar</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 12, marginBottom: 32 }}>
                {[
                  "Registro gratuito",
                  "5 búsquedas al mes",
                  "Vista de perfil básica",
                  "5 contactos al mes",
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
              <Link href="/signup?intent=institution">
                <button style={{
                  fontFamily: SANS, width: "100%", background: "transparent",
                  color: D.navy, border: `1.5px solid ${D.navy}`,
                  padding: "13px 0", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}>
                  Registrar mi institución
                </button>
              </Link>
            </div>

            {/* Professional */}
            <div style={{ background: D.navy, borderRadius: 20, padding: "36px 32px", position: "relative" as const }}>
              <div style={{
                position: "absolute", top: 20, right: 20,
                background: D.gold, color: D.ink,
                fontFamily: SANS, fontSize: 10, fontWeight: 800,
                letterSpacing: "0.08em", textTransform: "uppercase" as const,
                padding: "4px 10px", borderRadius: 999,
              }}>
                Más usado
              </div>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: D.gold, marginBottom: 18 }}>
                Plan Professional
              </div>
              <div style={{ fontFamily: SANS, fontSize: 48, fontWeight: 900, color: "#fff", letterSpacing: "-0.05em", margin: "0 0 4px", lineHeight: 1 }}>
                99 €
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>
                al mes · sin permanencia
              </div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 12, marginBottom: 32 }}>
                {[
                  "Búsquedas ilimitadas",
                  "Filtros avanzados completos",
                  "Contactos ilimitados",
                  "Shortlists y favoritos sin límite",
                  "Hasta 3 usuarios por institución",
                  "Soporte prioritario",
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
              <Link href="/checkout?plan=institution-pro">
                <button style={{
                  fontFamily: SANS, width: "100%", background: D.gold,
                  color: D.ink, border: "none",
                  padding: "13px 0", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
                }}>
                  Activar Professional
                </button>
              </Link>
              <p style={{ fontFamily: SANS, fontSize: 12, textAlign: "center", margin: "10px 0 0", color: "rgba(255,255,255,0.4)" }}>
                o{" "}
                <a
                  href="mailto:support@facultymatch.app?subject=Prueba%20Professional%2014%20d%C3%ADas"
                  style={{ color: D.gold, fontWeight: 700 }}
                >
                  solicita 14 días de prueba gratuita
                </a>
                {" "}— sin tarjeta
              </p>
            </div>
          </div>

          <p style={{ fontFamily: SANS, fontSize: 12, color: D.faint, textAlign: "center", marginTop: 22 }}>
            Sin comisiones por contratación. Sin permanencia. Cancela cuando quieras.
          </p>
          <div style={{
            maxWidth: 780, margin: "20px auto 0",
            background: "rgba(233,160,48,0.08)", border: "1px solid rgba(233,160,48,0.25)",
            borderRadius: 14, padding: "14px 20px",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              background: "rgba(233,160,48,0.2)", borderRadius: 8,
              padding: "6px 12px", flexShrink: 0,
              fontFamily: SANS, fontSize: 10, fontWeight: 800,
              color: D.gold, letterSpacing: "0.1em", textTransform: "uppercase" as const,
            }}>
              Próximamente
            </div>
            <p style={{ fontFamily: SANS, fontSize: 13, color: D.muted, margin: 0 }}>
              <strong style={{ color: D.navy }}>Plan Growth (~35€/mes)</strong> — 20 búsquedas, 20 contactos, 1 usuario.
              {" "}Para departamentos pequeños y escuelas medianas.{" "}
              <a href="mailto:support@facultymatch.app" style={{ color: D.blue, fontWeight: 700 }}>
                Solicitar acceso anticipado →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{
        background: `linear-gradient(135deg, ${D.dark} 0%, ${D.navy} 100%)`,
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
              Tu próximo experto lleva
              <br />años esperando esta llamada.
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "10px 0 0" }}>
              Registro gratuito. Sin validación previa. Sin comisiones si contratas.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, flexShrink: 0 }}>
            <Link href="/signup?intent=institution">
              <button style={{
                fontFamily: SANS, background: D.white, color: D.ink,
                border: "none", padding: "14px 30px", borderRadius: 10,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}>
                Acceder al directorio
              </button>
            </Link>
            <Link href="/signup">
              <button style={{
                fontFamily: SANS, background: "transparent",
                color: "rgba(255,255,255,0.75)",
                border: "1.5px solid rgba(255,255,255,0.25)",
                padding: "14px 30px", borderRadius: 10, fontSize: 14, cursor: "pointer",
              }}>
                Soy docente
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
