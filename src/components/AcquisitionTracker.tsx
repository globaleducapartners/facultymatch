"use client";

import { useEffect } from "react";

const STORAGE_KEY = "fm_acquisition";

/**
 * Captures UTM parameters from the URL + document.referrer
 * and stores them in localStorage under "fm_acquisition".
 * Only writes once — subsequent page loads keep the original values.
 */
export function AcquisitionTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only capture once
    if (localStorage.getItem(STORAGE_KEY)) return;

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
  }, []);

  return null;
}