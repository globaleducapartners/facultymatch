import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, Clock, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taxonomía Académica Global | FacultyMatch",
  description: "Cómo clasificamos las disciplinas y sub-áreas siguiendo los estándares internacionales para un matching preciso.",
};

export default function BlogPostTaxonomia() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/resources" className="inline-flex items-center gap-2 text-talentia-blue font-bold text-sm mb-8 hover:gap-3 transition-all">
          <ArrowLeft size={16} /> Volver a Recursos
        </Link>

        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-tech-cyan bg-blue-50 px-3 py-1 rounded-full">Estructura</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400"><Clock size={12} /> 10 min lectura</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-navy leading-tight">
            Taxonomía Académica Global: cómo clasificamos el conocimiento
          </h1>
          <p className="text-xl text-gray-500 font-medium leading-relaxed">
            Descubre cómo clasificamos las disciplinas y sub-áreas siguiendo los estándares internacionales. Una herramienta clave para el matching preciso entre oferta y demanda académica.
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <p className="text-lg font-medium leading-relaxed">
            Uno de los mayores desafíos en el matching de talento académico es la falta de un lenguaje común. Un docente puede describirse como "experto en finanzas", pero ese término abarca realidades muy distintas: finanzas corporativas, finanzas conductuales, mercados de capitales, finanzas sostenibles, etc. Sin una taxonomía precisa, el matching es impreciso y genera frustración tanto en docentes como en instituciones.
          </p>

          <h2 className="text-2xl font-black text-navy mt-10">Nuestra referencia: la clasificación UNESCO ISCED</h2>
          <p>
            FacultyMatch utiliza como base la <strong>Clasificación Internacional Normalizada de la Educación (ISCED)</strong> desarrollada por la UNESCO, complementada con las nomenclaturas propias de las principales agencias de calidad universitaria (ANECA en España, ANECA, NCES en EE.UU., QAA en el Reino Unido).
          </p>
          <p>
            Esta clasificación organiza el conocimiento en grandes áreas (nivel 1), sub-áreas (nivel 2) y especialidades (nivel 3), permitiendo una búsqueda tanto amplia como muy específica.
          </p>

          <h2 className="text-2xl font-black text-navy mt-10">Las 10 grandes áreas de FacultyMatch</h2>
          <ul className="space-y-3">
            {[
              { area: "Business & Management", subs: "Dirección Estratégica, Marketing, Finanzas, RRHH, Operaciones, Emprendimiento" },
              { area: "Ingeniería & Tecnología", subs: "Software, IA, Robótica, Telecomunicaciones, Industrial, Ambiental" },
              { area: "Ciencias de la Salud", subs: "Medicina, Enfermería, Farmacia, Nutrición, Fisioterapia, Salud Pública" },
              { area: "Derecho & Ciencias Políticas", subs: "Derecho Civil, Mercantil, Internacional, Tributario, Político" },
              { area: "Educación", subs: "Pedagogía, Psicopedagogía, Formación del Profesorado, E-Learning" },
              { area: "Artes & Humanidades", subs: "Filosofía, Historia, Lingüística, Bellas Artes, Literatura" },
              { area: "Ciencias Sociales", subs: "Sociología, Psicología, Comunicación, Trabajo Social, Antropología" },
              { area: "Ciencias Naturales", subs: "Física, Química, Biología, Geología, Astronomía" },
              { area: "Economía", subs: "Macroeconomía, Microeconomía, Economía Internacional, Econometría" },
              { area: "Matemáticas & Estadística", subs: "Álgebra, Cálculo, Estadística, Investigación Operativa, Matemática Aplicada" }
            ].map((item, i) => (
              <li key={i} className="flex flex-col gap-1 bg-white rounded-xl p-4 border border-gray-100">
                <span className="font-bold text-navy">{item.area}</span>
                <span className="text-sm text-gray-500">{item.subs}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-black text-navy mt-10">El impacto en el matching</h2>
          <p>
            Gracias a esta taxonomía estructurada, cuando una institución busca "un docente de Finanzas para el módulo de valoración de startups del programa MBA", el sistema puede identificar docentes que han declarado especialización en "Finanzas Corporativas" + "Emprendimiento" + "Valoración de Empresas", filtrando los resultados de forma mucho más precisa que una búsqueda por palabras clave genéricas.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mt-10">
            <p className="font-bold text-navy text-lg mb-2">¿Quieres que tu perfil aparezca en las búsquedas correctas?</p>
            <p className="text-gray-600 mb-4">Al crear tu perfil en FacultyMatch, te ayudamos a clasificar tu experiencia en nuestra taxonomía para que las instituciones adecuadas te encuentren.</p>
            <Link href="/apply" className="inline-flex items-center gap-2 bg-talentia-blue text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
              Crear mi perfil <ArrowLeft size={16} className="rotate-180" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
