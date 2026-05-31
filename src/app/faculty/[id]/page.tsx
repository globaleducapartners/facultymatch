import { createAdminClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import {
  GraduationCap, Globe, MapPin, Award, Briefcase, BookOpen,
  CheckCircle2, ShieldCheck, Lock, Star, Languages, ExternalLink,
  UserPlus, Sparkles, Building2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

const AVAIL_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  open:          { label: "Disponible ahora",     color: "#059669", bg: "#F0FDF4" },
  next_semester: { label: "Próximo semestre",      color: "#0891B2", bg: "#EFF9FF" },
  occasional:    { label: "Asignaturas puntuales", color: "#7C3AED", bg: "#F5F3FF" },
  weekends:      { label: "Fines de semana",       color: "#D97706", bg: "#FFFBEB" },
  online_only:   { label: "Solo online",           color: "#1B4FD8", bg: "#EFF6FF" },
  limited:       { label: "En 6 meses",            color: "#6B7280", bg: "#F3F4F6" },
  invite_only:   { label: "Por invitación",        color: "#0D2240", bg: "#EEF4FF" },
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: faculty } = await admin.from("faculty_profiles").select("full_name, headline").eq("id", id).single();
  const { data: up } = await admin.from("user_profiles").select("full_name").eq("id", id).single();
  const name = up?.full_name || faculty?.full_name || "Docente";
  return {
    title: `${name} | FacultyMatch`,
    description: faculty?.headline || `Perfil académico de ${name} en FacultyMatch`,
  };
}

