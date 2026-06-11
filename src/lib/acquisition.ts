/**
 * Reads the fm_acquisition data from localStorage and sends it to the
 * /api/acquisition endpoint to be saved on user_profiles.
 * Called after onboarding is completed.
 */
export async function submitAcquisitionData(userId: string) {
  if (typeof window === "undefined") return;

  let stored: Record<string, string> = {};
  try {
    const raw = localStorage.getItem("fm_acquisition");
    if (raw) stored = JSON.parse(raw);
  } catch {
    // localStorage unavailable or corrupted
  }

  if (Object.keys(stored).length === 0) {
    // Still send a request so the API sets acquisition_channel from referrer
    stored = {};
  }

  try {
    await fetch("/api/acquisition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        utmSource: stored.utm_source || null,
        utmMedium: stored.utm_medium || null,
        utmCampaign: stored.utm_campaign || null,
        referrerUrl: stored.referrer_url || null,
      }),
    });
  } catch {
    // Silently fail — acquisition data is non-critical
  }
}