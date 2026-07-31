import Link from "next/link";

interface LogoProps {
  className?: string;
  /** "dark" = logo on light background (dark text). "light" = logo on dark background (white text). */
  variant?: "dark" | "light";
  href?: string;
}

export function Logo({ className = "", variant = "dark", href = "/" }: LogoProps) {
  const textColor = variant === "light" ? "#ffffff" : "#0C1018";
  // "Encuentro" mark: two overlapping circles — docente (claro/marino) + institución (naranja).
  const circleA = variant === "light" ? "#EAF0F9" : "#0D2240";

  return (
    <Link
      href={href}
      style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}
      className={className}
    >
      <svg width="30" height="30" viewBox="0 0 100 100" style={{ flexShrink: 0, filter: "drop-shadow(0 0 8px rgba(255,106,26,0.45))" }}>
        <circle cx="30" cy="52" r="22" fill={circleA} />
        <circle cx="66" cy="50" r="34" fill="#FF6A1A" />
      </svg>

      {/* Wordmark */}
      <span style={{
        fontSize: 18, fontWeight: 800,
        color: textColor,
        letterSpacing: "-0.02em",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        lineHeight: 1,
      }}>
        facultymatch
      </span>
    </Link>
  );
}
