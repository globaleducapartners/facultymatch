import { createAdminClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, ShieldCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { buildCredentialId, generateVerificationHash, shortenHash } from "@/lib/verification";

const BASE = "https://www.facultymatch.app";

// Página pública de verificación de credencial — a la que apunta el enlace
// "Mostrar credencial" cuando alguien sube su certificado a LinkedIn.
//
// A propósito NO exige visibility='public' (a diferencia de /docentes/[slug],
// que es el directorio navegable): un docente puede haber elegido perfil
// privado —no aparecer en búsquedas de instituciones— y aun así querer
// enseñar su insignia de verificado en LinkedIn sin que eso lo meta en el
// directorio. Lo único que exige de verdad es que esté realmente
// verificado.
async function getVerifiedFaculty(slug: string) {
  const admin = createAdminClient();
  const { data: faculty } = await admin
    .from("faculty_profiles")
    .select(
      "id, headline, current_institution, academic_level, years_experience, is_phd, aneca_accreditation, orcid_id, profile_slug, visibility, estado_perfil, verificado_en"
    )
    .eq("profile_slug", slug)
    .eq("estado_perfil", "verificado")
    .maybeSingle();

  if (!faculty || !faculty.verificado_en) return null;

  const { data: userProfile } = await admin
    .from("user_profiles")
    .select("full_name")
    .eq("id", faculty.id)
    .maybeSingle();

  return { faculty, fullName: userProfile?.full_name || "Docente" };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getVerifiedFaculty(slug);
  if (!result) return {};

  const title = `Credencial verificada de ${result.fullName} | FacultyMatch`;
  const description = `Verificación de perfil académico de ${result.fullName} en FacultyMatch.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE}/verificar/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function VerificationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getVerifiedFaculty(slug);
  if (!result) notFound();

  const { faculty, fullName } = result;
  const issuedDate = new Date(faculty.verificado_en as string).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const hash = generateVerificationHash(fullName, faculty.verificado_en as string, faculty.profile_slug);
  const credentialId = buildCredentialId(fullName, faculty.verificado_en as string, faculty.profile_slug);

  const facts: string[] = [];
  if (faculty.academic_level) facts.push(`Nivel académico: ${faculty.academic_level}`);
  if (faculty.is_phd) facts.push("Doctorado confirmado");
  if (faculty.orcid_id) facts.push("ORCID vinculado");
  if (faculty.aneca_accreditation) facts.push(`Acreditación ${faculty.aneca_accreditation}`);
  if (faculty.current_institution) facts.push(`Institución actual: ${faculty.current_institution}`);
  if (faculty.years_experience && faculty.years_experience > 0)
    facts.push(`${faculty.years_experience}+ años de experiencia`);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 h-16">
          <Logo />
          <Link
            href="/login"
            className="text-sm font-bold text-[#0D2240] hover:text-[#1B4FD8] transition-colors"
          >
            Acceder
          </Link>
        </div>
      </nav>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-14">
        <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-sm p-8 sm:p-12">

          <div className="flex flex-col items-center text-center gap-4 mb-10">
            <div className="w-16 h-16 rounded-full bg-[#F7E8C8] border border-[#E9C77A] flex items-center justify-center">
              <ShieldCheck size={28} className="text-[#E9A030]" strokeWidth={2.2} />
            </div>
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#E9A030] mb-2">
                Credencial verificada
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0D2240] tracking-tight">{fullName}</h1>
              {faculty.headline && (
                <p className="text-[#1B4FD8] font-bold text-sm mt-1">{faculty.headline}</p>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-500 leading-relaxed text-center max-w-lg mx-auto mb-8">
            FacultyMatch confirma que este perfil académico ha sido revisado y verificado por
            nuestro equipo, mediante fuentes públicas —incluyendo ORCID— y la documentación
            aportada por el propio docente.
          </p>

          {facts.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {facts.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-3.5 py-1.5 text-xs font-bold text-[#0D2240]"
                >
                  <CheckCircle2 size={13} className="text-[#1B4FD8]" />
                  {f}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-6 mb-6 text-center sm:text-left">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">
                Fecha de emisión
              </p>
              <p className="text-sm font-bold text-[#0D2240]">{issuedDate}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">
                ID de credencial
              </p>
              <p className="text-sm font-bold text-[#0D2240]">{credentialId}</p>
            </div>
          </div>

          <div className="bg-[#F7E8C8]/40 border border-[#E9C77A]/60 rounded-xl px-4 py-3 text-center mb-8">
            <p className="font-mono text-[10px] text-[#0D2240]/70">{shortenHash(hash)}</p>
          </div>

          {faculty.visibility === "public" ? (
            <div className="text-center">
              <Link
                href={`/docentes/${faculty.profile_slug}`}
                className="inline-flex items-center gap-2 bg-[#1B4FD8] hover:bg-blue-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Ver perfil público completo <ExternalLink size={14} />
              </Link>
            </div>
          ) : (
            <p className="text-center text-xs text-slate-400 font-medium">
              Este docente ha elegido mantener su perfil privado — no aparece en el directorio,
              pero su verificación es real.
            </p>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 font-medium mt-8">
          ¿Tienes dudas sobre esta credencial? Escríbenos a{" "}
          <a href="mailto:support@facultymatch.app" className="text-[#1B4FD8] hover:underline">
            support@facultymatch.app
          </a>
        </p>
      </div>
    </div>
  );
}
