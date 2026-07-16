"use client";
// src/components/layout/Navbar.tsx — FacultyMatch v2: sticky, transparent scroll

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

const SANS = `'Inter', system-ui, -apple-system, sans-serif`;

const NAV_LINKS = [
  { name: "Para docentes",      href: "/faculty" },
  { name: "Para instituciones", href: "/institutions" },
  { name: "Recursos",           href: "/resources" },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser]   = useState<any>(null);
  const [role, setRole]   = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  // Hidden on landing — landing has its own nav
  if (pathname === "/") return null;

  const D = {
    navy:   "#0D2240",
    blue:   "#1B4FD8",
    ink:    "#080F1E",
    muted:  "#4B5A7A",
    border: "#D8E2EF",
    white:  "#FFFFFF",
  };

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        height: 64,
        background: scrolled ? "rgba(255,255,255,0.97)" : D.white,
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: `1px solid ${scrolled ? D.border : D.border}`,
        boxShadow: scrolled ? "0 1px 12px rgba(7,19,38,0.07)" : "0 1px 0 #D8E2EF",
        transition: "all 0.25s ease",
        fontFamily: SANS,
      }}>
        <div style={{
          maxWidth: 1120, margin: "0 auto",
          height: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 32px",
        }}>
          {/* Logo */}
          <Link href={user ? dashboardHref : "/"} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: D.navy,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 800, fontFamily: SANS }}>FM</span>
            </div>
            <span style={{
              fontFamily: SANS, fontSize: 18, fontWeight: 700,
              color: D.ink, letterSpacing: "-0.03em",
            }}>
              FacultyMatch
            </span>
          </Link>

          {/* Desktop links */}
          <div className="fm-nav-desktop" style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} style={{
                fontFamily: SANS, fontSize: 14, fontWeight: 500,
                color: pathname === l.href ? D.ink : D.muted,
                textDecoration: "none",
                borderBottom: pathname === l.href ? `2px solid ${D.blue}` : "2px solid transparent",
                paddingBottom: 2,
                transition: "color 0.15s, border-color 0.15s",
              }}>
                {l.name}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="fm-nav-desktop" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {user ? (
              <Link href={dashboardHref} style={{
                fontFamily: SANS, fontSize: 13, fontWeight: 700,
                background: D.blue, border: "none",
                color: "#fff", padding: "8px 22px", borderRadius: 8,
                cursor: "pointer", textDecoration: "none", display: "inline-block",
              }}>
                Mi dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" style={{
                  fontFamily: SANS, fontSize: 13, fontWeight: 500,
                  background: "transparent",
                  border: `1px solid ${D.border}`,
                  color: D.ink, padding: "7px 20px", borderRadius: 8,
                  cursor: "pointer", textDecoration: "none", display: "inline-block",
                }}>
                  Acceder
                </Link>
                <Link href="/signup" style={{
                  fontFamily: SANS, fontSize: 13, fontWeight: 700,
                  background: D.blue, border: "none",
                  color: "#fff", padding: "7px 22px", borderRadius: 8,
                  cursor: "pointer", textDecoration: "none", display: "inline-block",
                }}>
                  Publicar perfil
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="fm-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
          >
            {menuOpen ? <X size={22} color={D.ink} /> : <Menu size={22} color={D.ink} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: "fixed", top: 64, left: 0, right: 0, zIndex: 99,
          background: D.white, borderBottom: `1px solid ${D.border}`,
          padding: "20px 24px 28px",
          display: "flex", flexDirection: "column", gap: 4,
          boxShadow: "0 8px 24px rgba(7,19,38,0.1)",
        }}>
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{
              fontFamily: SANS, fontSize: 16, color: D.ink, fontWeight: 500,
              textDecoration: "none", padding: "12px 0",
              borderBottom: `1px solid ${D.border}`,
            }}>
              {l.name}
            </Link>
          ))}
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {user ? (
              <Link href={dashboardHref} onClick={() => setMenuOpen(false)} style={{
                fontFamily: SANS, background: D.blue, color: "#fff",
                border: "none", padding: "13px", borderRadius: 8,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                textDecoration: "none", display: "block", textAlign: "center",
              }}>
                Mi dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} style={{
                  fontFamily: SANS, background: D.blue, color: "#fff",
                  border: "none", padding: "12px", borderRadius: 8,
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  textDecoration: "none", display: "block", textAlign: "center",
                }}>
                  Acceder
                </Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)} style={{
                  fontFamily: SANS, background: D.white, color: D.ink,
                  border: `1.5px solid ${D.border}`, padding: "12px", borderRadius: 8,
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                  textDecoration: "none", display: "block", textAlign: "center",
                }}>
                  Publicar perfil
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .fm-nav-desktop { display: flex !important; }
        .fm-hamburger   { display: none !important; }
        @media (max-width: 768px) {
          .fm-nav-desktop { display: none !important; }
          .fm-hamburger   { display: flex !important; }
        }
      `}</style>
    </>
  );
}
