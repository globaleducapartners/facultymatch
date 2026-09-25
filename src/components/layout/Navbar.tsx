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
            <svg width="32" height="32" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
              <path d="M51.1 65.2 L48.9 65.2 L8.9 51.6 L6.7 50.5 L4.7 48.1 L4.0 46.3 L4.0 43.4 L5.1 40.8 L7.1 38.8 L9.3 37.7 L22.1 33.7 L23.2 32.9 L48.2 24.5 L52.2 24.5 L54.4 25.6 L91.8 38.1 L94.0 39.5 L95.3 41.2 L96.0 43.0 L96.0 46.3 L94.9 48.9 L93.3 50.5 L91.1 51.6 L90.0 51.6 L87.0 49.8 L83.0 48.7 L78.6 48.7 L74.6 49.8 L71.3 51.6 L67.4 55.5 L65.6 58.4 L65.0 60.4 Z" fill="#0D2240" />
              <circle cx="80.8" cy="65.3" r="10.2" fill="#FF6A1A" />
            </svg>
            <span style={{
              fontFamily: SANS, fontSize: 18, fontWeight: 800,
              color: D.ink, letterSpacing: "-0.02em",
            }}>
              facultymatch
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
              <Link href={dashboardHref} className="transition-all duration-150 ease-out hover:opacity-90 active:scale-[0.97]" style={{
                fontFamily: SANS, fontSize: 13, fontWeight: 700,
                background: D.blue, border: "none",
                color: "#fff", padding: "8px 22px", borderRadius: 8,
                cursor: "pointer", textDecoration: "none", display: "inline-block",
              }}>
                Mi dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="transition-transform duration-150 ease-out active:scale-[0.97]" style={{
                  fontFamily: SANS, fontSize: 13, fontWeight: 500,
                  background: "transparent",
                  border: `1px solid ${D.border}`,
                  color: D.ink, padding: "7px 20px", borderRadius: 8,
                  cursor: "pointer", textDecoration: "none", display: "inline-block",
                }}>
                  Acceder
                </Link>
                <Link href="/signup" className="transition-all duration-150 ease-out hover:opacity-90 active:scale-[0.97]" style={{
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
            className="fm-hamburger transition-transform duration-150 ease-out active:scale-90"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
          >
            {menuOpen ? <X size={22} color={D.ink} /> : <Menu size={22} color={D.ink} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="[animation:fm-menu-in_220ms_cubic-bezier(0.22,1,0.36,1)] motion-reduce:animate-none"
          style={{
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
              <Link href={dashboardHref} onClick={() => setMenuOpen(false)} className="transition-transform duration-150 ease-out active:scale-[0.97]" style={{
                fontFamily: SANS, background: D.blue, color: "#fff",
                border: "none", padding: "13px", borderRadius: 8,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                textDecoration: "none", display: "block", textAlign: "center",
              }}>
                Mi dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="transition-transform duration-150 ease-out active:scale-[0.97]" style={{
                  fontFamily: SANS, background: D.blue, color: "#fff",
                  border: "none", padding: "12px", borderRadius: 8,
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  textDecoration: "none", display: "block", textAlign: "center",
                }}>
                  Acceder
                </Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)} className="transition-transform duration-150 ease-out active:scale-[0.97]" style={{
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
