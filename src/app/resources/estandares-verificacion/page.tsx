import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { ArticleHeader } from "@/components/resources/ArticleHeader";
import { articleMetadata } from "@/lib/articles";

export const metadata: Metadata = articleMetadata("estandares-verificacion");

export default function BlogPostVerificacion() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <ArticleHeader slug="estandares-verificacion" />

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <p className="text-lg font-medium leading-relaxed">
            La credibilidad de FacultyMatch depende directamente de la calidad y autenticidad de los perfiles que alberga. Por eso hemos desarrollado un proceso de verificación riguroso, transparente y continuo que garantiza a las instituciones que cada docente que encuentran en nuestra plataforma ha pasado por un filtro de calidad real.
          </p>

          <h2 className="text-2xl font-extrabold text-fm-ink mt-10">Principios de nuestro proceso de verificación</h2>
          <p>
            Nuestro sistema de verificación se basa en cuatro principios fundamentales: <strong>autenticidad</strong> (los datos declarados son reales), <strong>trazabilidad</strong> (cada verificación queda registrada con fecha y fuente), <strong>proporcionalidad</strong> (el nivel de verificación se adapta al tipo de credencial) y <strong>confidencialidad</strong> (los documentos aportados son tratados con la máxima privacidad).
          </p>

          <h2 className="text-2xl font-extrabold text-fm-ink mt-10">Fase 1: Verificación de identidad</h2>
          <p>
            El primer paso consiste en confirmar que la persona que crea el perfil es quien dice ser. Para ello solicitamos:
          </p>
          <ul className="space-y-2">
            {[
              "Documento de identidad oficial (DNI, pasaporte o equivalente)",
              "Correo electrónico institucional activo (universidad o centro de investigación)",
              "Perfil de LinkedIn o ORCID activo con coherencia respecto al CV declarado"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-fm-blue flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-extrabold text-fm-ink mt-10">Fase 2: Verificación de titulaciones</h2>
          <p>
            Validamos cada titulación declarada mediante la consulta de registros oficiales cuando están disponibles (como el Registro de Títulos del Ministerio de Educación en España) y/o la solicitud de copia del título oficial. Para doctorados internacionales, consultamos las bases de datos de las universidades emisoras.
          </p>
          <p>
            En casos de acreditación ANECA (Agencia Nacional de Evaluación de la Calidad y Acreditación), verificamos directamente el número de expediente de acreditación, que queda reflejado de forma destacada en el perfil.
          </p>

          <h2 className="text-2xl font-extrabold text-fm-ink mt-10">Fase 3: Verificación de experiencia docente</h2>
          <p>
            Contactamos con las instituciones declaradas en el historial docente para confirmar la relación profesional. Aceptamos como evidencia válida: cartas de referencia institucional, certificados de prestación de servicios, contratos anonimizados y referencias directas de directores de programa.
          </p>

          <h2 className="text-2xl font-extrabold text-fm-ink mt-10">Fase 4: Revisión editorial</h2>
          <p>
            Antes de publicar cualquier perfil, nuestro equipo editorial realiza una revisión completa del conjunto de información declarada, buscando incoherencias, datos inconsistentes o señales de alerta. Este paso garantiza que la imagen que proyecta el perfil es coherente con la evidencia documentada.
          </p>

          <h2 className="text-2xl font-extrabold text-fm-ink mt-10">Insignias de verificación</h2>
          <p>
            Los perfiles verificados reciben insignias específicas que indican el nivel de validación completado. Las instituciones pueden filtrar sus búsquedas por nivel de verificación, garantizando así que solo acceden a los perfiles que cumplen sus estándares de calidad.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mt-10">
            <p className="font-bold text-fm-ink text-lg mb-2">¿Eres docente y quieres verificar tu perfil?</p>
            <p className="text-gray-600 mb-4">Crear tu perfil es gratis. Lo completas, lo publicas, y nuestro equipo lo revisa a mano antes de que aparezca en el directorio.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-fm-blue text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
              Crear mi perfil <ArrowLeft size={16} className="rotate-180" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
