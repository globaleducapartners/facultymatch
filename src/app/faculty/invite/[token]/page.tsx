import { createAdminClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import {
  MapPin, GraduationCap, Briefcase, Languages, Clock,
  CheckCircle2, Building2, ArrowRight, ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const admin = createAdminClient();
  const { data: fp } = await admin
    .from("faculty_profiles")
    .select("full_name, headline")
    .eq("profile_token", token)
    .maybeSingle();

  if (!fp) return { title: "Perfil no disponible | FacultyMatch" };
  return {
    title: `${fp.full_name || "Docente"} | FacultyMatch`,
    description: fp.headline || "Perfil docente en FacultyMatch",
  };
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: fp } = await admin
    .from("faculty_profiles")
    .select(`
      id, user_id, full_name, headline, bio,
      faculty_areas, availability, location, city, country,
      languages, institutions_taught, years_experience,
      is_phd, academic_level, linkedin_url, avatar_url
    `)
    .eq("profile_token", token)
    .maybeSingle();

  if (!fp) notFound();

  // Fallback name from user_profiles
  const { data: up } = await admin
    .from("user_profiles")
    .select("full_name, avatar_url")
    .eq("id", fp.user_id)
    .maybeSingle();

  const name = fp.full_name || up?.full_name || "Docente";
  const initials = name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase();
  const areas = (fp.faculty_areas as string[] | null) || [];
  const langs = (fp.languages as Array<{ lang: string; level: string }> | string[] | null) || [];
  const institutions = (fp.institutions_taught as string[] | null) || [];

  const availabilityLabel: Record<string, string> = {
    open: "Disponible inmediatamente",
    next_semester: "Desde próximo semestre",
    occasional: "Asignaturas puntuales",
    weekends: "Solo fines de semana / intensivos",
    online_only: "Solo online",
    limited: "Disponible en 6 meses",
    invite_only: "Solo por invitación directa",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-black text-navy text-xl tracking-tight">
          Faculty<span className="text-talentia-blue">Match</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-bold text-gray-500 hover:text-navy transition-colors"
          >
            Ya tengo cuenta
          </Link>
          <Link
            href="/signup/institution"
            className="inline-flex items-center gap-2 bg-talentia-blue hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            Registrarme <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Profile header */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-20 h-20 rounded-2xl bg-talentia-blue text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-lg shadow-blue-100">
            {initials}
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-navy">{name}</h1>
                {fp.is_phd && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-talentia-blue text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                    <ShieldCheck size={11} /> PhD
                  </span>
                )}
              </div>
              {fp.headline && (
                <p className="text-gray-500 font-medium">{fp.headline}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-400">
              {(fp.city || fp.country || fp.location) && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-talentia-blue" />
                  {fp.city && fp.country ? `${fp.city}, ${fp.country}` : fp.location}
                </span>
              )}
              {(fp.years_experience ?? 0) > 0 && (
                <span className="flex items-center gap-1.5">
                  <Briefcase size={14} className="text-talentia-blue" />
                  {fp.years_experience} años de experiencia
                </span>
              )}
              {fp.academic_level && (
                <span className="flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-talentia-blue" />
                  {fp.academic_level}
                </span>
              )}
            </div>
            {areas.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {areas.map((a) => (
                  <span
                    key={a}
                    className="bg-blue-50 text-talentia-blue text-xs font-bold px-3 py-1 rounded-full"
                  >
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Bio */}
          {fp.bio && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Sobre mí</h2>
              <p className="text-sm text-gray-600 font-medium leading-relaxed whitespace-pre-line line-clamp-6">
                {fp.bio}
              </p>
            </div>
          )}

          {/* Availability + Languages */}
          <div className="space-y-4">
            {fp.availability && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-2">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Disponibilidad</h2>
                <p className="flex items-center gap-2 text-sm font-bold text-navy">
                  <Clock size={15} className="text-energy-orange" />
                  {availabilityLabel[fp.availability] || fp.availability}
                </p>
              </div>
            )}

            {langs.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">
                  <span className="flex items-center gap-1.5"><Languages size={13} /> Idiomas</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {langs.map((l, i) => {
                    const label = typeof l === "string" ? l : `${l.lang} (${l.level})`;
                    return (
                      <span key={i} className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Institutions */}
        {institutions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">
              <span className="flex items-center gap-1.5"><Building2 size={13} /> Docencia impartida en</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {institutions.map((inst) => (
                <span key={inst} className="bg-gray-50 border border-gray-100 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                  {inst}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA block */}
        <div className="bg-navy rounded-3xl p-8 lg:p-12 text-white text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-tech-cyan">Contactar a este docente</p>
            <h2 className="text-2xl lg:text-3xl font-black leading-tight">
              ¿Interesado en colaborar con {name.split(" ")[0]}?
            </h2>
            <p className="text-gray-300 font-medium max-w-md mx-auto">
              Regístrate como institución para acceder al perfil completo y enviar una propuesta directamente.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup/institution"
              className="inline-flex items-center gap-2 bg-energy-orange hover:bg-orange-500 text-white font-black text-sm px-8 py-4 rounded-2xl transition-colors shadow-xl shadow-orange-900/30"
            >
              Crear cuenta de institución <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="text-sm font-bold text-gray-300 hover:text-white transition-colors py-4"
            >
              Ya tengo cuenta →
            </Link>
          </div>
          <div className="relative z-10 flex items-center justify-center gap-6 pt-2 text-[10px] font-black uppercase tracking-widest text-tech-cyan">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Registro gratuito</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> Plataforma verificada</span>
          </div>
        </div>
      </main>

    </div>
  );
}
