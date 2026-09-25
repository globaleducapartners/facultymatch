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
      <svg width="30" height="30" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
        <path d="M51.1 65.2 L48.9 65.2 L8.9 51.6 L6.7 50.5 L4.7 48.1 L4.0 46.3 L4.0 43.4 L5.1 40.8 L7.1 38.8 L9.3 37.7 L22.1 33.7 L23.2 32.9 L48.2 24.5 L52.2 24.5 L54.4 25.6 L91.8 38.1 L94.0 39.5 L95.3 41.2 L96.0 43.0 L96.0 46.3 L94.9 48.9 L93.3 50.5 L91.1 51.6 L90.0 51.6 L87.0 49.8 L83.0 48.7 L78.6 48.7 L74.6 49.8 L71.3 51.6 L67.4 55.5 L65.6 58.4 L65.0 60.4 Z" fill={capColor} />
        <circle cx="80.8" cy="65.3" r="10.2" fill="#FF6A1A" />
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
