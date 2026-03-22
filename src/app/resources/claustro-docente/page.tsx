import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, Clock, Building2, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cómo construir un claustro docente de alto impacto | FacultyMatch",
  description: "Guía práctica para instituciones sobre selección, diversificación y fidelización de talento académico global.",
};

export default function BlogPostClaustro() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/resources" className="inline-flex items-center gap-2 text-talentia-blue font-bold text-sm mb-8 hover:gap-3 transition-all">
          <ArrowLeft size={16} /> Volver a Recursos
        </Link>

        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-tech-cyan bg-blue-50 px-3 py-1 rounded-full">Instituciones</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400"><Clock size={12} /> 8 min lectura</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-navy leading-tight">
            Cómo construir un claustro docente de alto impacto
          </h1>
          <p className="text-xl text-gray-500 font-medium leading-relaxed">
            Guía práctica para instituciones sobre selección, diversificación y fidelización de talento académico global.
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <p className="text-lg font-medium leading-relaxed">
            El claustro docente es el corazón de cualquier institución universitaria. No se trata únicamente de reunir un conjunto de títulos académicos, sino de construir un ecosistema de conocimiento diverso, comprometido y alineado con la misión educativa de la institución. En un contexto de educación global e internacionalización creciente, este proceso exige una estrategia clara y herramientas adecuadas.
          </p>

          <h2 className="text-2xl font-black text-navy mt-10">1. Define primero el perfil académico que necesitas</h2>
          <p>
            Antes de lanzar cualquier proceso de búsqueda, es fundamental que el equipo de dirección académica defina con precisión qué tipo de perfiles requiere cada programa. Esto implica identificar:
          </p>
          <ul className="space-y-2">
            {[
              "Las áreas de conocimiento prioritarias según el plan de estudios",
              "El equilibrio deseado entre perfiles investigadores y profesionales en ejercicio",
              "Los idiomas de impartición necesarios para programas internacionales",
              "La disponibilidad requerida (presencial, online, híbrida)",
              "El nivel docente (Grado, Máster, Doctorado, Executive Education)"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-talentia-blue flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-black text-navy mt-10">2. Diversifica las fuentes de captación</h2>
          <p>
            Muchas instituciones cometen el error de recurrir siempre a los mismos canales: contactos directos, exalumnos del propio centro o publicaciones en portales genéricos. Aunque estos métodos tienen valor, limitan enormemente el abanico de perfiles disponibles. Una estrategia de alto impacto combina:
          </p>
          <p>
            <strong>Plataformas especializadas en talento académico</strong> como FacultyMatch permiten buscar por área de conocimiento, idioma, disponibilidad y tipo de acreditación. Esto reduce drásticamente el tiempo de identificación de candidatos adecuados y garantiza que los perfiles han sido previamente verificados.
          </p>
          <p>
            <strong>Redes de investigación internacionales</strong> como ResearchGate, Academia.edu o las redes de los grupos de investigación de universidades de referencia son excelentes fuentes de talento con producción académica contrastada.
          </p>
          <p>
            <strong>Programas de intercambio</strong> con otras universidades, especialmente en el marco de acuerdos Erasmus+ o redes como CINDA o la Asociación Iberoamericana de Educación Superior, facilitan la incorporación temporal o permanente de docentes internacionales.
          </p>

          <h2 className="text-2xl font-black text-navy mt-10">3. El proceso de selección debe valorar la experiencia docente real</h2>
          <p>
            Un error frecuente es primar en exceso el currículo investigador sobre la capacidad pedagógica. En programas orientados a la práctica profesional (como MBA, masters ejecutivos o programas técnicos), la experiencia en la industria combinada con la capacidad de transmitir conocimiento es mucho más valiosa que una larga lista de publicaciones en revistas indexadas.
          </p>
          <p>
            El proceso de selección debe incluir obligatoriamente una <strong>clase práctica o simulacro de impartición</strong> ante un comité evaluador. Esta prueba permite valorar la claridad expositiva, la capacidad de engagement con el alumnado y el dominio real de los contenidos.
          </p>

          <h2 className="text-2xl font-black text-navy mt-10">4. Fidelización: más allá del contrato</h2>
          <p>
            Conseguir el talento adecuado es solo el primer paso. Retenerlo es igual o más difícil. Los docentes de alto nivel tienen múltiples opciones y elegirán colaborar con las instituciones que les ofrezcan:
          </p>
          <ul className="space-y-2">
            {[
              "Condiciones económicas competitivas y transparentes",
              "Libertad académica y posibilidad de desarrollar metodologías propias",
              "Integración en proyectos de investigación o transferencia del conocimiento",
              "Reconocimiento público de su labor (ratings, publicaciones institucionales, referencias)",
              "Flexibilidad en formato y horario de impartición"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-talentia-blue flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-black text-navy mt-10">5. Evaluación continua del claustro</h2>
          <p>
            Un claustro de alto impacto no es una estructura estática. Debe revisarse periódicamente para adaptarse a las necesidades cambiantes del mercado laboral y del alumnado. Implementa encuestas de satisfacción, sesiones de feedback bidireccional y procesos de mejora continua que involucren tanto al profesorado como al equipo directivo.
          </p>
          <p>
            La evaluación no debe ser únicamente descendente (de la dirección al docente) sino también ascendente y entre pares. Los mejores claustros son comunidades académicas activas, no simples listas de profesores contratados.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mt-10">
            <p className="font-bold text-navy text-lg mb-2">¿Quieres acceder a perfiles docentes verificados?</p>
            <p className="text-gray-600 mb-4">FacultyMatch te ofrece un repositorio estructurado de talento académico internacional, listo para incorporarse a tu institución.</p>
            <Link href="/signup?role=institution" className="inline-flex items-center gap-2 bg-talentia-blue text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
              Registrar mi institución <ArrowLeft size={16} className="rotate-180" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
