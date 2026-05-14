import Link from "next/link";

interface LogoProps {
  className?: string;
  /** "dark" = logo on light background (dark text). "light" = logo on dark background (white text). */
  variant?: "dark" | "light";
  href?: string;
}

export function Logo({ className = "", variant = "dark", href = "/" }: LogoProps) {
  const textColor = variant === "light" ? "#ffffff" : "#0C1018";

  return (
    <Link
      href={href}
      style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}
      className={className}
    >
      {/* Badge */}
      <div style={{
        width: 34, height: 34, borderRadius: 8,
        background: "#1B4FD8",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <span style={{
          color: "#ffffff", fontSize: 13, fontWeight: 800,
          letterSpacing: "-0.03em",
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        }}>
          FM
        </span>
      </div>

      {/* Wordmark */}
      <span style={{
        fontSize: 18, fontWeight: 700,
        color: textColor,
        letterSpacing: "-0.03em",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        lineHeight: 1,
      }}>
        FacultyMatch
      </span>
    </Link>
  );
}
