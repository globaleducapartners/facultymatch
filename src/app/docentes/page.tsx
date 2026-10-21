import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-server";
import { Navbar } from "@/components/layout/Navbar";
import { SITE_URL } from "@/lib/seo";

// Índice público: solo perfiles verificados y que su titular ha hecho públicos
// (los mismos que ya tienen ficha en /docentes/[slug]). Se regenera cada 5 min
// y al instante cuando cambia la visibilidad o la verificación de un perfil.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Directorio de docentes y expertos verificados | FacultyMatch",
  description:
    "Docentes, investigadores y expertos con perfil verificado para universidades y escuelas de negocio. Explora por área de conocimiento y contacta con las instituciones.",
  alternates: { canonical: "/docentes" },
};

type Row = {
  profile_slug: string;
  headline: string | null;
  current_institution: string | null;
  faculty_areas: string[] | null;
  city: string | null;
  country: string | null;
  expertise: { area: string | null }[] | null;
};

export default async function DocentesIndexPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("faculty_profiles")
    .select("id, profile_slug, headline, current_institution, faculty_areas, city, country, expertise:faculty_expertise(area)")
    .eq("visibility", "public")
    .eq("is_active", true)
    .eq("estado_perfil", "verificado")
    .not("profile_slug", "is", "null");

  // Solo el número de perfiles verificados que han elegido privacidad: nunca sus datos.
  const { count: privateCount } = await admin
    .from("faculty_profiles")
    .select("id", { count: "exact", head: true })
    .eq("visibility", "private")
    .eq("is_active", true)
    .eq("estado_perfil", "verificado");

  const ids = ((data || []) as { id: string }[]).map((r) => r.id);
  const { data: names } = ids.length
    ? await admin.from("user_profiles").select("id, full_name").in("id", ids)
    : { data: [] as { id: string; full_name: string | null }[] };
  const nameOf = new Map((names || []).map((n) => [n.id, n.full_name]));

  const people = ((data || []) as (Row & { id: string })[])
    .map((r) => {
      const areas = [...(r.expertise || []).map((e) => e.area), ...(r.faculty_areas || [])].filter(Boolean) as string[];
      return {
        slug: r.profile_slug,
        name: nameOf.get(r.id) || "Docente",
        headline: r.headline && r.headline.trim().length > 8 ? r.headline.trim() : "",
        institution: r.current_institution,
        area: areas[0] || "",
        where: [r.city, r.country].filter(Boolean).join(", "),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Directorio de docentes y expertos verificados",
    url: `${SITE_URL}/docentes`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: people.length,
      itemListElement: people.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/docentes/${p.slug}`,
        name: p.name,
      })),
    },
  };

  return (
    <div className="bg-white font-sans">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="mx-auto max-w-[1100px] px-6 py-16 md:px-8 md:py-24">
        <h1 className="mb-3 text-balance text-[1.9rem] font-extrabold leading-[1.1] tracking-[-0.035em] text-fm-ink md:text-4xl">
          Directorio de docentes y expertos verificados
        </h1>
        <p className="mb-12 max-w-[62ch] text-base leading-[1.7] text-[#5B6B85]">
          Profesionales cuyo perfil ha sido revisado por el equipo de FacultyMatch y que han decidido hacerlo público.
          Si representas a una universidad o escuela de negocio, <Link href="/signup?intent=institution" className="font-semibold text-fm-blue hover:underline">accede al directorio completo</Link>.
        </p>

        {people.length === 0 ? (
          <p className="text-[#5B6B85]">Aún no hay perfiles públicos.</p>
        ) : (
          <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 md:grid-cols-3">
            {people.map((p) => (
              <li key={p.slug} className="border-t border-fm-border pt-4">
                <Link href={`/docentes/${p.slug}`} className="group block">
                  <p className="text-[17px] font-bold tracking-[-0.02em] text-fm-ink group-hover:text-fm-blue">{p.name}</p>
                  {p.headline && <p className="mt-1 text-sm text-[#5B6B85]">{p.headline}</p>}
                  <p className="mt-2 text-[13px] text-[#5E6F8E]">
                    {[p.area, p.institution, p.where].filter(Boolean).join(" · ")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {!!privateCount && (
          <p className="mt-12 border-t border-fm-border pt-6 text-sm leading-[1.7] text-[#5B6B85]">
            Además, {privateCount} {privateCount === 1 ? "docente verificado ha preferido" : "docentes verificados han preferido"} conservar su
            privacidad. Solo las cuentas de institución pueden acceder a {privateCount === 1 ? "su perfil" : "sus perfiles"}.
          </p>
        )}
      </main>
    </div>
  );
}
