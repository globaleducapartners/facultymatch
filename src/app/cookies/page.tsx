import { Navbar } from "@/components/layout/Navbar";
import { CookieSettingsLink } from "@/components/layout/CookieSettingsLink";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/cookies" },
  title: "Política de Cookies | FacultyMatch",
  description: "Qué cookies y almacenamiento local usa FacultyMatch, para qué sirven y cómo aceptarlas, rechazarlas o cambiar tu decisión.",
};

interface Row {
  name: string;
  owner: string;
  purpose: string;
  duration: string;
}

const NECESSARY: Row[] = [
  {
    name: "sb-…-auth-token (y variantes .0, .1)",
    owner: "FacultyMatch (propia)",
    purpose: "Mantener tu sesión iniciada y proteger tu cuenta. Sin ella no podrías acceder a tu área privada.",
    duration: "Hasta que cierres sesión (máximo 400 días)",
  },
  {
    name: "cookie_consent (almacenamiento local)",
    owner: "FacultyMatch (propia)",
    purpose: "Recordar tu decisión sobre las cookies: aceptadas o rechazadas, la fecha y la versión de este aviso.",
    duration: "12 meses",
  },
  {
    name: "fm_chunk_reload_at (almacenamiento de sesión)",
    owner: "FacultyMatch (propia)",
    purpose: "Evitar bucles de recarga cuando publicamos una actualización mientras tienes la web abierta.",
    duration: "Hasta que cierres la pestaña",
  },
  {
    name: "fm_welcome_inst_… y fm_ai_improve_card (almacenamiento local)",
    owner: "FacultyMatch (propia)",
    purpose: "Recordar que has cerrado un aviso o una tarjeta informativa para no volver a mostrártela.",
    duration: "Hasta que borres los datos del navegador (la tarjeta de IA, 7 días tras el primer cierre)",
  },
];

const ANALYTICS: Row[] = [
  {
    name: "_ga y _ga_… (cookies)",
    owner: "Google (Google Analytics 4, a través de Google Tag Manager)",
    purpose: "Distinguir visitantes y medir cómo se usa la web (páginas vistas, procedencia, duración) para mejorarla. Datos agregados.",
    duration: "2 años",
  },
  {
    name: "_fbp y _fbc (cookies)",
    owner: "Meta Platforms Ireland Limited (píxel de Meta, a través de Google Tag Manager)",
    purpose:
      "Medir la eficacia de nuestras campañas publicitarias en Facebook e Instagram (por ejemplo, cuántas personas que ven un anuncio se registran) y mostrar publicidad relevante en esas plataformas. _fbc solo aparece si llegas desde un anuncio de Meta.",
    duration: "3 meses",
  },
  {
    name: "fm_acquisition (almacenamiento local)",
    owner: "FacultyMatch (propia)",
    purpose:
      "Recordar de qué campaña (parámetros utm_) o de qué web llegaste, para saber qué acciones de captación funcionan. Si después te registras, ese dato se guarda en tu perfil.",
    duration: "Hasta que retires el consentimiento o borres los datos del navegador",
  },
];

