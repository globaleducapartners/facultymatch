"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const SERIF = `var(--font-serif, 'Georgia', 'Times New Roman', serif)`;
const SANS  = `var(--font-sans, system-ui, -apple-system, sans-serif)`;

const C = {
  ink: "#0C1018", navy: "#0D2240", brass: "#B8963E",
  cream: "#F7F5F0", paper: "#FDFCF9", white: "#FFFFFF",
  muted: "#6B7280", faint: "#9CA3AF", border: "#E5E1D8",
};

const KIND = {
  Académica:   { dot: "#2563EB", bg: "#EFF6FF", text: "#1D4ED8" },
  Experto:     { dot: C.brass,   bg: "#FEF3C7", text: "#92400E" },
  Profesional: { dot: "#059669", bg: "#F0FDF4", text: "#065F46" },
};

const SAMPLE_PROFILES = [
  { init: "MR", name: "Dr. M. Rodríguez", role: "Economía · Política fiscal",      org: "Univ. Autónoma · Madrid", kind: "Académica" as const,   avail: true,  lang: "ES · EN" },
  { init: "JL", name: "J. Llamas",        role: "Dirección de operaciones",         org: "18 años en empresa",       kind: "Experto" as const,     avail: true,  lang: "ES · EN" },
  { init: "CR", name: "Dra. C. Ramos",    role: "Derecho Mercantil · Compliance",   org: "UCM · Madrid",             kind: "Académica" as const,   avail: false, lang: "ES · FR" },
  { init: "PV", name: "P. Velasco",       role: "Marketing digital · Growth",       org: "Ex-Google · Ex-Cabify",    kind: "Profesional" as const, avail: true,  lang: "ES · EN" },
  { init: "BM", name: "Dra. B. Morales",  role: "Inteligencia Artificial · ML",     org: "UPM Madrid",               kind: "Académica" as const,   avail: true,  lang: "ES · EN" },
  { init: "AS", name: "A. Sánchez",       role: "Liderazgo · Gestión de equipos",   org: "Consultor independiente",  kind: "Experto" as const,     avail: true,  lang: "ES" },
];

const FILTERS = [
  { label: "Área UNESCO",    desc: "Desde Economía hasta Ciencias de la Salud" },
  { label: "Acreditación",  desc: "ANECA, ORCID, titulación doctoral" },
  { label: "Idioma",        desc: "Español, inglés, francés y más" },
  { label: "Modalidad",     desc: "Presencial, online o híbrida" },
  { label: "Disponibilidad",desc: "Inmediata, próximo semestre, solo online" },
  { label: "Tipo de perfil",desc: "Académico, profesional o educador independiente" },
];

const HOW = [
  { n: "I",   title: "Registra tu institución",  body: "Acceso al directorio completo desde el primer día. Sin proceso de aprobación previo." },
  { n: "II",  title: "Busca con filtros reales",  body: "Por área de conocimiento, acreditación, idioma y disponibilidad. Los resultados son exactamente lo que necesitas." },
  { n: "III", title: "Contacta directamente",     body: "Envía una solicitud al docente. Él decide si responde. Sin intermediarios ni comisiones por contratación." },
];

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

