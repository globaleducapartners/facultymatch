"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

interface Props {
  facultyId: string;
  /** "public" = página pública /docentes/[slug]; "app" (por defecto) = visor de instituciones en /app/faculty/[id]. */
  source?: "public" | "app";
}

/**
 * Fires a POST to the track-view API on mount to increment the view counter.
 * Also fires a GA4 event for analytics.
 * Uses a ref to prevent double-counting from React StrictMode double-renders.
 */
export function ProfileViewTracker({ facultyId, source = "app" }: Props) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!facultyId || tracked.current) return;

    tracked.current = true;

    const controller = new AbortController();

    fetch("/api/faculty/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facultyId, source }),
      signal: controller.signal,
    }).catch(() => {
      // Silently ignore failures (e.g. offline, abort)
    });

    trackEvent("faculty_profile_viewed", { faculty_id: facultyId });

    return () => controller.abort();
  }, [facultyId]);

  return null;
}