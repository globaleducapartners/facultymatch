import { Navbar } from "@/components/layout/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/legal" },
  title: "Aviso Legal | FacultyMatch",
  description: "Aviso legal y condiciones de uso de FacultyMatch, plataforma de Grupo Global Educa, S.L.",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-navy">Aviso Legal</h1>
          <p className="text-gray-500 font-medium">Última actualización: noviembre 2026</p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <h2 className="text-2xl font-black text-navy">1. Datos identificativos del titular</h2>
          <p>
            En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se informa que el titular del sitio web <strong>facultymatch.app</strong> es:
          </p>
          <ul>
            <li><strong>Denominación social:</strong> Grupo Global Educa, S.L.</li>
            <li><strong>Nombre comercial:</strong> FacultyMatch</li>
            <li><strong>CIF:</strong> B19907047</li>
            <li><strong>Domicilio social:</strong> Avenida de la Constitución, 4, 30008 Murcia, España</li>
            <li>
              <strong>Datos registrales:</strong> inscrita en el Registro Mercantil de Murcia (Sección 8, Hoja MU-114190, Inscripción 2, Tomo A-2)
            </li>
            <li><strong>Email de contacto general y asuntos legales:</strong> info@globaleducapartners.com</li>
            <li><strong>Email de atención a usuarios y soporte:</strong> support@facultymatch.app</li>
            <li><strong>Teléfono:</strong> +34 616 684 214</li>
          </ul>

          <h2 className="text-2xl font-black text-navy">2. Objeto y ámbito de aplicación</h2>
          <p>
            El presente Aviso Legal regula el acceso y uso del sitio web <strong>facultymatch.app</strong> (en adelante, "la Web" o "la Plataforma"), titularidad de Grupo Global Educa, S.L. (en adelante, "FacultyMatch" o "la empresa"). El acceso a la Web atribuye la condición de usuario e implica la aceptación de las disposiciones incluidas en este Aviso Legal. El uso de los servicios que requieren registro se rige además por los <a href="/terms" className="text-talentia-blue">Términos y Condiciones</a>, y el tratamiento de datos personales por la <a href="/privacy" className="text-talentia-blue">Política de Privacidad</a> y la <a href="/cookies" className="text-talentia-blue">Política de Cookies</a>.
          </p>
          <p>
            La empresa se reserva el derecho de modificar en cualquier momento la presentación, configuración y contenido de la Web, así como las condiciones requeridas para su acceso y uso, sin perjuicio de los derechos que la normativa reconozca a los usuarios.
          </p>

          <h2 className="text-2xl font-black text-navy">3. Condiciones de acceso y uso</h2>
          <p>
            El acceso a los contenidos públicos de la Web es gratuito. El acceso a determinadas áreas y servicios requiere registro. El usuario se compromete a hacer un uso lícito, diligente y conforme a la buena fe de la Web y, en particular, a no:
          </p>
          <ul>
            <li>utilizarla con fines ilícitos o contrarios a lo establecido en este Aviso Legal, o lesivos de derechos o intereses de terceros;</li>
            <li>suplantar la identidad de otra persona o institución, ni facilitar información falsa;</li>
            <li>acceder o intentar acceder a áreas, cuentas o datos para los que no esté autorizado, ni dañar, sobrecargar o inutilizar la Web;</li>
            <li>extraer o recopilar datos de los perfiles de forma masiva o automatizada, ni utilizarlos para fines distintos de los expresamente permitidos en los Términos y Condiciones.</li>
          </ul>

          <h2 className="text-2xl font-black text-navy">4. Propiedad intelectual e industrial</h2>
          <p>
            Todos los contenidos de la Web, entendiendo por éstos, a título enunciativo, los textos, fotografías, gráficos, imágenes, iconos, tecnología, software, links y demás contenidos audiovisuales o sonoros, así como su diseño gráfico y códigos fuente, son propiedad intelectual de Grupo Global Educa, S.L. o de terceros que han autorizado su uso, sin que puedan entenderse cedidos al usuario ninguno de los derechos de explotación sobre los mismos más allá de lo estrictamente necesario para el correcto uso de la Web. El nombre y el logotipo "FacultyMatch" son signos distintivos de la empresa y no pueden usarse sin su autorización.
          </p>
          <p>
            Los créditos de las fotografías de terceros y de los datos geográficos utilizados en la búsqueda por cercanía (GeoNames, licencia Creative Commons Atribución 4.0) figuran en la página de <a href="/creditos" className="text-talentia-blue">créditos</a>. Los contenidos que los usuarios incluyen en sus perfiles pertenecen a sus titulares, que son responsables de contar con los derechos necesarios para publicarlos.
          </p>

          <h2 className="text-2xl font-black text-navy">5. Contenidos de los usuarios y notificación de contenidos ilícitos</h2>
          <p>
            FacultyMatch presta un servicio de alojamiento de los perfiles y mensajes que los usuarios introducen en la Plataforma, de cuyo contenido son responsables. Si consideras que algún contenido de la Web es ilícito o vulnera tus derechos (por ejemplo, de propiedad intelectual, honor o protección de datos), puedes notificarlo a <strong>support@facultymatch.app</strong> indicando la dirección (URL) del contenido, los motivos por los que lo consideras ilícito y tus datos de contacto. Revisaremos la notificación con diligencia, adoptaremos las medidas que correspondan y te informaremos de la decisión.
          </p>
          <p>
            A efectos del Reglamento (UE) 2022/2065 (Reglamento de Servicios Digitales), el punto de contacto único para comunicarse con FacultyMatch, tanto para las autoridades como para los usuarios, es <strong>support@facultymatch.app</strong>, en español.
          </p>

          <h2 className="text-2xl font-black text-navy">6. Enlaces a sitios de terceros</h2>
          <p>
            La Web puede contener enlaces a sitios de terceros (por ejemplo, perfiles profesionales en LinkedIn, ORCID o Google Scholar). FacultyMatch no controla esos sitios ni se responsabiliza de sus contenidos o políticas, y su inclusión no implica recomendación ni relación con sus titulares.
          </p>

          <h2 className="text-2xl font-black text-navy">7. Responsabilidad</h2>
          <p>
            Grupo Global Educa, S.L. no será responsable de los daños o perjuicios de cualquier tipo producidos en el usuario que traigan causa de fallos o desconexiones en las redes de telecomunicaciones que produzcan la suspensión, cancelación o interrupción del servicio de la Web durante la prestación del mismo.
          </p>
          <p>
            La empresa no garantiza la ausencia de virus u otros elementos en los contenidos que puedan producir alteraciones en el sistema informático del usuario. Lo anterior se entiende sin perjuicio de la responsabilidad que la normativa imperativa, y en particular la de protección de los consumidores y usuarios, atribuya a la empresa.
          </p>

          <h2 className="text-2xl font-black text-navy">8. Protección de datos y cookies</h2>
          <p>
            El tratamiento de los datos personales de los usuarios se describe en la <a href="/privacy" className="text-talentia-blue">Política de Privacidad</a>, y el uso de cookies y tecnologías similares en la <a href="/cookies" className="text-talentia-blue">Política de Cookies</a>.
          </p>

          <h2 className="text-2xl font-black text-navy">9. Modificaciones</h2>
          <p>
            La empresa podrá modificar este Aviso Legal para adaptarlo a novedades legislativas o a cambios en los servicios. La versión vigente es la publicada en esta página, con la fecha de última actualización indicada arriba.
          </p>

          <h2 className="text-2xl font-black text-navy">10. Legislación aplicable y jurisdicción</h2>
          <p>
            Las relaciones entre la empresa y el usuario se regirán por la normativa española vigente. Si el usuario tiene la condición de consumidor, cualquier controversia se someterá a los juzgados y tribunales de su domicilio, de conformidad con la legislación de consumidores y usuarios. En los demás casos, las partes se someten a los juzgados y tribunales de la ciudad de Murcia, con renuncia expresa a cualquier otro fuero que pudiera corresponderles.
          </p>
        </div>
      </main>
    </div>
  );
}
