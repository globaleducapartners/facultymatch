export const CONSENT_STORAGE_KEY = "cookie_consent";
export const CONSENT_CHANGED_EVENT = "fm-cookie-consent-changed";

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(CONSENT_STORAGE_KEY) === "accepted";
  } catch {
    return false;
  }
}
