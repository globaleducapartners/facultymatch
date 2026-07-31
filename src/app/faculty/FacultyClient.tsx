"use client";
// src/app/faculty/FacultyClient.tsx — FacultyMatch v3 (Tailwind + tokens de marca)

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

const PROFILES = [
  {
    dot: "bg-fm-blue",
    label: "Docente universitario",
    desc: "Profesores titulares, investigadores y doctores que quieren ampliar su docencia en otras instituciones sin abandonar su puesto actual. Tu acreditación ANECA o ORCID te da prioridad en búsquedas.",
    examples: ["Doctor en Economía · UAM", "Catedrática de Derecho · UCM", "Investigador en IA · UPM"],
  },
  {
    dot: "bg-fm-gold",
    label: "Experto profesional",
    desc: "Directivos, médicos especialistas, abogados, ingenieros o consultores con experiencia real que quieren compartir su conocimiento en programas ejecutivos y másters. El aula te necesita precisamente porque has estado en el campo.",
    examples: ["Médico especialista · 15 años", "Director de Operaciones", "Abogada Mercantil · Bufete"],
  },
  {
    dot: "bg-emerald-600",
    label: "Educador independiente",
    desc: "Formadores, consultores independientes y creadores de contenido educativo que buscan respaldo institucional. Si sabes algo que vale la pena enseñar, estás en el lugar correcto.",
    examples: ["Consultor de Liderazgo", "Formador en Digital", "Especialista en Marketing"],
  },
];

