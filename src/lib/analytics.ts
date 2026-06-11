/**
 * Google Analytics 4 — helper functions.
 * All functions are guarded: they noop when the env var is not set or gtag is
 * not available (e.g. during SSR, dev without the env var, ad blockers).
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

type GtagParams = Record<string, string | number | boolean | undefined | null>;

function canTrack(): boolean {
  return !!GA_ID && typeof window !== "undefined" && typeof (window as any).gtag === "function";
}

/**
 * Send a custom event to GA4.
 *
 * @example
 *   trackEvent("faculty_profile_viewed", { faculty_id: "abc-123" })
 */
export function trackEvent(eventName: string, params?: GtagParams) {
  if (!canTrack()) return;
  try {
    (window as any).gtag("event", eventName, params);
  } catch {
    // Silently ignore — ad blockers or other restrictions
  }
}

/**
 * Manually track a page view. GA4 automatically tracks SPAs via
 * history.pushState, but this can be used to force a page view if
 * the automatic detection fails.
 *
 * @example
 *   trackPageView("/faculty/abc-123")
 */
export function trackPageView(url: string) {
  if (!canTrack()) return;
  try {
    (window as any).gtag("config", GA_ID, { page_path: url });
  } catch {
    // Silently ignore
  }
}