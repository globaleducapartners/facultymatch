"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Do not show global footer on app/dashboard, auth pages, or landing (has own footer)
    const hideFooter =
      pathname === "/" ||
      pathname?.startsWith("/app") ||
      pathname?.startsWith("/login") ||
      pathname?.startsWith("/signup") ||
      pathname?.startsWith("/auth") ||
      pathname?.startsWith("/onboarding");

  if (hideFooter) return null;

  return <Footer />;
}