function CookieTable({ rows }: { rows: Row[] }) {
  return (
    <div className="not-prose overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Titular</th>
            <th className="px-4 py-3">Finalidad</th>
            <th className="px-4 py-3">Duración</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 align-top text-gray-700">
          {rows.map((r) => (
            <tr key={r.name}>
              <td className="px-4 py-3 font-mono text-xs text-navy">{r.name}</td>
              <td className="px-4 py-3">{r.owner}</td>
              <td className="px-4 py-3">{r.purpose}</td>
              <td className="px-4 py-3">{r.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-navy">Política de Cookies</h1>
          <p className="text-gray-500 font-medium">Última actualización: noviembre 2026</p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <h2 className="text-2xl font-black text-navy">1. Qué son las cookies y el almacenamiento local</h2>
          <p>
            Las cookies son pequeños archivos que un sitio web guarda en tu dispositivo. El almacenamiento local del navegador
            (<em>localStorage</em> y <em>sessionStorage</em>) cumple una función parecida. Esta política los trata de forma conjunta, conforme al art. 22.2 de la
            Ley 34/2002 (LSSI-CE) y al Reglamento (UE) 2016/679 (RGPD).
          </p>

          <h2 className="text-2xl font-black text-navy">2. Responsable</h2>
          <ul>
            <li><strong>Identidad:</strong> Grupo Global Educa, S.L. (CIF B19907047)</li>
            <li><strong>Dirección:</strong> Avenida de la Constitución, 4, 30008 Murcia, España</li>
            <li><strong>Email:</strong> info@globaleducapartners.com</li>
          </ul>

          <h2 className="text-2xl font-black text-navy">3. Qué usamos y para qué</h2>
          <h3 className="text-xl font-extrabold text-navy">Técnicas o necesarias (no requieren tu consentimiento)</h3>
          <p>
            Imprescindibles para que la plataforma funcione o para recordar una elección que tú has hecho. Se instalan siempre.
          </p>
          <CookieTable rows={NECESSARY} />

          <h3 className="text-xl font-extrabold text-navy">De análisis y publicidad (solo si las aceptas)</h3>
          <p>
            Nos permiten medir el uso de la web y el origen de las visitas, y medir nuestras campañas publicitarias. <strong>No se activan hasta que las
            aceptas</strong> y puedes rechazarlas sin perder ninguna función. Hoy se aceptan o rechazan todas juntas.
          </p>
          <CookieTable rows={ANALYTICS} />
          <p>
            Si en el futuro se añadiera alguna etiqueta o proveedor nuevo, actualizaremos esta tabla y volveremos a pedirte tu decisión.
          </p>
          <p>
            Cuando inicias sesión con Google o realizas un pago con Stripe, esos servicios pueden usar sus propias cookies técnicas en sus
            dominios; no las controlamos y se rigen por sus políticas.
          </p>

          <h2 className="text-2xl font-black text-navy">4. Cómo aceptar, rechazar o cambiar tu decisión</h2>
          <p>
            La primera vez que visitas la web te mostramos un aviso con las opciones «Aceptar todas» y «Rechazar todas», con el mismo peso visual.
            Puedes cambiar o retirar tu decisión cuando quieras, con la misma facilidad con la que la diste:
          </p>
          <p>
            <CookieSettingsLink className="rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white hover:opacity-90">
              Configurar cookies
            </CookieSettingsLink>
          </p>
          <p>
            También encontrarás ese mismo enlace, «Configurar cookies», al pie de las páginas públicas. Al retirar el consentimiento borramos las cookies
            de análisis y los datos de campaña guardados en tu navegador.
          </p>
          <p>
            Además, puedes bloquear o eliminar cookies desde la configuración de tu navegador:{" "}
            <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-talentia-blue">Chrome</a>,{" "}
            <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-talentia-blue">Firefox</a>,{" "}
            <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-talentia-blue">Safari</a> o{" "}
            <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-talentia-blue">Edge</a>.
            Si bloqueas las cookies técnicas, algunas funciones, como iniciar sesión, dejarán de funcionar.
          </p>
          <p>
            Para la publicidad basada en intereses, además de rechazar aquí las cookies, puedes oponerte desde la configuración de anuncios de tu cuenta de Facebook o Instagram y en{" "}
            <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer" className="text-talentia-blue">youronlinechoices.eu</a>.
          </p>

          <h2 className="text-2xl font-black text-navy">5. Transferencias internacionales</h2>
          <p>
            Si aceptas las cookies de análisis y publicidad, Google (Google Ireland Limited / Google LLC) y Meta (Meta Platforms Ireland Limited / Meta Platforms, Inc.)
            pueden tratar datos en Estados Unidos. Esa transferencia se ampara en las garantías previstas en el RGPD, como el Marco de Privacidad de Datos
            UE-EE. UU. y las cláusulas contractuales tipo.
          </p>

          <h2 className="text-2xl font-black text-navy">6. Cómo guardamos tu decisión</h2>
          <p>
            Tu decisión se guarda en tu propio navegador (estado, fecha y versión de este aviso). Te la volvemos a pedir pasados 12 meses o si cambian de forma
            sustancial las cookies que usamos.
          </p>

          <h2 className="text-2xl font-black text-navy">7. Más información</h2>
          <p>
            Consulta nuestra <a href="/privacy" className="text-talentia-blue">Política de privacidad</a> para saber cómo tratamos tus datos personales y cómo
            ejercer tus derechos. Si tienes dudas sobre esta política, escríbenos a info@globaleducapartners.com.
          </p>
        </div>
      </main>
    </div>
  );
}
