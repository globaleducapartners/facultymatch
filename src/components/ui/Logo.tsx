import Link from "next/link";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
  href?: string;
}

export function Logo({ className = "", variant = "dark", href = "/" }: LogoProps) {
  const titleColor = variant === "light" ? "#ffffff" : "#0C1018";

  return (
    <Link href={href} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }} className={className}>
      <div style={{
        width: 32, height: 32, borderRadius: 7,
        background: "#1B4FD8",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <span style={{ color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: "-0.03em", fontFamily: "system-ui, sans-serif" }}>FM</span>
      </div>
      <span style={{
        fontSize: 17, fontWeight: 700, color: titleColor,
        letterSpacing: "-0.03em", fontFamily: "system-ui, sans-serif",
        lineHeight: 1,
      }}>
        FacultyMatch
      </span>
    </Link>
  );
}
