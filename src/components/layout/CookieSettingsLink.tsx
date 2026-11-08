"use client";

import type { CSSProperties, ReactNode } from "react";
import { openCookieSettings } from "@/lib/consent";

// Reabre el aviso de cookies para cambiar o retirar la decisión en cualquier momento.
export function CookieSettingsLink({
  children = "Configurar cookies",
  style,
  className,
}: {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className={className}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", ...style }}
    >
      {children}
    </button>
  );
}
