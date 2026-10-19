"use client";
// src/app/faculty/FacultyClient.tsx — FacultyMatch v3 (Tailwind + tokens de marca)

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Row, SectionRows, SectionSteps } from "@/components/sections/skeleton";

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

const FACULTY_STEPS = [
  {
    title: "Publica en 10 minutos",
    body: "Sube tu CV o rellénalo tú mismo. Un experto de nuestro equipo revisa y aprueba cada perfil antes de publicarlo.",
  },
  {
    title: "Llegas a quien te busca",
    body: "Las instituciones filtran por área, idioma y disponibilidad real. Apareces cuando alguien necesita justo lo que ofreces.",
  },
  {
    title: "Tú decides el sí",
    body: "La institución contacta directamente. Tú pones las condiciones, el ritmo y el precio. Tú aceptas o rechazas.",
  },
];

const PROFILES = [
  {
    label: "Docente universitario",
    desc: "Profesores titulares, investigadores y doctores que quieren ampliar su docencia en otras instituciones sin abandonar su puesto actual. Tu acreditación ANECA o ORCID te da prioridad en búsquedas.",
    examples: ["Doctor en Economía · UAM", "Catedrática de Derecho · UCM", "Investigador en IA · UPM"],
  },
  {
    label: "Experto profesional",
    desc: "Directivos, médicos especialistas, abogados, ingenieros o consultores con experiencia real que quieren compartir su conocimiento en programas ejecutivos y másters. El aula te necesita precisamente porque has estado en el campo.",
    examples: ["Médico especialista · 15 años", "Director de Operaciones", "Abogada Mercantil · Bufete"],
  },
  {
    label: "Educador independiente",
    desc: "Formadores, consultores independientes y creadores de contenido educativo que buscan respaldo institucional. Si sabes algo que vale la pena enseñar, estás en el lugar correcto.",
    examples: ["Consultor de Liderazgo", "Formador en Digital", "Especialista en Marketing"],
  },
];

const BENEFITS = [
  {
    title: "Visible para quien importa",
    desc: "Tu perfil llega a directores de programa, no a RRHH genérico. Estructurado exactamente como ellos necesitan verlo: área, idioma, disponibilidad, acreditación.",
  },
  {
    title: "Sin buscar oportunidades",
    desc: "Publicas una vez. Las instituciones te encuentran cuando necesitan exactamente lo que tú ofreces. Sin prospectar, sin networking forzado.",
  },
  {
    title: "Privacidad total",
    desc: "Tu institución actual no sabe que estás aquí, a menos que tú quieras. Bloqueo selectivo por nombre de institución disponible en el plan gratuito.",
  },
  {
    title: "Siempre gratuito para entrar",
    desc: "El plan básico es para siempre gratuito. Publicas, recibes solicitudes y decides. Sin pagar nada para empezar. Sin sorpresas.",
  },
];

