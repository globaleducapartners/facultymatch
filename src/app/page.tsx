import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FacultyMatch | Directorio de talento para la educación superior",
  description:
    "El directorio de docentes, investigadores y expertos para instituciones educativas. Perfiles revisados. Contacto directo. Sin intermediarios.",
  keywords:
    "directorio docentes, talento académico, educación superior, expertos universidad",
};

const AREAS = [
  "Derecho",
  "Economía",
  "Ingeniería",
  "Ciencias de la Educación",
  "Medicina",
  "Filosofía",
  "Historia",
  "Física",
  "Química",
  "Matemáticas",
  "Arquitectura",
  "Biología",
  "Psicología",
  "Sociología",
  "Comunicación",
  "Arte y Diseño",
  "Tecnología",
  "Administración de Empresas",
  "Relaciones Internacionales",
  "Lingüística",
  "Educación Física",
  "Enfermería",
];

const PROFILES = [
  {
    name: "Dra. Carmen Villalba",
    role: "Derecho Internacional Público",
    institution: "Univ. Complutense de Madrid",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    tags: ["Derecho", "Internacional"],
    verified: true,
  },
  {
    name: "Dr. Ramón Fuentes",
    role: "Catedrático de Economía",
    institution: "Univ. de Barcelona",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    tags: ["Economía", "Finanzas"],
    verified: true,
  },
  {
    name: "Dra. Isabel Moreno",
    role: "Investigadora en Biomedicina",
    institution: "Univ. Autónoma de Madrid",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    tags: ["Medicina", "Investigación"],
    verified: true,
  },
  {
    name: "Dr. Alejandro Torres",
    role: "Ingeniería Industrial",
    institution: "Univ. Politécnica de Valencia",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
    tags: ["Ingeniería", "Industria 4.0"],
    verified: false,
  },
];

