import { createAdminClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  GraduationCap, MapPin, Award, BookOpen, ExternalLink,
  CheckCircle2, Building2, Sparkles, Globe, UserPlus, Shield,
  ChevronRight, FileText, CalendarCheck, Languages, Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/ui/Logo";
import { ProfileViewTracker } from "@/components/profile/ProfileViewTracker";

// Caché de 60 s; se invalida al momento al cambiar visibilidad o verificación.
export const revalidate = 60;

// Sin perfiles pregenerados: cada ficha se genera la primera vez que alguien
// la pide y queda en caché hasta que caduca o se invalida.
export async function generateStaticParams() {
  return [];
}

const BASE = "https://www.facultymatch.app";

const AVAIL_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  open:          { label: "Disponible ahora",     color: "#059669", bg: "#F0FDF4" },
  next_semester: { label: "Próximo semestre",      color: "#0891B2", bg: "#EFF9FF" },
  occasional:    { label: "Asignaturas puntuales", color: "#7C3AED", bg: "#F5F3FF" },
  weekends:      { label: "Fines de semana",       color: "#D97706", bg: "#FFFBEB" },
  online_only:   { label: "Solo online",           color: "#1B4FD8", bg: "#EFF6FF" },
  limited:       { label: "En 6 meses",            color: "#6B7280", bg: "#F3F4F6" },
  invite_only:   { label: "Por invitación",        color: "#0D2240", bg: "#EEF4FF" },
};

// ── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: faculty } = await admin
    .from("faculty_profiles")
    .select("id, headline, current_institution, city, country, faculty_areas, expertise:faculty_expertise(area)")
    .eq("profile_slug", slug)
    .eq("visibility", "public")
    .eq("is_active", true)
    .eq("estado_perfil", "verificado")
    .maybeSingle();

  if (!faculty) {
    return {
      title: "Perfil no encontrado | FacultyMatch",
      description: "Este perfil docente no existe o ya no está disponible públicamente.",
      robots: { index: false, follow: true },
    };
  }

  const { data: up } = await admin
    .from("user_profiles")
    .select("full_name, avatar_url")
    .eq("id", faculty.id)
    .maybeSingle();

  const name = up?.full_name || "Docente";
  // El titular a veces es solo un tratamiento ("Dra."); solo se usa si dice algo.
  const headline = faculty.headline && faculty.headline.trim().length > 8 ? faculty.headline.trim() : "";
  const areaList: string[] = Array.isArray(faculty.faculty_areas) ? faculty.faculty_areas : [];
  const expertiseAreas: string[] = Array.isArray(faculty.expertise) ? faculty.expertise.map((e: any) => e.area).filter(Boolean) : [];
  const mainArea = expertiseAreas[0] || areaList[0] || "";
  const where = [faculty.city, faculty.country].filter(Boolean).join(", ");
  const title = mainArea
    ? `${name}, ${mainArea}: docente verificado | FacultyMatch`
    : `${name}: docente verificado | FacultyMatch`;
  const description = [
    `${name}${headline ? `, ${headline}` : ""}${faculty.current_institution ? ` (${faculty.current_institution})` : ""}.`,
    `Perfil docente verificado por FacultyMatch${mainArea ? ` en ${mainArea}` : ""}${where ? ` · ${where}` : ""}.`,
  ].join(" ").slice(0, 300);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `${BASE}/docentes/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: { canonical: `${BASE}/docentes/${slug}` },
    robots: { index: true, follow: true },
  };
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function PublicFacultyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const admin = createAdminClient();

  // Fetch faculty profile — security-critical: filter in query, not just UI.
  // Columna a columna (no select(*)): esta página es pública y usa el
  // cliente admin, así que una fila entera incluiría teléfono, email de
  // contacto y notas internas de verificación aunque hoy no se rendericen.
  const { data: faculty } = await admin
    .from("faculty_profiles")
    .select(`
      id, headline, current_institution, bio, banner_url,
      faculty_areas, aneca_accreditation, academic_level, institutions_taught,
      languages, availability, city, country, location, degrees,
      google_scholar_id, orcid_id, linkedin_url, website, is_phd,
      years_experience, modalities, research_publications,
      expertise:faculty_expertise(id, area, subarea, topics)
    `)
    .eq("profile_slug", slug)
    .eq("visibility", "public")
    .eq("is_active", true)
    .eq("estado_perfil", "verificado")
    .maybeSingle();

  // Verificado pero privado: el enlace existe (se comparte desde el panel, el
  // PDF y el email) pero el docente aún no lo ha hecho público. En vez de un
  // 404 genérico, explicamos qué pasa y ofrecemos la verificación (que a
  // propósito no exige visibilidad pública). No se muestra ningún dato personal.
  if (!faculty) {
    const { data: privateOne } = await admin
      .from("faculty_profiles")
      .select("id")
      .eq("profile_slug", slug)
      .eq("is_active", true)
      .eq("estado_perfil", "verificado")
      .maybeSingle();
    if (!privateOne) notFound();
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-fm-surface p-6 text-center">
        <div className="w-full max-w-lg rounded-3xl border border-fm-border bg-white p-10 shadow-[0_8px_40px_rgba(13,34,64,0.06)]">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-fm-blue/[0.08] text-fm-blue">
            <Shield size={26} />
          </div>
          <h1 className="mb-3 text-2xl font-extrabold tracking-[-0.03em] text-fm-ink">Este perfil es privado</h1>
          <p className="mb-7 text-base leading-relaxed text-fm-muted">
            Es un perfil verificado por FacultyMatch, pero su titular aún no lo ha hecho público. Puedes comprobar su verificación o explorar el directorio.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={`/verificar/${slug}`}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-fm-blue px-7 text-sm font-bold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.97] sm:w-auto"
            >
              Comprobar verificación
            </Link>
            <Link
              href="/directory"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-fm-border bg-white px-7 text-sm font-bold text-fm-ink transition-all duration-150 hover:border-fm-blue active:scale-[0.97] sm:w-auto"
            >
              Ver el directorio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fetch user profile for name and avatar
  const { data: userProfile } = await admin
    .from("user_profiles")
    .select("full_name, avatar_url")
    .eq("id", faculty.id)
    .maybeSingle();

  if (!userProfile) notFound();

  // ── Derived data ──
  const fullName = userProfile.full_name || "Docente";
  const avatarUrl = userProfile.avatar_url || null;
  const nameWords = fullName.replace(/\b(dr|dra|prof|profa|d|da)\.?(?=\s)/gi, "").split(/\s+/).filter(Boolean);
  const initials = (nameWords.length > 1
    ? nameWords[0][0] + nameWords[nameWords.length - 1][0]
    : (nameWords[0] || fullName).substring(0, 2)
  ).toUpperCase();
  const avail = faculty.availability ? (AVAIL_LABELS[faculty.availability] || null) : null;
  const locationStr = [faculty.city, faculty.country || faculty.location].filter(Boolean).join(", ");
  const yearsExp = faculty.years_experience ?? 0;
  const hasExpertise = Array.isArray(faculty.expertise) && faculty.expertise.length > 0;
  const hasDegrees = Array.isArray(faculty.degrees) && faculty.degrees.length > 0;
  const hasInstitutionsTaught = Array.isArray(faculty.institutions_taught) && faculty.institutions_taught.length > 0;
  const hasLanguages = Array.isArray(faculty.languages) && faculty.languages.length > 0;
  const hasResearch = !!(faculty.google_scholar_id || faculty.orcid_id || faculty.research_publications);
  const hasFacultyAreas = Array.isArray(faculty.faculty_areas) && faculty.faculty_areas.length > 0;
  const hasModalities = Array.isArray(faculty.modalities) && faculty.modalities.length > 0;
  const isPhd = faculty.is_phd === true;
  const hasAneca = !!faculty.aneca_accreditation;

  // JSON-LD structured data
  const sameAs = [
    faculty.orcid_id ? `https://orcid.org/${faculty.orcid_id}` : null,
    faculty.google_scholar_id ? `https://scholar.google.com/citations?user=${faculty.google_scholar_id}` : null,
    faculty.linkedin_url || null,
    faculty.website || null,
  ].filter(Boolean) as string[];
  const knowsAbout = Array.from(new Set([
    ...(hasExpertise ? faculty.expertise.map((e: any) => e.area) : []),
    ...(hasFacultyAreas ? faculty.faculty_areas : []),
  ].filter(Boolean)));
  const person = {
    "@type": "Person",
    "@id": `${BASE}/docentes/${slug}#persona`,
    name: fullName,
    ...(faculty.headline ? { jobTitle: faculty.headline } : {}),
    ...(avatarUrl ? { image: avatarUrl } : {}),
    ...(faculty.bio ? { description: String(faculty.bio).slice(0, 500) } : {}),
    ...(faculty.current_institution ? { worksFor: { "@type": "Organization", name: faculty.current_institution } } : {}),
    ...(knowsAbout.length ? { knowsAbout } : {}),
    ...(hasLanguages ? { knowsLanguage: faculty.languages.map((l: any) => (typeof l === "string" ? l : l.lang || l.language || l.name)).filter(Boolean) } : {}),
    ...(locationStr ? { address: { "@type": "PostalAddress", addressLocality: locationStr } } : {}),
    url: `${BASE}/docentes/${slug}`,
    ...(sameAs.length ? { sameAs } : {}),
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${BASE}/docentes/${slug}`,
    isPartOf: { "@id": `${BASE}/#website` },
    mainEntity: person,
  };

  return (
    <>
      <ProfileViewTracker facultyId={faculty.id} source="public" />

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#F8FAFC]">
        {/* ── Navbar ── */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 px-4 sm:px-6 h-16">
            <Logo className="shrink-0" />
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <Link
                href="/login"
                className="whitespace-nowrap text-xs sm:text-sm font-bold text-[#0D2240] hover:text-[#1B4FD8] transition-colors px-1"
              >
                Acceder
              </Link>
              <Link
                href="/signup?intent=institution"
                className="flex items-center gap-1.5 whitespace-nowrap bg-[#1B4FD8] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-colors"
              >
                <UserPlus size={14} className="hidden sm:block" /> Registrarse
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-6 pt-8 pb-16 space-y-10">

          {/* ── Breadcrumb ── */}
          <nav className="flex items-center gap-2 text-sm font-semibold text-[#5B6B85]">
            <Link href="/" className="hover:text-[#1B4FD8] transition-colors">Inicio</Link>
            <ChevronRight size={14} />
            <span className="text-fm-ink font-bold truncate max-w-[250px]">{fullName}</span>
          </nav>

          {/* ── CABECERA ── */}
          <div className="overflow-hidden rounded-[20px] border border-fm-border bg-white">
            <div className="relative h-28 bg-fm-navy sm:h-40">
              {faculty.banner_url && (
                <Image
                  src={faculty.banner_url}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                  unoptimized
                />
              )}
            </div>

            <div className="px-6 pb-8 sm:px-10">
              <div className="relative -mt-12 h-24 w-24 shrink-0 overflow-hidden rounded-xl border-4 border-white bg-fm-navy sm:-mt-14 sm:h-28 sm:w-28">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={fullName} fill sizes="112px" priority className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-3xl font-extrabold text-white">{initials}</span>
                )}
              </div>

              <div className="mt-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h1 className="text-balance text-[1.9rem] font-extrabold leading-[1.1] tracking-[-0.035em] text-fm-ink sm:text-4xl">{fullName}</h1>
                  <Link
                    href={`/verificar/${slug}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-fm-gold/40 bg-fm-gold/10 px-2.5 py-1 text-xs font-bold text-[#92600A] hover:bg-fm-gold/20"
                    title="Perfil verificado por el equipo de FacultyMatch"
                  >
                    <CheckCircle2 size={13} /> Verificado
                  </Link>
                  {isPhd && <span className="text-xs font-bold text-[#5B6B85]">PhD</span>}
                  {hasAneca && <span className="text-xs font-bold text-[#5B6B85]">ANECA</span>}
                </div>
                {faculty.headline && (
                  <p className="mt-2 text-lg font-semibold leading-snug text-[#5B6B85]">{faculty.headline}</p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-[#5B6B85]">
                  {faculty.current_institution && (
                    <span className="flex items-center gap-2">
                      <Building2 size={16} className="shrink-0 text-fm-blue" />
                      <span className="font-semibold text-fm-ink">{faculty.current_institution}</span>
                    </span>
                  )}
                  {locationStr && (
                    <span className="flex items-center gap-2">
                      <MapPin size={16} className="shrink-0 text-fm-blue" />
                      <span>{locationStr}</span>
                    </span>
                  )}
                  {yearsExp > 0 && (
                    <span className="flex items-center gap-2">
                      <CalendarCheck size={16} className="shrink-0 text-fm-blue" />
                      <span>{yearsExp}+ años de experiencia</span>
                    </span>
                  )}
                  {avail && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: avail.color }}>
                      <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: avail.color }} />
                      {avail.label}
                    </span>
                  )}
                </div>
              </div>

              {faculty.bio && (
                <div className="mt-6 max-w-3xl border-t border-fm-border pt-6">
                  <p className="whitespace-pre-line text-[15px] leading-[1.7] text-[#5B6B85]">{faculty.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── TWO COLUMN LAYOUT ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ── LEFT: Main content ── */}
            <div className="lg:col-span-8 space-y-8">

              {/* Especialidades */}
              {(hasExpertise || hasFacultyAreas) && (
                <Section>
                  <SectionTitle icon={<Sparkles size={20} />} title="Áreas de especialización" />
                  {hasExpertise ? (
                    <div className="grid grid-cols-1 gap-4">
                      {faculty.expertise.map((exp: any) => (
                        <div
                          key={exp.id}
                          className="flex gap-5 items-start p-5 bg-fm-surface border border-fm-border rounded-xl"
                        >
                          <div className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-fm-blue" />
                          <div className="space-y-2 min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-[#1B4FD8]">
                              {exp.area}
                            </p>
                            {exp.subarea && (
                              <p className="font-bold text-fm-ink text-base leading-snug">{exp.subarea}</p>
                            )}
                            {Array.isArray(exp.topics) && exp.topics.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {exp.topics.map((t: string) => (
                                  <span
                                    key={t}
                                    className="text-[11px] font-semibold px-3 py-1.5 bg-white border border-fm-border rounded-lg text-[#5B6B85]"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      {faculty.faculty_areas.map((area: string) => (
                        <span key={area} className="rounded-lg border border-fm-border bg-fm-surface px-3 py-1.5 text-xs font-bold text-fm-ink">
                          {area}
                        </span>
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {/* Formación y acreditaciones */}
              {(hasDegrees || hasAneca) && (
                <Section>
                  <SectionTitle icon={<GraduationCap size={20} />} title="Formación y acreditaciones" />
                  <div className="grid gap-4">
                    {hasDegrees &&
                      faculty.degrees.map((deg: any, i: number) => (
                        <div
                          key={i}
                          className="flex gap-5 items-start p-5 bg-fm-surface border border-fm-border rounded-xl"
                        >
                          <div className="w-11 h-11 bg-white text-fm-blue rounded-xl flex items-center justify-center shrink-0 border border-fm-border">
                            <GraduationCap size={20} />
                          </div>
                          <div className="space-y-1.5 pt-0.5">
                            <p className="font-bold text-fm-ink text-[15px] leading-snug">
                              {deg.type || deg.title || deg.degree || "Titulación"}
                            </p>
                            {deg.field && (
                              <p className="text-sm font-semibold text-[#1B4FD8]">{deg.field}</p>
                            )}
                            <p className="text-sm text-[#5B6B85] font-medium">
                              {deg.university || deg.institution || ""}
                              {deg.year && <span className="ml-2 text-[#5B6B85] font-normal">({deg.year})</span>}
                            </p>
                          </div>
                        </div>
                      ))}
                    {hasAneca && (
                      <div className="flex gap-5 items-start p-5 bg-fm-surface border border-fm-border rounded-xl">
                        <div className="w-11 h-11 bg-white text-fm-blue rounded-xl flex items-center justify-center shrink-0 border border-fm-border">
                          <Award size={20} />
                        </div>
                        <div className="space-y-1.5 pt-0.5">
                          <p className="font-bold text-fm-ink text-[15px] leading-snug">
                            {faculty.aneca_accreditation}
                          </p>
                          <p className="text-sm text-[#5B6B85] font-medium">Acreditación oficial certificada</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* Experiencia docente */}
              {(faculty.current_institution || hasInstitutionsTaught || yearsExp > 0) && (
                <Section>
                  <SectionTitle icon={<Building2 size={20} />} title="Afiliaciones institucionales" />
                  <div className="grid gap-4">
                    {faculty.current_institution && (
                      <div className="flex gap-5 items-start p-5 bg-fm-surface border border-fm-border rounded-xl">
                        <div className="w-11 h-11 bg-blue-50 text-[#1B4FD8] rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                          <Building2 size={20} />
                        </div>
                        <div className="space-y-1.5 pt-0.5">
                          <p className="font-bold text-fm-ink text-[15px] leading-snug">
                            {faculty.current_institution}
                          </p>
                          {faculty.academic_level && (
                            <p className="text-sm font-semibold text-[#1B4FD8]">{faculty.academic_level}</p>
                          )}
                          {yearsExp > 0 && (
                            <p className="text-sm text-[#5B6B85] font-medium">
                              {yearsExp} años de experiencia docente
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {hasInstitutionsTaught && (
                      <div className="p-5 bg-fm-surface border border-fm-border rounded-xl space-y-3">
                        <p className="text-[11px] font-bold text-[#5B6B85]">
                          Otras instituciones
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                          {faculty.institutions_taught.map((inst: string, i: number) => (
                            <span key={i} className="rounded-lg border border-fm-border bg-fm-surface px-3 py-1.5 text-xs font-bold text-fm-ink">
                              {inst}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* Idiomas */}
              {hasLanguages && (
                <Section>
                  <SectionTitle icon={<Languages size={20} />} title="Idiomas" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {faculty.languages.map((l: any, i: number) => {
                      const name = typeof l === "string" ? l : (l.lang || l.language || l.name || "");
                      const level = typeof l === "object" ? l.level : null;
                      return name ? (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-3 p-4 bg-fm-surface border border-fm-border rounded-xl"
                        >
                          <span className="font-bold text-fm-ink text-[15px]">{name}</span>
                          {level && (
                            <span className="text-xs text-[#5B6B85] font-medium bg-white px-2.5 py-1 rounded-lg border border-fm-border">
                              {level}
                            </span>
                          )}
                        </div>
                      ) : null;
                    })}
                  </div>
                </Section>
              )}

              {/* Modalidades */}
              {hasModalities && (
                <Section>
                  <SectionTitle icon={<Globe size={20} />} title="Modalidades" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {faculty.modalities.map((mod: string) => (
                      <div
                        key={mod}
                        className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-fm-surface border border-fm-border text-fm-ink font-bold text-sm capitalize"
                      >
                        <Globe size={17} className="text-[#1B4FD8] shrink-0" /> {mod}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Investigación */}
              {hasResearch && (
                <Section>
                  <SectionTitle icon={<BookOpen size={20} />} title="Producción académica" />
                  <div className="grid gap-4">
                    {faculty.google_scholar_id && (
                      <div className="flex items-center gap-5 p-5 bg-fm-surface border border-fm-border rounded-xl">
                        <div className="w-11 h-11 bg-blue-50 text-[#1B4FD8] rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                          <BookOpen size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold text-[#5B6B85] block mb-1.5">
                            Google Scholar
                          </span>
                          <a
                            href={`https://scholar.google.com/citations?user=${faculty.google_scholar_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-[#1B4FD8] hover:underline flex items-center gap-2"
                          >
                            {faculty.google_scholar_id} <ExternalLink size={13} />
                          </a>
                        </div>
                      </div>
                    )}
                    {faculty.orcid_id && (
                      <div className="flex items-center gap-5 p-5 bg-fm-surface border border-fm-border rounded-xl">
                        <div className="w-11 h-11 bg-white text-fm-blue rounded-xl flex items-center justify-center shrink-0 border border-fm-border">
                          <Globe size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold text-[#5B6B85] block mb-1.5">
                            ORCID iD
                          </span>
                          <a
                            href={`https://orcid.org/${faculty.orcid_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-fm-blue hover:underline flex items-center gap-2"
                          >
                            {faculty.orcid_id} <ExternalLink size={13} />
                          </a>
                        </div>
                      </div>
                    )}
                    {faculty.research_publications && (
                      <div className="pt-6 border-t border-fm-border">
                        <p className="text-xs font-bold text-[#5B6B85] mb-4">
                          Publicaciones destacadas
                        </p>
                        <div className="grid gap-3">
                          {faculty.research_publications
                            .split("\n")
                            .map((line: string) => line.trim())
                            .filter(Boolean)
                            .map((pub: string, idx: number) => (
                              <div
                                key={idx}
                                className="flex gap-4 items-start p-5 bg-fm-surface border border-fm-border rounded-xl"
                              >
                                <div className="p-2 bg-white border border-fm-border rounded-xl text-[#5B6B85] shrink-0">
                                  <BookOpen size={15} className="text-[#1B4FD8]" />
                                </div>
                                <span className="text-[14px] text-[#5B6B85] leading-relaxed font-medium flex-1 min-w-0 break-words">{pub}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* Enlaces */}
              {(faculty.linkedin_url || faculty.website) && (
                <Section>
                  <SectionTitle icon={<Link2 size={20} />} title="Redes y enlaces" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {faculty.linkedin_url && (
                      <a
                        href={faculty.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-5 bg-fm-surface border border-fm-border rounded-xl hover:border-[#1B4FD8]/30 hover:bg-blue-50/40 transition-all group"
                      >
                        <div className="w-10 h-10 bg-[#0A66C2] rounded-xl flex items-center justify-center shrink-0 border border-blue-700">
                          <span className="text-white text-sm font-extrabold">in</span>
                        </div>
                        <span className="text-sm font-bold text-fm-ink group-hover:text-[#1B4FD8] flex-1">LinkedIn</span>
                        <ExternalLink size={15} className="text-slate-300 group-hover:text-[#1B4FD8] transition-colors shrink-0" />
                      </a>
                    )}
                    {faculty.website && (
                      <a
                        href={faculty.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-5 bg-fm-surface border border-fm-border rounded-xl hover:border-[#1B4FD8]/30 hover:bg-blue-50/40 transition-all group"
                      >
                        <div className="w-10 h-10 bg-white border border-fm-border rounded-xl flex items-center justify-center shrink-0">
                          <Globe size={17} className="text-[#5B6B85]" />
                        </div>
                        <span className="text-sm font-bold text-fm-ink group-hover:text-[#1B4FD8] flex-1 truncate">
                          {faculty.website.replace(/^https?:\/\//, "")}
                        </span>
                        <ExternalLink size={15} className="text-slate-300 group-hover:text-[#1B4FD8] transition-colors shrink-0" />
                      </a>
                    )}
                  </div>
                </Section>
              )}
            </div>

            {/* ── RIGHT: Sidebar ── */}
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 self-start">

              {/* Contact CTA */}
              <div className="space-y-5 rounded-[20px] bg-fm-navy p-7 text-white">
                <div>
                  <p className="mb-2 text-sm font-bold text-[#9DB8FF]">¿Eres una institución?</p>
                  <h3 className="mb-2.5 text-xl font-extrabold leading-snug tracking-[-0.02em]">
                    Contacta con {fullName.split(" ")[0]}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/70">
                    Regístrate en FacultyMatch para enviar propuestas, ver datos de contacto
                    y conectar con este docente.
                  </p>
                </div>

                <Link
                  href="/signup?role=institution"
                  className="flex w-full items-center justify-center gap-2.5 rounded-[10px] bg-white py-3.5 text-sm font-bold text-fm-ink transition-opacity hover:opacity-90 active:scale-[0.98]"
                >
                  <UserPlus size={16} /> Contactar a través de FacultyMatch
                </Link>

                <Link
                  href="/login"
                  className="flex w-full items-center justify-center rounded-[10px] border border-white/25 py-3 text-sm font-semibold text-white/80 transition-colors hover:text-white"
                >
                  Ya tengo cuenta: Acceder
                </Link>
              </div>

              {/* Verification badges */}
              <div className="space-y-4 rounded-[20px] border border-fm-border bg-white p-6">
                <p className="text-sm font-bold text-fm-ink">Verificaciones</p>
                <div className="space-y-3">
                  {isPhd && (
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="shrink-0 text-fm-blue" />
                      <div>
                        <p className="text-sm font-bold text-fm-ink">Doctorado</p>
                        <p className="text-xs text-[#5B6B85]">Título de doctor verificado</p>
                      </div>
                    </div>
                  )}
                  {hasAneca && (
                    <div className="flex items-center gap-3">
                      <Award size={18} className="shrink-0 text-fm-blue" />
                      <div>
                        <p className="text-sm font-bold text-fm-ink">ANECA</p>
                        <p className="text-xs text-[#5B6B85]">Acreditación verificada</p>
                      </div>
                    </div>
                  )}
                  {!isPhd && !hasAneca && (
                    <p className="text-sm text-[#5B6B85]">Sin verificaciones adicionales</p>
                  )}
                </div>
              </div>

              {/* Faculty areas (compact) */}
              {hasFacultyAreas && (
                <div className="bg-white rounded-[20px] border border-fm-border p-6 space-y-4">
                  <p className="text-[11px] font-extrabold text-[#5B6B85]">Materias</p>
                  <div className="flex flex-wrap gap-2">
                    {faculty.faculty_areas.slice(0, 8).map((area: string) => (
                      <span
                        key={area}
                        className="text-[11px] font-bold bg-fm-surface border border-fm-border text-[#5B6B85] px-2.5 py-1.5 rounded-lg"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Section helpers ─────────────────────────────────────────────────────────

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-3xl border border-slate-200/80 shadow-sm p-7 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h2 className="mb-6 flex items-center gap-3 text-lg font-bold tracking-[-0.02em] text-fm-ink">
      <span className="shrink-0 text-fm-blue">{icon}</span>
      {title}
    </h2>
  );
}