export default function FacultyClient() {
  const { ref: pricingRef, inView: pricingVisible } = useInView(0.1);

  return (
    <div className="bg-white font-sans">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden py-20 md:py-0 md:min-h-[580px] md:flex md:items-center">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(700px 420px at 15% 0%, rgba(27,79,216,0.28), transparent 60%), linear-gradient(160deg, #0B1B33 0%, #071326 70%)",
          }}
        />
        <div className="relative z-[2] mx-auto grid w-full max-w-[1120px] items-center gap-10 px-6 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:px-8">
          <div className="text-center md:text-left">
            <div className="fm-animate-up mb-7 inline-flex items-center border-l-2 border-[#6D93F5] py-0.5 pl-3">
              <span className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">
                Para docentes y expertos profesionales
              </span>
            </div>

            <h1 className="fm-animate-up fm-animate-up-delay-1 mb-5 text-[34px] font-black leading-[1.1] tracking-[-0.04em] text-white md:text-[clamp(32px,3.4vw,44px)]">
              Lo que la IA no puede sustituir es tu experiencia.
            </h1>

            <p className="fm-animate-up fm-animate-up-delay-2 mb-10 max-w-[480px] text-[15px] leading-[1.75] text-white/60 md:text-[17px] mx-auto md:mx-0">
              Médicos, investigadores, directivos, abogados, comunicadores.
              FacultyMatch los conecta con universidades y escuelas de negocio
              que buscan exactamente lo que ellos saben.
            </p>

            <div className="fm-animate-up fm-animate-up-delay-3 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link href="/signup">
                <button className="rounded-[10px] bg-white px-8 py-3.5 text-[15px] font-bold text-fm-ink transition-all duration-150 ease-out hover:opacity-90 active:scale-[0.97]">
                  Publicar mi perfil
                </button>
              </Link>
              <Link href="/login">
                <button className="rounded-[10px] border border-white/30 px-8 py-3.5 text-[15px] text-white/80 transition-transform duration-150 ease-out active:scale-[0.97]">
                  Ya tengo cuenta
                </button>
              </Link>
            </div>
          </div>

          <div className="fm-animate-up fm-animate-up-delay-2 relative mx-auto w-full max-w-[440px] md:mx-0 md:max-w-none">
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-white/10">
              <Image
                src="/images/faculty-hero-photo.jpg"
                alt="Docente experta explicando en una pizarra"
                fill
                sizes="(min-width: 768px) 45vw, 90vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <SectionSteps title="De la experiencia al aula." subtitle="Sin intermediarios. Sin comisiones por contratación." steps={FACULTY_STEPS} />

      <SectionRows>
        <Row
          title="Hay un sitio para cada tipo de experiencia."
          body="Si sabes algo que vale la pena enseñar, estás en el lugar correcto. El aula te necesita precisamente porque has estado en la práctica."
        >
          <div className="grid gap-2.5">
            {PROFILES.map((p) => (
              <div key={p.label} className="rounded-[10px] border border-[#E1E7F5] bg-white p-3.5">
                <div className="mb-2 text-sm font-bold text-fm-navy">{p.label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {p.examples.map((e) => (
                    <span key={e} className="rounded-md border border-[#E1E7F5] bg-fm-surface px-2 py-[3px] text-xs text-[#5B6B85]">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Row>

        <Row
          flip
          title="Tu institución actual no verá tu perfil, a menos que tú quieras."
          body="El bloqueo selectivo de instituciones está disponible en todos los planes, incluso el gratuito. Añade tu centro actual y nadie allí podrá ver tu perfil ni tus datos de contacto."
          href="/signup"
          cta="Publicar con privacidad →"
        >
          <div className="rounded-[14px] bg-white p-6 shadow-[0_14px_34px_-16px_rgba(13,34,64,0.25)]">
            <div className="flex items-center gap-3 border-b border-[#E1E7F5] pb-3.5 text-sm text-fm-navy">
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded bg-fm-blue">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
              </span>
              Visible en el directorio
            </div>
            <h3 className="mb-2 mt-[18px] text-[13px] font-bold text-fm-navy">Instituciones bloqueadas</h3>
            {["Universidad de ejemplo", "Escuela de negocios demo"].map((n) => (
              <div key={n} className="mb-2 flex items-center justify-between rounded-lg border border-[#E1E7F5] bg-[#FBFCFE] px-3 py-[9px] text-[13px] text-fm-navy">
                <span>{n}</span><span className="text-[#5E6F8E]">Quitar</span>
              </div>
            ))}
            <span className="text-[13px] font-bold text-fm-blue">+ Bloquear otra institución</span>
          </div>
        </Row>

        <Row
          title="Lo que hace diferente estar en FacultyMatch."
          bullets={BENEFITS.map((b) => (
            <>
              <b>{b.title}.</b> {b.desc}
            </>
          ))}
        >
          <div className="relative aspect-[4/3.1] overflow-hidden rounded-[14px]">
            <Image
              src="/images/faculty-benefits.jpg"
              alt="Persona trabajando con un portátil en una sesión de trabajo"
              fill
              sizes="(min-width: 768px) 520px, 100vw"
              className="object-cover object-top"
            />
          </div>
        </Row>
      </SectionRows>

      {/* ── PRECIOS ── */}
      <section id="precios" className="bg-white px-6 py-16 md:px-8 md:py-[88px]">
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-13 text-center">
            <div className="mb-3.5 font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-fm-blue">
              Precios
            </div>
            <h2 className="text-[26px] font-extrabold tracking-[-0.04em] text-fm-ink md:text-[clamp(28px,3vw,40px)]">
              Para docentes y expertos, sin coste de entrada.
            </h2>
          </div>

          <div ref={pricingRef} className="mx-auto grid max-w-[780px] gap-5 md:grid-cols-2">
            {/* Basic */}
            <div
              className="rounded-[20px] border border-fm-border bg-fm-surface p-8 transition-transform duration-500"
              style={{ transform: pricingVisible ? "translateY(0)" : "translateY(10px)" }}
            >
              <div className="mb-[18px] font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-[#5E6F8E]">
                Plan Basic
              </div>
              <div className="mb-1 text-5xl font-black leading-none tracking-[-0.05em] text-fm-ink">0 €</div>
              <div className="mb-7 text-[13px] text-[#5E6F8E]">siempre gratuito</div>
              <div className="mb-8 flex flex-col gap-3">
                {[
                  "Perfil en el directorio",
                  "Recepción de solicitudes de instituciones",
                  "Control de disponibilidad",
                  "Visibilidad pública básica",
                  "Bloqueo de instituciones específicas",
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] bg-fm-blue/10">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#1B4FD8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-sm text-fm-muted">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup">
                <button className="w-full rounded-[10px] border-[1.5px] border-fm-navy py-3.5 text-sm font-semibold text-fm-navy transition-transform duration-150 ease-out active:scale-[0.97]">
                  Empezar gratis
                </button>
              </Link>
            </div>

            {/* Pro */}
            <div
              className="relative overflow-hidden rounded-[20px] bg-fm-navy p-8 transition-transform duration-500"
              style={{ transitionDelay: "0.1s", transform: pricingVisible ? "translateY(0)" : "translateY(10px)" }}
            >
              <div className="absolute right-5 top-5 rounded-full bg-fm-blue px-2.5 py-1 font-sans text-[11px] font-extrabold uppercase tracking-[0.08em] text-white">
                Popular
              </div>
              <div className="mb-[18px] font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-[#9DB8FF]">
                Plan Professional
              </div>
              <div className="mb-1 text-5xl font-black leading-none tracking-[-0.05em] text-white">29 €</div>
              <div className="mb-7 text-[13px] text-white/60">al año · sin permanencia</div>
              <div className="mb-8 flex flex-col gap-3">
                {[
                  "Todo lo del Plan Basic",
                  "Posicionamiento prioritario en búsquedas",
                  "Estadísticas avanzadas de visitas a tu perfil",
                  "Visibilidad preferente ante instituciones objetivo",
                  "Soporte por email prioritario",
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] bg-[#9DB8FF]/15">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#9DB8FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-sm text-white/65">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/checkout?plan=faculty-pro">
                <button className="w-full rounded-[10px] bg-fm-blue py-3.5 text-sm font-bold text-white transition-all duration-150 ease-out hover:opacity-90 active:scale-[0.97]">
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
            <h2 className="text-2xl font-extrabold leading-[1.1] tracking-[-0.04em] text-white md:text-[clamp(24px,2.8vw,36px)]">
              Publica hoy. Recibe tu primera
               solicitud esta semana.
            </h2>
            <p className="mt-2.5 text-[13px] text-white/60">
              Sin permanencia. Sin proceso de admisión previo. Sin comisiones.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/signup">
              <button className="rounded-[10px] bg-white px-[30px] py-3.5 text-sm font-bold text-fm-ink transition-all duration-150 ease-out hover:opacity-90 active:scale-[0.97]">
                Publicar mi perfil
              </button>
            </Link>
            <Link href="/signup?intent=institution">
              <button className="rounded-[10px] border-[1.5px] border-white/25 px-[30px] py-3.5 text-sm text-white/75 transition-transform duration-150 ease-out active:scale-[0.97]">
                Soy institución
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
