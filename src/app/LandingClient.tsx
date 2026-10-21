"use client";
// src/app/LandingClient.tsx — FacultyMatch v3: sistema Tailwind + tokens de marca

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/layout/Footer";
import { CheckIcon, DarkBand, Row, SectionRows, SectionSteps } from "@/components/sections/skeleton";
import { IMAGES } from "@/lib/images";

// ─── Mark: birrete con el punto naranja ───────────────────────────────────
function Mark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className="shrink-0"
    >
      <circle cx="60" cy="60" r="55" fill="none" stroke="#0D2240" strokeWidth="3.5" />
      <path d="M61.1 75.2 L58.9 75.2 L18.9 61.6 L16.7 60.5 L14.7 58.1 L14.0 56.3 L14.0 53.4 L15.1 50.8 L17.1 48.8 L19.3 47.7 L32.1 43.7 L33.2 42.9 L58.2 34.5 L62.2 34.5 L64.4 35.6 L101.8 48.1 L104.0 49.5 L105.3 51.2 L106.0 53.0 L106.0 56.3 L104.9 58.9 L103.3 60.5 L101.1 61.6 L100.0 61.6 L97.0 59.8 L93.0 58.7 L88.6 58.7 L84.6 59.8 L81.3 61.6 L77.4 65.5 L75.6 68.4 L75.0 70.4 Z" fill="#0D2240" />
      <circle cx="90.8" cy="75.3" r="10.2" fill="#FF6A1A" />
    </svg>
  );
}

// Términos genéricos y de tendencia — lo que la gente escribe de verdad al
// buscar, con peso en salud, tecnología y negocios. NO son las áreas UNESCO
// del producto (esas se usan en el buscador de /app, no en marketing).
const AREAS = [
  "Salud y ciencias de la vida", "Inteligencia Artificial", "Ciencia de datos",
  "Medicina", "Enfermería", "Ciberseguridad", "Marketing digital",
  "Finanzas y banca", "Liderazgo y management", "Ingeniería",
  "Sostenibilidad y ESG", "Derecho de los negocios", "Transformación digital",
  "Educación online",
];

// ─── NAV ───────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Para docentes", href: "/faculty" },
    { label: "Para instituciones", href: "/institutions" },
    { label: "Recursos", href: "/resources" },
  ];

  return (
    <>
      <nav
        className="fixed inset-x-0 top-0 z-[200] h-16 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(255,255,255,0.96)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid #D8E2EF" : "none",
          boxShadow: scrolled ? "0 1px 12px rgba(7,19,38,0.08)" : "none",
        }}
      >
        <div className="mx-auto flex h-full max-w-[1120px] items-center justify-between gap-5 px-6 md:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 no-underline">
            <Mark size={34} />
            <span className="text-lg font-extrabold tracking-tight text-[#080F1E]">
              facultymatch
            </span>
          </Link>

          <div className="hidden shrink-0 items-center gap-8 min-[900px]:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="whitespace-nowrap text-sm font-medium text-[#4B5A7A] transition-colors hover:text-fm-ink"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link href="/login" className="hidden min-[560px]:block">
              <button className="rounded-[10px] border border-fm-border px-5 py-[7px] text-[13px] font-medium text-[#080F1E] transition-transform duration-150 ease-out active:scale-[0.97]">
                Acceder
              </button>
            </Link>
            <Link href="/signup">
              <button className="rounded-[10px] bg-fm-blue px-[22px] py-[7px] text-[13px] font-bold text-white transition-all duration-150 ease-out hover:opacity-90 active:scale-[0.97]">
                <span className="hidden min-[560px]:inline">Publicar perfil</span>
                <span className="min-[560px]:hidden">Empezar</span>
              </button>
            </Link>
            <button
              type="button"
              aria-label="Abrir menú"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-fm-border min-[900px]:hidden"
            >
              <div className="flex flex-col gap-1">
                <span className="block h-[1.5px] w-4 bg-[#080F1E]" />
                <span className="block h-[1.5px] w-4 bg-[#080F1E]" />
                <span className="block h-[1.5px] w-4 bg-[#080F1E]" />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-x-0 top-16 z-[199] flex flex-col gap-1 border-b border-fm-border bg-white px-6 pb-7 pt-5 min-[900px]:hidden [animation:fm-menu-in_220ms_cubic-bezier(0.22,1,0.36,1)] motion-reduce:animate-none">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-fm-border py-3 text-base font-medium text-fm-ink no-underline"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setMenuOpen(false)} className="mt-3">
            <button className="w-full rounded-lg border border-fm-border py-3 text-sm text-fm-navy">
              Acceder
            </button>
          </Link>
        </div>
      )}
    </>
  );
}

