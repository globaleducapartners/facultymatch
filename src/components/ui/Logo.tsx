import Link from "next/link";

interface LogoProps {
  className?: string;
  /** "dark" = logo on light background (dark text). "light" = logo on dark background (white text). */
  variant?: "dark" | "light";
  href?: string;
  onClick?: () => void;
}

export function Logo({ className = "", variant = "dark", href = "/", onClick }: LogoProps) {
  const textColor = variant === "light" ? "#ffffff" : "#0C1018";
  // Mark: birrete (gorro de graduación) con el punto naranja.
  const capColor = variant === "light" ? "#EAF0F9" : "#0D2240";

  return (
    <Link
      href={href}
      onClick={onClick}
      style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}
      className={className}
    >
      <svg width="30" height="30" viewBox="0 0 100 100" style={{ flexShrink: 0, filter: "drop-shadow(0 0 8px rgba(255,106,26,0.45))" }}>
        <path d="M51.1 44.7 L48.9 44.7 L8.9 31.1 L6.7 30.0 L4.7 27.6 L4.0 25.8 L4.0 22.9 L5.1 20.3 L7.1 18.3 L9.3 17.2 L22.1 13.2 L23.2 12.4 L48.2 4.0 L52.2 4.0 L54.4 5.1 L91.8 17.6 L94.0 19.0 L95.3 20.7 L96.0 22.5 L96.0 25.8 L94.9 28.4 L93.3 30.0 L91.1 31.1 L90.0 31.1 L87.0 29.3 L83.0 28.2 L78.6 28.2 L74.6 29.3 L71.3 31.1 L67.4 35.0 L65.6 37.9 L65.0 39.9 Z" fill={capColor} />
        <circle cx="80.8" cy="44.8" r="10.2" fill="#FF6A1A" />
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
