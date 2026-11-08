"use client";

import { useEffect } from "react";
import { CONSENT_CHANGED_EVENT, hasAnalyticsConsent } from "@/lib/consent";

const STORAGE_KEY = "fm_acquisition";

/**
 * Captures UTM parameters from the URL + document.referrer
 * and stores them in localStorage under "fm_acquisition".
 * Only writes once — subsequent page loads keep the original values.
 *
 * Es una medición (no una función necesaria): solo guarda algo en el navegador
 * si el visitante ha aceptado las cookies de análisis (LSSI art. 22.2). Si
 * retira el consentimiento, saveConsent() borra lo guardado.
 */
export function AcquisitionTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const capture = () => {
      if (!hasAnalyticsConsent()) return;

      // Only capture once
      try {
        if (localStorage.getItem(STORAGE_KEY)) return;
      } catch {
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get("utm_source");
      const utmMedium = params.get("utm_medium");
      const utmCampaign = params.get("utm_campaign");
      const referrer = document.referrer || "";

      const data: Record<string, string> = {};
      if (utmSource) data.utm_source = utmSource;
      if (utmMedium) data.utm_medium = utmMedium;
      if (utmCampaign) data.utm_campaign = utmCampaign;
      if (referrer) data.referrer_url = referrer.slice(0, 500);

      if (Object.keys(data).length > 0) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
          // localStorage might be unavailable
        }
      }
    };

    capture();
    // Si acepta estando ya en la página de llegada, aún se pueden leer los parámetros.
    window.addEventListener(CONSENT_CHANGED_EVENT, capture);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, capture);
  }, []);

  return null;
}
