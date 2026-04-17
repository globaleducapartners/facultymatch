"use client";
// src/components/layout/Navbar.tsx  ← reemplaza el archivo completo

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

const NAV_LINKS = [
  { name: "Para docentes",      href: "/faculty" },
  { name: "Para instituciones", href: "/institutions" },
  { name: "Cómo funciona",      href: "/#como-funciona" },
  { name: "Precios",            href: "/faculty#precios" },
];

// ─── Estilos inline — consistentes con el sistema universitario ───────────────
const S = {
  nav: {
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: "0 40px",
    height: 58,
    background: "#FFFFFF",
    borderBottom: "1px solid #E5E1D8",
    position: "sticky" as const,
    top: 0,
    zIndex: 100,
  },
  wordmark: {
    fontFamily: "var(--font-serif, Georgia, serif)",
    fontSize: 17,
    color: "#0C1018",
    letterSpacing: "-0.01em",
    textDecoration: "none",
  },
  dot: {
    width: 26, height: 26, borderRadius: 5,
    background: "#0D2240",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexShrink: 0 as const,
  },
  link: {
    fontFamily: "var(--font-sans, system-ui, sans-serif)",
    fontSize: 13, color: "#6B7280",
    textDecoration: "none", cursor: "pointer",
    transition: "color 0.15s",
  },
  btnOutline: {
    fontFamily: "var(--font-sans, system-ui, sans-serif)",
    background: "transparent",
    border: "1px solid #E5E1D8",
    color: "#0C1018",
    fontSize: 13, fontWeight: 500,
    padding: "6px 18px", borderRadius: 6,
    cursor: "pointer", textDecoration: "none",
    display: "inline-block",
  },
  btnPrimary: {
    fontFamily: "var(--font-sans, system-ui, sans-serif)",
    background: "#0D2240",
    border: "none",
    color: "#fff",
    fontSize: 13, fontWeight: 600,
    padding: "6px 18px", borderRadius: 6,
    cursor: "pointer", textDecoration: "none",
    display: "inline-block",
  },
};

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser]   = useState<any>(null);
  const [role, setRole]   = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role, active_mode")
          .eq("id", user.id)
          .single();
        setRole(profile?.active_mode ?? profile?.role ?? null);
      }
    };
    getUser();
  }, []);

  const dashboardHref =
    role === "faculty"      ? "/app/faculty" :
    role === "institution"  ? "/app/institution" :
    role === "admin" || role === "super_admin" ? "/control" :
    "/app/faculty";

  // Ocultar navbar en las páginas que tienen la suya propia
  if (pathname === "/") return null;

  return (
    <>
      <nav style={S.nav}>
        {/* Wordmark */}
        <Link href="/" style={{ display: "flex", alignItems: "baseline", gap: 9, textDecoration: "none" }}>
          <div style={S.dot}>
            <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>FM</span>
          </div>
          <span style={S.wordmark}>FacultyMatch</span>
        </Link>

        {/* Links — desktop */}
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}
          className="hidden lg:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} style={{
              ...S.link,
              color: pathname === l.href ? "#0C1018" : "#6B7280",
              fontWeight: pathname === l.href ? 500 : 400,
            }}>
              {l.name}
            </Link>
          ))}
        </div>

        {/* Auth — desktop */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }} className="hidden lg:flex">
          {user ? (
            <Link href={dashboardHref} style={S.btnPrimary}>
              Mi dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" style={S.btnOutline}>Acceder</Link>
              <Link href="/signup/faculty" style={S.btnPrimary}>Publicar perfil</Link>
            </>
          )}
        </div>

        {/* Hamburger — mobile */}
        <button
          className="lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
        >
          {menuOpen
            ? <X size={22} color="#0C1018" />
            : <Menu size={22} color="#0C1018" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: "fixed", top: 58, left: 0, right: 0, zIndex: 99,
          background: "#fff", borderBottom: "1px solid #E5E1D8",
          padding: "20px 24px 28px",
          display: "flex", flexDirection: "column", gap: 4,
        }} className="lg:hidden">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "var(--font-sans, system-ui, sans-serif)",
                fontSize: 16, color: "#0C1018", fontWeight: 500,
                textDecoration: "none", padding: "10px 0",
                borderBottom: "0.5px solid #E5E1D8",
              }}
            >
              {l.name}
            </Link>
          ))}
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {user ? (
              <Link href={dashboardHref} style={{ ...S.btnPrimary, textAlign: "center", padding: "12px 18px" }}
                onClick={() => setMenuOpen(false)}>
                Mi dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" style={{ ...S.btnOutline, textAlign: "center", padding: "12px 18px" }}
                  onClick={() => setMenuOpen(false)}>
                  Acceder
                </Link>
                <Link href="/signup/faculty" style={{ ...S.btnPrimary, textAlign: "center", padding: "12px 18px" }}
                  onClick={() => setMenuOpen(false)}>
                  Publicar perfil
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
