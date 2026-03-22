import { Navbar } from "@/components/layout/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso Legal | FacultyMatch",
  description: "Aviso legal y condiciones de uso de FacultyMatch, plataforma de Grupo Global Educa SL.",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-navy">Aviso Legal</h1>
          <p className="text-gray-500 font-medium">Última actualización: marzo 2026</p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <h2 className="text-2xl font-black text-navy">1. Datos identificativos del titular</h2>
          <p>
            En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se informa que el titular del sitio web <strong>facultymatch.app</strong> es:
          </p>
          <ul>
            <li><strong>Razón social:</strong> Grupo Global Educa SL</li>
            <li><strong>Domicilio social:</strong> Avenida Constitución, 4, 30008 Murcia, España</li>
            <li><strong>Email:</strong> info@globaleducapartners.com</li>
            <li><strong>Teléfono:</strong> +34 616 684 214</li>
          </ul>

          <h2 className="text-2xl font-black text-navy">2. Objeto y ámbito de aplicación</h2>
          <p>
            El presente Aviso Legal regula el acceso y uso del sitio web <strong>facultymatch.app</strong> (en adelante, "la Web" o "la Plataforma"), titularidad de Grupo Global Educa SL (en adelante, "FacultyMatch" o "la empresa"). El acceso a la Web atribuye la condición de usuario e implica la aceptación plena y sin reservas de todas las disposiciones incluidas en este Aviso Legal.
          </p>
          <p>
            La empresa se reserva el derecho de modificar en cualquier momento la presentación, configuración y contenido de la Web, así como las condiciones requeridas para su acceso y uso.
          </p>

          <h2 className="text-2xl font-black text-navy">3. Propiedad intelectual e industrial</h2>
          <p>
            Todos los contenidos de la Web, entendiendo por éstos, a título enunciativo, los textos, fotografías, gráficos, imágenes, iconos, tecnología, software, links y demás contenidos audiovisuales o sonoros, así como su diseño gráfico y códigos fuente, son propiedad intelectual de Grupo Global Educa SL o de terceros que han autorizado su uso, sin que puedan entenderse cedidos al usuario ninguno de los derechos de explotación sobre los mismos más allá de lo estrictamente necesario para el correcto uso de la Web.
          </p>

          <h2 className="text-2xl font-black text-navy">4. Responsabilidad</h2>
          <p>
            Grupo Global Educa SL no será responsable de los daños o perjuicios de cualquier tipo producidos en el usuario que traigan causa de fallos o desconexiones en las redes de telecomunicaciones que produzcan la suspensión, cancelación o interrupción del servicio de la Web durante la prestación del mismo.
          </p>
          <p>
            La empresa no garantiza la ausencia de virus u otros elementos en los contenidos que puedan producir alteraciones en el sistema informático del usuario.
          </p>

          <h2 className="text-2xl font-black text-navy">5. Legislación aplicable y jurisdicción</h2>
          <p>
            Las relaciones establecidas entre la empresa y el usuario se regirán por lo dispuesto en la normativa española vigente. Las partes se someten, con renuncia expresa a cualquier otro fuero, a los Juzgados y Tribunales del domicilio del usuario para cualquier controversia que pudiera derivarse del acceso o uso de la Web.
          </p>
        </div>
      </main>
    </div>
  );
}
