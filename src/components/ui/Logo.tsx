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
      <svg width="30" height="30" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
        <circle cx="60" cy="60" r="55" fill="none" stroke={capColor} strokeWidth="3.5" />
        <path d="M61.1 75.2 L58.9 75.2 L18.9 61.6 L16.7 60.5 L14.7 58.1 L14.0 56.3 L14.0 53.4 L15.1 50.8 L17.1 48.8 L19.3 47.7 L32.1 43.7 L33.2 42.9 L58.2 34.5 L62.2 34.5 L64.4 35.6 L101.8 48.1 L104.0 49.5 L105.3 51.2 L106.0 53.0 L106.0 56.3 L104.9 58.9 L103.3 60.5 L101.1 61.6 L100.0 61.6 L97.0 59.8 L93.0 58.7 L88.6 58.7 L84.6 59.8 L81.3 61.6 L77.4 65.5 L75.6 68.4 L75.0 70.4 Z" fill={capColor} />
        <circle cx="90.8" cy="75.3" r="10.2" fill="#FF6A1A" />
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
