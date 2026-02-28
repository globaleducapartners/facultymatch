"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Do not show global footer on app/dashboard or auth pages
  const hideFooter = 
    pathname?.startsWith("/app") || 
    pathname?.startsWith("/login") || 
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/auth");

  if (hideFooter) return null;

  return <Footer />;
}
