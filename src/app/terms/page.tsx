import { Navbar } from "@/components/layout/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones | FacultyMatch",
  description: "Términos y condiciones de uso de la plataforma FacultyMatch.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-navy">Términos y Condiciones</h1>
          <p className="text-gray-500 font-medium">Última actualización: marzo 2026</p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <h2 className="text-2xl font-black text-navy">1. Partes del contrato</h2>
          <p>
            Los presentes Términos y Condiciones regulan la relación entre <strong>Grupo Global Educa SL</strong> (titular de la plataforma FacultyMatch, con domicilio en Avenida Constitución, 4, 30008 Murcia; email: info@globaleducapartners.com) y los usuarios que accedan y utilicen la plataforma <strong>facultymatch.app</strong>.
          </p>

          <h2 className="text-2xl font-black text-navy">2. Descripción del servicio</h2>
          <p>
            FacultyMatch es una plataforma de conexión entre docentes universitarios y profesionales académicos (en adelante, "Docentes") e instituciones de educación superior (en adelante, "Instituciones"). El servicio permite a los Docentes crear y publicar perfiles profesionales verificados, y a las Instituciones buscar y contactar con dichos perfiles para establecer colaboraciones académicas.
          </p>

          <h2 className="text-2xl font-black text-navy">3. Registro y cuenta de usuario</h2>
          <p>
            Para acceder a las funcionalidades de la plataforma, el usuario deberá completar el proceso de registro facilitando información veraz, precisa y actualizada. El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que se produzcan bajo su cuenta.
          </p>
          <p>
            FacultyMatch se reserva el derecho de suspender o cancelar cuentas que incumplan los presentes términos, proporcionen información falsa o realicen un uso fraudulento de la plataforma.
          </p>

          <h2 className="text-2xl font-black text-navy">4. Obligaciones del Docente</h2>
          <p>Al registrarse como Docente, el usuario se compromete a:</p>
          <ul>
            <li>Proporcionar información académica y profesional veraz y actualizada.</li>
            <li>No incluir en su perfil contenidos ilegales, difamatorios o que vulneren derechos de terceros.</li>
            <li>Colaborar con el proceso de verificación de credenciales de FacultyMatch.</li>
            <li>Mantener actualizada su disponibilidad para evitar oportunidades perdidas para las instituciones.</li>
          </ul>

          <h2 className="text-2xl font-black text-navy">5. Obligaciones de la Institución</h2>
          <p>Las instituciones registradas se comprometen a:</p>
          <ul>
            <li>Utilizar la plataforma exclusivamente para la búsqueda legítima de talento académico.</li>
            <li>No utilizar la información de los perfiles docentes para fines distintos a los expresamente autorizados.</li>
            <li>Contactar con los docentes con respeto profesional y sin discriminación de ningún tipo.</li>
            <li>No ceder los datos de los docentes a terceros sin su consentimiento.</li>
          </ul>

          <h2 className="text-2xl font-black text-navy">6. Limitación de responsabilidad</h2>
          <p>
            FacultyMatch actúa como plataforma intermediaria y no es parte en las relaciones contractuales que puedan establecerse entre Docentes e Instituciones. La empresa no garantiza que los Docentes y las Instituciones lleguen a un acuerdo, ni asume responsabilidad por el incumplimiento de compromisos adquiridos entre ellos.
          </p>
          <p>
            FacultyMatch verifica la autenticidad de las credenciales declaradas pero no puede garantizar al 100% la exactitud de toda la información contenida en los perfiles.
          </p>

          <h2 className="text-2xl font-black text-navy">7. Tarifas y facturación</h2>
          <p>
            El registro básico en FacultyMatch es gratuito para los Docentes. Las funcionalidades avanzadas y el acceso completo a los perfiles por parte de las Instituciones están sujetos a las tarifas vigentes en cada momento, que se publicarán en la sección correspondiente de la plataforma. FacultyMatch se reserva el derecho de modificar sus tarifas previo aviso de 30 días.
          </p>

          <h2 className="text-2xl font-black text-navy">8. Duración y rescisión</h2>
          <p>
            Los presentes Términos tienen vigencia indefinida mientras el usuario mantenga su cuenta activa en FacultyMatch. El usuario puede solicitar la baja en cualquier momento enviando un correo a info@globaleducapartners.com. FacultyMatch puede dar de baja una cuenta que incumpla los presentes términos con notificación previa salvo en casos de incumplimiento grave.
          </p>

          <h2 className="text-2xl font-black text-navy">9. Modificaciones</h2>
          <p>
            FacultyMatch se reserva el derecho de modificar los presentes Términos en cualquier momento. Los cambios se comunicarán a los usuarios registrados con un mínimo de 15 días de antelación. El uso continuado de la plataforma tras la entrada en vigor de los nuevos términos implica su aceptación.
          </p>

          <h2 className="text-2xl font-black text-navy">10. Legislación aplicable y jurisdicción</h2>
          <p>
            Los presentes Términos se rigen por la legislación española. Para la resolución de cualquier controversia, las partes se someten a los tribunales de la ciudad de Murcia, con renuncia expresa a cualquier otro fuero que pudiera corresponderles.
          </p>
        </div>
      </main>
    </div>
  );
}
