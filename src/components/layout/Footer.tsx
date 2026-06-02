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

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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
              <a href="mailto:support@facultymatch.app" style={{
                fontFamily: SANS, fontSize: 13, color: D.text, textDecoration: "none",
              }}>
                support@facultymatch.app
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
                  href: "https://linkedin.com/company/facultymatch",
                  icon: <LinkedInIcon />,
                  label: "LinkedIn",
                },
                {
                  href: WHATSAPP,
                  icon: <WhatsAppIcon />,
                  label: "WhatsApp",
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
              <a href="mailto:support@facultymatch.app" style={{ fontFamily: SANS, fontSize: 13, color: D.text, textDecoration: "none" }}>
                Email
              </a>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SANS, fontSize: 13, color: D.text, textDecoration: "none" }}>
                WhatsApp
              </a>
              <a href="https://linkedin.com/company/facultymatch" target="_blank" rel="noopener noreferrer" style={{ fontFamily: SANS, fontSize: 13, color: D.text, textDecoration: "none" }}>
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
