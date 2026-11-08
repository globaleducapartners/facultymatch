"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { hasAnalyticsConsent, CONSENT_CHANGED_EVENT } from "@/lib/consent";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GTM_ID = "GTM-P64FLPTT";

// Zonas privadas o con datos en la URL (id de un docente, tokens de verificación
// o de recuperación de contraseña): ahí no se carga ninguna etiqueta de medición,
// aunque el visitante haya aceptado las cookies. Las direcciones de esas pantallas
// no deben llegar a Google ni a Meta.
const PRIVATE_PREFIXES = [
  "/app", "/control", "/admin", "/admin-login", "/dashboard", "/checkout",
  "/auth", "/reset-password", "/update-password", "/verifica-tu-correo",
];

export function isPrivateAnalyticsPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// Direcciones públicas cuya URL arrastra una ruta privada o un token: por ejemplo
// /login?next=/app/faculty/<id> (redirección al intentar abrir una página privada sin sesión).
function hasSensitiveQuery(q: { get(name: string): string | null; has(name: string): boolean } | null): boolean {
  if (!q) return false;
  const next = q.get("next") ?? "";
  return isPrivateAnalyticsPath(next) || q.has("token_hash") || q.has("code") || q.has("access_token");
}

// Carga GTM y GA4 solo si el visitante ha aceptado cookies no esenciales y no
// está en el área privada. Antes se cargaban siempre desde el <head> del layout,
// sin comprobar el consentimiento — ver CookieConsent.tsx.
export function GoogleAnalytics() {
  const [consented, setConsented] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isPrivate = isPrivateAnalyticsPath(pathname) || hasSensitiveQuery(searchParams);

  useEffect(() => {
    let wasConsented = hasAnalyticsConsent();
    setConsented(wasConsented);
    const onChange = () => {
      const now = hasAnalyticsConsent();
      // Retirada del consentimiento con las etiquetas de Google ya cargadas: no se
      // pueden descargar de la página, así que se recarga (las cookies ya se borraron
      // en saveConsent) para que dejen de funcionar de inmediato.
      if (wasConsented && !now) {
        window.location.reload();
        return;
      }
      wasConsented = now;
      setConsented(now);
    };
    window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
  }, []);

  // Navegación (sin recarga) desde una página pública, con las etiquetas ya cargadas,
  // hacia el área privada: seguirían registrando la ruta. Se recarga para empezar sin ellas.
  useEffect(() => {
    if (isPrivate && document.getElementById("gtm")) {
      window.location.reload();
    }
  }, [isPrivate]);

  if (!consented || isPrivate) return null;

  return (
    <>
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}
    </>
  );
}
