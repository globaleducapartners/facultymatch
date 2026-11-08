import { Navbar } from "@/components/layout/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/terms" },
  title: "Términos y Condiciones | FacultyMatch",
  description: "Condiciones de uso de FacultyMatch: registro, verificación, planes y precios, cancelación y desistimiento, programa de referidos, uso de la IA y normas para docentes e instituciones.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-navy">Términos y Condiciones</h1>
          <p className="text-gray-500 font-medium">Última actualización: noviembre 2026 · Versión 2</p>
          <p className="text-gray-600">
            Esta versión se aplica a los nuevos registros desde el 8 de noviembre de 2026 y, a quienes ya estaban registrados antes, a partir del 24 de noviembre de 2026
            (quince días después de comunicárselo). Si no estás de acuerdo con los cambios, puedes darte de baja antes de esa fecha sin coste.
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <h2 className="text-2xl font-black text-navy">1. Quiénes somos y a quién se aplican estos términos</h2>
          <p>
            Estos Términos regulan el uso de la plataforma <strong>facultymatch.app</strong>, titularidad de <strong>Grupo Global Educa, S.L.</strong> (CIF B19907047, Avenida de la Constitución, 4, 30008 Murcia; Registro Mercantil de Murcia, Sección 8, Hoja MU-114190, Inscripción 2, Tomo A-2), en adelante «FacultyMatch». Se aplican a los usuarios que se registran como <strong>Docentes</strong> (profesionales y académicos que crean un perfil) y como <strong>Instituciones</strong> (universidades, escuelas de negocio y otros centros que buscan docentes). Complementan el <a href="/legal" className="text-talentia-blue">Aviso Legal</a>, la <a href="/privacy" className="text-talentia-blue">Política de Privacidad</a> y la <a href="/cookies" className="text-talentia-blue">Política de Cookies</a>.
          </p>
          <p>Contacto: info@globaleducapartners.com (asuntos generales) y support@facultymatch.app (atención al usuario).</p>

          <h2 className="text-2xl font-black text-navy">2. Qué es FacultyMatch</h2>
          <p>
            FacultyMatch es un directorio de talento docente: los Docentes crean un perfil que nuestro equipo revisa y, si procede, verifica; las Instituciones buscan perfiles y contactan con ellos. FacultyMatch pone en contacto a las partes, <strong>no es parte</strong> de las colaboraciones o contrataciones que acuerden entre sí, y <strong>no cobra comisión</strong> por ellas. Las condiciones económicas y laborales se pactan directamente entre Docente e Institución.
          </p>

          <h2 className="text-2xl font-black text-navy">3. Registro, cuenta y capacidad</h2>
          <ul>
            <li>Debes ser <strong>mayor de edad</strong> y facilitar información veraz, completa y actualizada. Si te registras en nombre de una institución, declaras tener poder para vincularla.</li>
            <li>Tienes una cuenta única; puedes cambiar entre el modo Docente y el modo Institución cuando proceda.</li>
            <li>Eres responsable de custodiar tus credenciales y de lo que ocurra desde tu cuenta. Avísanos de inmediato si sospechas un uso no autorizado.</li>
            <li>El alta exige confirmar tu correo electrónico mediante un enlace que caduca a las 24 horas.</li>
          </ul>

          <h2 className="text-2xl font-black text-navy">4. Verificación de perfiles</h2>
          <p>
            Un perfil de Docente pasa por estos estados: pendiente de verificación, incompleto, en revisión, verificado, rechazado o suspendido. La verificación la realiza una persona de nuestro equipo a partir de la información y los documentos que aportas, y consiste en comprobar su coherencia y apariencia de veracidad; <strong>no constituye una garantía</strong> de la exactitud de todo el contenido del perfil ni de las cualidades del Docente.
          </p>
          <ul>
            <li>Si rechazamos un perfil, te indicaremos el motivo y podrás corregirlo y volver a enviarlo.</li>
            <li>Si modificas campos sensibles de un perfil verificado (nombre, nivel académico, titulaciones, acreditación ANECA, doctorado, instituciones, institución actual, Google Scholar u ORCID), el perfil vuelve a revisión y deja de aparecer en el directorio hasta que se verifique de nuevo.</li>
            <li>Podemos suspender perfiles que incumplan estos términos o contengan información falsa.</li>
          </ul>

          <h2 className="text-2xl font-black text-navy">5. Tu contenido</h2>
          <p>
            Conservas la titularidad del contenido que subes (datos del perfil, foto, documentos, mensajes). Nos concedes una licencia gratuita, no exclusiva y limitada a lo necesario para prestar el servicio: alojarlo, mostrarlo según la visibilidad que hayas elegido, indexarlo en el buscador interno, generar tu ficha pública y el certificado en PDF de perfil verificado, y enviarlo a las instituciones con las que contactes. La licencia termina cuando eliminas el contenido o tu cuenta, salvo copias técnicas temporales.
          </p>
          <p>
            Garantizas que tienes derecho a publicar lo que subes y que no es ilícito, difamatorio, discriminatorio, engañoso ni vulnera derechos de terceros (incluidos datos personales ajenos y propiedad intelectual).
          </p>

          <h2 className="text-2xl font-black text-navy">6. Reglas para Docentes e Instituciones</h2>
          <p><strong>Docentes:</strong> aportar información veraz, mantener actualizada su disponibilidad, colaborar en la verificación y no suplantar identidades ni titulaciones.</p>
          <p><strong>Instituciones:</strong></p>
          <ul>
            <li>Usar la plataforma exclusivamente para la búsqueda legítima de talento académico y contactar con respeto y sin discriminación.</li>
            <li>No usar los datos de los perfiles para otros fines, no cederlos a terceros sin base legal y no enviar comunicaciones comerciales no solicitadas.</li>
            <li>No extraer ni recopilar datos de forma masiva o automatizada (scraping), ni eludir los límites del plan.</li>
            <li>Tratar los datos que reciban de los docentes como responsables independientes, conforme al RGPD, e informar a los docentes cuando proceda.</li>
          </ul>
          <p>Está prohibido, además, intentar acceder a datos o cuentas ajenos, sobrecargar o dañar la plataforma o usarla de forma contraria a la ley.</p>

          <h2 className="text-2xl font-black text-navy">7. Visibilidad, búsqueda y orden de los resultados</h2>
          <p>
            Los Docentes eligen la visibilidad de su perfil y pueden bloquear instituciones concretas. Un perfil nuevo no aparece en las búsquedas hasta que decide hacerlo visible. Solo los perfiles verificados se muestran con sus datos en el directorio.
          </p>
          <p>
            Los resultados se ordenan principalmente por la coincidencia con lo que busca la institución o, si indica una ciudad, por la cercanía a ella (a partir de la ciudad del perfil, nunca de una dirección). <strong>A igualdad de criterio</strong>, tienen preferencia los perfiles con el plan Professional Docente y, después, los más completos. No garantizamos una posición concreta en los resultados.
          </p>

          <h2 className="text-2xl font-black text-navy">8. Planes, precios y pago</h2>
          <ul>
            <li><strong>Docentes:</strong> el registro y el perfil básico son gratuitos. El plan <strong>Professional Docente</strong> cuesta 29 € al año e incluye posicionamiento prioritario, estadísticas de visitas y soporte prioritario.</li>
            <li><strong>Instituciones:</strong> el plan gratuito incluye 5 búsquedas y 5 contactos al mes. El plan <strong>Professional Institución</strong> cuesta 99 € al mes e incluye búsquedas y contactos ilimitados, filtros avanzados, favoritos sin límite, hasta tres usuarios y soporte prioritario.</li>
            <li>Los precios de los planes para Docentes incluyen el IVA aplicable. Los de Instituciones se indican sin IVA, que se añadirá cuando corresponda. El importe total se muestra antes de pagar.</li>
            <li>El pago se realiza con tarjeta a través de Stripe. Las suscripciones <strong>se renuevan automáticamente</strong> cada periodo (mensual o anual) hasta que las canceles.</li>
            <li>Si un pago falla, podremos suspender los beneficios del plan hasta regularizarlo; tu cuenta pasa al plan gratuito.</li>
            <li>Podemos modificar los precios o los planes con un aviso de al menos 30 días. Si no estás de acuerdo, puedes cancelar antes de que se apliquen; el cambio no afecta al periodo ya pagado.</li>
          </ul>

          <h2 className="text-2xl font-black text-navy">9. Cancelación, desistimiento y devoluciones</h2>
          <ul>
            <li><strong>Cancelar:</strong> puedes cancelar tu suscripción cuando quieras desde «Gestionar o cancelar suscripción» (en Ajustes o en Plan y facturación). Se mantiene hasta el final del periodo ya pagado y no se renueva.</li>
            <li>
              <strong>Docentes (consumidores):</strong> tienes derecho a desistir y a que te devolvamos el importe íntegro en los <strong>14 días naturales</strong> siguientes a la contratación, sin necesidad de justificarlo, escribiendo a support@facultymatch.app.
            </li>
            <li><strong>Instituciones:</strong> al tratarse de una contratación entre profesionales, no existe el derecho legal de desistimiento.</li>
            <li>Fuera de esos plazos no se reembolsa de forma proporcional el periodo ya pagado, salvo error o fallo del servicio imputable a FacultyMatch.</li>
            <li>Si eliminas tu cuenta, la suscripción activa se cancela y no se renovará.</li>
          </ul>

          <h2 className="text-2xl font-black text-navy">10. Inteligencia artificial</h2>
          <p>
            Las funciones de IA (crear o mejorar tu perfil a partir de tu CV) son opcionales. Ofrecen una propuesta que debes revisar: eres responsable del contenido que finalmente confirmes y publiques. La IA puede cometer errores. El tratamiento de tus datos en estas funciones se describe en la <a href="/privacy" className="text-talentia-blue">Política de Privacidad</a>.
          </p>

          <h2 className="text-2xl font-black text-navy">11. Programa «Invita y Gana»</h2>
          <ul>
            <li>Puedes compartir tu enlace personal sin límite y enviar hasta 20 invitaciones por correo electrónico, solo a personas que conozcas y sin enviar mensajes no deseados.</li>
            <li>Cada invitación incluye un código de un solo uso que da a la persona invitada un mes de plan Professional gratuito, válido para quien aún no ha contratado ningún plan.</li>
            <li>Cuando 10 personas invitadas por ti se registren, completen su perfil y nuestro equipo lo verifique, recibes un año de plan Professional gratuito.</li>
            <li>Las recompensas no son canjeables por dinero ni transferibles. Podemos denegarlas o retirarlas si detectamos fraude, cuentas duplicadas o un uso abusivo, y modificar o cancelar el programa avisando con antelación, sin afectar a las recompensas ya conseguidas.</li>
          </ul>

          <h2 className="text-2xl font-black text-navy">12. Disponibilidad del servicio y responsabilidad</h2>
          <p>
            Hacemos lo razonable para mantener la plataforma disponible, pero puede haber interrupciones por mantenimiento o causas ajenas. FacultyMatch no garantiza que los Docentes y las Instituciones lleguen a un acuerdo, ni responde de los compromisos que adquieran entre sí ni de la exactitud de toda la información de los perfiles. En la medida permitida por la ley, no responderemos de daños indirectos ni de lucro cesante. Nada de lo anterior limita la responsabilidad que la normativa imperativa, en particular la de protección de consumidores, no permita excluir.
          </p>

          <h2 className="text-2xl font-black text-navy">13. Suspensión y baja</h2>
          <p>
            Puedes darte de baja cuando quieras desde Ajustes, o escribiendo a support@facultymatch.app. Podemos suspender o cancelar una cuenta que incumpla estos términos, con aviso previo salvo incumplimientos graves o riesgo para otros usuarios. Siempre te indicaremos el motivo de la decisión y podrás responder o recurrirla escribiendo a support@facultymatch.app; la revisaremos con una persona distinta a quien la adoptó cuando sea posible. Para notificar contenidos ilícitos, consulta el <a href="/legal" className="text-talentia-blue">Aviso Legal</a>.
          </p>

          <h2 className="text-2xl font-black text-navy">14. Propiedad intelectual</h2>
          <p>
            La plataforma, su diseño, marca y software pertenecen a FacultyMatch o a sus licenciantes. Se te concede un derecho personal, no exclusivo e intransferible de uso conforme a estos términos.
          </p>

          <h2 className="text-2xl font-black text-navy">15. Modificaciones de los términos</h2>
          <p>
            Podemos modificar estos Términos por cambios legales, técnicos o del servicio. Te lo comunicaremos con al menos 15 días de antelación por correo o en la plataforma. Si no aceptas los cambios, puedes darte de baja sin penalización antes de que entren en vigor; el uso continuado después implica su aceptación.
          </p>

          <h2 className="text-2xl font-black text-navy">16. Ley aplicable y jurisdicción</h2>
          <p>
            Estos Términos se rigen por la legislación española. Si eres consumidor, cualquier controversia se someterá a los juzgados y tribunales de tu domicilio. En los demás casos (por ejemplo, instituciones), las partes se someten a los juzgados y tribunales de la ciudad de Murcia, con renuncia expresa a cualquier otro fuero.
          </p>
        </div>
      </main>
    </div>
  );
}
