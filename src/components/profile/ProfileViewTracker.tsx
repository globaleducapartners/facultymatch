"use client";

import { useEffect, useRef } from "react";

interface Props {
  facultyId: string;
}

/**
 * Fires a POST to the track-view API on mount to increment the view counter.
 * Counts EVERY time the component mounts (every click/view).
 * Uses a ref to prevent double-counting from React StrictMode double-renders.
 */
export function ProfileViewTracker({ facultyId }: Props) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!facultyId || tracked.current) return;

    tracked.current = true;

    const controller = new AbortController();

    fetch("/api/faculty/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facultyId }),
      signal: controller.signal,
    }).catch(() => {
      // Silently ignore failures (e.g. offline, abort)
    });

    return () => controller.abort();
  }, [facultyId]);

  return null;
}