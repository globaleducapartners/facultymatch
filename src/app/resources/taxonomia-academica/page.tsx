import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { ArticleHeader } from "@/components/resources/ArticleHeader";
import { articleMetadata } from "@/lib/articles";

export const metadata: Metadata = articleMetadata("taxonomia-academica");

export default function BlogPostTaxonomia() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <ArticleHeader slug="taxonomia-academica" />

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <p className="text-lg font-medium leading-relaxed">
            Uno de los mayores desafíos en el matching de talento académico es la falta de un lenguaje común. Un docente puede describirse como "experto en finanzas", pero ese término abarca realidades muy distintas: finanzas corporativas, finanzas conductuales, mercados de capitales, finanzas sostenibles, etc. Sin una taxonomía precisa, el matching es impreciso y genera frustración tanto en docentes como en instituciones.
          </p>

          <h2 className="text-2xl font-extrabold text-fm-ink mt-10">Nuestra referencia: la clasificación UNESCO ISCED</h2>
          <p>
            FacultyMatch utiliza como base la <strong>Clasificación Internacional Normalizada de la Educación (CINE / ISCED)</strong> desarrollada por la UNESCO, complementada con las acreditaciones propias de las agencias de calidad universitaria (ANECA y las agencias autonómicas en España, y equivalentes en otros países).
          </p>
          <p>
            Esta clasificación organiza el conocimiento en grandes áreas, sub-áreas y temas, permitiendo una búsqueda tanto amplia como muy específica.
          </p>

          <h2 className="text-2xl font-extrabold text-fm-ink mt-10">Las 10 grandes áreas</h2>
          <ul className="space-y-3">
            {[
              { area: "Educación", subs: "Formación de docentes, Educación superior, Pedagogía y didáctica, Tecnología educativa" },
              { area: "Artes y Humanidades", subs: "Idiomas y lingüística, Historia, Filosofía y ética, Bellas artes, Literatura" },
              { area: "Ciencias Sociales, Periodismo e Información", subs: "Psicología, Economía, Ciencias políticas, Sociología, Periodismo y comunicación" },
              { area: "Negocios, Administración y Derecho", subs: "Dirección de empresas, Marketing y ventas, Finanzas y contabilidad, Recursos humanos, Derecho mercantil e internacional" },
              { area: "Ciencias Naturales, Matemáticas y Estadística", subs: "Matemáticas, Estadística, Física, Química, Biología" },
              { area: "Tecnologías de la Información y Comunicación", subs: "Desarrollo de software, Ciencia de datos e IA, Ciberseguridad, Redes y telecomunicaciones" },
              { area: "Ingeniería, Industria y Construcción", subs: "Ingeniería civil, mecánica y eléctrica, Arquitectura y urbanismo, Energías renovables" },
              { area: "Agricultura, Veterinaria y Medioambiente", subs: "Agronomía, Veterinaria, Ecología, Gestión ambiental y sostenibilidad, Alimentación" },
              { area: "Salud y Servicios Sociales", subs: "Medicina, Enfermería, Farmacia, Psicología clínica, Salud pública y epidemiología" },
              { area: "Servicios", subs: "Turismo y hotelería, Deporte, Seguridad, Transporte y logística" }
            ].map((item, i) => (
              <li key={i} className="flex flex-col gap-1 bg-white rounded-xl p-4 border border-gray-100">
                <span className="font-bold text-fm-ink">{item.area}</span>
                <span className="text-sm text-gray-500">{item.subs}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-extrabold text-fm-ink mt-10">El impacto en el matching</h2>
          <p>
            Gracias a esta taxonomía estructurada, cuando una institución busca "un docente de Finanzas para el módulo de valoración de startups del programa MBA", el sistema puede identificar docentes que han declarado especialización en "Finanzas Corporativas" + "Emprendimiento" + "Valoración de Empresas", filtrando los resultados de forma mucho más precisa que una búsqueda por palabras clave genéricas.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mt-10">
            <p className="font-bold text-fm-ink text-lg mb-2">¿Quieres que tu perfil aparezca en las búsquedas correctas?</p>
            <p className="text-gray-600 mb-4">Al crear tu perfil en FacultyMatch, te ayudamos a clasificar tu experiencia en nuestra taxonomía para que las instituciones adecuadas te encuentren.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-fm-blue text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
              Crear mi perfil <ArrowLeft size={16} className="rotate-180" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
