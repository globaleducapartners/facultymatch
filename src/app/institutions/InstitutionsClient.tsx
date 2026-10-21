"use client";
// src/app/institutions/InstitutionsClient.tsx — FacultyMatch v3 (Tailwind + tokens de marca)

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Row, SectionRows, SectionSteps } from "@/components/sections/skeleton";
import { IMAGES } from "@/lib/images";
import { Faq } from "@/components/sections/Faq";

const INSTITUTION_FAQ = [
  { q: "¿Qué es FacultyMatch para instituciones?", a: "Un directorio de docentes, investigadores y expertos verificados para universidades y escuelas de negocio. Buscas por área de conocimiento, revisas el perfil y contactas directamente con el docente." },
  { q: "¿Cómo sé que los perfiles son fiables?", a: "Cada perfil con el distintivo Verificado ha sido revisado por el equipo de FacultyMatch: titulación, trayectoria y perfiles académicos. Si el docente cambia datos sensibles, el perfil se vuelve a revisar." },
  { q: "¿Cuesta algo contactar con un docente?", a: "No hay comisiones si contratas. El contacto es directo entre la institución y el docente, sin intermediarios." },
  { q: "¿Tiene coste registrarse?", a: "El registro es gratuito e incluye 5 búsquedas y 5 contactos al mes. El plan Professional, 99 € al mes, añade búsquedas y contactos ilimitados, filtros avanzados, favoritos sin límite y hasta 3 usuarios." },
  { q: "¿Qué privacidad tienen los docentes?", a: "Cada docente decide si su perfil es público o privado y puede bloquear instituciones concretas. FacultyMatch solo muestra la información que el docente ha elegido publicar." },
];

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

const AVATAR_COLORS: string[] = [
  "#1B4FD8", "#0D2240", "#059669", "#7C3AED", "#DC2626", "#0891B2",
];

// Muestra ANÓNIMA — sin nombres ni "Ex-Google/Ex-Amazon" inventados (solo
// Miguel, Rocío y Javier tienen consentimiento para aparecer con nombre).
// Se enseñan los atributos que de verdad se pueden filtrar: rol, área,
// idiomas, disponibilidad, experiencia.
const SAMPLE_PROFILES = [
  {
    role: "Economía · Política fiscal", org: "Docente universitario",
    kind: "Académica" as const, avail: true, lang: "ES · EN",
    area: "Economía", years: "12 años exp.", color: AVATAR_COLORS[0],
  },
  {
    role: "Dirección de Operaciones", org: "Directivo en activo",
    kind: "Experto" as const, avail: true, lang: "ES · EN · FR",
    area: "Operaciones", years: "18 años exp.", color: AVATAR_COLORS[1],
  },
  {
    role: "Derecho mercantil · Compliance", org: "Abogada en activo",
    kind: "Académica" as const, avail: false, lang: "ES · FR",
    area: "Derecho", years: "9 años exp.", color: AVATAR_COLORS[2],
  },
  {
    role: "Marketing digital · Growth", org: "Profesional del sector",
    kind: "Profesional" as const, avail: true, lang: "ES · EN",
    area: "Marketing", years: "14 años exp.", color: AVATAR_COLORS[3],
  },
  {
    role: "Inteligencia Artificial · ML", org: "Investigadora senior",
    kind: "Académica" as const, avail: true, lang: "ES · EN",
    area: "Inteligencia Artificial", years: "8 años exp.", color: AVATAR_COLORS[4],
  },
  {
    role: "Liderazgo · Gestión de personas", org: "Dirección de RR. HH.",
    kind: "Experto" as const, avail: true, lang: "ES · EN",
    area: "Liderazgo", years: "16 años exp.", color: AVATAR_COLORS[5],
  },
];

const INST_STEPS = [
  {
    title: "Registra tu institución",
    body: "Acceso al directorio completo desde el primer día. Sin proceso de aprobación previo. En cinco minutos estás dentro.",
  },
  {
    title: "Busca con filtros reales",
    body: "Por área de conocimiento, acreditación, idioma y disponibilidad. Los resultados son exactamente lo que necesitas para tu programa.",
  },
  {
    title: "Contacta directamente",
    body: "Envía una solicitud al docente. Él decide si responde. Sin intermediarios ni comisiones por contratación. Negociáis directamente.",
  },
];

