export const CONSENT_STORAGE_KEY = "cookie_consent";
export const CONSENT_CHANGED_EVENT = "fm-cookie-consent-changed";
export const OPEN_COOKIE_SETTINGS_EVENT = "fm-open-cookie-settings";

// Versión de la información que se muestra en el banner (y en /cookies). Si
// cambia de forma sustancial (nuevos terceros, nuevas finalidades) se sube y
// se vuelve a pedir el consentimiento a todo el mundo.
export const CONSENT_VERSION = "2026-11";

// El consentimiento caduca a los 12 meses (la AEPD recomienda no pasar de 24).
const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export type ConsentStatus = "accepted" | "rejected";

export interface StoredConsent {
  status: ConsentStatus;
  at: string;
  version: string;
}

/**
 * Decisión vigente del visitante, o null si no hay (nunca decidió, caducó, es de
 * una versión anterior del aviso o es el formato antiguo —texto suelto sin fecha—,
 * que no sirve como prueba de consentimiento).
 */
export function getConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Partial<StoredConsent>;
    if (c.status !== "accepted" && c.status !== "rejected") return null;
    if (c.version !== CONSENT_VERSION) return null;
    const at = Date.parse(c.at ?? "");
    if (!Number.isFinite(at) || Date.now() - at > CONSENT_MAX_AGE_MS) return null;
    return { status: c.status, at: c.at as string, version: c.version };
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  return getConsent()?.status === "accepted";
}

// Borra lo que se guardó con consentimiento: datos de campaña propios y cookies de Google Analytics y del píxel de Meta.
export function purgeAnalyticsStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("fm_acquisition");
  } catch {
    // localStorage no disponible
  }
  try {
    const host = window.location.hostname;
    const parts = host.split(".");
    const domains = [undefined, host, `.${host}`, `.${parts.slice(-2).join(".")}`];
    const names = document.cookie
      .split(";")
      .map((c) => c.split("=")[0].trim())
      .filter((n) => /^(_ga|_gid|_gat|_gcl_|_dc_gtm_|_fbp|_fbc)/.test(n));
    for (const name of names) {
      for (const d of domains) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${d ? `;domain=${d}` : ""}`;
      }
    }
  } catch {
    // sin acceso a cookies
  }
}

/** Guarda la decisión (con fecha y versión) y avisa al resto de la web. */
export function saveConsent(status: ConsentStatus): void {
  if (typeof window === "undefined") return;
  if (status === "rejected") purgeAnalyticsStorage();
  try {
    const value: StoredConsent = { status, at: new Date().toISOString(), version: CONSENT_VERSION };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Sin almacenamiento no se puede recordar la decisión: se volverá a preguntar.
  }
  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
}

/** Reabre el aviso para cambiar o retirar la decisión (enlace «Configurar cookies»). */
export function openCookieSettings(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
}