const BENEFITS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
    ),
    title: "Visible para quien importa",
    desc: "Tu perfil llega a directores de programa, no a RRHH genérico. Estructurado exactamente como ellos necesitan verlo: área, idioma, disponibilidad, acreditación.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Sin buscar oportunidades",
    desc: "Publicas una vez. Las instituciones te encuentran cuando necesitan exactamente lo que tú ofreces. Sin prospectar, sin networking forzado.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Privacidad total",
    desc: "Tu institución actual no sabe que estás aquí, a menos que tú quieras. Bloqueo selectivo por nombre de institución disponible en el plan gratuito.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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

  return (
    <div className="bg-white font-sans">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative flex items-center overflow-hidden min-h-[90svh] md:min-h-[580px]">
        {isMob ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/images/faculty-video-poster.jpg"
            alt="Docente experto en FacultyMatch"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "center 30%" }}
          />
        ) : (
          <video
            autoPlay muted loop playsInline
            poster="/images/faculty-video-poster.jpg"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "center 30%" }}
          >
            <source src="/faculty-hero.mp4" type="video/mp4" />
          </video>
        )}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, rgba(7,19,38,0.75) 0%, rgba(7,19,38,0.88) 60%, rgba(7,19,38,0.96) 100%)" }}
        />
        <div className="relative z-[2] mx-auto flex w-full max-w-[1120px] flex-col items-center px-6 py-20 text-center md:px-8 md:py-0">
          <div className="fm-animate-up mb-7 inline-flex items-center gap-2 rounded-full border border-fm-blue/40 bg-fm-blue/20 px-3.5 py-[5px]">
            <span className="h-1.5 w-1.5 rounded-full bg-fm-gold" />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">
              Para docentes y expertos profesionales
            </span>
          </div>

          <h1 className="fm-animate-up fm-animate-up-delay-1 mb-5 max-w-[740px] text-[34px] font-black leading-[1.06] tracking-[-0.04em] text-white md:text-[clamp(38px,5vw,60px)]">
            Lo que la IA no puede sustituir
            <br />es tu experiencia.
          </h1>

          <p className="fm-animate-up fm-animate-up-delay-2 mb-10 max-w-[520px] text-[15px] leading-[1.75] text-white/60 md:text-[17px]">
            Médicos, investigadores, directivos, abogados, comunicadores.
            FacultyMatch los conecta con universidades y escuelas de negocio
            que buscan exactamente lo que ellos saben.
          </p>

          <div className="fm-animate-up fm-animate-up-delay-3 flex flex-wrap justify-center gap-3">
            <Link href="/signup">
              <button className="rounded-[10px] bg-white px-8 py-3.5 text-[15px] font-bold text-fm-ink">
                Publicar mi perfil
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

      {/* ── TIPOS DE PERFIL ── */}
      <section className="bg-white px-6 py-16 md:px-8 md:py-[88px]">
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-11 text-center md:mb-15">
            <div className="mb-3.5 font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-fm-gold">
              Quién puede publicar su perfil
            </div>
            <h2 className="mb-3.5 text-[26px] font-extrabold leading-[1.1] tracking-[-0.04em] text-fm-ink md:text-[clamp(28px,3vw,40px)]">
              No hace falta ser catedrático.
            </h2>
            <p className="mx-auto max-w-[460px] text-base text-fm-muted">
              FacultyMatch conecta tres tipos de talento con las instituciones que los buscan.
            </p>
          </div>

          <div ref={profilesRef} className="grid gap-5 md:grid-cols-3">
            {PROFILES.map((p, i) => (
              <div
                key={i}
                className="rounded-2xl border border-fm-border bg-fm-surface p-7 transition-transform duration-500"
                style={{
                  borderTop: `3px solid ${p.dot.includes("blue") ? "#1B4FD8" : p.dot.includes("gold") ? "#E9A030" : "#059669"}`,
                  transitionDelay: `${i * 0.12}s`,
                  transform: profilesVisible ? "translateY(0)" : "translateY(10px)",
                }}
              >
                <div className="mb-3.5 flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${p.dot}`} />
                  <span className="text-base font-bold text-fm-ink">{p.label}</span>
                </div>
                <p className="mb-[18px] text-sm leading-[1.75] text-fm-muted">{p.desc}</p>
                <div className="flex flex-col gap-[7px]">
                  {p.examples.map((ex, j) => (
                    <span
                      key={j}
                      className="self-start rounded-full border border-fm-border bg-white px-3 py-1.5 text-xs text-[#8896B0]"
                    >
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
      <section className="bg-fm-navy px-6 py-12 md:px-8 md:py-[52px]">
        <div className="mx-auto max-w-[1120px]">
          <div className="flex flex-col items-start gap-5 rounded-[20px] border border-white/10 bg-white/5 p-7 md:flex-row md:items-center md:gap-10 md:p-10">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-fm-blue/40 bg-fm-blue/30">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#E9A030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="mb-2 font-sans text-[10px] font-extrabold uppercase tracking-[0.16em] text-fm-gold">
                Tu empresa no lo sabrá
              </div>
              <h3 className="mb-2.5 text-xl font-extrabold leading-tight tracking-[-0.03em] text-white md:text-2xl">
                Tu institución actual no verá tu perfil,<br />a menos que tú quieras.
              </h3>
              <p className="max-w-[520px] text-sm leading-[1.75] text-white/50">
                El bloqueo selectivo de instituciones está disponible en todos los planes, incluso el gratuito.
                Añade tu centro actual y nadie allí podrá ver tu perfil ni tus datos de contacto.
              </p>
            </div>
            <Link href="/signup" className="shrink-0">
              <button className="whitespace-nowrap rounded-[10px] bg-fm-gold px-7 py-3.5 text-sm font-bold text-fm-ink">
                Publicar con privacidad →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── BENEFICIOS ── */}
      <section className="bg-fm-surface px-6 py-16 md:px-8 md:py-[88px]">
        <div className="mx-auto max-w-[1120px]">
          <div className="grid items-center gap-0 md:grid-cols-2 md:gap-[72px]">
            {!isMob && (
              <div className="h-[440px] overflow-hidden rounded-[20px]">
                <div
                  className="h-full w-full bg-cover bg-top"
                  style={{ backgroundImage: "url(/images/faculty-benefits.jpg)" }}
                />
              </div>
            )}
            <div ref={benefitsRef}>
              <div className="mb-4 font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-fm-gold">
                Cómo funciona para ti
              </div>
              <h2 className="mb-8 text-[26px] font-extrabold leading-[1.1] tracking-[-0.04em] text-fm-ink md:text-[clamp(26px,2.8vw,36px)]">
                Lo que hace diferente<br />estar en FacultyMatch.
              </h2>
              <div className="flex flex-col gap-6">
                {BENEFITS.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 transition-transform duration-500"
                    style={{ transitionDelay: `${i * 0.1}s`, transform: benefitsVisible ? "translateX(0)" : "translateX(-8px)" }}
                  >
                    <div className="mt-px flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-fm-blue/[0.08]">
                      {b.icon}
                    </div>
                    <div>
                      <h3 className="mb-1 text-[15px] font-bold text-fm-ink">{b.title}</h3>
                      <p className="text-sm leading-[1.7] text-fm-muted">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" className="bg-white px-6 py-16 md:px-8 md:py-[88px]">
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-13 text-center">
            <div className="mb-3.5 font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-fm-gold">
              Precios
            </div>
            <h2 className="text-[26px] font-extrabold tracking-[-0.04em] text-fm-ink md:text-[clamp(28px,3vw,40px)]">
              Para docentes y expertos,<br />sin coste de entrada.
            </h2>
          </div>

          <div className="mx-auto grid max-w-[780px] gap-5 md:grid-cols-2">
            {/* Basic */}
            <div className="rounded-[20px] border border-fm-border bg-fm-surface p-8">
              <div className="mb-[18px] font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-[#8896B0]">
                Plan Basic
              </div>
              <div className="mb-1 text-5xl font-black leading-none tracking-[-0.05em] text-fm-ink">0 €</div>
              <div className="mb-7 text-[13px] text-[#8896B0]">siempre gratuito</div>
              <div className="mb-8 flex flex-col gap-3">
                {[
                  "Perfil en el directorio",
                  "Recepción de solicitudes de instituciones",
                  "Control de disponibilidad",
                  "Visibilidad pública básica",
                  "Bloqueo de instituciones específicas",
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] bg-fm-gold/15">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#E9A030" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-sm text-fm-muted">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup">
                <button className="w-full rounded-[10px] border-[1.5px] border-fm-navy py-3.5 text-sm font-semibold text-fm-navy">
                  Empezar gratis
                </button>
              </Link>
            </div>

            {/* Pro */}
            <div className="relative overflow-hidden rounded-[20px] bg-fm-navy p-8">
              <div className="absolute right-5 top-5 rounded-full bg-fm-gold px-2.5 py-1 font-sans text-[10px] font-extrabold uppercase tracking-[0.08em] text-fm-ink">
                Popular
              </div>
              <div className="mb-[18px] font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-fm-gold">
                Plan Professional
              </div>
              <div className="mb-1 text-5xl font-black leading-none tracking-[-0.05em] text-white">29 €</div>
              <div className="mb-7 text-[13px] text-white/40">al año · sin permanencia</div>
              <div className="mb-8 flex flex-col gap-3">
                {[
                  "Todo lo del Plan Basic",
                  "Posicionamiento prioritario en búsquedas",
                  "Estadísticas avanzadas de visitas a tu perfil",
                  "Visibilidad preferente ante instituciones objetivo",
                  "Soporte por email prioritario",
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] bg-fm-gold/20">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#E9A030" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-sm text-white/65">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/checkout?plan=faculty-pro">
                <button className="w-full rounded-[10px] bg-fm-gold py-3.5 text-sm font-bold text-fm-ink">
                  Activar Professional
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-fm-navy to-fm-blue">
        <div className="mx-auto flex max-w-[1120px] flex-col items-start justify-between gap-8 px-6 py-16 md:flex-row md:items-center md:px-8 md:py-18">
          <div>
            <div className="mb-3 font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-fm-gold">
              Empieza hoy
            </div>
            <h2 className="text-2xl font-extrabold leading-[1.1] tracking-[-0.04em] text-white md:text-[clamp(24px,2.8vw,36px)]">
              Publica hoy. Recibe tu primera
              <br />solicitud esta semana.
            </h2>
            <p className="mt-2.5 text-[13px] text-white/40">
              Sin permanencia. Sin proceso de admisión previo. Sin comisiones.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/signup">
              <button className="rounded-[10px] bg-white px-[30px] py-3.5 text-sm font-bold text-fm-ink">
                Publicar mi perfil
              </button>
            </Link>
            <Link href="/signup?intent=institution">
              <button className="rounded-[10px] border-[1.5px] border-white/25 px-[30px] py-3.5 text-sm text-white/75">
                Soy institución
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
