"use client";
// src/components/layout/ConditionalFooter.tsx  ← reemplaza el archivo completo

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

export function ConditionalFooter() {
  const pathname = usePathname();

  const hideFooter =
    pathname === "/" ||               // Landing tiene su propio footer
    pathname?.startsWith("/app") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/onboarding");

  if (hideFooter) return null;

  return <Footer />;
}