export default function Home() {
  return (
    <>
      {/* Ticker animation keyframes */}
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker-scroll 45s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="bg-[#FDFCF9] text-[#0C1018]">

        {/* ── NAV ────────────────────────────────────────────────────── */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FDFCF9]/95 backdrop-blur-sm border-b border-[#E5E1D8]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="font-serif text-xl font-bold text-[#0D2240] tracking-tight"
            >
              FacultyMatch
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/signup/faculty"
                className="text-sm text-[#6B7280] hover:text-[#0C1018] transition-colors"
              >
                Para docentes
              </Link>
              <Link
                href="/signup/institution"
                className="text-sm text-[#6B7280] hover:text-[#0C1018] transition-colors"
              >
                Para instituciones
              </Link>
              <Link
                href="/about"
                className="text-sm text-[#6B7280] hover:text-[#0C1018] transition-colors"
              >
                Nosotros
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:block text-sm font-medium text-[#6B7280] hover:text-[#0C1018] transition-colors px-4 py-2"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/signup/institution"
                className="text-sm font-semibold bg-[#0D2240] text-white px-5 py-2.5 rounded-full hover:bg-[#0C1018] transition-colors"
              >
                Buscar docentes
              </Link>
            </div>
          </div>
        </nav>

        {/* ── HERO ───────────────────────────────────────────────────── */}
        <section
          className="relative min-h-screen flex items-end pb-24 pt-32"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1800')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#0C1018]/20 via-[#0C1018]/55 to-[#0C1018]/90" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 w-full">
            <div className="max-w-3xl">
              <p className="text-[#B8963E] text-xs font-semibold uppercase tracking-[0.25em] mb-6">
                Directorio académico verificado
              </p>
              <h1 className="font-serif text-5xl lg:text-7xl text-white leading-[1.05] mb-8">
                El directorio de talento para la educación superior
              </h1>
              <p className="text-white/65 text-xl font-light leading-relaxed mb-10 max-w-xl">
                Perfiles revisados. Contacto directo. Sin intermediarios.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup/institution"
                  className="inline-flex items-center justify-center gap-2 bg-[#B8963E] text-white text-sm font-semibold px-8 py-4 rounded-full hover:bg-amber-600 transition-colors"
                >
                  Buscar docentes
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <Link
                  href="/signup/faculty"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white text-sm font-semibold px-8 py-4 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
                >
                  Crear mi perfil gratis
                </Link>
              </div>
            </div>

            {/* Stats strip */}
            <div className="mt-20 flex flex-wrap gap-10 pt-10 border-t border-white/20">
              {[
                { value: "+2.000", label: "docentes verificados" },
                { value: "+150", label: "instituciones activas" },
                { value: "32", label: "disciplinas académicas" },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="font-serif text-3xl text-white">{stat.value}</p>
                  <p className="text-white/45 text-xs mt-1 uppercase tracking-widest">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TICKER ─────────────────────────────────────────────────── */}
        <section className="bg-[#0D2240] py-4 overflow-hidden select-none">
          <div className="ticker-track">
            {[...AREAS, ...AREAS].map((area, i) => (
              <span key={i} className="inline-flex items-center gap-3 px-6">
                <span className="text-[#B8963E] text-xs">◆</span>
                <span className="text-white/65 text-sm font-medium whitespace-nowrap">
                  {area}
                </span>
              </span>
            ))}
          </div>
        </section>

        {/* ── PROFILE GRID ───────────────────────────────────────────── */}
        <section className="bg-[#F7F5F0] py-24 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-14">
              <p className="text-[#B8963E] text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                Talento verificado
              </p>
              <h2 className="font-serif text-4xl lg:text-5xl text-[#0D2240]">
                Perfiles del directorio
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-7">
              {PROFILES.map((p, i) => (
                <div
                  key={i}
                  className="bg-[#FDFCF9] border border-[#E5E1D8] rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <Image
                      src={p.photo}
                      alt={p.name}
                      fill
                      sizes="(max-width:768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {p.verified && (
                      <div className="absolute top-3 right-3 bg-[#B8963E] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        Verificado
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-[#0D2240] text-sm">{p.name}</p>
                    <p className="text-[#6B7280] text-xs mt-0.5">{p.role}</p>
                    <p className="text-[#9CA3AF] text-xs mt-0.5">{p.institution}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {p.tags.map((t, j) => (
                        <span
                          key={j}
                          className="bg-[#F7F5F0] text-[#6B7280] text-[10px] px-2 py-0.5 rounded-full border border-[#E5E1D8]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/signup/institution"
                className="inline-flex items-center gap-2 text-[#B8963E] text-sm font-semibold border-b border-[#B8963E] pb-0.5 hover:text-[#0D2240] hover:border-[#0D2240] transition-colors"
              >
                Acceder al directorio completo
              </Link>
            </div>
          </div>
        </section>

        {/* ── EDITORIAL COLUMNS ──────────────────────────────────────── */}
        <section className="bg-[#FDFCF9] py-24 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16">

            {/* Column 1 — Institutions */}
            <article>
              <div className="aspect-[16/10] relative overflow-hidden rounded-2xl mb-8">
                <Image
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=900"
                  alt="Campus universitario"
                  fill
                  sizes="(max-width:1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <p className="text-[#B8963E] text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                Para instituciones
              </p>
              <h3 className="font-serif text-3xl text-[#0D2240] leading-tight mb-4">
                Encuentra el profesorado adecuado para tus programas
              </h3>
              <p className="text-[#6B7280] leading-relaxed mb-6">
                Accede a un directorio estructurado de docentes, investigadores y
                expertos. Filtra por disciplina, experiencia, idioma y
                disponibilidad. Sin CV en PDF, sin intermediarios.
              </p>
              <Link
                href="/signup/institution"
                className="inline-flex items-center gap-2 text-[#0D2240] text-sm font-semibold border-b border-[#0D2240] pb-0.5 hover:text-[#B8963E] hover:border-[#B8963E] transition-colors"
              >
                Registrar mi institución
              </Link>
            </article>

            {/* Column 2 — Faculty */}
            <article>
              <div className="aspect-[16/10] relative overflow-hidden rounded-2xl mb-8">
                <Image
                  src="https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&q=80&w=900"
                  alt="Docente en clase"
                  fill
                  sizes="(max-width:1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <p className="text-[#B8963E] text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                Para docentes
              </p>
              <h3 className="font-serif text-3xl text-[#0D2240] leading-tight mb-4">
                Tu perfil académico. Tu visibilidad. Tu control.
              </h3>
              <p className="text-[#6B7280] leading-relaxed mb-6">
                Crea un perfil profesional verificado y hazte visible ante
                instituciones de todo el mundo. Tú decides quién puede ver tu
                información y cómo contactarte.
              </p>
              <Link
                href="/signup/faculty"
                className="inline-flex items-center gap-2 text-[#0D2240] text-sm font-semibold border-b border-[#0D2240] pb-0.5 hover:text-[#B8963E] hover:border-[#B8963E] transition-colors"
              >
                Crear mi perfil gratis
              </Link>
            </article>
          </div>
        </section>

        {/* ── PULL QUOTE ─────────────────────────────────────────────── */}
        <section
          className="relative py-32 px-6 lg:px-10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1800')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-[#0D2240]/82" />
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <p className="font-serif text-[#B8963E] text-6xl lg:text-7xl leading-none mb-4">
              &ldquo;
            </p>
            <blockquote className="font-serif text-3xl lg:text-5xl text-white leading-tight">
              La calidad de la educación depende de la calidad de quienes enseñan.
            </blockquote>
            <p className="text-white/40 text-xs mt-10 uppercase tracking-[0.3em]">
              FacultyMatch · 2024
            </p>
          </div>
        </section>

        {/* ── PROCESS — 3 STEPS ──────────────────────────────────────── */}
        <section className="bg-[#F7F5F0] py-24 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center">
              <p className="text-[#B8963E] text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                Cómo funciona
              </p>
              <h2 className="font-serif text-4xl lg:text-5xl text-[#0D2240]">
                Tres pasos para conectar
              </h2>
            </div>
            <div className="grid lg:grid-cols-3 gap-10">
              {[
                {
                  step: "01",
                  title: "Perfil verificado",
                  body: "Los docentes crean un perfil estructurado con su formación, experiencia y especialidades. Nuestro equipo valida cada dato antes de publicarlo.",
                },
                {
                  step: "02",
                  title: "Búsqueda precisa",
                  body: "Las instituciones acceden al directorio y filtran por disciplina, idioma, modalidad y disponibilidad. Sin ruido, sin candidatos no cualificados.",
                },
                {
                  step: "03",
                  title: "Contacto directo",
                  body: "Las instituciones envían propuestas directamente al docente. Sin intermediarios ni comisiones sobre los contratos.",
                },
              ].map((s, i) => (
                <div key={i} className="border-t-2 border-[#B8963E] pt-8">
                  <p className="font-serif text-6xl text-[#E5E1D8] mb-6 leading-none">
                    {s.step}
                  </p>
                  <h3 className="font-serif text-2xl text-[#0D2240] mb-3">
                    {s.title}
                  </h3>
                  <p className="text-[#6B7280] leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRIVACY ────────────────────────────────────────────────── */}
        <section className="bg-[#FDFCF9] py-24 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#B8963E] text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                Privacidad
              </p>
              <h2 className="font-serif text-4xl lg:text-5xl text-[#0D2240] leading-tight mb-6">
                Tu perfil, bajo tu control absoluto
              </h2>
              <p className="text-[#6B7280] text-lg leading-relaxed mb-8">
                Decides qué instituciones pueden ver tu perfil. Puedes pausar tu
                visibilidad en cualquier momento y exportar o eliminar tus datos
                con un clic.
              </p>
              <ul className="space-y-4">
                {[
                  "Visibilidad configurable por institución",
                  "Exportación de datos GDPR incluida",
                  "Eliminación de cuenta inmediata",
                  "Sin venta de datos a terceros",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#0C1018] text-sm">
                    <span className="text-[#B8963E] mt-0.5 shrink-0">◆</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="aspect-square relative overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51?auto=format&fit=crop&q=80&w=800"
                alt="Privacidad y control del perfil"
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D2240]/30 to-transparent" />
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ──────────────────────────────────────────────── */}
        <section
          className="relative py-32 px-6 lg:px-10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&q=80&w=1800')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-[#0C1018]/80" />
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <p className="text-[#B8963E] text-xs font-semibold uppercase tracking-[0.25em] mb-6">
              Únete al directorio
            </p>
            <h2 className="font-serif text-4xl lg:text-6xl text-white leading-tight mb-6">
              Tu próxima oportunidad académica empieza aquí
            </h2>
            <p className="text-white/55 text-lg mb-12 max-w-xl mx-auto">
              Crea tu perfil en minutos y empieza a conectar con instituciones de
              todo el mundo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup/faculty"
                className="inline-flex items-center justify-center bg-[#B8963E] text-white text-sm font-semibold px-10 py-4 rounded-full hover:bg-amber-600 transition-colors"
              >
                Soy docente — Crear perfil gratis
              </Link>
              <Link
                href="/signup/institution"
                className="inline-flex items-center justify-center bg-white/10 border border-white/30 text-white text-sm font-semibold px-10 py-4 rounded-full hover:bg-white/20 transition-colors"
              >
                Soy institución — Buscar talento
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────────── */}
        <footer className="bg-[#0C1018] text-white/55 py-16 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
              <div className="col-span-2 lg:col-span-1">
                <p className="font-serif text-white text-xl mb-3">FacultyMatch</p>
                <p className="text-sm leading-relaxed text-white/35">
                  El directorio de talento académico para la educación superior.
                </p>
              </div>
              <div>
                <p className="text-white text-xs font-semibold uppercase tracking-widest mb-4">
                  Plataforma
                </p>
                <ul className="space-y-2.5 text-sm">
                  <li>
                    <Link
                      href="/signup/faculty"
                      className="hover:text-white transition-colors"
                    >
                      Para docentes
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/signup/institution"
                      className="hover:text-white transition-colors"
                    >
                      Para instituciones
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      className="hover:text-white transition-colors"
                    >
                      Iniciar sesión
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-white text-xs font-semibold uppercase tracking-widest mb-4">
                  Legal
                </p>
                <ul className="space-y-2.5 text-sm">
                  <li>
                    <Link
                      href="/privacy"
                      className="hover:text-white transition-colors"
                    >
                      Privacidad
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="hover:text-white transition-colors"
                    >
                      Términos
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/cookies"
                      className="hover:text-white transition-colors"
                    >
                      Cookies
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-white text-xs font-semibold uppercase tracking-widest mb-4">
                  Contacto
                </p>
                <ul className="space-y-2.5 text-sm">
                  <li>
                    <a
                      href="mailto:hola@facultymatch.app"
                      className="hover:text-white transition-colors"
                    >
                      hola@facultymatch.app
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/25">
              <p>© {new Date().getFullYear()} FacultyMatch. Todos los derechos reservados.</p>
              <p>Madrid, España</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
