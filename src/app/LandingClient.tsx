"use client";
// src/app/LandingClient.tsx — FacultyMatch v3: sistema Tailwind + tokens de marca

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { useIsMobile } from "@/hooks/use-mobile";

// ─── Mark: "encuentro" — dos círculos que se solapan ──────────────────────
function Mark({ size = 32, glow = true }: { size?: number; glow?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="shrink-0"
      style={glow ? { filter: "drop-shadow(0 0 10px rgba(255,106,26,0.55))" } : undefined}
    >
      <circle cx="30" cy="52" r="22" fill="#EAF0F9" />
      <circle cx="66" cy="50" r="34" fill="#FF6A1A" />
    </svg>
  );
}

const AREAS = [
  "Medicina", "Derecho", "Inteligencia Artificial", "Liderazgo ejecutivo",
  "Finanzas corporativas", "Investigación clínica", "Marketing estratégico",
  "Ingeniería", "Ciencias de la Salud", "Transformación digital",
  "Comunicación", "Emprendimiento", "Data Science", "Gestión hospitalaria",
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
            <span
              className="text-lg font-extrabold tracking-tight transition-colors duration-300"
              style={{ color: scrolled ? "#080F1E" : "#fff" }}
            >
              facultymatch
            </span>
          </Link>

          <div className="hidden shrink-0 items-center gap-8 min-[900px]:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="whitespace-nowrap text-sm font-medium transition-colors"
                style={{ color: scrolled ? "#4B5A7A" : "rgba(255,255,255,0.8)" }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link href="/login" className="hidden min-[560px]:block">
              <button
                className="rounded-[10px] border px-5 py-[7px] text-[13px] font-medium transition-colors"
                style={{
                  borderColor: scrolled ? "#D8E2EF" : "rgba(255,255,255,0.35)",
                  color: scrolled ? "#080F1E" : "#fff",
                }}
              >
                Acceder
              </button>
            </Link>
            <Link href="/signup">
              <button className="rounded-[10px] bg-fm-blue px-[22px] py-[7px] text-[13px] font-bold text-white">
                <span className="hidden min-[560px]:inline">Publicar perfil</span>
                <span className="min-[560px]:hidden">Empezar</span>
              </button>
            </Link>
            <button
              type="button"
              aria-label="Abrir menú"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border min-[900px]:hidden"
              style={{ borderColor: scrolled ? "#D8E2EF" : "rgba(255,255,255,0.3)" }}
            >
              <div className="flex flex-col gap-1">
                <span className="block h-[1.5px] w-4" style={{ background: scrolled ? "#080F1E" : "#fff" }} />
                <span className="block h-[1.5px] w-4" style={{ background: scrolled ? "#080F1E" : "#fff" }} />
                <span className="block h-[1.5px] w-4" style={{ background: scrolled ? "#080F1E" : "#fff" }} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-x-0 top-16 z-[199] flex flex-col gap-1 border-b border-fm-border bg-white px-6 pb-7 pt-5 min-[900px]:hidden">
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
function Hero() {
  return (
    <div
      className="px-6 pb-16 pt-[120px] md:px-8 md:pb-20 md:pt-[140px]"
      style={{
        background:
          "radial-gradient(900px 480px at 18% -10%, rgba(27,79,216,0.32), transparent 60%), radial-gradient(640px 460px at 92% 6%, rgba(255,106,26,0.14), transparent 55%), #071326",
      }}
    >
      <div className="mx-auto max-w-[760px] text-center">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[rgba(62,107,240,0.45)] bg-[rgba(27,79,216,0.22)] py-[6px] pl-2 pr-3.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-fm-gold">
            <svg viewBox="0 0 12 12" fill="none" className="h-[11px] w-[11px]">
              <path d="M2 6l3 3 5-5" stroke="#0D2240" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/85">
            Cada perfil, verificado a mano
          </span>
        </div>

        <h1 className="mb-5 text-[2.2rem] font-black leading-[1.08] tracking-[-0.04em] text-white md:text-[clamp(2.4rem,5vw,3.6rem)]">
          En la era de la IA, lo más valioso
          <br />
          no es tu contenido, <span className="text-fm-gold">es tu experiencia.</span>
        </h1>

        <p className="mx-auto mb-9 max-w-[540px] text-[15px] leading-[1.75] text-white/60 md:text-[17px]">
          FacultyMatch conecta directivos, médicos, investigadores y expertos en activo
          con universidades y escuelas de negocio. Sin intermediarios. Sin currículums sin comprobar.
        </p>

        <div className="mb-4 flex flex-wrap justify-center gap-3">
          <Link href="/signup">
            <button className="rounded-[10px] bg-white px-8 py-[14px] text-[15px] font-bold text-fm-ink shadow-[0_2px_20px_rgba(255,255,255,0.15)]">
              Publicar mi perfil →
            </button>
          </Link>
          <Link href="/signup?intent=institution">
            <button className="rounded-[10px] border border-white/30 px-8 py-[14px] text-[15px] font-medium text-white/85">
              Buscar docentes
            </button>
          </Link>
        </div>
        <p className="font-mono text-xs text-white/40">
          100% PERFILES REVISADOS POR PERSONAS · CERO BOTS
        </p>
      </div>

      <div className="mx-auto mt-14 max-w-[940px] md:mt-16">
        <div className="relative overflow-hidden rounded-[18px] bg-[#12161d] shadow-[0_24px_60px_-20px_rgba(7,19,38,0.6)] ring-1 ring-white/[0.06]">
          <div className="flex items-center gap-2 bg-[#1B1F27] px-[18px] py-[13px]">
            <span className="h-[11px] w-[11px] rounded-full bg-[#FF5F57]" />
            <span className="h-[11px] w-[11px] rounded-full bg-[#FFBD2E]" />
            <span className="h-[11px] w-[11px] rounded-full bg-[#28C840]" />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/panel-docente-mockup.png"
            alt="Panel de docente en FacultyMatch"
            className="block w-full"
          />
          <div
            className="absolute h-5 w-5 rounded-full [animation:fm-cursor-travel_7s_ease-in-out_infinite] motion-reduce:hidden"
            style={{ filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.45))" }}
          >
            <div className="absolute -left-[7px] -top-[7px] h-[34px] w-[34px] rounded-full border-2 border-fm-signal [animation:fm-ripple-pulse_7s_ease-in-out_infinite]" />
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d="M4 2l14 6-6 2-2 6-6-14z" fill="#fff" stroke="#0D2240" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="absolute bottom-[26px] right-[26px] flex items-center gap-[9px] rounded-xl bg-white px-3.5 py-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.25)] [animation:fm-badge-pulse_7s_ease-in-out_infinite]">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fm-gold">
              <svg viewBox="0 0 12 12" fill="none" className="h-[11px] w-[11px]">
                <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-xs font-bold leading-tight text-fm-navy">
              Perfil verificado
              <small className="block font-mono font-normal text-[#8592A8]">por el equipo FacultyMatch</small>
            </span>
          </div>
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

// ─── STATS ─────────────────────────────────────────────────────────────────
function StatsStrip() {
  const stats = [
    { display: "+91", label: "universidades en España" },
    { display: "1,76M", label: "estudiantes universitarios" },
    { display: "200k", label: "alumnos internacionales / curso" },
    { display: "4k", label: "titulaciones de máster" },
  ];
  return (
    <div className="bg-fm-dark py-12">
      <div className="mx-auto grid max-w-[1120px] grid-cols-2 gap-y-9 px-6 md:grid-cols-4 md:gap-y-0 md:px-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="px-2 text-center md:border-r md:border-white/10 md:px-6 md:last:border-r-0"
          >
            <div className="font-mono text-4xl font-bold tracking-[-0.02em] text-white [font-variant-numeric:tabular-nums] md:text-[clamp(2rem,3.6vw,2.7rem)]">
              {s.display}
            </div>
            <div className="mt-1.5 text-[12.5px] text-white/45">{s.label}</div>
          </div>
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
      body: "Sube tu CV o rellénalo tú mismo. Un especialista humano revisa y aprueba cada perfil antes de publicarlo.",
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
          <span className="mb-3.5 block font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#B4791E]">
            Cómo funciona
          </span>
          <h2 className="mb-3.5 text-[1.7rem] font-extrabold leading-[1.15] tracking-[-0.035em] text-fm-ink md:text-[clamp(1.7rem,3.4vw,2.5rem)]">
            De la experiencia al aula.
          </h2>
          <p className="text-[15.5px] text-[#5B6B85]">Sin intermediarios. Sin comisiones por contratación.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto mb-[22px] flex h-24 w-24 items-center justify-center rounded-full border border-fm-border bg-fm-surface shadow-[0_4px_24px_rgba(7,19,38,0.06)]">
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
          <span className="mb-3.5 block font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-fm-blue">
            La herramienta, por dentro
          </span>
          <h2 className="mb-3.5 text-[1.7rem] font-extrabold leading-[1.15] tracking-[-0.035em] text-fm-ink md:text-[clamp(1.7rem,3.4vw,2.5rem)]">
            De tu CV a un perfil verificado.
          </h2>
          <p className="text-[15.5px] text-[#5B6B85]">Así es el camino real dentro de FacultyMatch — sin datos sensibles a la vista.</p>
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
              <p className="text-[13px] leading-[1.65] text-[#5B6B85]">Claude Haiku extrae tus datos y marca su confianza en cada campo. Tú revisas antes de publicar — nada se guarda sin tu ok.</p>
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
                  Verificado · equipo humano
                </div>
              </div>
            </div>
            <div className="p-5 pt-4">
              <div className="mb-2 font-mono text-[11px] font-bold text-fm-blue">PASO 3</div>
              <h3 className="mb-2 text-[15.5px] font-bold text-fm-ink">Verificación humana</h3>
              <p className="text-[13px] leading-[1.65] text-[#5B6B85]">Un revisor de nuestro equipo confirma cada perfil a mano antes de publicarlo. La IA propone, las personas deciden.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SPLIT: DOCENTES (vídeo real) ──────────────────────────────────────────
function SplitDocentes() {
  const isMob = useIsMobile();
  const { ref, inView } = useInView(0.1);

  return (
    <section className="overflow-hidden bg-fm-surface">
      <div ref={ref} className="mx-auto grid max-w-[1120px] md:grid-cols-2 md:min-h-[520px]">
        <div className="relative order-first h-[260px] overflow-hidden rounded-2xl md:order-2 md:h-auto md:rounded-none">
          {isMob ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/images/faculty-video-poster.jpg" alt="Cómo se construye tu perfil en FacultyMatch" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <video
              autoPlay muted loop playsInline
              poster="/images/faculty-video-poster.jpg"
              className="absolute inset-0 h-full w-full object-cover"
            >
              <source src="/faculty-hero.mp4" type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-fm-dark/40 to-transparent" />
          <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-fm-dark/60 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-sm">
            <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-fm-gold">
              <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
                <path d="M2 6l3 3 5-5" stroke="#0D2240" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Así se construye tu perfil
          </div>
        </div>

        <div
          className="order-2 flex flex-col justify-center px-0 pt-9 transition-transform duration-700 md:order-1 md:px-8 md:py-16 md:pl-8"
          style={{ transform: inView ? "translateX(0)" : "translateX(-10px)" }}
        >
          <span className="mb-4 block font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#B4791E]">
            Para docentes y expertos
          </span>
          <h2 className="mb-[18px] text-[1.6rem] font-extrabold leading-[1.15] tracking-[-0.035em] text-fm-ink md:text-[clamp(1.6rem,2.8vw,2.2rem)]">
            Tu experiencia es el <b className="font-extrabold text-fm-blue">valor diferencial.</b>
          </h2>
          <p className="mb-6 text-[14.5px] leading-[1.8] text-[#5B6B85]">
            Años en medicina, consultoría, investigación o dirección tienen demanda real en másteres
            y educación ejecutiva. Te hacemos visible ante quien busca justo lo que tú sabes.
          </p>
          <div className="mb-7 flex flex-col gap-2.5">
            {[
              "Perfil verificado y estructurado por área UNESCO",
              "Las instituciones vienen a ti — sin prospectar",
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
            <button className="rounded-[10px] bg-fm-navy px-7 py-[13px] text-sm font-bold text-white">
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
  const rows: [string, string, number, boolean][] = [
    ["Directorio completo", "1.240", 100, false],
    ["+ Área: Ciencias de la Salud", "312", 80, false],
    ["+ Idioma: inglés", "96", 54, false],
    ["+ Disponibilidad inmediata", "14", 30, true],
  ];

  return (
    <section className="overflow-hidden bg-white">
      <div ref={ref} className="mx-auto grid max-w-[1120px] md:grid-cols-2 md:min-h-[520px]">
        <div
          className="order-2 flex flex-col justify-center px-0 pb-9 pt-0 transition-transform duration-700 md:order-1 md:py-16 md:pl-16 md:pr-8"
          style={{ transform: inView ? "translateX(0)" : "translateX(-10px)" }}
        >
          <span className="mb-4 block font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#B4791E]">
            Para instituciones educativas
          </span>
          <h2 className="mb-[18px] text-[1.6rem] font-extrabold leading-[1.15] tracking-[-0.035em] text-fm-ink md:text-[clamp(1.6rem,2.8vw,2.2rem)]">
            El docente que buscas <b className="font-extrabold text-fm-blue">no está en LinkedIn.</b>
          </h2>
          <p className="mb-6 text-[14.5px] leading-[1.8] text-[#5B6B85]">
            Los mejores perfiles están en activo: dirigiendo hospitales, liderando equipos, investigando.
            FacultyMatch los hace accesibles, verificados y directos.
          </p>
          <div className="mb-7 grid grid-cols-2 gap-2.5">
            {["Área UNESCO", "Acreditación ANECA", "Idioma de impartición", "Modalidad", "Disponibilidad real", "Tipo de perfil"].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 rounded-lg border border-fm-border bg-fm-surface px-3.5 py-2.5 text-[13px] font-semibold text-fm-navy">
                <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-fm-gold" />
                {f}
              </div>
            ))}
          </div>
          <Link href="/institutions" className="self-start">
            <button className="rounded-[10px] bg-fm-blue px-7 py-[13px] text-sm font-bold text-white">
              Acceder al directorio →
            </button>
          </Link>
        </div>

        <div className="order-1 flex items-center justify-center bg-gradient-to-br from-fm-navy to-fm-dark px-8 py-10 md:order-2">
          <div className="w-full max-w-[340px]">
            <span className="mb-4 block font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-white/50">
              Cómo filtran las instituciones
            </span>
            {rows.map(([label, val, pct, highlight], i) => (
              <div
                key={i}
                className="mb-2.5 flex w-full items-center justify-between gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-white md:w-[var(--bar-pct)]"
                style={{
                  ["--bar-pct" as string]: `${pct}%`,
                  background: highlight ? "linear-gradient(90deg,#FF6A1A,#FF8A45)" : "linear-gradient(90deg,#1B4FD8,#3E6BF0)",
                }}
              >
                <span>{label}</span>
                <span className="shrink-0 font-mono font-bold">{val}</span>
              </div>
            ))}
            <div className="mt-4 flex items-center gap-2.5 text-[12.5px] font-semibold leading-[1.4] text-white/90">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fm-gold">
                <svg viewBox="0 0 12 12" fill="none" className="h-[11px] w-[11px]">
                  <path d="M2 6l3 3 5-5" stroke="#0D2240" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              14 perfiles verificados listos para contactar
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
        <div className="mx-auto mb-12 max-w-[560px] text-center md:mb-16">
          <span className="mb-3.5 block font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-fm-blue">
            Sector en España
          </span>
          <h2 className="text-[1.7rem] font-extrabold leading-[1.15] tracking-[-0.035em] text-fm-ink md:text-[clamp(1.7rem,3.4vw,2.5rem)]">
            Un mercado que necesita talento docente.
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
      </div>
    </section>
  );
}

// ─── PRIVACY ───────────────────────────────────────────────────────────────
function Privacy() {
  return (
    <section className="overflow-hidden bg-white">
      <div className="mx-auto grid max-w-[1120px] md:min-h-[380px] md:grid-cols-2">
        <div className="flex items-center justify-center bg-gradient-to-br from-fm-navy to-fm-dark px-8 py-10">
          <div className="w-full max-w-[320px] rounded-2xl border border-white/10 bg-white/[0.045] p-6">
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

        <div className="flex flex-col justify-center px-6 py-9 md:px-16 md:py-14">
          <div className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-fm-blue/[0.08]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className="mb-3.5 block font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#B4791E]">
            Privacidad
          </span>
          <h2 className="mb-[18px] text-[1.5rem] font-extrabold leading-[1.1] tracking-[-0.035em] text-fm-ink md:text-[clamp(1.5rem,2.6vw,2.1rem)]">
            Tú controlas quién ve tu perfil.
          </h2>
          <p className="mb-7 text-sm leading-[1.8] text-[#5B6B85]">
            Puedes bloquear instituciones específicas por nombre, incluido tu empleador actual.
            Tu perfil es visible únicamente para quien tú decidas.
          </p>
          <Link href="/signup" className="self-start">
            <button className="rounded-[10px] border-[1.5px] border-fm-navy px-6 py-3 text-sm font-semibold text-fm-navy">
              Gestionar mi privacidad
            </button>
          </Link>
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
            <button className="rounded-[10px] bg-white px-9 py-[15px] text-[15px] font-bold text-fm-navy shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
              Soy docente o experto →
            </button>
          </Link>
          <Link href="/signup?intent=institution">
            <button className="rounded-[10px] border-[1.5px] border-white/35 px-9 py-[15px] text-[15px] font-semibold text-white/85">
              Soy institución
            </button>
          </Link>
        </div>
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
      <Ticker />
      <StatsStrip />
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
