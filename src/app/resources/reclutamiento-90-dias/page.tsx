import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, Clock, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Estrategias de Reclutamiento Docente en 90 días | FacultyMatch",
  description: "Plan de acción para directores académicos: desde la identificación de necesidades hasta la firma de la colaboración docente.",
};

export default function BlogPostReclutamiento() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/resources" className="inline-flex items-center gap-2 text-talentia-blue font-bold text-sm mb-8 hover:gap-3 transition-all">
          <ArrowLeft size={16} /> Volver a Recursos
        </Link>

        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-tech-cyan bg-blue-50 px-3 py-1 rounded-full">Gestión</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400"><Clock size={12} /> 15 min lectura</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-navy leading-tight">
            Estrategias de Reclutamiento Docente en 90 días
          </h1>
          <p className="text-xl text-gray-500 font-medium leading-relaxed">
            Plan de acción para directores académicos: desde la identificación de necesidades hasta la firma de la colaboración docente mediante nuestra infraestructura conectada.
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <p className="text-lg font-medium leading-relaxed">
            Los procesos de captación de talento docente en las instituciones universitarias son, con demasiada frecuencia, lentos, poco sistemáticos y reactivos. Se busca un docente cuando hay una urgencia, no cuando hay una oportunidad. Esta guía propone un plan de 90 días para transformar ese proceso en un sistema proactivo, escalable y alineado con la estrategia académica de la institución.
          </p>

          <h2 className="text-2xl font-black text-navy mt-10">Fase 1 (Días 1-30): Diagnóstico y planificación</h2>
          <p><strong>Semana 1-2: Auditoría del claustro actual</strong></p>
          <p>
            Antes de buscar nuevos perfiles, es imprescindible entender qué tienes. Realiza un mapa del claustro actual identificando: áreas cubiertas y nivel de calidad, perfiles en riesgo de abandono, gaps de especialización y oportunidades de internacionalización.
          </p>
          <p><strong>Semana 3-4: Definición del plan de necesidades</strong></p>
          <p>
            En base al diagnóstico, elabora un plan de necesidades docentes para los próximos 12-18 meses. Este plan debe estar alineado con el plan estratégico académico y contar con el respaldo de la dirección. Define prioridades: qué es urgente vs. qué es importante.
          </p>
          <ul className="space-y-2">
            {[
              "Mapea cada asignatura con el perfil docente ideal",
              "Identifica qué perfiles son difícilmente sustituibles (riesgo de dependencia)",
              "Define el presupuesto disponible por perfil",
              "Establece los criterios de selección no negociables"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-talentia-blue flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-black text-navy mt-10">Fase 2 (Días 31-60): Búsqueda y contacto</h2>
          <p><strong>Semana 5-6: Activación de canales de búsqueda</strong></p>
          <p>
            Con el plan de necesidades definido, activa simultáneamente múltiples canales: plataformas especializadas (como FacultyMatch), red de contactos del claustro actual, programas de colaboración con otras universidades y redes profesionales sectoriales.
          </p>
          <p><strong>Semana 7-8: Primer contacto y evaluación inicial</strong></p>
          <p>
            Establece un protocolo de primer contacto profesional y una plantilla de evaluación inicial que permita comparar candidatos de forma objetiva. En esta fase, el objetivo es crear una longlist de al menos 3-5 candidatos por posición.
          </p>

          <h2 className="text-2xl font-black text-navy mt-10">Fase 3 (Días 61-90): Selección y onboarding</h2>
          <p><strong>Semana 9-10: Proceso de selección</strong></p>
          <p>
            Reduce la longlist a una shortlist de 2-3 candidatos mediante entrevistas estructuradas y la ya mencionada clase práctica. Involucra al coordinador del programa y, si es posible, a representantes del alumnado en la evaluación.
          </p>
          <p><strong>Semana 11-12: Cierre y onboarding</strong></p>
          <p>
            Una vez seleccionado el candidato, establece un proceso de onboarding estructurado que incluya: presentación del equipo docente, acceso a materiales y plataformas institucionales, sesión de alineación pedagógica con el coordinador del programa, y definición de expectativas mutuas.
          </p>

          <h2 className="text-2xl font-black text-navy mt-10">Métricas de éxito del proceso</h2>
          <p>
            Mide el rendimiento de tu proceso de reclutamiento con estas métricas: tiempo medio desde la identificación de la necesidad hasta la incorporación del docente, tasa de retención a 12 meses, satisfacción del alumnado con los nuevos docentes y número de perfiles en el pipeline para cobertura de urgencias.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mt-10">
            <p className="font-bold text-navy text-lg mb-2">Acelera tu proceso de reclutamiento con FacultyMatch</p>
            <p className="text-gray-600 mb-4">Accede a perfiles verificados, filtra por área, idioma y disponibilidad, y contacta directamente con los docentes que necesitas.</p>
            <Link href="/signup?role=institution" className="inline-flex items-center gap-2 bg-talentia-blue text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
              Registrar mi institución <ArrowLeft size={16} className="rotate-180" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