export default function InstitutionsClient() {
  const isMob = useIsMobile();
  const pad = isMob ? "48px 20px" : "72px 40px";

  return (
    <div style={{ background: C.paper, fontFamily: SANS }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        position: "relative", overflow: "hidden",
        height: isMob ? "auto" : 520,
        minHeight: isMob ? 440 : undefined,
        paddingTop: isMob ? 80 : 0,
        paddingBottom: isMob ? 60 : 0,
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&q=85&w=1800)`,
          backgroundSize: "cover", backgroundPosition: "center 40%",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(160deg, rgba(12,16,24,0.5) 0%, rgba(12,16,24,0.72) 60%, rgba(12,16,24,0.92) 100%)",
        }} />
        <div style={{
          position: "relative", zIndex: 2,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          minHeight: "inherit",
          textAlign: "center",
          padding: isMob ? "0 20px" : "0 40px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <div style={{ width: 28, height: "0.5px", background: "rgba(255,255,255,0.28)" }} />
            <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.45)" }}>
              Para instituciones educativas
            </span>
            <div style={{ width: 28, height: "0.5px", background: "rgba(255,255,255,0.28)" }} />
          </div>

          <h1 style={{ fontFamily: SERIF, fontSize: isMob ? 32 : 54, fontWeight: 400, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.025em", margin: "0 0 20px", maxWidth: 700 }}>
            El directorio que busca lo que
            ningún portal de empleo tiene.
          </h1>

          <p style={{ fontFamily: SANS, fontSize: 16, color: "rgba(255,255,255,0.58)", lineHeight: 1.75, margin: "0 0 38px", maxWidth: 500 }}>
            Docentes universitarios, investigadores y expertos de empresa
            que no publican su CV en ningún sitio. Aquí están, revisados y
            estructurados. Contacto directo. Sin comisiones.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, justifyContent: "center" }}>
            <Link href="/signup?intent=institution">
              <button style={{ fontFamily: SANS, background: "#fff", color: C.ink, border: "none", padding: "13px 32px", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Acceder al directorio
              </button>
            </Link>
            <Link href="/login">
              <button style={{ fontFamily: SANS, background: "transparent", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.28)", padding: "13px 32px", borderRadius: 6, fontSize: 14, cursor: "pointer" }}>
                Ya tengo cuenta
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── PREVIEW DEL DIRECTORIO ── */}
      <section style={{ background: C.cream }}>
        <div style={{ padding: pad, maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap" as const, gap: 20 }}>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: C.brass, marginBottom: 10 }}>
                Muestra del directorio
              </div>
              <h2 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 400, color: C.ink, letterSpacing: "-0.025em", margin: 0, lineHeight: 1.1 }}>
                Perfiles que no están en LinkedIn.
              </h2>
            </div>
            <Link href="/signup?intent=institution">
              <button style={{ fontFamily: SANS, background: C.navy, color: "#fff", border: "none", padding: "10px 22px", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                Ver el directorio completo
              </button>
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
            {SAMPLE_PROFILES.map((p, i) => {
              const k = KIND[p.kind];
              return (
                <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px 20px" }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0, background: C.cream, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontSize: 13, color: C.navy }}>
                      {p.init}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ fontFamily: SERIF, fontSize: 13, color: C.ink }}>{p.name}</span>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: p.avail ? "#059669" : C.faint, flexShrink: 0 }} />
                      </div>
                      <div style={{ fontFamily: SANS, fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{p.role}</div>
                      <div style={{ fontFamily: SANS, fontSize: 10, color: C.faint, marginTop: 1 }}>{p.org}</div>
                    </div>
                  </div>
                  <div style={{ paddingTop: 10, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: k.text, background: k.bg, padding: "2px 8px", borderRadius: 20 }}>{p.kind}</span>
                    <span style={{ fontFamily: SANS, fontSize: 10, color: C.faint }}>{p.lang}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ fontFamily: SANS, fontSize: 13, color: C.faint, textAlign: "center" }}>
            Todos los perfiles son revisados antes de publicarse en el directorio.
          </p>
        </div>
      </section>

      {/* ── FILTROS ── */}
      <section style={{ background: C.white }}>
        <div style={{
          padding: pad, maxWidth: 1080, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMob ? "1fr" : "1fr 1fr",
          gap: isMob ? 0 : 60,
          alignItems: "center",
        }}>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: C.brass, marginBottom: 16 }}>
              Búsqueda estructurada
            </div>
            <h2 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 400, color: C.ink, letterSpacing: "-0.025em", margin: "0 0 18px", lineHeight: 1.2 }}>
              Busca por lo que<br />realmente importa.
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 15, color: C.muted, lineHeight: 1.8, margin: "0 0 32px" }}>
              No hay palabras clave ni CVs que interpretar. El directorio está estructurado
              por los criterios que usan los directores de programa para seleccionar profesorado.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 12 }}>
              {FILTERS.map((f, i) => (
                <div key={i} style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.brass }} />
                    <span style={{ fontFamily: SERIF, fontSize: 14, color: C.ink }}>{f.label}</span>
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 12, color: C.faint, lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Foto — oculta en mobile */}
          {!isMob && (
            <div style={{ borderRadius: 14, overflow: "hidden", height: 460 }}>
              <div style={{
                width: "100%", height: "100%",
                backgroundImage: `url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800)`,
                backgroundSize: "cover", backgroundPosition: "center",
              }} />
            </div>
          )}
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section style={{ background: C.cream }}>
        <div style={{ padding: pad, maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: C.brass, marginBottom: 12 }}>
              Cómo funciona
            </div>
            <h2 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 400, color: C.ink, letterSpacing: "-0.025em", margin: 0, lineHeight: 1.15 }}>
              Tres pasos. Sin proceso de selección previo.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "repeat(3,1fr)", gap: 18 }}>
            {HOW.map((s, i) => (
              <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "28px 26px", borderTop: `3px solid ${C.brass}` }}>
                <div style={{ fontFamily: SERIF, fontSize: 24, color: C.brass, opacity: 0.45, marginBottom: 14, letterSpacing: "-0.02em" }}>{s.n}</div>
                <h3 style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 400, color: C.ink, margin: "0 0 10px" }}>{s.title}</h3>
                <p style={{ fontFamily: SANS, fontSize: 14, color: C.muted, lineHeight: 1.75, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" style={{ background: C.white }}>
        <div style={{ padding: pad, maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: C.brass, marginBottom: 12 }}>
              Precios para instituciones
            </div>
            <h2 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 400, color: C.ink, letterSpacing: "-0.025em", margin: "0 0 10px" }}>
              Empieza gratis. Escala cuando lo necesites.
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 15, color: C.muted, maxWidth: 460, margin: "0 auto" }}>
              Sin comisiones por contratación. Pagas por acceso al directorio, no por cada perfil que encuentres.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 20, maxWidth: 760, margin: "0 auto" }}>
            {/* Essential */}
            <div style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 14, padding: "32px 30px" }}>
              <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: C.faint, marginBottom: 16 }}>Plan Essential</div>
              <div style={{ fontFamily: SERIF, fontSize: 38, color: C.ink, margin: "0 0 4px" }}>0 €</div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: C.faint, marginBottom: 24 }}>para empezar</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 28 }}>
                {["Registro gratuito", "2 búsquedas al mes", "Vista de perfiles básica", "2 contactos al mes"].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.brass, flexShrink: 0 }} />
                    <span style={{ fontFamily: SANS, fontSize: 13, color: C.muted }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup?intent=institution">
                <button style={{ fontFamily: SANS, width: "100%", background: "transparent", color: C.navy, border: `1px solid ${C.navy}`, padding: "11px 0", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                  Registrar mi institución
                </button>
              </Link>
            </div>

            {/* Professional */}
            <div style={{ background: C.navy, borderRadius: 14, padding: "32px 30px" }}>
              <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: C.brass, marginBottom: 16 }}>Plan Professional</div>
              <div style={{ fontFamily: SERIF, fontSize: 38, color: "#fff", margin: "0 0 4px" }}>99 €</div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>al mes · sin permanencia</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 28 }}>
                {["Búsquedas ilimitadas", "Filtros avanzados completos", "Contactos ilimitados", "Shortlists y favoritos sin límite", "Hasta 3 usuarios por institución", "Soporte prioritario"].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.brass, flexShrink: 0 }} />
                    <span style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/checkout?plan=institution-pro">
                <button style={{ fontFamily: SANS, width: "100%", background: C.brass, color: "#fff", border: "none", padding: "11px 0", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
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
        <div style={{
          position: "relative", zIndex: 2,
          maxWidth: 1080, margin: "0 auto",
          padding: isMob ? "48px 20px" : "64px 40px",
          display: "flex",
          flexDirection: isMob ? "column" as const : "row" as const,
          alignItems: isMob ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: 32,
        }}>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: C.brass, marginBottom: 12 }}>
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
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
            <Link href="/signup?intent=institution">
              <button style={{ fontFamily: SANS, background: "#fff", color: C.ink, border: "none", padding: "13px 28px", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Acceder al directorio
              </button>
            </Link>
            <Link href="/signup">
              <button style={{ fontFamily: SANS, background: "transparent", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.22)", padding: "13px 28px", borderRadius: 6, fontSize: 14, cursor: "pointer" }}>
                Soy docente
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