// ─── HERO ──────────────────────────────────────────────────────────────────
// Verified-teacher card for the floating panel. Solo se muestran con nombre
// los 3 perfiles con consentimiento (Miguel, Rocío, Javier); el 4º es una
// tarjeta anónima "en revisión", igual que en el producto real.
const HERO_CARDS: Array<
  | { name: string; role: string; initials: string; from: string; bar: number }
  | { pending: true }
> = [
  { name: "Miguel A. Martí", role: "Estrategia empresarial · Murcia", initials: "MA", from: "#1B4FD8", bar: 88 },
  { name: "Rocío Guijarro", role: "Marketing y Publicidad · Valencia", initials: "RG", from: "#FF6A1A", bar: 71 },
  { name: "Javier Plitt Stevens", role: "Derecho mercantil · Madrid", initials: "JP", from: "#0D2240", bar: 94 },
  { pending: true },
];

function Hero() {
  return (
    <section className="bg-white px-6 pb-14 pt-[104px] md:px-8 md:pb-20 md:pt-[128px]">
      <div className="mx-auto grid max-w-[1180px] items-center gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-12">

        {/* ── Left: copy ── */}
        <div>
          <span className="mb-4 inline-flex items-center border-l-2 border-[#FF6A1A] py-0.5 pl-3 font-mono text-[11px] font-bold uppercase tracking-[0.09em] text-fm-blue">
            Directorio académico verificado
          </span>
          <h1 className="mb-4 text-[2rem] font-black leading-[1.08] tracking-[-0.035em] text-fm-ink md:text-[clamp(2.1rem,3.4vw,2.9rem)]">
            En la era de la IA, la experiencia <span className="text-fm-blue">real</span> marca la diferencia.
          </h1>
          <p className="mb-7 max-w-[480px] text-[15px] leading-[1.7] text-[#5B6B85]">
            El «LinkedIn» de los docentes que forman en universidades y escuelas de negocio.
            Perfiles verificados, sin intermediarios.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/signup">
              <button className="rounded-[10px] bg-fm-blue px-7 py-[13px] text-[14px] font-bold text-white shadow-[0_10px_24px_-8px_rgba(27,79,216,0.5)] transition-all duration-150 ease-out hover:opacity-90 active:scale-[0.97]">
                Publicar mi perfil →
              </button>
            </Link>
            <Link href="/signup?intent=institution">
              <button className="rounded-[10px] border-[1.5px] border-fm-border px-6 py-[13px] text-[14px] font-semibold text-fm-navy transition-transform duration-150 ease-out active:scale-[0.97]">
                Buscar docentes
              </button>
            </Link>
          </div>
        </div>

        {/* ── Right: video + floating search panel ── */}
        <div className="relative">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-fm-border bg-gradient-to-br from-fm-navy to-fm-dark">
            <video
              autoPlay muted loop playsInline preload="auto"
              aria-label="Docentes y expertos en el aula, vídeo de presentación de FacultyMatch"
              title="FacultyMatch, directorio de docentes y expertos verificados"
              poster="/images/faculty-video-poster.jpg"
              className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
            >
              <source src="/faculty-hero.mp4" type="video/mp4" />
            </video>
            <span className="absolute bottom-3 left-3.5 font-mono text-[11px] uppercase tracking-[0.08em] text-white/70">
              Universidades y escuelas de negocio de habla hispana
            </span>
          </div>

          <div className="relative mt-[-52px] rounded-2xl border border-[#E1E7F5] bg-white p-3.5 shadow-[0_30px_55px_-24px_rgba(13,34,64,0.4)] md:-ml-7">
            <div className="mb-2.5 flex gap-2">
              <div className="flex h-8 flex-1 items-center gap-1.5 rounded-lg border border-[#E1E7F5] bg-[#F7F9FD] px-2.5 text-[11px] text-[#5E6F8E]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" /></svg>
                Marketing estratégico, MBA…
              </div>
              <div className="flex h-8 w-16 items-center justify-center rounded-lg border border-[#E1E7F5] bg-[#F7F9FD] text-[11px] font-semibold text-[#4B5A7A]">Área ▾</div>
              <div className="hidden h-8 w-16 items-center justify-center rounded-lg border border-[#E1E7F5] bg-[#F7F9FD] text-[11px] font-semibold text-[#4B5A7A] min-[420px]:flex">País ▾</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {HERO_CARDS.map((c, i) =>
                "pending" in c ? (
                  <div key={i} className="relative rounded-[10px] border border-[#E1E7F5] bg-[#FBFCFE] p-2.5">
                    <span className="absolute right-2.5 top-2.5 rounded-[5px] bg-fm-gold/15 px-1.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.03em] text-[#B77A1B]">En revisión</span>
                    <div className="mb-1.5 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#DCE2EE]">
                      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5"><circle cx="12" cy="8" r="4" fill="#fff" /><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="#fff" /></svg>
                    </div>
                    <div className="mb-1 h-1.5 w-[70%] rounded bg-[#E4E9F3]" />
                    <div className="mb-2 h-1.5 w-[48%] rounded bg-[#E4E9F3]" />
                    <div className="h-1 overflow-hidden rounded-full bg-[#EEF1F8]"><i className="block h-full w-[22%] rounded-full bg-[#C7CEDD]" /></div>
                  </div>
                ) : (
                  <div key={i} className="relative rounded-[10px] border border-[#E1E7F5] bg-white p-2.5">
                    <span className="absolute right-2.5 top-2.5 rounded-[5px] bg-fm-gold/15 px-1.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.03em] text-[#B77A1B]">Verificado</span>
                    <div
                      className="mb-1.5 flex h-[26px] w-[26px] items-center justify-center rounded-full text-[11px] font-extrabold text-white"
                      style={{ background: `linear-gradient(140deg, ${c.from}, #0D2240)` }}
                    >
                      {c.initials}
                    </div>
                    <div className="text-[11px] font-bold text-fm-navy">{c.name}</div>
                    <div className="mb-2 text-[11px] leading-tight text-[#5E6F8E]">{c.role}</div>
                    <div className="h-1 overflow-hidden rounded-full bg-[#EEF1F8]"><i className="block h-full rounded-full bg-fm-blue" style={{ width: `${c.bar}%` }} /></div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── TRUST STRIP ───────────────────────────────────────────────────────────
// Vive fuera del hero a propósito (ver skill design-taste-frontend, regla de
// densidad del hero): la línea de confianza y los avatares eran un quinto y
// sexto elemento dentro del hero, algo que la propia guía marca como "trust
// micro-strip" a evitar ahí. Aquí, como franja propia, cumple el mismo papel
// sin sobrecargar el bloque principal.
function TrustStrip() {
  return (
    <div className="border-y border-fm-border bg-fm-surface px-6 py-4 md:px-8">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3">
        <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] text-[#5E6F8E]">
          <span>Gratis para docentes</span><span className="text-fm-border">·</span>
          <span>Cada perfil, verificado a mano</span><span className="text-fm-border">·</span>
          <span>Sin intermediarios</span>
        </p>
        <div className="flex items-center gap-3">
          <div className="flex">
            {[
              { t: "MA", bg: "#1B4FD8" }, { t: "RG", bg: "#FF6A1A" }, { t: "JP", bg: "#0D2240" },
            ].map((a) => (
              <span
                key={a.t}
                className="-ml-2 flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white text-[11px] font-extrabold text-white first:ml-0"
                style={{ background: a.bg }}
              >
                {a.t}
              </span>
            ))}
            <span className="-ml-2 flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white bg-[#4B5A7A]">
              <svg viewBox="0 0 24 24" fill="none" className="h-[14px] w-[14px]">
                <circle cx="12" cy="8" r="4" fill="#fff" fillOpacity="0.9" />
                <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="#fff" fillOpacity="0.9" />
              </svg>
            </span>
          </div>
          <span className="font-mono text-[11px] text-fm-faint">+100 perfiles verificados</span>
        </div>
      </div>
    </div>
  );
}

// ─── TICKER ────────────────────────────────────────────────────────────────
function Ticker() {
  return (
    <div className="overflow-hidden bg-fm-blue py-3">
      <div className="flex w-max animate-[fm-tick_38s_linear_infinite]">
        {[...AREAS, ...AREAS].map((a, i) => (
          <span
            key={i}
            className="whitespace-nowrap border-r border-white/20 px-7 font-mono text-[11px] font-bold uppercase tracking-[0.09em] text-white/80"
          >
            {a}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── CÓMO FUNCIONA: pasos con numerales ────────────────────────────────────
const HOME_STEPS = [
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

// ─── FILAS ALTERNAS: texto + panel pastel con el producto ──────────────────
function RowsSection() {
  return (
    <SectionRows>
        <Row
          title="Lo que sabes hacer tiene demanda en las aulas."
          body="Médicos, investigadores, directivos y profesionales con experiencia real. Te hacemos visible ante quien busca justo lo que tú sabes."
          bullets={[
            "Perfil verificado y estructurado por área de conocimiento",
            "Las instituciones vienen a ti, sin prospectar",
            "Control total de tu visibilidad y privacidad",
          ]}
          href="/faculty"
          cta="Ver cómo funciona para docentes →"
        >
          <div className="relative">
            <div className="relative aspect-[4/3.1] overflow-hidden rounded-[14px]">
              <Image
                src={IMAGES.docentePizarra.src}
                alt={IMAGES.docentePizarra.alt}
                title={IMAGES.docentePizarra.title}
                fill
                sizes="(min-width: 768px) 520px, 100vw"
                className="object-cover object-[30%_25%]"
              />
            </div>
            <div className="absolute bottom-3.5 left-3.5 w-[170px] rounded-[10px] border border-[#E1E7F5] bg-white p-2.5 shadow-[0_18px_36px_-14px_rgba(13,34,64,0.45)] sm:w-[200px]">
              <span className="absolute right-2.5 top-2.5 rounded-[5px] bg-fm-gold/15 px-1.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.03em] text-[#B77A1B]">Verificado</span>
              <div className="mb-1.5 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-fm-navy text-[11px] font-extrabold text-white">JP</div>
              <div className="text-[11px] font-bold text-fm-navy">Javier Plitt Stevens</div>
              <div className="mb-2 text-[11px] leading-tight text-[#5E6F8E]">Derecho mercantil · Madrid</div>
              <div className="h-1 overflow-hidden rounded-full bg-[#EEF1F8]"><i className="block h-full w-[94%] rounded-full bg-fm-blue" /></div>
            </div>
          </div>
        </Row>

        <Row
          flip
          title="El docente que buscas está dando clase, no buscando trabajo."
          body="Los mejores perfiles están en activo: dirigiendo hospitales, liderando equipos, investigando. FacultyMatch los hace accesibles, verificados y directos."
          bullets={[
            "Área de conocimiento, acreditación ANECA e idioma de impartición",
            "Modalidad, disponibilidad real y tipo de perfil",
          ]}
          href="/institutions"
          cta="Acceder al directorio →"
        >
          <div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-[14px]">
              <Image
                src={IMAGES.equipoReunion.src}
                alt={IMAGES.equipoReunion.alt}
                title={IMAGES.equipoReunion.title}
                fill
                sizes="(min-width: 768px) 520px, 100vw"
                className="object-cover object-[50%_40%]"
              />
            </div>
          <div className="relative mx-3 -mt-12 rounded-[14px] bg-white p-5 shadow-[0_18px_36px_-14px_rgba(13,34,64,0.35)] sm:mx-5">
            <h3 className="mb-4 text-sm font-bold text-fm-navy">Cómo filtran las instituciones</h3>
            <div className="grid gap-2.5">
              {([
                ["Todo el directorio", 100, false],
                ["+ Área: Salud", 80, false],
                ["+ Idioma de impartición: inglés", 54, false],
                ["+ Disponibilidad inmediata", 30, true],
              ] as [string, number, boolean][]).map(([label, w, last]) => (
                <div key={label} className="grid gap-1.5">
                  <span className="text-[13px] font-medium text-fm-navy">{label}</span>
                  <i className={`block h-2.5 rounded ${last ? "bg-fm-blue" : "bg-[#C9D8F5]"}`} style={{ width: `${w}%` }} />
                </div>
              ))}
            </div>
            <div className="mt-[18px] flex items-start gap-2.5 border-t border-[#E1E7F5] pt-4 text-sm font-semibold text-fm-navy">
              <span className="mt-0.5"><CheckIcon size={18} /></span>
              El perfil exacto que necesitas, verificado y en activo.
            </div>
          </div>
          </div>
        </Row>

        <Row
          title="Tú controlas quién ve tu perfil."
          body="Puedes bloquear instituciones específicas por nombre, incluido tu empleador actual. Tu perfil es visible únicamente para quien tú decidas."
          href="/signup"
          cta="Gestionar mi privacidad →"
        >
          <div className="rounded-[14px] bg-white p-6 shadow-[0_14px_34px_-16px_rgba(13,34,64,0.25)]">
            <div className="flex items-center gap-3 border-b border-[#E1E7F5] pb-3.5 text-sm text-fm-navy">
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded bg-fm-blue">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
              </span>
              Visible en el directorio
            </div>
            <h3 className="mb-2 mt-[18px] text-[13px] font-bold text-fm-navy">Instituciones bloqueadas</h3>
            {["Universidad Complutense de Madrid", "ENAE Business School"].map((n) => (
              <div key={n} className="mb-2 flex items-center justify-between rounded-lg border border-[#E1E7F5] bg-[#FBFCFE] px-3 py-[9px] text-[13px] text-fm-navy">
                <span>{n}</span><span className="text-[#5E6F8E]">Quitar</span>
              </div>
            ))}
            <span className="text-[13px] font-bold text-fm-blue">+ Bloquear otra institución</span>
          </div>
        </Row>
    </SectionRows>
  );
}

// ─── FRANJA OSCURA: cifras del sector ──────────────────────────────────────
function SectorBand() {
  const metrics = [
    { value: "91", label: "universidades", detail: "50 públicas y 41 privadas" },
    { value: "50+", label: "escuelas de negocio", detail: "Activas en todo el país" },
    { value: "4.200+", label: "másteres al año", detail: "Nuevos cada curso" },
    { value: "600K+", label: "estudiantes de máster", detail: "Matriculados anualmente" },
  ];

  return (
    <DarkBand>
        <h2 className="mx-auto max-w-[22ch] text-balance text-[1.5rem] font-extrabold leading-[1.12] tracking-[-0.035em] text-fm-ink md:text-[clamp(1.5rem,2.8vw,2.1rem)]">
          Miles de másteres nuevos cada curso. No hay suficiente claustro con experiencia real.
        </h2>
        <p className="mt-3.5 text-base text-[#5B6B85]">Empezamos por España y el mundo de habla hispana.</p>
        <div className="mt-9 grid grid-cols-2 gap-4 text-left md:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-[#E1E7F5] bg-white p-5">
              <div className="text-[1.7rem] font-extrabold leading-none tracking-[-0.04em] text-fm-blue [font-variant-numeric:tabular-nums] md:text-[2rem]">
                {m.value}
              </div>
              <div className="mt-2.5 text-sm font-bold text-fm-navy">{m.label}</div>
              <div className="mt-0.5 text-[13px] text-[#5E6F8E]">{m.detail}</div>
            </div>
          ))}
        </div>
    </DarkBand>
  );
}

// ─── CTA FINAL ─────────────────────────────────────────────────────────────
function CtaFinal() {
  return (
    <section className="bg-gradient-to-br from-fm-navy to-fm-blue px-6 py-[72px] text-center md:px-8 md:py-20">
      <div className="mx-auto max-w-[680px]">
        <h2 className="mb-[18px] text-[1.75rem] font-black leading-[1.08] tracking-[-0.04em] text-white md:text-[clamp(1.75rem,3.5vw,3rem)]">
          Únete a la red de talento para la educación superior.
        </h2>
        <p className="mb-10 text-base leading-[1.7] text-white/60">
          Publicar tu perfil es gratuito para docentes y expertos. Las instituciones empiezan con acceso básico sin coste.
        </p>
        <div className="flex flex-wrap justify-center gap-3.5">
          <Link href="/signup">
            <button className="rounded-[10px] bg-white px-9 py-[15px] text-[15px] font-bold text-fm-navy shadow-[0_4px_24px_rgba(0,0,0,0.2)] transition-all duration-150 ease-out hover:opacity-90 active:scale-[0.97]">
              Soy docente o experto →
            </button>
          </Link>
          <Link href="/signup?intent=institution">
            <button className="rounded-[10px] border-[1.5px] border-white/35 px-9 py-[15px] text-[15px] font-semibold text-white/85 transition-transform duration-150 ease-out active:scale-[0.97]">
              Soy institución
            </button>
          </Link>
        </div>
        <p className="mt-7 flex flex-wrap justify-center gap-x-2.5 gap-y-1 font-mono text-[11px] text-white/60">
          <span>Revisión manual de cada perfil</span><span>·</span>
          <span>Sin permanencia</span><span>·</span>
          <span>Sin comisiones por contratación</span>
        </p>
      </div>
    </section>
  );
}

// ─── ROOT ──────────────────────────────────────────────────────────────────
export default function LandingClient() {
  return (
    <div className="bg-fm-surface font-sans">
      <Nav />
      <Hero />
      <TrustStrip />
      <Ticker />
      <SectionSteps title="De la experiencia al aula." subtitle="Sin intermediarios. Sin comisiones por contratación." steps={HOME_STEPS} />
      <RowsSection />
      <SectorBand />
      <CtaFinal />
      <Footer />
    </div>
  );
}
