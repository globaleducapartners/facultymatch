"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const SANS = `var(--font-sans, system-ui, -apple-system, sans-serif)`;
const D = {
  surf: "#F2F6FC",
  blue: "#1B4FD8",
  navy: "#0D2240",
  ink:  "#0C1018",
};

export default function FacultyConfirmPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to onboarding — the user is auto-logged in from signup
    const timeout = setTimeout(() => {
      router.replace("/app/faculty/onboarding");
    }, 1500);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: D.surf, padding: "48px 24px", fontFamily: SANS,
    }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <Logo />
      </div>
      <div style={{
        background: "#fff", borderRadius: 20,
        border: "1px solid #D8E2EF", padding: "40px 36px",
        maxWidth: 440, textAlign: "center",
      }}>
        <Loader2 size={32} color={D.blue} style={{ animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
        <h1 style={{ fontSize: 24, fontWeight: 900, color: D.ink, margin: "0 0 8px" }}>
          ¡Cuenta creada con éxito!
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
          Estamos preparando tu perfil. Te redirigimos al asistente de configuración...
        </p>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}