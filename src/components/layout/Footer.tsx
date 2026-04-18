// src/components/layout/Footer.tsx  ← reemplaza el archivo completo
import Link from "next/link";

const SERIF = `var(--font-serif, 'Georgia', 'Times New Roman', serif)`;
const SANS  = `var(--font-sans, system-ui, -apple-system, sans-serif)`;
const WHATSAPP = `https://wa.me/34616684214?text=${encodeURIComponent("Hola, me gustaría obtener más información sobre FacultyMatch.")}`;

export function Footer() {
  return (
    <footer style={{
      background: "#0C1018",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "48px 40px 28px",
    }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {/* Top row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 40,
          paddingBottom: 40,
          borderBottom: "0.5px solid rgba(255,255,255,0.08)",
          marginBottom: 24,
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 5,
                background: "#0D2240",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, fontFamily: SANS }}>FM</span>
              </div>
              <span style={{ fontFamily: SERIF, fontSize: 16, color: "#fff", letterSpacing: "-0.01em" }}>
                FacultyMatch
              </span>
            </div>
            <p style={{
              fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.4)",
              lineHeight: 1.7, margin: "0 0 20px", maxWidth: 280,
            }}>
              Directorio de talento para la educación superior.
              Docentes, investigadores y expertos conectados con instituciones.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <a href="mailto:info@facultymatch.app" style={{
                fontFamily: SANS, fontSize: 13,
                color: "rgba(255,255,255,0.4)", textDecoration: "none",
              }}>
                info@facultymatch.app
              </a>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: SANS, fontSize: 13,
                color: "rgba(255,255,255,0.4)", textDecoration: "none",
              }}>
                +34 616 684 214
              </a>
            </div>
          </div>

          {/* Plataforma */}
          <div>
            <div style={{
              fontFamily: SANS, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase" as const,
              color: "#B8963E", marginBottom: 16,
            }}>
              Plataforma
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Para docentes",      href: "/faculty" },
                { label: "Para instituciones", href: "/institutions" },
                { label: "Cómo funciona",      href: "/faculty#como-funciona" },
                { label: "Precios",            href: "/faculty#precios" },
                { label: "Recursos",           href: "/resources" },
              ].map((l) => (
                <Link key={l.href} href={l.href} style={{
                  fontFamily: SANS, fontSize: 13,
                  color: "rgba(255,255,255,0.4)", textDecoration: "none",
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
              letterSpacing: "0.12em", textTransform: "uppercase" as const,
              color: "#B8963E", marginBottom: 16,
            }}>
              Legal
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Aviso legal",          href: "/legal" },
                { label: "Política de privacidad",href: "/privacy" },
                { label: "Términos",              href: "/terms" },
              ].map((l) => (
                <Link key={l.href} href={l.href} style={{
                  fontFamily: SANS, fontSize: 13,
                  color: "rgba(255,255,255,0.4)", textDecoration: "none",
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
              letterSpacing: "0.12em", textTransform: "uppercase" as const,
              color: "#B8963E", marginBottom: 16,
            }}>
              Contacto
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href="mailto:info@facultymatch.app" style={{
                fontFamily: SANS, fontSize: 13,
                color: "rgba(255,255,255,0.4)", textDecoration: "none",
              }}>
                Email
              </a>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: SANS, fontSize: 13,
                color: "rgba(255,255,255,0.4)", textDecoration: "none",
              }}>
                WhatsApp
              </a>
              <a
                href="https://linkedin.com/company/globaleducapartners"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: SANS, fontSize: 13,
                  color: "rgba(255,255,255,0.4)", textDecoration: "none",
                }}
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap" as const, gap: 12,
        }}>
          <span style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.22)" }}>
            © {new Date().getFullYear()} FacultyMatch · Grupo Global Educa SL. Todos los derechos reservados.
          </span>
          <span style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
            Murcia · España
          </span>
        </div>
      </div>
    </footer>
  );
}
