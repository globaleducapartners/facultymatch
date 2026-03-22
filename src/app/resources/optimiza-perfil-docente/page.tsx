import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, Clock, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guía: Optimiza tu Perfil Docente en FacultyMatch",
  description: "Mejores prácticas para destacar tu trayectoria académica y generar confianza en las universidades.",
};

export default function BlogPostPerfil() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/resources" className="inline-flex items-center gap-2 text-talentia-blue font-bold text-sm mb-8 hover:gap-3 transition-all">
          <ArrowLeft size={16} /> Volver a Recursos
        </Link>

        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-tech-cyan bg-blue-50 px-3 py-1 rounded-full">Docentes</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400"><Clock size={12} /> 6 min lectura</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-navy leading-tight">
            Guía: Optimiza tu Perfil Docente en FacultyMatch
          </h1>
          <p className="text-xl text-gray-500 font-medium leading-relaxed">
            Mejores prácticas para destacar tu trayectoria académica. Cómo estructurar tus áreas de conocimiento y generar confianza en las universidades.
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <p className="text-lg font-medium leading-relaxed">
            Tu perfil en FacultyMatch es tu carta de presentación ante cientos de instituciones universitarias de todo el mundo. Un perfil bien construido puede marcar la diferencia entre pasar desapercibido y recibir múltiples solicitudes de colaboración. Esta guía te explica cómo sacar el máximo partido a cada sección.
          </p>

          <h2 className="text-2xl font-black text-navy mt-10">1. El titular académico: tu primera impresión</h2>
          <p>
            El titular es lo primero que ven las instituciones. Debe ser específico, memorable y reflejar tu propuesta de valor única. Evita titulares genéricos como "Profesor universitario" o "Doctor en Economía". En su lugar, opta por formulaciones como:
          </p>
          <ul className="space-y-2">
            {[
              "PhD en Finanzas Conductuales | Experto en Neurociencia aplicada a la Inversión",
              "Docente de IA y Machine Learning | 15 años en la industria tecnológica",
              "Especialista en Derecho Tributario Internacional | Acreditado ANECA"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-talentia-blue flex-shrink-0 mt-0.5" />
                <span className="italic">{item}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-black text-navy mt-10">2. La biografía profesional: tu historia, no tu CV</h2>
          <p>
            La bio no es un resumen de tu expediente académico; es el relato de por qué eres el docente adecuado. Una buena biografía responde a tres preguntas: ¿Qué sabes mejor que nadie? ¿Cómo lo aprendiste? ¿Qué aportas al alumnado que no aportan otros?
          </p>
          <p>
            Extiéndete lo suficiente para transmitir profundidad (al menos 150 palabras), pero evita la enumeración de logros sin contexto. Las instituciones quieren entender tu perspectiva académica y tu filosofía docente, no solo tus credenciales.
          </p>

          <h2 className="text-2xl font-black text-navy mt-10">3. Áreas de conocimiento: sé específico</h2>
          <p>
            Muchos docentes cometen el error de marcar demasiadas áreas de conocimiento para ampliar sus posibilidades. El resultado es exactamente el contrario: un perfil difuso que no destaca en ninguna búsqueda concreta. Selecciona entre 2 y 4 áreas principales en las que realmente tengas profundidad.
          </p>

          <h2 className="text-2xl font-black text-navy mt-10">4. Historial docente: la evidencia que convence</h2>
          <p>
            Lista todas las instituciones en las que has impartido docencia, indicando el rol, el programa y las fechas. Cuanto más detallado y verificable sea este historial, mayor será la confianza que genera tu perfil. Si tienes experiencia internacional, asegúrate de incluirla: es uno de los factores más valorados por las instituciones que buscan perfiles para programas globales.
          </p>

          <h2 className="text-2xl font-black text-navy mt-10">5. Disponibilidad e idiomas: facilita la búsqueda</h2>
          <p>
            Especifica claramente en qué idiomas puedes impartir docencia y en qué modalidades (presencial, online, híbrida). Indica también tu disponibilidad de forma concreta: "Disponible para asignaturas sueltas a partir de septiembre 2025" es mucho más útil que "Disponibilidad flexible".
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mt-10">
            <p className="font-bold text-navy text-lg mb-2">¿Aún no tienes tu perfil en FacultyMatch?</p>
            <p className="text-gray-600 mb-4">Regístrate en menos de 5 minutos y empieza a recibir oportunidades de instituciones verificadas.</p>
            <Link href="/apply" className="inline-flex items-center gap-2 bg-talentia-blue text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
              Crear mi perfil ahora <ArrowLeft size={16} className="rotate-180" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
