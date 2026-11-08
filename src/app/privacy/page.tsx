import { Navbar } from "@/components/layout/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/privacy" },
  title: "Política de Privacidad | FacultyMatch",
  description: "Cómo trata FacultyMatch tus datos personales: qué datos, para qué, con qué base legal, a quién se comunican, cuánto tiempo se conservan y cómo ejercer tus derechos (RGPD y LOPDGDD).",
};

type Row = string[];

function Table({ head, rows }: { head: string[]; rows: Row[] }) {
  return (
    <div className="not-prose overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full min-w-[620px] border-collapse text-left text-sm">
        <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 align-top text-gray-700">
          {rows.map((r) => (
            <tr key={r[0]}>
              {r.map((c, i) => (
                <td key={i} className={`px-4 py-3 ${i === 0 ? "font-semibold text-navy" : ""}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-navy">Política de Privacidad</h1>
          <p className="text-gray-500 font-medium">Última actualización: noviembre 2026 · Versión 2</p>
          <p className="text-gray-600">
            En FacultyMatch tratamos tus datos con transparencia. Aquí te explicamos, en lenguaje claro, qué datos recogemos, para qué los usamos, con qué
            base legal, quién puede verlos, cuánto tiempo los conservamos y cómo ejercer tus derechos, conforme al Reglamento (UE) 2016/679 (RGPD) y a la
            Ley Orgánica 3/2018 (LOPDGDD).
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <h2 className="text-2xl font-black text-navy">1. Responsable del tratamiento</h2>
          <ul>
            <li><strong>Identidad:</strong> Grupo Global Educa, S.L. (nombre comercial: FacultyMatch)</li>
            <li><strong>CIF:</strong> B19907047</li>
            <li><strong>Domicilio:</strong> Avenida de la Constitución, 4, 30008 Murcia, España</li>
            <li><strong>Registro Mercantil:</strong> Murcia (Sección 8, Hoja MU-114190, Inscripción 2, Tomo A-2)</li>
            <li><strong>Contacto de privacidad:</strong> support@facultymatch.app (también info@globaleducapartners.com)</li>
          </ul>

          <h2 className="text-2xl font-black text-navy">2. Qué datos tratamos y de dónde proceden</h2>
          <p>Casi todos los datos los facilitas tú al registrarte y completar tu perfil. Según uses la plataforma como docente o como institución, tratamos:</p>
          <ul>
            <li><strong>Cuenta y acceso:</strong> nombre, correo electrónico, contraseña (que se guarda cifrada por nuestro proveedor de autenticación), rol y, si inicias sesión con Google, el nombre, correo y foto que Google nos comparte.</li>
            <li>
              <strong>Perfil de docente:</strong> foto, titular, biografía, país y ciudad (hasta tres), titulaciones, experiencia, instituciones donde has impartido, áreas de conocimiento, idiomas, modalidades y disponibilidad, enlaces
              profesionales (LinkedIn, web, ORCID, Google Scholar), datos de contacto que decidas mostrar (teléfono, correo, WhatsApp) y los documentos que subas para verificar tu perfil.
            </li>
            <li><strong>Datos importados a petición tuya:</strong> si usas la importación desde ORCID, los datos públicos de tu registro; si subes tu CV, el contenido que contenga (ver apartado 5).</li>
            <li><strong>Institución:</strong> nombre y tipo de institución, CIF, web, ciudad y país, datos de contacto de la persona que gestiona la cuenta y, en su caso, el dominio de correo para verificarla.</li>
            <li><strong>Contactos entre usuarios:</strong> mensajes, asunto, fechas, modalidad y respuestas entre instituciones y docentes; favoritos, bloqueos y reglas de visibilidad.</li>
            <li><strong>Pagos:</strong> el pago lo gestiona Stripe, que recoge los datos de tu tarjeta; nosotros no los vemos. Guardamos tu plan, el estado y las fechas de la suscripción y los identificadores de cliente y suscripción.</li>
            <li><strong>Programa de referidos:</strong> si invitas a alguien por correo, guardamos su dirección de correo (que nos facilitas tú), el código de invitación y su estado.</li>
            <li><strong>Uso y seguridad:</strong> visitas a páginas y a perfiles dentro de la plataforma (qué rol visita, cuándo), registro de los correos que te enviamos, tu dirección IP en los registros del servidor y, convertida en un código irreversible, para limitar abusos, y datos técnicos del dispositivo.</li>
            <li><strong>Origen del registro:</strong> si has aceptado las cookies de análisis, de qué campaña o web llegaste.</li>
          </ul>
          <p>
            No solicitamos datos de categorías especiales (salud, afiliación sindical, origen, etc.). Te pedimos que no los incluyas en tu perfil ni en el CV que subas; si lo haces, los trataremos únicamente para el fin que tú indicas y podrás eliminarlos cuando quieras.
          </p>

          <h2 className="text-2xl font-black text-navy">3. Para qué usamos tus datos y con qué base legal</h2>
          <Table
            head={["Finalidad", "Base legal (RGPD)"]}
            rows={[
              ["Crear y gestionar tu cuenta y tu perfil", "Ejecución del contrato (art. 6.1.b)"],
              ["Verificar tu perfil mediante revisión manual de tus datos y documentos", "Ejecución del contrato (6.1.b) e interés legítimo en la fiabilidad del directorio (6.1.f)"],
              ["Mostrar tu perfil a instituciones, o públicamente si eliges visibilidad pública, y permitir la búsqueda, incluida la búsqueda por cercanía a partir de tu ciudad", "Ejecución del contrato (6.1.b) y tu elección de visibilidad"],
              ["Permitir el contacto y la mensajería entre instituciones y docentes", "Ejecución del contrato (6.1.b)"],
              ["Rellenar tu perfil con ayuda de inteligencia artificial a partir de tu CV", "Tu consentimiento al subir el CV (6.1.a)"],
              ["Gestionar suscripciones, cobros y facturación", "Ejecución del contrato (6.1.b) y obligación legal (6.1.c)"],
              ["Enviarte mensajes del servicio: activación, verificación, avisos de contactos, recordatorios para completar el perfil y actualizaciones de estas condiciones", "Ejecución del contrato (6.1.b) e interés legítimo (6.1.f)"],
              ["Enviarte el resumen semanal de actividad", "Tu consentimiento, al activarlo en Ajustes (6.1.a)"],
              ["Informarte de novedades de FacultyMatch y de la comunidad, con baja sencilla en cada mensaje", "Interés legítimo (6.1.f) y art. 21.2 LSSI-CE; consentimiento (6.1.a) para comunicaciones comerciales"],
              ["Enviar una invitación a quien tú invites con el programa de referidos", "Interés legítimo (6.1.f) y tu petición como usuario que invita"],
              ["Seguridad, prevención del fraude y del abuso, límites de uso", "Interés legítimo (6.1.f)"],
              ["Estadísticas internas de uso para mejorar la plataforma (visitas a perfiles, páginas vistas dentro de la plataforma)", "Interés legítimo (6.1.f)"],
              ["Analítica web y medición de campañas publicitarias (cookies de Google y Meta)", "Tu consentimiento (6.1.a), ver Política de cookies"],
              ["Atender consultas y el ejercicio de derechos, y tramitar notificaciones de contenido ilícito", "Obligación legal (6.1.c) e interés legítimo (6.1.f)"],
              ["Cumplir obligaciones legales y defender reclamaciones", "Obligación legal (6.1.c) e interés legítimo (6.1.f)"],
            ]}
          />
          <p>Puedes retirar en cualquier momento los consentimientos que nos hayas dado, sin que ello afecte a la licitud del tratamiento previo.</p>

          <h2 className="text-2xl font-black text-navy">4. Quién puede ver tus datos</h2>
          <ul>
            <li><strong>Instituciones registradas y otros docentes</strong>, solo con el alcance que determine tu configuración de privacidad. Por defecto un perfil nuevo no aparece en las búsquedas. Tu teléfono y tus datos de contacto solo los ven las instituciones con plan que lo incluye.</li>
            <li><strong>Cualquier persona</strong>, únicamente si eliges una visibilidad pública y tu perfil está verificado (se publica una ficha con tu nombre y trayectoria).</li>
            <li>
              <strong>Proveedores que tratan datos por nuestra cuenta (encargados del tratamiento):</strong> Supabase (base de datos, autenticación y almacenamiento de archivos), Vercel (alojamiento de la web), Resend (envío de correos),
              Stripe (pagos), Anthropic (inteligencia artificial, solo si usas la función de CV) y, con tu consentimiento, Google (Analytics y Tag Manager). Tenemos con ellos los acuerdos de tratamiento de datos que exige el RGPD.
            </li>
            <li>
              <strong>Meta Platforms Ireland Limited</strong>, si aceptas las cookies de publicidad: el píxel de Meta le permite medir la eficacia de nuestras campañas. Meta actúa como corresponsable de esa medición conforme a sus condiciones.
            </li>
            <li><strong>ORCID y OpenAlex</strong>, a los que consultamos datos públicos cuando tú solicitas la importación; y <strong>Google</strong>, si eliges iniciar sesión con tu cuenta de Google.</li>
            <li><strong>Autoridades, jueces y tribunales y asesores</strong>, cuando exista una obligación legal o para defender nuestros derechos.</li>
          </ul>
          <p>No vendemos tus datos ni los cedemos a terceros con fines comerciales propios.</p>

          <h2 className="text-2xl font-black text-navy">5. Inteligencia artificial y decisiones automatizadas</h2>
          <p>
            La función «Crea tu perfil con IA» y «Mejorar con IA» es opcional. Si la usas, extraemos en nuestro servidor el texto de tu CV y enviamos <strong>solo ese texto</strong> (nunca el archivo) a Anthropic, que lo procesa por encargo nuestro y, conforme a sus condiciones comerciales, no lo utiliza para entrenar sus modelos. El archivo que subes se borra de nuestro almacenamiento en cuanto se ha leído, y nada de lo que propone la IA se guarda hasta que lo revisas y lo confirmas.
          </p>
          <p>
            No adoptamos decisiones que te afecten jurídicamente basadas únicamente en tratamientos automatizados. La verificación de tu perfil la realiza una persona de nuestro equipo. El orden de los resultados de búsqueda depende de lo que busca la institución, de la cercanía, de lo completo que esté el perfil y de si el docente tiene el plan Professional; esto se explica en los{" "}
            <a href="/terms" className="text-talentia-blue">Términos y Condiciones</a>. Si quieres que una persona revise cualquier decisión, escríbenos.
          </p>

          <h2 className="text-2xl font-black text-navy">6. Transferencias internacionales</h2>
          <p>
            Algunos de nuestros proveedores (Supabase, Vercel, Resend, Stripe, Anthropic, Google y Meta) pertenecen a grupos con sede en Estados Unidos, por lo que tus datos pueden tratarse fuera del Espacio Económico Europeo. Esas transferencias se amparan en una decisión de adecuación de la Comisión Europea (Marco de Privacidad de Datos UE-EE. UU., para las empresas adheridas) y, en su defecto, en cláusulas contractuales tipo y medidas complementarias. Puedes pedirnos más información o una copia de las garantías escribiendo a support@facultymatch.app.
          </p>

          <h2 className="text-2xl font-black text-navy">7. Cuánto tiempo conservamos tus datos</h2>
          <Table
            head={["Datos", "Plazo"]}
            rows={[
              ["Cuenta, perfil, documentos de verificación, contactos, favoritos y registros de actividad", "Mientras mantengas la cuenta. Al eliminarla desde Ajustes se borran de la plataforma."],
              ["CV subido para la función de IA", "Se elimina en cuanto se lee el texto. Los datos extraídos solo se guardan si los confirmas."],
              ["Facturación y pagos", "El plazo que exige la normativa mercantil y fiscal (hasta 6 años), debidamente bloqueados. Los conserva también Stripe."],
              ["Solicitudes de derechos, reclamaciones y notificaciones de contenido ilícito", "Mientras puedan derivarse responsabilidades (hasta 3 años)."],
              ["Cuentas sin actividad", "Si una cuenta lleva más de 36 meses sin actividad, te avisaremos por correo antes de eliminarla."],
              ["Copias de seguridad técnicas", "Se sobrescriben en los ciclos ordinarios de nuestro proveedor; no se utilizan para otra finalidad."],
              ["Cookies y almacenamiento local", "Los plazos de la Política de cookies; tu decisión sobre ellas, 12 meses."],
            ]}
          />

          <h2 className="text-2xl font-black text-navy">8. Tus derechos y cómo ejercerlos</h2>
          <p>Tienes derecho a acceder a tus datos, rectificarlos, suprimirlos, oponerte a su tratamiento, limitarlo, recibirlos en un formato estructurado (portabilidad), retirar tus consentimientos y no ser objeto de decisiones exclusivamente automatizadas.</p>
          <ul>
            <li><strong>Por ti mismo en la plataforma:</strong> edita tu perfil, ajusta tu visibilidad y tus notificaciones, descarga tus datos y elimina tu cuenta desde <em>Ajustes</em>, y cambia tu decisión sobre cookies desde «Configurar cookies».</li>
            <li><strong>Por correo:</strong> escribe a support@facultymatch.app indicando el derecho que quieres ejercer. Respondemos en el plazo máximo de un mes. Solo te pediremos documentación que acredite tu identidad si tenemos dudas razonables sobre ella.</li>
          </ul>
          <p>
            Si consideras que no tratamos tus datos conforme a la normativa, puedes presentar una reclamación ante la Agencia Española de Protección de Datos (
            <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-talentia-blue">www.aepd.es</a>), sin perjuicio de que puedas contactar antes con nosotros.
          </p>

          <h2 className="text-2xl font-black text-navy">9. Datos de terceros: invitaciones y personas de contacto</h2>
          <p>
            Si recibes una invitación de FacultyMatch, es porque un usuario nos ha facilitado tu correo electrónico para invitarte; solo lo usamos para enviarte esa invitación y, si te registras, para aplicar el código. No te escribiremos más por ese motivo. Si no quieres recibirla o quieres que eliminemos tu dirección, escríbenos a support@facultymatch.app. Quien invita se compromete a hacerlo solo con personas que conoce.
          </p>
          <p>
            Cuando una institución contacta con un docente, se convierte en responsable independiente de los datos que reciba y debe tratarlos conforme a la normativa y a los Términos y Condiciones.
          </p>

          <h2 className="text-2xl font-black text-navy">10. Menores y seguridad</h2>
          <p>
            FacultyMatch está dirigido a profesionales mayores de edad y no recoge conscientemente datos de menores. Aplicamos medidas técnicas y organizativas adecuadas: conexiones cifradas (HTTPS), control de acceso por roles y políticas de seguridad a nivel de fila en la base de datos, tokens de activación almacenados cifrados y caducidad de enlaces, y acceso restringido del equipo a los datos.
          </p>

          <h2 className="text-2xl font-black text-navy">11. Cookies</h2>
          <p>
            Usamos cookies técnicas y, solo si las aceptas, de análisis y publicidad. Consulta la <a href="/cookies" className="text-talentia-blue">Política de cookies</a> para ver cuáles son y cómo cambiar tu decisión.
          </p>

          <h2 className="text-2xl font-black text-navy">12. Cambios en esta política</h2>
          <p>
            Si cambiamos esta política de forma relevante, te lo comunicaremos por correo o en la plataforma. La versión vigente es siempre la publicada aquí, con su fecha y número de versión.
          </p>
        </div>
      </main>
    </div>
  );
}
