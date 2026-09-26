"use client";
// src/app/LandingClient.tsx — FacultyMatch v3: sistema Tailwind + tokens de marca

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/layout/Footer";

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
          <span className="mb-4 inline-flex items-center border-l-2 border-[#FF6A1A] py-0.5 pl-3 font-mono text-[10px] font-bold uppercase tracking-[0.09em] text-fm-blue">
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
              poster="/images/faculty-video-poster.jpg"
              className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
            >
              <source src="/faculty-hero.mp4" type="video/mp4" />
            </video>
            <span className="absolute bottom-3 left-3.5 font-mono text-[9px] uppercase tracking-[0.08em] text-white/70">
              Universidades y escuelas de negocio de habla hispana
            </span>
          </div>

          <div className="relative mt-[-52px] rounded-2xl border border-[#E1E7F5] bg-white p-3.5 shadow-[0_30px_55px_-24px_rgba(13,34,64,0.4)] md:-ml-7">
            <div className="mb-2.5 flex gap-2">
              <div className="flex h-8 flex-1 items-center gap-1.5 rounded-lg border border-[#E1E7F5] bg-[#F7F9FD] px-2.5 text-[11px] text-[#8592A8]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" /></svg>
                Marketing estratégico, MBA…
              </div>
              <div className="flex h-8 w-16 items-center justify-center rounded-lg border border-[#E1E7F5] bg-[#F7F9FD] text-[10px] font-semibold text-[#4B5A7A]">Área ▾</div>
              <div className="hidden h-8 w-16 items-center justify-center rounded-lg border border-[#E1E7F5] bg-[#F7F9FD] text-[10px] font-semibold text-[#4B5A7A] min-[420px]:flex">País ▾</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {HERO_CARDS.map((c, i) =>
                "pending" in c ? (
                  <div key={i} className="relative rounded-[10px] border border-[#E1E7F5] bg-[#FBFCFE] p-2.5">
                    <span className="absolute right-2.5 top-2.5 rounded-[5px] bg-fm-gold/15 px-1.5 py-0.5 font-mono text-[7.5px] font-bold uppercase tracking-[0.03em] text-[#B77A1B]">En revisión</span>
                    <div className="mb-1.5 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#DCE2EE]">
                      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5"><circle cx="12" cy="8" r="4" fill="#fff" /><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="#fff" /></svg>
                    </div>
                    <div className="mb-1 h-1.5 w-[70%] rounded bg-[#E4E9F3]" />
                    <div className="mb-2 h-1.5 w-[48%] rounded bg-[#E4E9F3]" />
                    <div className="h-1 overflow-hidden rounded-full bg-[#EEF1F8]"><i className="block h-full w-[22%] rounded-full bg-[#C7CEDD]" /></div>
                  </div>
                ) : (
                  <div key={i} className="relative rounded-[10px] border border-[#E1E7F5] bg-white p-2.5">
                    <span className="absolute right-2.5 top-2.5 rounded-[5px] bg-fm-gold/15 px-1.5 py-0.5 font-mono text-[7.5px] font-bold uppercase tracking-[0.03em] text-[#B77A1B]">Verificado</span>
                    <div
                      className="mb-1.5 flex h-[26px] w-[26px] items-center justify-center rounded-full text-[9px] font-extrabold text-white"
                      style={{ background: `linear-gradient(140deg, ${c.from}, #0D2240)` }}
                    >
                      {c.initials}
                    </div>
                    <div className="text-[10px] font-bold text-fm-navy">{c.name}</div>
                    <div className="mb-2 text-[8px] leading-tight text-[#8592A8]">{c.role}</div>
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
        <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] text-[#8592A8]">
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
                className="-ml-2 flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white text-[10px] font-extrabold text-white first:ml-0"
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
          <span className="font-mono text-[11px] text-[#8592A8]">+200 perfiles verificados</span>
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

// ─── HOW IT WORKS ──────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      ),
      title: "Publica en 10 minutos",
      body: "Sube tu CV o rellénalo tú mismo. Un experto de nuestro equipo revisa y aprueba cada perfil antes de publicarlo.",
    },
    {
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
      ),
      title: "Llegas a quien te busca",
      body: "Las instituciones filtran por área, idioma y disponibilidad real. Apareces cuando alguien necesita justo lo que ofreces.",
    },
    {
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      title: "Tú decides el sí",
      body: "La institución contacta directamente. Tú pones las condiciones, el ritmo y el precio. Tú aceptas o rechazas.",
    },
  ];

  return (
    <section className="bg-white px-6 py-16 md:px-8 md:py-[88px]">
      <div className="mx-auto max-w-[1120px]">
        <div className="mx-auto mb-12 max-w-[560px] text-center md:mb-16">
          <h2 className="mb-3.5 text-[1.7rem] font-extrabold leading-[1.15] tracking-[-0.035em] text-fm-ink md:text-[clamp(1.7rem,3.4vw,2.5rem)]">
            De la experiencia al aula.
          </h2>
          <p className="text-[15.5px] text-[#5B6B85]">Sin intermediarios. Sin comisiones por contratación.</p>
        </div>

        <div className="relative grid gap-10 md:grid-cols-3 md:gap-6">
          {/* Hilo que conecta los 3 pasos — solo desktop, donde están en fila */}
          <div
            aria-hidden="true"
            className="absolute left-[calc(16.6%+48px)] right-[calc(16.6%+48px)] top-12 hidden h-px bg-gradient-to-r from-fm-border via-fm-blue/40 to-fm-border md:block"
          />
          {steps.map((step, i) => (
            <div
              key={i}
              className={`relative text-center ${i === 1 ? "md:-translate-y-3" : ""}`}
            >
              <div className="relative z-10 mx-auto mb-[22px] flex h-24 w-24 items-center justify-center rounded-full border border-fm-border bg-white shadow-[0_4px_24px_rgba(7,19,38,0.06)]">
                {step.icon}
              </div>
              <h3 className="mb-[9px] text-[16.5px] font-bold tracking-[-0.02em] text-fm-ink">{step.title}</h3>
              <p className="mx-auto max-w-[34ch] text-[13.5px] leading-[1.7] text-[#5B6B85]">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PRODUCT TRIO ──────────────────────────────────────────────────────────
function ProductTrio() {
  return (
    <section className="bg-fm-surface px-6 py-16 md:px-8 md:py-[88px]">
      <div className="mx-auto max-w-[1120px]">
        <div className="mx-auto mb-12 max-w-[560px] text-center md:mb-16">
          <h2 className="mb-3.5 text-[1.7rem] font-extrabold leading-[1.15] tracking-[-0.035em] text-fm-ink md:text-[clamp(1.7rem,3.4vw,2.5rem)]">
            De tu CV a un perfil verificado.
          </h2>
          <p className="text-[15.5px] text-[#5B6B85]">Así es el camino real dentro de FacultyMatch, sin datos sensibles a la vista.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {/* Paso 1: subir CV */}
          <div className="flex flex-col overflow-hidden rounded-3xl border border-fm-border bg-white shadow-sm">
            <div className="relative overflow-hidden bg-[#12161f]">
              <div className="flex gap-1.5 bg-[#1B1F27] px-3.5 py-2.5">
                <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
                <span className="h-2 w-2 rounded-full bg-[#FFBD2E]" />
                <span className="h-2 w-2 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex min-h-[190px] flex-col justify-center gap-2.5 p-5">
                <div className="rounded-xl border-[1.5px] border-dashed border-white/25 px-4 py-5 text-center [animation:fm-dz-flash_6s_ease-in-out_infinite]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" className="mx-auto mb-2.5 h-[34px] w-[34px]">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
                  </svg>
                  <div className="text-xs font-semibold text-white/75">Arrastra tu CV aquí</div>
                  <div className="mt-1 font-mono text-[10.5px] text-white/40">PDF o Word · máx. 10MB</div>
                </div>
                <div
                  className="absolute h-[26px] w-[26px] -translate-x-1/2 -translate-y-1/2 [animation:fm-drag-file_6s_ease-in-out_infinite] motion-reduce:hidden"
                  style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="2" width="13" height="17" rx="2" fill="#fff" />
                    <path d="M6 6h7M6 9.5h7M6 13h4" stroke="#0D2240" strokeWidth="1.1" strokeLinecap="round" />
                    <path d="M14 14l7 3-3.2 1-1 3.2z" fill="#FF6A1A" stroke="#0D2240" strokeWidth="0.8" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-5 pt-4">
              <div className="mb-2 font-mono text-[11px] font-bold text-fm-blue">PASO 1</div>
              <h3 className="mb-2 text-[15.5px] font-bold text-fm-ink">Sube tu CV</h3>
              <p className="text-[13px] leading-[1.65] text-[#5B6B85]">O pega el texto directamente. Nada que no tengas ya escrito en algún sitio.</p>
            </div>
          </div>

          {/* Paso 2: IA */}
          <div className="flex flex-col overflow-hidden rounded-3xl border border-fm-border bg-white shadow-sm">
            <div className="overflow-hidden bg-[#12161f]">
              <div className="flex gap-1.5 bg-[#1B1F27] px-3.5 py-2.5">
                <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
                <span className="h-2 w-2 rounded-full bg-[#FFBD2E]" />
                <span className="h-2 w-2 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex min-h-[190px] flex-col justify-center gap-2.5 p-5">
                {[["70%", "ALTA", true], ["50%", "ALTA", true], ["60%", "MEDIA", false]].map(([w, label, high], i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-white/5 px-2.5 py-2">
                    <div className="h-2 rounded-full bg-white/15" style={{ width: w as string }} />
                    <span
                      className="rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold"
                      style={high ? { background: "rgba(233,160,48,0.18)", color: "#E9A030" } : { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}
                    >
                      {label as string}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 pt-4">
              <div className="mb-2 font-mono text-[11px] font-bold text-fm-blue">PASO 2</div>
              <h3 className="mb-2 text-[15.5px] font-bold text-fm-ink">La IA prepara tu borrador</h3>
              <p className="text-[13px] leading-[1.65] text-[#5B6B85]">Una IA extrae tus datos y marca su confianza en cada campo. Tú revisas antes de publicar: nada se guarda sin tu ok.</p>
            </div>
          </div>

          {/* Paso 3: verificación */}
          <div className="flex flex-col overflow-hidden rounded-3xl border border-fm-border bg-white shadow-sm">
            <div className="overflow-hidden bg-[#12161f]">
              <div className="flex gap-1.5 bg-[#1B1F27] px-3.5 py-2.5">
                <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
                <span className="h-2 w-2 rounded-full bg-[#FFBD2E]" />
                <span className="h-2 w-2 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex min-h-[190px] flex-col items-center justify-center gap-2.5 p-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-fm-gold">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#E9A030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-fm-gold/90">
                  Verificado · revisado a mano
                </div>
              </div>
            </div>
            <div className="p-5 pt-4">
              <div className="mb-2 font-mono text-[11px] font-bold text-fm-blue">PASO 3</div>
              <h3 className="mb-2 text-[15.5px] font-bold text-fm-ink">Revisión de nuestro equipo</h3>
              <p className="text-[13px] leading-[1.65] text-[#5B6B85]">Un revisor de nuestro equipo confirma cada perfil a mano antes de publicarlo. La IA propone, las personas deciden.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SPLIT: DOCENTES ──────────────────────────────────────────────────────
function SplitDocentes() {
  const { ref, inView } = useInView(0.1);

  return (
    <section className="overflow-hidden bg-fm-surface">
      <div ref={ref} className="mx-auto grid max-w-[1120px] md:grid-cols-2 md:min-h-[520px]">
        <div className="relative order-first h-[260px] overflow-hidden rounded-2xl md:order-2 md:h-auto md:rounded-none">
          {/* Foto distinta a la del hero (esa es vídeo de otra persona) —
              faculty-benefits.jpg: profesional presentando, encaja con
              "lo que sabes hacer tiene demanda en las aulas". */}
          <Image
            src="/images/faculty-benefits.jpg"
            alt="Profesional con experiencia impartiendo formación"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-fm-dark/40 to-transparent" />
          <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-fm-dark/60 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-sm">
            <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-fm-gold">
              <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
                <path d="M2 6l3 3 5-5" stroke="#0D2240" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Docentes con experiencia real
          </div>
        </div>

        <div
          className="order-2 flex flex-col justify-center px-6 pt-9 transition-transform duration-700 md:order-1 md:px-8 md:py-16 md:pl-8"
          style={{ transform: inView ? "translateX(0)" : "translateX(-10px)" }}
        >
          <h2 className="mb-[18px] text-[1.6rem] font-extrabold leading-[1.15] tracking-[-0.035em] text-fm-ink md:text-[clamp(1.6rem,2.8vw,2.2rem)]">
            Lo que sabes hacer <b className="font-extrabold text-fm-blue">tiene demanda en las aulas.</b>
          </h2>
          <p className="mb-6 text-[14.5px] leading-[1.8] text-[#5B6B85]">
            Años en medicina, consultoría, investigación o dirección tienen demanda real en másteres
            y educación ejecutiva. Te hacemos visible ante quien busca justo lo que tú sabes.
          </p>
          <div className="mb-7 flex flex-col gap-2.5">
            {[
              "Perfil verificado y estructurado por área de conocimiento",
              "Las instituciones vienen a ti, sin prospectar",
              "Control total de tu visibilidad y privacidad",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-px flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-md bg-fm-gold/15">
                  <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
                    <path d="M2 6l3 3 5-5" stroke="#B4791E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-[13.5px] leading-[1.55] text-[#43526B]">{item}</span>
              </div>
            ))}
          </div>
          <Link href="/faculty" className="self-start">
            <button className="rounded-[10px] bg-fm-navy px-7 py-[13px] text-sm font-bold text-white transition-all duration-150 ease-out hover:opacity-90 active:scale-[0.97]">
              Ver cómo funciona para docentes →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── SPLIT: INSTITUCIONES (embudo de filtrado) ─────────────────────────────
function SplitInstituciones() {
  const { ref, inView } = useInView(0.1);
  const rows: [string, number, boolean][] = [
    ["Todo el directorio", 100, false],
    ["+ Área: Salud", 80, false],
    ["+ Idioma de impartición: inglés", 54, false],
    ["+ Disponibilidad inmediata", 30, true],
  ];

  return (
    <section className="overflow-hidden bg-white">
      <div ref={ref} className="mx-auto grid max-w-[1120px] md:grid-cols-2 md:min-h-[520px]">
        <div
          className="order-2 flex flex-col justify-center px-6 pb-9 pt-0 transition-transform duration-700 md:order-1 md:py-16 md:pl-16 md:pr-8"
          style={{ transform: inView ? "translateX(0)" : "translateX(-10px)" }}
        >
          <span className="mb-4 block font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#B4791E]">
            Para instituciones educativas
          </span>
          <h2 className="mb-[18px] text-[1.6rem] font-extrabold leading-[1.15] tracking-[-0.035em] text-fm-ink md:text-[clamp(1.6rem,2.8vw,2.2rem)]">
            El docente que buscas <b className="font-extrabold text-fm-blue">está dando clase, no buscando trabajo.</b>
          </h2>
          <p className="mb-6 text-[14.5px] leading-[1.8] text-[#5B6B85]">
            Los mejores perfiles están en activo: dirigiendo hospitales, liderando equipos, investigando.
            FacultyMatch los hace accesibles, verificados y directos.
          </p>
          <div className="mb-7 grid grid-cols-2 gap-2.5">
            {["Área de conocimiento", "Acreditación ANECA", "Idioma de impartición", "Modalidad", "Disponibilidad real", "Tipo de perfil"].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 rounded-lg border border-fm-border bg-fm-surface px-3.5 py-2.5 text-[13px] font-semibold text-fm-navy">
                <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-fm-gold" />
                {f}
              </div>
            ))}
          </div>
          <Link href="/institutions" className="self-start">
            <button className="rounded-[10px] bg-fm-blue px-7 py-[13px] text-sm font-bold text-white transition-all duration-150 ease-out hover:opacity-90 active:scale-[0.97]">
              Acceder al directorio →
            </button>
          </Link>
        </div>

        <div className="order-1 flex items-center justify-center bg-gradient-to-br from-fm-navy to-fm-dark px-8 py-10 md:order-2">
          <div className="w-full max-w-[340px]">
            <span className="mb-4 block font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-white/50">
              Cómo filtran las instituciones
            </span>
            {rows.map(([label, pct, highlight], i) => (
              <div
                key={i}
                className="mb-2.5 flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-white md:w-[var(--bar-pct)]"
                style={{
                  ["--bar-pct" as string]: `${pct}%`,
                  background: highlight ? "linear-gradient(90deg,#FF6A1A,#FF8A45)" : "linear-gradient(90deg,#1B4FD8,#3E6BF0)",
                }}
              >
                <span>{label}</span>
              </div>
            ))}
            <div className="mt-4 flex items-center gap-2.5 text-[12.5px] font-semibold leading-[1.4] text-white/90">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fm-gold">
                <svg viewBox="0 0 12 12" fill="none" className="h-[11px] w-[11px]">
                  <path d="M2 6l3 3 5-5" stroke="#0D2240" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              El perfil exacto que necesitas, verificado y en activo.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SECTOR METRICS ────────────────────────────────────────────────────────
function SectorMetrics() {
  const { ref, inView } = useInView(0.1);
  const metrics = [
    { value: "91", label: "universidades", detail: "50 públicas y 41 privadas" },
    { value: "50+", label: "escuelas de negocio", detail: "Activas en todo el país" },
    { value: "4.200+", label: "másteres al año", detail: "Nuevos cada curso" },
    { value: "600K+", label: "estudiantes de máster", detail: "Matriculados anualmente" },
  ];

  return (
    <section className="bg-fm-surface px-6 py-16 md:px-8 md:py-[88px]">
      <div className="mx-auto max-w-[1120px]">
        <div className="mx-auto mb-12 max-w-[600px] text-center md:mb-16">
          <h2 className="text-[1.7rem] font-extrabold leading-[1.15] tracking-[-0.035em] text-fm-ink md:text-[clamp(1.7rem,3.4vw,2.5rem)]">
            Miles de másteres nuevos cada curso. No hay suficiente claustro con experiencia real.
          </h2>
        </div>

        <div ref={ref} className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {metrics.map((m, i) => (
            <div
              key={i}
              className="rounded-3xl border border-fm-border bg-white p-6 text-center shadow-sm transition-transform duration-500"
              style={{ transitionDelay: `${i * 0.1}s`, transform: inView ? "translateY(0)" : "translateY(12px)" }}
            >
              <div className="font-mono text-[1.7rem] font-bold text-fm-navy [font-variant-numeric:tabular-nums] md:text-[clamp(1.7rem,3vw,2.2rem)]">
                {m.value}
              </div>
              <div className="mt-1.5 text-[13px] font-bold text-fm-ink">{m.label}</div>
              <div className="text-[11.5px] text-[#8592A8]">{m.detail}</div>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-[440px] text-center text-[12.5px] text-[#8592A8]">
          Empezamos por España y el mundo de habla hispana.
        </p>
      </div>
    </section>
  );
}

// ─── PRIVACY ───────────────────────────────────────────────────────────────
function Privacy() {
  return (
    <section className="overflow-hidden bg-white px-6 py-16 md:px-8 md:py-[88px]">
      <div className="mx-auto flex max-w-[620px] flex-col items-center text-center">
        <div className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-fm-blue/[0.08]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h2 className="mb-[18px] text-[1.5rem] font-extrabold leading-[1.1] tracking-[-0.035em] text-fm-ink md:text-[clamp(1.5rem,2.6vw,2.1rem)]">
          Tú controlas quién ve tu perfil.
        </h2>
        <p className="mb-7 text-sm leading-[1.8] text-[#5B6B85]">
          Puedes bloquear instituciones específicas por nombre, incluido tu empleador actual.
          Tu perfil es visible únicamente para quien tú decidas.
        </p>
        <Link href="/signup">
          <button className="rounded-[10px] border-[1.5px] border-fm-navy px-6 py-3 text-sm font-semibold text-fm-navy transition-transform duration-150 ease-out active:scale-[0.97]">
            Gestionar mi privacidad
          </button>
        </Link>
      </div>

      {/* Tarjeta flotante y descentrada — a propósito distinta de la columna
          50/50 que ya usan las dos secciones "Para docentes/instituciones"
          de más arriba, para no repetir un tercer split idéntico. */}
      <div className="mx-auto mt-12 max-w-[1120px] md:mt-[-8px]">
        <div className="w-full max-w-[320px] rounded-2xl border border-white/10 bg-gradient-to-br from-fm-navy to-fm-dark p-6 shadow-[0_30px_60px_-24px_rgba(13,34,64,0.35)] md:ml-auto md:mr-[6%] md:-rotate-2">
          <div className="mb-[22px] flex items-center justify-between text-[13px] font-semibold text-white">
            <span>Visible en el directorio</span>
            <span className="relative h-[22px] w-[38px] shrink-0 rounded-full bg-fm-blue">
              <span className="absolute left-[18px] top-0.5 h-[18px] w-[18px] rounded-full bg-white" />
            </span>
          </div>
          <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.08em] text-white/40">
            Instituciones bloqueadas
          </div>
          {[68, 52].map((w, i) => (
            <div key={i} className="mb-2 flex items-center justify-between gap-2.5 rounded-lg bg-white/5 px-3 py-2.5">
              <div className="h-[9px] rounded-md bg-white/15" style={{ width: `${w}%` }} />
              <span className="shrink-0 rounded-full bg-fm-signal/15 px-2 font-mono text-[9.5px] font-bold text-[#FF9B8A]">
                Bloqueada
              </span>
            </div>
          ))}
          <button
            type="button"
            className="mt-2 w-full rounded-lg border border-dashed border-white/25 py-2 text-[11.5px] text-white/50"
          >
            + Bloquear otra institución
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── CTA FINAL ─────────────────────────────────────────────────────────────
function CtaFinal() {
  return (
    <section className="bg-gradient-to-br from-fm-navy to-fm-blue px-6 py-[72px] text-center md:px-8 md:py-20">
      <div className="mx-auto max-w-[680px]">
        <span className="mb-[18px] block font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-fm-gold">
          Únete a la red
        </span>
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
        <p className="mt-7 flex flex-wrap justify-center gap-x-2.5 gap-y-1 font-mono text-[11px] text-white/45">
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
      <HowItWorks />
      <ProductTrio />
      <SplitDocentes />
      <SplitInstituciones />
      <SectorMetrics />
      <Privacy />
      <CtaFinal />
      <Footer />
    </div>
  );
}