export default async function PublicFacultyProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const [
    { data: faculty },
    { data: userProfile },
  ] = await Promise.all([
    admin.from("faculty_profiles").select(`
      *,
      expertise:faculty_expertise(*),
      links:faculty_links(*)
    `).eq("id", id).neq("visibility", "hidden").single(),
    admin.from("user_profiles").select("full_name, avatar_url").eq("id", id).single(),
  ]);

  if (!faculty) return notFound();

  const fullName = userProfile?.full_name || (faculty as any).full_name || "Docente";
  const avatarUrl = userProfile?.avatar_url || null;
  const initials = fullName.substring(0, 2).toUpperCase();
  const avail = faculty.availability ? (AVAIL_LABELS[faculty.availability] || null) : null;
  const isVerified = faculty.verified && faculty.verified !== "none";
  const locationStr = [faculty.city, faculty.country || faculty.location].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black">FM</span>
            </div>
            <span className="font-black text-navy text-sm hidden sm:block">FacultyMatch</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-bold text-navy hover:text-talentia-blue transition-colors">
              Acceder
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 bg-talentia-blue hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
            >
              <UserPlus size={14} /> Registrarse
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Hero card */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* Cover */}
          <div className="h-28 bg-gradient-to-br from-[#0D2240] via-[#1B4FD8] to-[#2563EB]" />

          <div className="px-6 sm:px-10 pb-8">
            {/* Avatar + name */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-6">
              <div className="relative w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-navy flex items-center justify-center flex-shrink-0">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={fullName} fill sizes="96px" className="object-cover" />
                ) : (
                  <span className="text-white text-2xl font-black">{initials}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black text-navy">{fullName}</h1>
                  {(faculty as any).is_phd && (
                    <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">PhD</span>
                  )}
                  {isVerified && (
                    <Badge className="bg-blue-50 text-talentia-blue border-none text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle2 size={9} /> Verificado
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 font-medium">{faculty.headline || "Docente académico"}</p>
                <div className="flex flex-wrap gap-4 mt-2">
                  {locationStr && (
                    <span className="flex items-center gap-1 text-sm text-gray-400 font-medium">
                      <MapPin size={13} /> {locationStr}
                    </span>
                  )}
                  {avail && (
                    <span className="text-xs font-black px-3 py-1 rounded-full" style={{ color: avail.color, background: avail.bg }}>
                      {avail.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {faculty.bio && (
              <p className="text-gray-600 leading-relaxed max-w-3xl">{faculty.bio}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Expertise */}
            {Array.isArray(faculty.expertise) && faculty.expertise.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <BookOpen size={13} /> Áreas de especialización
                </h2>
                <div className="flex flex-wrap gap-2">
                  {faculty.expertise.map((exp: any) => {
                    const area = typeof exp.area === "string" ? exp.area : exp.area?.name ?? "";
                    const sub = typeof exp.subarea === "string" ? exp.subarea : exp.subarea?.name ?? "";
                    const label = [area, sub].filter(Boolean).join(": ");
                    return label ? (
                      <Badge key={exp.id ?? label} variant="secondary" className="bg-blue-50 text-talentia-blue border-blue-100 font-bold text-xs px-3 py-1 rounded-xl">
                        {label}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Degrees */}
            {Array.isArray((faculty as any).degrees) && (faculty as any).degrees.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <GraduationCap size={13} /> Formación académica
                </h2>
                <div className="space-y-4">
                  {(faculty as any).degrees.map((deg: any, i: number) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-10 h-10 bg-blue-50 text-talentia-blue rounded-xl flex items-center justify-center flex-shrink-0">
                        <GraduationCap size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-navy">{deg.type || deg.title || "Titulación"}</p>
                        {deg.field && <p className="text-sm font-medium text-talentia-blue">{deg.field}</p>}
                        <p className="text-sm text-gray-500 font-medium">
                          {deg.university || ""}
                          {deg.year && <span className="ml-2 text-gray-400">({deg.year})</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(faculty as any).aneca_accreditation && (
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Award size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-navy">{(faculty as any).aneca_accreditation}</p>
                        <p className="text-sm text-gray-500 font-medium">Acreditación ANECA</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Experience / languages */}
            {((faculty as any).experience_years > 0 || (faculty as any).years_teaching > 0 || Array.isArray(faculty.languages)) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Briefcase size={13} /> Experiencia
                </h2>
                <div className="flex flex-wrap gap-4">
                  {((faculty as any).experience_years || (faculty as any).years_teaching) > 0 && (
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                      <Briefcase size={15} className="text-talentia-blue" />
                      <span className="text-sm font-bold text-navy">
                        {(faculty as any).experience_years || (faculty as any).years_teaching} años de experiencia
                      </span>
                    </div>
                  )}
                  {Array.isArray(faculty.languages) && faculty.languages.length > 0 && (
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                      <Globe size={15} className="text-talentia-blue" />
                      <span className="text-sm font-bold text-navy">
                        {faculty.languages.map((l: any) => typeof l === "string" ? l : l.lang ?? l.language ?? "").filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: CTA sidebar */}
          <div className="space-y-4">
            {/* Sign up CTA */}
            <div className="bg-gradient-to-br from-[#0D2240] to-[#1B4FD8] rounded-2xl p-6 text-white space-y-4 shadow-xl shadow-blue-200">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-blue-300" />
                <p className="text-xs font-black uppercase tracking-widest text-blue-300">¿Eres una institución?</p>
              </div>
              <h3 className="text-lg font-black leading-snug">Contacta directamente con {fullName.split(" ")[0]}</h3>
              <p className="text-sm text-blue-200 font-medium leading-relaxed">
                Regístrate en FacultyMatch para enviar propuestas, ver datos de contacto y mucho más.
              </p>
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 w-full bg-white text-navy font-black py-3 rounded-xl hover:bg-gray-100 transition-colors text-sm"
              >
                <UserPlus size={15} /> Crear cuenta gratuita
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full bg-white/10 text-white font-bold py-2.5 rounded-xl hover:bg-white/20 transition-colors text-sm"
              >
                Ya tengo cuenta → Acceder
              </Link>
            </div>

            {/* Blurred contact info for non-logged users */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Lock size={11} /> Datos de contacto
                </p>
              </div>
              <div className="p-4 space-y-3 relative">
                {/* Blurred placeholder rows */}
                {["Email profesional", "Teléfono / WhatsApp", "LinkedIn"].map((label) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Lock size={13} className="text-gray-300" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                      <div className="h-3 bg-gray-100 rounded-full blur-sm w-32" />
                    </div>
                  </div>
                ))}
                {/* Overlay */}
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                  <Link
                    href="/login"
                    className="flex items-center gap-2 bg-talentia-blue text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-lg hover:bg-blue-700 transition-colors"
                  >
                    <Sparkles size={13} /> Ver datos de contacto
                  </Link>
                </div>
              </div>
            </div>

            {/* Faculty areas */}
            {Array.isArray((faculty as any).faculty_areas) && (faculty as any).faculty_areas.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Materias</p>
                <div className="flex flex-wrap gap-1.5">
                  {(faculty as any).faculty_areas.slice(0, 6).map((area: any) => {
                    const label = typeof area === "string" ? area : area?.name ?? "";
                    return label ? (
                      <span key={label} className="text-[10px] font-bold bg-gray-50 border border-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                        {label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-100 bg-white px-4 py-8 text-center">
        <p className="text-sm text-gray-400 font-medium">
          <span className="font-black text-navy">FACULTY<span className="text-talentia-blue">MATCH</span></span>
          {" · "}La plataforma académica de referencia{" · "}
          <a href="https://www.facultymatch.app" className="hover:underline text-talentia-blue">www.facultymatch.app</a>
        </p>
      </footer>
    </div>
  );
}