const COMPARISON = [
  {
    feature: "Disponibilidad docente",
    fm: "Filtro real: inmediata, próximo semestre, solo online",
    li: "Hay que contactar y preguntar a cada persona",
  },
  {
    feature: "Perfiles verificados",
    fm: "Revisados a mano antes de publicarse",
    li: "Cualquiera puede escribir que da clases en su perfil",
  },
  {
    feature: "Primer contacto",
    fm: "Solicitud directa al docente; responde o declina",
    li: "Correos en frío que a menudo se quedan sin respuesta",
  },
  {
    feature: "Comisión por contratación",
    fm: "0 €, nunca",
    li: "El proceso manual tiene un coste oculto en horas",
  },
];

export default function InstitutionsClient() {
  const { ref: pricingRef, inView: pricingVisible } = useInView(0.1);

  return (
    <div className="bg-white font-sans">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#071326] md:flex md:min-h-[560px] md:items-center">
        {/* Foto a sangre (derecha en escritorio, arriba en móvil) */}
        <div className="relative h-[260px] md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[55%]">
          <Image
            src={IMAGES.tallerFormacion.src}
            alt={IMAGES.tallerFormacion.alt}
            title={IMAGES.tallerFormacion.title}
            fill
            priority
            sizes="(min-width: 768px) 56vw, 100vw"
            className="object-cover object-[40%_40%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#071326] md:bg-gradient-to-r md:from-[#071326] md:via-[#071326]/40 md:to-transparent" />
        </div>

        <div className="relative z-[2] mx-auto w-full max-w-[1180px] px-6 py-12 md:px-8 md:py-16">
          <div className="max-w-[520px]">
            <span className="mb-4 inline-flex items-center border-l-2 border-[#FF6A1A] py-0.5 pl-3 font-mono text-[11px] font-bold uppercase tracking-[0.09em] text-[#9DB8FF]">
              Para universidades y escuelas de negocio
            </span>
            <h1 className="mb-4 text-[2rem] font-black leading-[1.08] tracking-[-0.035em] text-white md:text-[clamp(2.1rem,3.4vw,2.9rem)]">
              El directorio que ningún portal de empleo puede tener.
            </h1>
            <p className="mb-7 max-w-[480px] text-base leading-[1.7] text-white/70">
              Médicos, investigadores y directivos que nunca publican su CV
              en portales de empleo. Aquí están disponibles, verificados y
              con contacto directo.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup?intent=institution">
                <button className="rounded-[10px] bg-white px-7 py-[13px] text-[14px] font-bold text-fm-ink transition-all duration-150 ease-out hover:opacity-90 active:scale-[0.97]">
                  Acceder al directorio
                </button>
              </Link>
              <Link href="/login">
                <button className="rounded-[10px] border-[1.5px] border-white/35 px-6 py-[13px] text-[14px] font-semibold text-white/90 transition-transform duration-150 ease-out active:scale-[0.97]">
                  Ya tengo cuenta
                </button>
              </Link>
            </div>
          </div>

          {/* Tarjeta de producto sobre la foto */}
          <div className="mt-8 w-full max-w-[300px] rounded-2xl border border-[#E1E7F5] bg-white p-3.5 shadow-[0_28px_52px_-24px_rgba(0,0,0,0.6)] md:absolute md:bottom-9 md:right-8 md:mt-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-fm-blue text-[11px] font-extrabold text-white">EN</div>
              <div className="min-w-0">
                <div className="text-[12.5px] font-bold text-fm-navy">Enfermería · Gestión sanitaria</div>
                <div className="text-[11.5px] leading-tight text-[#5E6F8E]">Docente en activo · ES · EN</div>
              </div>
              <span className="ml-auto shrink-0 rounded-[5px] bg-fm-gold/15 px-1.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.03em] text-[#B77A1B]">Verificado</span>
            </div>
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-[#EEF1F8]"><i className="block h-full w-[88%] rounded-full bg-fm-blue" /></div>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <SectionSteps title="Tres pasos. Sin proceso de selección previo." steps={INST_STEPS} />

      <SectionRows>
        <Row
          title="Búsqueda pensada para quien contrata, no para quien busca trabajo."
          body="No hay keywords que interpretar ni CVs confusos. El directorio está estructurado exactamente con los criterios que usan los directores de programa al seleccionar profesorado."
          bullets={[
            "Área de conocimiento, de Salud y Tecnología a Negocios y Derecho",
            "Acreditación: ANECA, ORCID, titulación doctoral",
            "Idioma, modalidad y disponibilidad",
          ]}
        >
          <div>
            <div className="relative aspect-[16/8] overflow-hidden rounded-[14px]">
              <Image
                src={IMAGES.comisionSeleccion.src}
                alt={IMAGES.comisionSeleccion.alt}
                title={IMAGES.comisionSeleccion.title}
                fill
                sizes="(min-width: 768px) 520px, 100vw"
                className="object-cover object-[50%_35%]"
              />
            </div>
          <div className="relative mx-3 -mt-10 rounded-[14px] bg-white p-5 shadow-[0_18px_36px_-14px_rgba(13,34,64,0.35)] sm:mx-5">
            <h3 className="mb-3.5 text-sm font-bold text-fm-navy">Así se ve un perfil verificado</h3>
            <div className="grid gap-2.5">
              {SAMPLE_PROFILES.slice(0, 3).map((p) => (
                <div key={p.role} className="flex min-w-0 items-center gap-3 rounded-[10px] border border-[#E1E7F5] bg-white p-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white"
                    style={{ background: p.color }}
                  >
                    {p.role.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold text-fm-navy">{p.role}</div>
                    <div className="truncate text-xs text-[#5E6F8E]">{p.org} · {p.lang}</div>
                  </div>
                  <span
                    className={`shrink-0 rounded-[5px] px-[7px] py-[3px] font-mono text-[11px] font-bold uppercase tracking-[0.03em] ${
                      p.avail ? "bg-emerald-600/15 text-emerald-700" : "bg-[#EEF1F8] text-[#5E6F8E]"
                    }`}
                  >
                    {p.avail ? "Disponible" : "No disponible"}
                  </span>
                </div>
              ))}
            </div>
          </div>
          </div>
        </Row>

        <Row
          flip
          title="Una red generalista tiene millones de perfiles. Aquí están los que enseñan."
          body="No todos los profesionales quieren dar clases, ni saben que pueden. FacultyMatch solo incluye perfiles que se han registrado explícitamente para enseñar."
        >
          <div className="rounded-[14px] bg-white p-3 shadow-[0_14px_34px_-16px_rgba(13,34,64,0.25)] sm:p-5">
            <div className="grid grid-cols-[1.1fr_1fr_1fr] text-[12px] sm:text-[13px]">
              <div className="p-2.5" />
              <div className="p-2.5 text-xs font-bold text-fm-blue">FacultyMatch</div>
              <div className="p-2.5 text-xs font-bold text-fm-navy">Red generalista</div>
              {COMPARISON.map((c) => (
                <div key={c.feature} className="contents">
                  <div className={`border-t border-[#E1E7F5] p-2.5 font-semibold text-fm-navy`}>{c.feature}</div>
                  <div className="border-t border-[#E1E7F5] p-2.5 text-fm-navy">{c.fm}</div>
                  <div className="border-t border-[#E1E7F5] p-2.5 text-[#5E6F8E]">{c.li}</div>
                </div>
              ))}
            </div>
          </div>
        </Row>
      </SectionRows>

      {/* ── PRECIOS ── */}
      <section id="precios" className="bg-white px-6 py-16 md:px-8 md:py-[88px]">
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-13 text-center">
            <h2 className="mb-3 text-[26px] font-extrabold tracking-[-0.04em] text-fm-ink md:text-[clamp(28px,3vw,40px)]">
              Empieza gratis. Escala cuando lo necesites.
            </h2>
            <p className="mx-auto max-w-[460px] text-base text-fm-muted">
              Sin comisiones por contratación. Pagas por acceso al directorio, no por cada perfil que encuentres.
            </p>
          </div>

          <div ref={pricingRef} className="mx-auto grid max-w-[760px] gap-5 md:grid-cols-2">
            {/* Essential */}
            <div
              className="flex flex-col rounded-[20px] border border-fm-border bg-fm-surface p-7 transition-all duration-500"
              style={{
                opacity: pricingVisible ? 1 : 0,
                transform: pricingVisible ? "translateY(0)" : "translateY(14px)",
              }}
            >
              <div className="mb-[18px] font-sans text-sm font-bold text-[#5E6F8E]">
                Plan Essential
              </div>
              <div className="mb-1 text-[44px] font-black leading-none tracking-[-0.05em] text-fm-ink">0 €</div>
              <div className="mb-7 text-[13px] text-[#5E6F8E]">para empezar</div>
              <div className="mb-7 flex flex-1 flex-col gap-[11px]">
                {["Registro gratuito", "5 búsquedas al mes", "5 contactos al mes", "Vista de perfil básica"].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] bg-fm-blue/10">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#1B4FD8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-fm-muted">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup?intent=institution">
                <button className="w-full rounded-[10px] border-[1.5px] border-fm-navy py-3 text-sm font-semibold text-fm-navy transition-transform duration-150 ease-out active:scale-[0.97]">
                  Registrar mi institución
                </button>
              </Link>
            </div>

            {/* Professional */}
            <div
              className="relative flex flex-col rounded-[20px] border border-white/15 bg-fm-dark p-7 transition-all duration-500"
              style={{
                transitionDelay: "0.16s",
                opacity: pricingVisible ? 1 : 0,
                transform: pricingVisible ? "translateY(0)" : "translateY(14px)",
              }}
            >
              <div className="mb-[18px] font-sans text-sm font-bold text-[#9DB8FF]">
                Plan Professional
              </div>
              <div className="mb-1 text-[44px] font-black leading-none tracking-[-0.05em] text-white">99 €</div>
              <div className="mb-7 text-[13px] text-white/60">al mes · sin permanencia</div>
              <div className="mb-7 flex flex-1 flex-col gap-[11px]">
                {["Búsquedas ilimitadas", "Contactos ilimitados", "Filtros avanzados completos", "Favoritos sin límite", "Hasta 3 usuarios", "Soporte prioritario"].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] bg-[#9DB8FF]/15">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#9DB8FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-white/65">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/checkout?plan=institution-pro">
                <button className="w-full rounded-[10px] border border-white/20 bg-white/10 py-3 text-sm font-bold text-white transition-all duration-150 ease-out hover:bg-white/20 active:scale-[0.97]">
                  Activar Professional
                </button>
              </Link>
              <p className="mt-2.5 text-center text-[11px] text-white/60">
                o{" "}
                <a href="mailto:support@facultymatch.app?subject=Prueba%20Professional%2014%20d%C3%ADas" className="font-bold text-[#9DB8FF]">
                  14 días de prueba gratuita
                </a>
                , sin tarjeta
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-[#5E6F8E]">
            Sin comisiones por contratación. Sin permanencia. Cancela cuando quieras.
          </p>
        </div>
      </section>

      <Faq title="Preguntas frecuentes de instituciones" items={INSTITUTION_FAQ} />

      {/* ── CTA FINAL ── */}
      <section className="bg-gradient-to-br from-fm-dark to-fm-navy">
        <div className="mx-auto flex max-w-[1120px] flex-col items-start justify-between gap-8 px-6 py-16 md:flex-row md:items-center md:px-8 md:py-18">
          <div>
            <h2 className="text-2xl font-extrabold leading-[1.1] tracking-[-0.04em] text-white md:text-[clamp(24px,2.8vw,36px)]">
              Tu próximo experto lleva
               años esperando esta llamada.
            </h2>
            <p className="mt-2.5 text-[13px] text-white/60">
              Registro gratuito. Sin validación previa. Sin comisiones si contratas.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/signup?intent=institution">
              <button className="rounded-[10px] bg-white px-[30px] py-3.5 text-sm font-bold text-fm-ink transition-all duration-150 ease-out hover:opacity-90 active:scale-[0.97]">
                Acceder al directorio
              </button>
            </Link>
            <Link href="/signup">
              <button className="rounded-[10px] border-[1.5px] border-white/25 px-[30px] py-3.5 text-sm text-white/75 transition-transform duration-150 ease-out active:scale-[0.97]">
                Soy docente
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
