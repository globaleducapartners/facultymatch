// src/components/layout/Footer.tsx — FacultyMatch v2
import Link from "next/link";

const SANS = `'Inter', system-ui, -apple-system, sans-serif`;
const WHATSAPP = `https://wa.me/34616684214?text=${encodeURIComponent("Hola, me gustaría obtener más información sobre FacultyMatch.")}`;

const D = {
  dark:   "#071326",
  navy:   "#0D2240",
  gold:   "#E9A030",
  border: "rgba(255,255,255,0.07)",
  text:   "rgba(255,255,255,0.42)",
  hover:  "rgba(255,255,255,0.72)",
};

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

export function Footer() {
  return (
    <footer style={{
      background: D.dark,
      borderTop: `1px solid ${D.border}`,
      padding: "60px 24px 32px",
      fontFamily: SANS,
    }}>
      <style>{`
        .fm-footer-grid {
          display: grid;
          grid-template-columns: 2.2fr 1fr 1fr 1fr;
          gap: 40px;
        }
        .fm-footer-trust {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
          justify-content: center;
        }
        @media (max-width: 900px) {
          .fm-footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
          }
        }
        @media (max-width: 520px) {
          .fm-footer-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .fm-footer-trust {
            gap: 12px !important;
          }
        }
      `}</style>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>

        {/* Trust line */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}>
          <div className="fm-footer-trust" style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 999, padding: "10px 20px",
          }}>
            {["Verificado", "Sin comisiones", "Sin intermediarios"].map((label, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                {i > 0 && <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)" }} />}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: D.gold }} />
                  <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.02em" }}>
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top row */}
        <div className="fm-footer-grid" style={{
          paddingBottom: 48,
          borderBottom: `1px solid ${D.border}`,
          marginBottom: 28,
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: D.navy,
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>FM</span>
              </div>
              <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>
                FacultyMatch
              </span>
            </div>
            <p style={{
              fontFamily: SANS, fontSize: 13, color: D.text,
              lineHeight: 1.75, margin: "0 0 22px", maxWidth: 290,
            }}>
              Conectamos expertos reales con la educación del siglo XXI.
              Médicos, investigadores, directivos y docentes que quieren
              dejar su legado en el aula.
            </p>
            {/* Contact */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
              <a href="mailto:info@facultymatch.app" style={{
                fontFamily: SANS, fontSize: 13, color: D.text, textDecoration: "none",
              }}>
                info@facultymatch.app
              </a>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: SANS, fontSize: 13, color: D.text, textDecoration: "none",
              }}>
                +34 616 684 214
              </a>
            </div>
            {/* Social icons */}
            <div style={{ display: "flex", gap: 12 }}>
              {[
                {
                  href: "https://linkedin.com/company/globaleducapartners",
                  icon: <LinkedInIcon />,
                  label: "LinkedIn",
                },
                {
                  href: "https://instagram.com/facultymatch",
                  icon: <InstagramIcon />,
                  label: "Instagram",
                },
                {
                  href: "https://x.com/facultymatch",
                  icon: <XIcon />,
                  label: "X (Twitter)",
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: D.text, textDecoration: "none",
                    transition: "all 0.15s",
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Plataforma */}
          <div>
            <div style={{
              fontFamily: SANS, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase" as const,
              color: D.gold, marginBottom: 18,
            }}>
              Plataforma
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Para docentes",      href: "/faculty" },
                { label: "Para instituciones", href: "/institutions" },
                { label: "Precios",            href: "/faculty#precios" },
                { label: "Recursos",           href: "/resources" },
              ].map((l) => (
                <Link key={l.href} href={l.href} style={{
                  fontFamily: SANS, fontSize: 13, color: D.text,
                  textDecoration: "none",
                }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <div style={{
              fontFamily: SANS, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase" as const,
              color: D.gold, marginBottom: 18,
            }}>
              Legal
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Aviso legal",            href: "/legal" },
                { label: "Política de privacidad", href: "/privacy" },
                { label: "Términos de uso",        href: "/terms" },
              ].map((l) => (
                <Link key={l.href} href={l.href} style={{
                  fontFamily: SANS, fontSize: 13, color: D.text,
                  textDecoration: "none",
                }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div>
            <div style={{
              fontFamily: SANS, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase" as const,
              color: D.gold, marginBottom: 18,
            }}>
              Contacto
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a href="mailto:info@facultymatch.app" style={{ fontFamily: SANS, fontSize: 13, color: D.text, textDecoration: "none" }}>
                Email
              </a>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SANS, fontSize: 13, color: D.text, textDecoration: "none" }}>
                WhatsApp
              </a>
              <a href="https://linkedin.com/company/globaleducapartners" target="_blank" rel="noopener noreferrer" style={{ fontFamily: SANS, fontSize: 13, color: D.text, textDecoration: "none" }}>
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap" as const, gap: 12,
        }}>
          <span style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
            © {new Date().getFullYear()} FacultyMatch · Grupo Global Educa SL. Todos los derechos reservados.
          </span>
          <span style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.18)" }}>
            Murcia · España
          </span>
        </div>
      </div>
    </footer>
  );
}
