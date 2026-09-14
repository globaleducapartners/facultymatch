"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Dispara un evento al dataLayer de GTM justo cuando se acaba de crear una
 * cuenta (no cuando se termina el onboarding) — así Meta/GTM puede medir
 * un registro real en vez de solo "vio la página".
 *
 * Se monta en las páginas de destino del alta (verificar-email,
 * app/institution, app/faculty/onboarding) y solo dispara si llega el
 * parámetro `fm_signup` en la URL, que ponen los redirects de signUp()
 * tanto en el alta por email como por SSO.
 */
export function SignupConversionPixel({ role }: { role?: string | null }) {
  useEffect(() => {
    if (!role) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "sign_up_completed", signup_role: role });
  }, [role]);

  return null;
}
