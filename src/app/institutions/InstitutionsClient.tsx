"use client";
// src/app/institutions/InstitutionsClient.tsx — FacultyMatch v3 (Tailwind + tokens de marca)

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { useIsMobile } from "@/hooks/use-mobile";

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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    n: "II",
    title: "Busca con filtros reales",
    body: "Por área de conocimiento, acreditación, idioma y disponibilidad. Los resultados son exactamente lo que necesitas para tu programa.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    n: "III",
    title: "Contacta directamente",
    body: "Envía una solicitud al docente. Él decide si responde. Sin intermediarios ni comisiones por contratación. Tú negociais directamente.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

const COMPARISON = [
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
];

export default function InstitutionsClient() {
  const isMob = useIsMobile();
  const { ref: directoryRef, inView: directoryVisible } = useInView(0.1);
  const { ref: howRef, inView: howVisible } = useInView(0.1);

  return (
    <div className="bg-white font-sans">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative flex items-center overflow-hidden min-h-[90svh] md:min-h-[580px]">
        {isMob ? (
          <div
            className="absolute inset-0 bg-cover"
            style={{
              backgroundImage: "url(https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=85&w=1200)",
              backgroundPosition: "center 30%",
            }}
          />
        ) : (
          <video
            autoPlay muted loop playsInline
            poster="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=85&w=1800"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "center 30%" }}
          >
            <source src="https://assets.mixkit.co/videos/48165/48165-720.mp4" type="video/mp4" />
          </video>
        )}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, rgba(7,19,38,0.78) 0%, rgba(7,19,38,0.88) 60%, rgba(7,19,38,0.96) 100%)" }}
        />
        <div className="relative z-[2] mx-auto flex w-full max-w-[1120px] flex-col items-center px-6 py-20 text-center md:px-8 md:py-0">
          <div className="fm-animate-up mb-7 inline-flex items-center gap-2 rounded-full border border-fm-blue/40 bg-fm-blue/20 px-3.5 py-[5px]">
            <span className="h-1.5 w-1.5 rounded-full bg-fm-gold" />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">
              Para universidades y escuelas de negocio
            </span>
          </div>

          <h1 className="fm-animate-up fm-animate-up-delay-1 mb-5 max-w-[760px] text-[32px] font-black leading-[1.06] tracking-[-0.04em] text-white md:text-[clamp(36px,4.8vw,58px)]">
            El directorio que ningún<br />portal de empleo puede tener.
          </h1>

          <p className="fm-animate-up fm-animate-up-delay-2 mb-10 max-w-[540px] text-[15px] leading-[1.75] text-white/60 md:text-[17px]">
            Médicos en activo, investigadores, directivos y especialistas
            que nunca publican su CV en LinkedIn. Aquí están disponibles,
            verificados, con contacto directo y sin comisiones de contratación.
          </p>

          <div className="fm-animate-up fm-animate-up-delay-3 flex flex-wrap justify-center gap-3">
            <Link href="/signup?intent=institution">
              <button className="rounded-[10px] bg-white px-8 py-3.5 text-[15px] font-bold text-fm-ink">
                Acceder al directorio
              </button>
            </Link>
            <Link href="/login">
              <button className="rounded-[10px] border border-white/30 px-8 py-3.5 text-[15px] text-white/80">
                Ya tengo cuenta
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── PREVIEW DIRECTORIO ── */}
      <section className="bg-fm-surface px-6 py-16 md:px-8 md:py-[88px]">
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="mb-3 font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-fm-gold">
                Muestra del directorio
              </div>
              <h2 className="text-2xl font-extrabold leading-[1.1] tracking-[-0.04em] text-fm-ink md:text-[clamp(26px,2.8vw,36px)]">
                Una muestra real de los perfiles disponibles.
              </h2>
            </div>
            <Link href="/signup?intent=institution" className="shrink-0">
              <button className="rounded-[10px] bg-fm-blue px-6 py-[11px] text-[13px] font-bold text-white">
                Ver el directorio completo
              </button>
            </Link>
          </div>

          <div ref={directoryRef} className="mb-5 grid gap-3.5 md:grid-cols-3">
            {SAMPLE_PROFILES.map((p, i) => {
              const k = KIND_STYLE[p.kind];
              return (
                <div
                  key={i}
                  className="flex flex-col gap-3.5 rounded-2xl border border-fm-border bg-white p-5 pb-4 shadow-[0_2px_12px_rgba(7,19,38,0.06)] transition-all duration-500"
                  style={{
                    transitionDelay: `${i * 0.08}s`,
                    opacity: directoryVisible ? 1 : 0,
                    transform: directoryVisible ? "translateY(0)" : "translateY(20px)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl text-sm font-extrabold tracking-[-0.02em] text-white"
                      style={{ background: p.color }}
                    >
                      {p.init}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center justify-between gap-1.5">
                        <span className="text-sm font-bold tracking-[-0.02em] text-fm-ink">{p.name}</span>
                        <div className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 ${p.avail ? "bg-emerald-50" : "bg-gray-100"}`}>
                          <span className={`h-[5px] w-[5px] rounded-full ${p.avail ? "bg-emerald-600" : "bg-[#8896B0]"}`} />
                          <span className={`text-[9px] font-bold uppercase tracking-[0.06em] ${p.avail ? "text-emerald-600" : "text-[#8896B0]"}`}>
                            {p.avail ? "Disponible" : "No disponible"}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs leading-tight text-fm-muted">{p.role}</div>
                      <div className="mt-0.5 text-[11px] text-[#8896B0]">{p.org}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 border-t border-fm-border pt-2.5">
                    <span
                      className="rounded-full border px-2.5 py-[3px] text-[10px] font-bold"
                      style={{ color: k.text, background: k.bg, borderColor: k.border }}
                    >
                      {p.kind}
                    </span>
                    <span className="rounded-full border border-fm-border bg-fm-surface px-2.5 py-[3px] text-[10px] font-semibold text-fm-muted">
                      {p.area}
                    </span>
                    <span className="ml-auto rounded-full border border-fm-border bg-fm-surface px-2.5 py-[3px] text-[10px] text-[#8896B0]">
                      {p.years}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8896B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span className="text-[11px] text-[#8896B0]">{p.lang}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-center text-[13px] text-[#8896B0]">
            Todos los perfiles son revisados manualmente antes de publicarse en el directorio.
          </p>
        </div>
      </section>

      {/* ── FILTROS ── */}
      <section className="bg-white px-6 py-16 md:px-8 md:py-[88px]">
        <div className="mx-auto max-w-[1120px]">
          <div className="grid items-center gap-0 md:grid-cols-2 md:gap-[72px]">
            <div>
              <div className="mb-4 font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-fm-gold">
                Búsqueda estructurada
              </div>
              <h2 className="mb-[18px] text-2xl font-extrabold leading-[1.1] tracking-[-0.04em] text-fm-ink md:text-[clamp(26px,2.8vw,36px)]">
                Búsqueda pensada para<br />quien contrata, no para<br />quien busca trabajo.
              </h2>
              <p className="mb-8 text-[15px] leading-[1.8] text-fm-muted">
                No hay keywords que interpretar ni CVs confusos. El directorio
                está estructurado exactamente con los criterios que usan los
                directores de programa al seleccionar profesorado.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {FILTERS.map((f, i) => (
                  <div key={i} className="rounded-[10px] border border-fm-border bg-fm-surface px-4 py-3">
                    <div className="mb-1 flex items-center gap-[7px]">
                      <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-fm-gold" />
                      <span className="text-[13px] font-semibold text-fm-ink">{f.label}</span>
                    </div>
                    <p className="text-xs leading-[1.5] text-[#8896B0]">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            {!isMob && (
              <div className="h-[480px] overflow-hidden rounded-[20px]">
                <div
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: "url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800)" }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="bg-fm-surface px-6 py-16 md:px-8 md:py-[88px]">
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-11 text-center md:mb-15">
            <div className="mb-3.5 font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-fm-gold">
              Cómo funciona
            </div>
            <h2 className="text-[26px] font-extrabold leading-[1.1] tracking-[-0.04em] text-fm-ink md:text-[clamp(28px,3vw,40px)]">
              Tres pasos. Sin proceso<br />de selección previo.
            </h2>
          </div>
          <div ref={howRef} className="grid gap-5 md:grid-cols-3">
            {HOW.map((s, i) => (
              <div
                key={i}
                className="rounded-2xl border border-fm-border bg-white p-7 transition-all duration-500"
                style={{
                  borderTop: "3px solid #1B4FD8",
                  transitionDelay: `${i * 0.12}s`,
                  opacity: howVisible ? 1 : 0,
                  transform: howVisible ? "translateY(0)" : "translateY(20px)",
                }}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-fm-blue/[0.08]">
                  {s.icon}
                </div>
                <div className="mb-2.5 text-[28px] font-black leading-none tracking-[-0.03em] text-fm-gold/50">
                  {s.n}
                </div>
                <h3 className="mb-2.5 text-base font-bold text-fm-ink">{s.title}</h3>
                <p className="text-sm leading-[1.75] text-fm-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POR QUÉ NO LINKEDIN ── */}
      <section className="bg-white px-6 py-16 md:px-8 md:py-[88px]">
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-12 text-center">
            <div className="mb-3.5 font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-fm-gold">
              Por qué no LinkedIn
            </div>
            <h2 className="mb-4 text-[26px] font-extrabold tracking-[-0.04em] text-fm-ink md:text-[clamp(28px,3vw,40px)]">
              LinkedIn tiene 50 millones de perfiles.<br />Nosotros tenemos los que enseñan.
            </h2>
            <p className="mx-auto max-w-[520px] text-[15px] text-fm-muted">
              No todos los profesionales quieren dar clases — ni saben que pueden.
              FacultyMatch solo incluye perfiles que se han registrado explícitamente
              para dar docencia y están disponibles ahora.
            </p>
          </div>
          <div className="mx-auto grid max-w-[840px] gap-4 md:grid-cols-2">
            {COMPARISON.map((row, i) => (
              <div key={i} className="rounded-[14px] border border-fm-border bg-fm-surface px-[22px] py-5">
                <div className="mb-3.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8896B0]">
                  {row.feature}
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-px flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] bg-emerald-600/10">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-fm-blue">FacultyMatch </span>
                      <p className="mt-0.5 text-[13px] leading-[1.5] text-fm-ink">{row.fm}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="mt-px flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] bg-red-600/[0.08]">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 2l8 8M10 2l-8 8" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#8896B0]">LinkedIn </span>
                      <p className="mt-0.5 text-[13px] leading-[1.5] text-fm-muted">{row.li}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" className="bg-white px-6 py-16 md:px-8 md:py-[88px]">
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-13 text-center">
            <div className="mb-3.5 font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-fm-gold">
              Precios para instituciones
            </div>
            <h2 className="mb-3 text-[26px] font-extrabold tracking-[-0.04em] text-fm-ink md:text-[clamp(28px,3vw,40px)]">
              Empieza gratis. Escala cuando lo necesites.
            </h2>
            <p className="mx-auto max-w-[460px] text-base text-fm-muted">
              Sin comisiones por contratación. Pagas por acceso al directorio, no por cada perfil que encuentres.
            </p>
          </div>

          <div className="mx-auto grid max-w-[1060px] gap-5 md:grid-cols-3">
            {/* Essential */}
            <div className="flex flex-col rounded-[20px] border border-fm-border bg-fm-surface p-7">
              <div className="mb-[18px] font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-[#8896B0]">
                Plan Essential
              </div>
              <div className="mb-1 text-[44px] font-black leading-none tracking-[-0.05em] text-fm-ink">0 €</div>
              <div className="mb-7 text-[13px] text-[#8896B0]">para empezar</div>
              <div className="mb-7 flex flex-1 flex-col gap-[11px]">
                {["Registro gratuito", "5 búsquedas al mes", "5 contactos al mes", "Vista de perfil básica"].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] bg-fm-gold/15">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#E9A030" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-fm-muted">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup?intent=institution">
                <button className="w-full rounded-[10px] border-[1.5px] border-fm-navy py-3 text-sm font-semibold text-fm-navy">
                  Registrar mi institución
                </button>
              </Link>
            </div>

            {/* Growth */}
            <div className="relative flex flex-col rounded-[20px] bg-fm-navy p-7 shadow-[0_8px_40px_rgba(27,79,216,0.22)]">
              <div className="absolute right-5 top-5 rounded-full bg-fm-gold px-2.5 py-1 font-sans text-[10px] font-extrabold uppercase tracking-[0.08em] text-fm-ink">
                Más popular
              </div>
              <div className="mb-[18px] font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-fm-gold">
                Plan Growth
              </div>
              <div className="mb-1 text-[44px] font-black leading-none tracking-[-0.05em] text-white">35 €</div>
              <div className="mb-7 text-[13px] text-white/40">al mes · sin permanencia</div>
              <div className="mb-7 flex flex-1 flex-col gap-[11px]">
                {["20 búsquedas al mes", "20 contactos al mes", "Filtros avanzados", "Shortlists y favoritos", "1 usuario", "Soporte por email"].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] bg-fm-gold/20">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#E9A030" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-white/65">{f}</span>
                  </div>
                ))}
              </div>
              <a href="mailto:support@facultymatch.app?subject=Solicitud%20Plan%20Growth">
                <button className="w-full rounded-[10px] bg-fm-gold py-3 text-sm font-bold text-fm-ink">
                  Solicitar acceso
                </button>
              </a>
              <p className="mt-2.5 text-center text-[11px] text-white/35">
                Disponible por email · lanzamiento próximo
              </p>
            </div>

            {/* Professional */}
            <div className="relative flex flex-col rounded-[20px] border border-fm-gold/25 bg-fm-dark p-7">
              <div className="mb-[18px] font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-fm-gold">
                Plan Professional
              </div>
              <div className="mb-1 text-[44px] font-black leading-none tracking-[-0.05em] text-white">99 €</div>
              <div className="mb-7 text-[13px] text-white/40">al mes · sin permanencia</div>
              <div className="mb-7 flex flex-1 flex-col gap-[11px]">
                {["Búsquedas ilimitadas", "Contactos ilimitados", "Filtros avanzados completos", "Shortlists y favoritos sin límite", "Hasta 3 usuarios", "Soporte prioritario"].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] bg-fm-gold/15">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#E9A030" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-white/65">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/checkout?plan=institution-pro">
                <button className="w-full rounded-[10px] border border-white/20 bg-white/10 py-3 text-sm font-bold text-white">
                  Activar Professional
                </button>
              </Link>
              <p className="mt-2.5 text-center text-[11px] text-white/35">
                o{" "}
                <a href="mailto:support@facultymatch.app?subject=Prueba%20Professional%2014%20d%C3%ADas" className="font-bold text-fm-gold">
                  14 días de prueba gratuita
                </a>
                {" "}— sin tarjeta
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-[#8896B0]">
            Sin comisiones por contratación. Sin permanencia. Cancela cuando quieras.
          </p>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-gradient-to-br from-fm-dark to-fm-navy">
        <div className="mx-auto flex max-w-[1120px] flex-col items-start justify-between gap-8 px-6 py-16 md:flex-row md:items-center md:px-8 md:py-18">
          <div>
            <div className="mb-3 font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-fm-gold">
              Empieza hoy
            </div>
            <h2 className="text-2xl font-extrabold leading-[1.1] tracking-[-0.04em] text-white md:text-[clamp(24px,2.8vw,36px)]">
              Tu próximo experto lleva
              <br />años esperando esta llamada.
            </h2>
            <p className="mt-2.5 text-[13px] text-white/40">
              Registro gratuito. Sin validación previa. Sin comisiones si contratas.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/signup?intent=institution">
              <button className="rounded-[10px] bg-white px-[30px] py-3.5 text-sm font-bold text-fm-ink">
                Acceder al directorio
              </button>
            </Link>
            <Link href="/signup">
              <button className="rounded-[10px] border-[1.5px] border-white/25 px-[30px] py-3.5 text-sm text-white/75">
                Soy docente
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
