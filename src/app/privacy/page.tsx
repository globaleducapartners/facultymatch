import { Navbar } from "@/components/layout/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | FacultyMatch",
  description: "Política de privacidad y protección de datos de FacultyMatch, conforme al RGPD.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-navy">Política de Privacidad</h1>
          <p className="text-gray-500 font-medium">Última actualización: marzo 2026</p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <h2 className="text-2xl font-black text-navy">1. Responsable del tratamiento</h2>
          <ul>
            <li><strong>Identidad:</strong> Grupo Global Educa SL</li>
            <li><strong>Dirección:</strong> Avenida Constitución, 4, 30008 Murcia, España</li>
            <li><strong>Email:</strong> info@globaleducapartners.com</li>
            <li><strong>Teléfono:</strong> +34 616 684 214</li>
          </ul>

          <h2 className="text-2xl font-black text-navy">2. Datos recogidos y finalidades del tratamiento</h2>
          <p>
            FacultyMatch trata los datos personales que el usuario facilita a través del formulario de registro de docentes y los formularios de contacto. En concreto:
          </p>
          <ul>
            <li><strong>Datos de identificación:</strong> nombre completo, correo electrónico, teléfono.</li>
            <li><strong>Datos profesionales:</strong> titulaciones, experiencia docente, áreas de conocimiento, idiomas, disponibilidad.</li>
            <li><strong>Datos de navegación:</strong> dirección IP, tipo de dispositivo, páginas visitadas (con fines estadísticos y de seguridad).</li>
          </ul>
          <p>
            Las finalidades del tratamiento son: (a) gestión del perfil docente en la plataforma; (b) conexión con instituciones universitarias que buscan perfiles docentes adecuados; (c) envío de comunicaciones relacionadas con el servicio y, si el usuario ha dado su consentimiento, comunicaciones comerciales.
          </p>

          <h2 className="text-2xl font-black text-navy">3. Base legal del tratamiento</h2>
          <p>
            El tratamiento de los datos personales se basa en las siguientes bases legitimadoras del art. 6.1 del RGPD:
          </p>
          <ul>
            <li>Ejecución de la relación contractual o precontractual (art. 6.1.b RGPD) para la gestión del perfil.</li>
            <li>Consentimiento del interesado (art. 6.1.a RGPD) para comunicaciones comerciales.</li>
            <li>Interés legítimo (art. 6.1.f RGPD) para la mejora del servicio y la seguridad de la plataforma.</li>
          </ul>

          <h2 className="text-2xl font-black text-navy">4. Destinatarios de los datos</h2>
          <p>
            Los datos profesionales incluidos en el perfil del docente serán accesibles para las instituciones universitarias registradas en FacultyMatch, de acuerdo con la configuración de privacidad elegida por el usuario. No se cederán datos a terceros fuera de este ámbito sin el consentimiento expreso del interesado, salvo obligación legal.
          </p>
          <p>
            FacultyMatch utiliza proveedores de servicios tecnológicos (hosting, email, analytics) que actúan como encargados del tratamiento y han suscrito los acuerdos de tratamiento exigidos por el RGPD.
          </p>

          <h2 className="text-2xl font-black text-navy">5. Derechos de los interesados</h2>
          <p>
            El usuario puede ejercer en cualquier momento los siguientes derechos frente al responsable del tratamiento:
          </p>
          <ul>
            <li><strong>Acceso:</strong> conocer qué datos trata FacultyMatch sobre el usuario.</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
            <li><strong>Supresión:</strong> solicitar la eliminación de los datos cuando ya no sean necesarios para los fines para los que se recogieron.</li>
            <li><strong>Oposición:</strong> oponerse al tratamiento en determinadas circunstancias.</li>
            <li><strong>Portabilidad:</strong> recibir los datos en un formato estructurado y legible por máquina.</li>
            <li><strong>Limitación del tratamiento.</strong></li>
          </ul>
          <p>
            Estos derechos pueden ejercerse enviando un correo a <strong>info@globaleducapartners.com</strong> con el asunto "Ejercicio de derechos RGPD" y adjuntando copia de su documento de identidad.
          </p>
          <p>
            Si considera que el tratamiento no se ajusta a la normativa, tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-talentia-blue">www.aepd.es</a>).
          </p>

          <h2 className="text-2xl font-black text-navy">6. Conservación de los datos</h2>
          <p>
            Los datos se conservarán mientras el usuario mantenga su perfil activo en FacultyMatch y, una vez solicitada la baja, durante los plazos legalmente establecidos para el cumplimiento de obligaciones legales.
          </p>

          <h2 className="text-2xl font-black text-navy">7. Uso de cookies</h2>
          <p>
            FacultyMatch utiliza cookies propias y de terceros para el funcionamiento técnico de la plataforma, la mejora de la experiencia de usuario y el análisis estadístico del tráfico. Consulta nuestra política de cookies para más información.
          </p>
        </div>
      </main>
    </div>
  );
}
