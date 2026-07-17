import { createAdminClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  GraduationCap, MapPin, Award, BookOpen, ExternalLink,
  CheckCircle2, Building2, Sparkles, Globe, UserPlus, Shield,
  ChevronRight, FileText, CalendarCheck, Languages, Link2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

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
    .select("id, headline, current_institution")
    .eq("profile_slug", slug)
    .eq("visibility", "public")
    .eq("is_active", true)
    .maybeSingle();

  if (!faculty) return {};

  const { data: up } = await admin
    .from("user_profiles")
    .select("full_name, avatar_url")
    .eq("id", faculty.id)
    .maybeSingle();

  const name = up?.full_name || "Docente";
  const description = faculty?.headline
    ? `${faculty.headline}${faculty?.current_institution ? ` — ${faculty.current_institution}` : ""}`
    : `Perfil académico de ${name} en FacultyMatch`;

  return {
    title: `${name} | FacultyMatch`,
    description,
    openGraph: {
      title: `${name} | FacultyMatch`,
      description,
      type: "profile",
      url: `${BASE}/docentes/${slug}`,
      images: up?.avatar_url ? [{ url: up.avatar_url, width: 400, height: 400 }] : undefined,
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

  // Fetch faculty profile — security-critical: filter in query, not just UI
  const { data: faculty } = await admin
    .from("faculty_profiles")
    .select(`*, expertise:faculty_expertise(*)`)
    .eq("profile_slug", slug)
    .eq("visibility", "public")
    .eq("is_active", true)
    .maybeSingle();

  // If not found or not public → 404
  if (!faculty) notFound();

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
  const initials = fullName.substring(0, 2).toUpperCase();
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: fullName,
    ...(faculty.headline ? { jobTitle: faculty.headline } : {}),
    ...(faculty.current_institution ? {
      affiliation: {
        "@type": "Organization",
        name: faculty.current_institution,
      },
    } : {}),
    ...(locationStr ? { address: { "@type": "PostalAddress", addressLocality: locationStr } } : {}),
    url: `${BASE}/docentes/${slug}`,
    ...(faculty.google_scholar_id ? { sameAs: `https://scholar.google.com/citations?user=${faculty.google_scholar_id}` } : {}),
    ...(faculty.orcid_id ? { sameAs: `https://orcid.org/${faculty.orcid_id}` } : {}),
    ...(faculty.linkedin_url ? { sameAs: faculty.linkedin_url } : {}),
    ...(faculty.website ? { sameAs: faculty.website } : {}),
  };

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#F8FAFC]">
        {/* ── Navbar ── */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#0D2240] rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-black">FM</span>
              </div>
              <span className="font-black text-[#0D2240] text-sm">FacultyMatch</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-bold text-[#0D2240] hover:text-[#1B4FD8] transition-colors"
              >
                Acceder
              </Link>
              <Link
                href="/signup?role=institution"
                className="flex items-center gap-1.5 bg-[#1B4FD8] hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
              >
                <UserPlus size={14} /> Registrarse
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-6 pt-8 pb-16 space-y-10">

          {/* ── Breadcrumb ── */}
          <nav className="flex items-center gap-2 text-sm font-semibold text-slate-400">
            <Link href="/" className="hover:text-[#1B4FD8] transition-colors">Inicio</Link>
            <ChevronRight size={14} />
            <span className="text-[#0D2240] font-bold truncate max-w-[250px]">{fullName}</span>
          </nav>

          {/* ── HERO CARD ── */}
          <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Cover */}
            <div className="relative h-40 sm:h-52 overflow-hidden bg-gradient-to-br from-[#0D2240] via-[#1B4FD8] to-[#2563EB]">
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

            <div className="px-8 sm:px-12 pb-10">
              {/* Avatar + name row */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-14 mb-8">
                <div className="relative w-28 h-28 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-[#0D2240] flex items-center justify-center flex-shrink-0">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={fullName}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-white text-3xl font-black">{initials}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <h1 className="text-3xl sm:text-[2.5rem] font-black text-[#0D2240] leading-tight">{fullName}</h1>
                    {isPhd && (
                      <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold px-3 py-1 rounded-full">
                        PhD
                      </Badge>
                    )}
                    {hasAneca && (
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                        <Award size={11} /> ANECA
                      </Badge>
                    )}
                  </div>
                  {faculty.headline && (
                    <p className="text-lg text-slate-500 font-semibold leading-snug">
                      {faculty.headline}
                    </p>
                  )}
                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm font-medium text-slate-500">
                    {faculty.current_institution && (
                      <span className="flex items-center gap-2">
                        <Building2 size={16} className="text-[#1B4FD8] shrink-0" />
                        <span className="text-[#0D2240] font-semibold">{faculty.current_institution}</span>
                      </span>
                    )}
                    {locationStr && (
                      <span className="flex items-center gap-2">
                        <MapPin size={16} className="text-[#1B4FD8] shrink-0" />
                        <span>{locationStr}</span>
                      </span>
                    )}
                    {yearsExp > 0 && (
                      <span className="flex items-center gap-2">
                        <CalendarCheck size={16} className="text-[#1B4FD8] shrink-0" />
                        <span>{yearsExp}+ años de experiencia</span>
                      </span>
                    )}
                    {avail && (
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full"
                        style={{ color: avail.color, background: avail.bg }}
                      >
                        <Sparkles size={12} /> {avail.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {faculty.bio && (
                <div className="max-w-3xl pt-6 border-t border-slate-100">
                  <p className="text-slate-500 leading-relaxed text-[15px] whitespace-pre-line">
                    {faculty.bio}
                  </p>
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
                          className="flex gap-5 items-start p-5 bg-slate-50/70 border border-slate-100 rounded-2xl"
                        >
                          <div className="w-2 h-2 rounded-full bg-[#1B4FD8] mt-2.5 shrink-0" />
                          <div className="space-y-2 min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-[#1B4FD8] uppercase tracking-wider">
                              {exp.area}
                            </p>
                            {exp.subarea && (
                              <p className="font-bold text-[#0D2240] text-base leading-snug">{exp.subarea}</p>
                            )}
                            {Array.isArray(exp.topics) && exp.topics.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {exp.topics.map((t: string) => (
                                  <span
                                    key={t}
                                    className="text-[11px] font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600"
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
                        <Badge
                          key={area}
                          className="bg-blue-50 text-[#1B4FD8] border-blue-200 px-4 py-2 rounded-xl text-xs font-bold"
                        >
                          {area}
                        </Badge>
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
                          className="flex gap-5 items-start p-5 bg-slate-50/70 border border-slate-100 rounded-2xl"
                        >
                          <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0 border border-purple-100">
                            <GraduationCap size={20} />
                          </div>
                          <div className="space-y-1.5 pt-0.5">
                            <p className="font-bold text-[#0D2240] text-[15px] leading-snug">
                              {deg.type || deg.title || deg.degree || "Titulación"}
                            </p>
                            {deg.field && (
                              <p className="text-sm font-semibold text-[#1B4FD8]">{deg.field}</p>
                            )}
                            <p className="text-sm text-slate-500 font-medium">
                              {deg.university || deg.institution || ""}
                              {deg.year && <span className="ml-2 text-slate-400 font-normal">({deg.year})</span>}
                            </p>
                          </div>
                        </div>
                      ))}
                    {hasAneca && (
                      <div className="flex gap-5 items-start p-5 bg-slate-50/70 border border-slate-100 rounded-2xl">
                        <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 border border-amber-100">
                          <Award size={20} />
                        </div>
                        <div className="space-y-1.5 pt-0.5">
                          <p className="font-bold text-[#0D2240] text-[15px] leading-snug">
                            {faculty.aneca_accreditation}
                          </p>
                          <p className="text-sm text-slate-500 font-medium">Acreditación oficial certificada</p>
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
                      <div className="flex gap-5 items-start p-5 bg-slate-50/70 border border-slate-100 rounded-2xl">
                        <div className="w-11 h-11 bg-blue-50 text-[#1B4FD8] rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                          <Building2 size={20} />
                        </div>
                        <div className="space-y-1.5 pt-0.5">
                          <p className="font-bold text-[#0D2240] text-[15px] leading-snug">
                            {faculty.current_institution}
                          </p>
                          {faculty.academic_level && (
                            <p className="text-sm font-semibold text-[#1B4FD8]">{faculty.academic_level}</p>
                          )}
                          {yearsExp > 0 && (
                            <p className="text-sm text-slate-500 font-medium">
                              {yearsExp} años de experiencia docente
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {hasInstitutionsTaught && (
                      <div className="p-5 bg-slate-50/70 border border-slate-100 rounded-2xl space-y-3">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Otras instituciones
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                          {faculty.institutions_taught.map((inst: string, i: number) => (
                            <Badge
                              key={i}
                              className="bg-white text-[#0D2240] border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold"
                            >
                              {inst}
                            </Badge>
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
                          className="flex items-center justify-between gap-3 p-4 bg-slate-50/70 border border-slate-100 rounded-2xl"
                        >
                          <span className="font-bold text-[#0D2240] text-[15px]">{name}</span>
                          {level && (
                            <span className="text-xs text-slate-400 font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-200">
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
                        className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 text-[#0D2240] font-bold text-sm capitalize"
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
                      <div className="flex items-center gap-5 p-5 bg-slate-50/70 border border-slate-100 rounded-2xl">
                        <div className="w-11 h-11 bg-blue-50 text-[#1B4FD8] rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                          <BookOpen size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
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
                      <div className="flex items-center gap-5 p-5 bg-slate-50/70 border border-slate-100 rounded-2xl">
                        <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
                          <Globe size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            ORCID iD
                          </span>
                          <a
                            href={`https://orcid.org/${faculty.orcid_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-emerald-700 hover:underline flex items-center gap-2"
                          >
                            {faculty.orcid_id} <ExternalLink size={13} />
                          </a>
                        </div>
                      </div>
                    )}
                    {faculty.research_publications && (
                      <div className="pt-6 border-t border-slate-200/80">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
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
                                className="flex gap-4 items-start p-5 bg-slate-50/70 border border-slate-100 rounded-2xl"
                              >
                                <div className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 shrink-0">
                                  <BookOpen size={15} className="text-[#1B4FD8]" />
                                </div>
                                <span className="text-[14px] text-slate-600 leading-relaxed font-medium flex-1 min-w-0 break-words">{pub}</span>
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
                        className="flex items-center gap-4 p-5 bg-slate-50/70 border border-slate-100 rounded-2xl hover:border-[#1B4FD8]/30 hover:bg-blue-50/40 transition-all group"
                      >
                        <div className="w-10 h-10 bg-[#0A66C2] rounded-xl flex items-center justify-center shrink-0 border border-blue-700">
                          <span className="text-white text-sm font-black">in</span>
                        </div>
                        <span className="text-sm font-bold text-[#0D2240] group-hover:text-[#1B4FD8] flex-1">LinkedIn</span>
                        <ExternalLink size={15} className="text-slate-300 group-hover:text-[#1B4FD8] transition-colors shrink-0" />
                      </a>
                    )}
                    {faculty.website && (
                      <a
                        href={faculty.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-5 bg-slate-50/70 border border-slate-100 rounded-2xl hover:border-[#1B4FD8]/30 hover:bg-blue-50/40 transition-all group"
                      >
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shrink-0">
                          <Globe size={17} className="text-slate-500" />
                        </div>
                        <span className="text-sm font-bold text-[#0D2240] group-hover:text-[#1B4FD8] flex-1 truncate">
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
              <div className="bg-gradient-to-br from-[#0D2240] to-[#1B4FD8] rounded-[2rem] p-7 sm:p-8 text-white space-y-5 shadow-xl relative overflow-hidden border border-white/10">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Building2 size={16} className="text-blue-300" />
                    <p className="text-[11px] font-black uppercase tracking-widest text-blue-300">
                      ¿Eres una institución?
                    </p>
                  </div>
                  <h3 className="text-xl font-black leading-snug mb-2.5">
                    Contacta con {fullName.split(" ")[0]}
                  </h3>
                  <p className="text-sm text-blue-200 font-medium leading-relaxed">
                    Regístrate en FacultyMatch para enviar propuestas, ver datos de contacto
                    y conectar con este docente.
                  </p>
                </div>

                <Link
                  href="/signup?role=institution"
                  className="flex items-center justify-center gap-2.5 w-full bg-white text-[#0D2240] font-black py-4 rounded-2xl hover:bg-gray-100 transition-colors text-sm shadow-lg"
                >
                  <UserPlus size={16} /> Contactar a través de FacultyMatch
                </Link>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2.5 w-full bg-white/10 text-white font-bold py-3.5 rounded-2xl hover:bg-white/20 transition-colors text-sm border border-white/10"
                >
                  Ya tengo cuenta — Acceder
                </Link>
              </div>

              {/* Verification badges */}
              <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-2.5">
                  <Shield size={13} className="text-slate-400" />
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Verificaciones
                  </p>
                </div>
                <div className="space-y-4">
                  {isPhd && (
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0 border border-purple-100">
                        <CheckCircle2 size={18} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0D2240]">Doctorado</p>
                        <p className="text-[11px] font-medium text-slate-400">Título de doctor verificado</p>
                      </div>
                    </div>
                  )}
                  {hasAneca && (
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 border border-amber-100">
                        <Award size={18} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0D2240]">ANECA</p>
                        <p className="text-[11px] font-medium text-slate-400">Acreditación verificada</p>
                      </div>
                    </div>
                  )}
                  {!isPhd && !hasAneca && (
                    <p className="text-sm text-slate-400 font-medium">Sin verificaciones adicionales</p>
                  )}
                </div>
              </div>

              {/* Faculty areas (compact) */}
              {hasFacultyAreas && (
                <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-sm p-6 space-y-4">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Materias</p>
                  <div className="flex flex-wrap gap-2">
                    {faculty.faculty_areas.slice(0, 8).map((area: string) => (
                      <span
                        key={area}
                        className="text-[11px] font-bold bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1.5 rounded-lg"
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

        {/* ── Footer ── */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-10 text-center">
            <p className="text-sm text-slate-400 font-medium">
              <span className="font-black text-[#0D2240]">FACULTY<span className="text-[#1B4FD8]">MATCH</span></span>
              {" · "}La plataforma académica de referencia{" · "}
              <a href="https://www.facultymatch.app" className="hover:underline text-[#1B4FD8]">
                www.facultymatch.app
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

// ── Section helpers ─────────────────────────────────────────────────────────

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-[2rem] border border-slate-200/80 shadow-sm p-7 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h2 className="flex items-center gap-3 text-lg font-bold text-[#0D2240] tracking-tight mb-6">
      <div className="p-2.5 bg-blue-50 text-[#1B4FD8] rounded-[0.75rem] shrink-0">{icon}</div>
      {title}
    </h2>
  );
}
