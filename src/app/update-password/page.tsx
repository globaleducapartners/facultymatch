"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const SANS = `var(--font-sans, system-ui, -apple-system, sans-serif)`;
const D = {
  dark:   "#071326",
  navy:   "#0D2240",
  blue:   "#1B4FD8",
  surf:   "#F2F6FC",
  white:  "#FFFFFF",
  ink:    "#0C1018",
  muted:  "#6B7280",
  border: "#D8E2EF",
  error:  "#DC2626",
};

const inputStyle: React.CSSProperties = {
  fontFamily: SANS, width: "100%", fontSize: 14, color: D.ink,
  background: D.white, border: `1px solid ${D.border}`,
  borderRadius: 8, padding: "12px 14px", outline: "none",
  boxSizing: "border-box" as const,
};

export default function UpdatePasswordPage() {
  const [password,     setPassword]     = useState("");
  const [confirm,      setConfirm]      = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [done,         setDone]         = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("No se pudo actualizar la contraseña. El enlace puede haber expirado.");
      setLoading(false);
    } else {
      setDone(true);
      setTimeout(() => router.push("/login?message=Contraseña actualizada correctamente"), 3000);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: D.surf, padding: "48px 24px", fontFamily: SANS,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Logo />
        </div>

        {done ? (
          <div style={{
            background: D.white, borderRadius: 16, border: `1px solid ${D.border}`,
            padding: "40px 36px", textAlign: "center",
            display: "flex", flexDirection: "column", gap: 12, alignItems: "center",
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: 14,
              background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CheckCircle2 size={28} color="#16A34A" />
            </div>
            <h1 style={{ fontFamily: SANS, fontSize: 22, fontWeight: 900, color: D.ink, letterSpacing: "-0.04em", margin: 0 }}>
              ¡Contraseña actualizada!
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 14, color: D.muted, margin: 0 }}>
              Redirigiendo al acceso...
            </p>
          </div>
        ) : (
          <div style={{
            background: D.white, borderRadius: 16, border: `1px solid ${D.border}`,
            padding: "40px 36px", display: "flex", flexDirection: "column", gap: 24,
          }}>
            <div>
              <h1 style={{ fontFamily: SANS, fontSize: 24, fontWeight: 900, color: D.ink, letterSpacing: "-0.04em", margin: "0 0 8px" }}>
                Nueva contraseña
              </h1>
              <p style={{ fontFamily: SANS, fontSize: 14, color: D.muted, margin: 0 }}>
                Elige una contraseña segura para tu cuenta.
              </p>
            </div>

            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "12px 14px" }}>
                <p style={{ fontFamily: SANS, fontSize: 13, color: D.error, margin: 0 }}>
                  {error}
                  {error.includes("expirado") && (
                    <span>{" "}<Link href="/reset-password" style={{ color: D.error, fontWeight: 600 }}>Solicitar nuevo enlace</Link></span>
                  )}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: D.muted, display: "block", marginBottom: 8 }}>
                  Nueva contraseña
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    style={{ ...inputStyle, paddingRight: 48 }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: D.muted,
                    display: "flex", alignItems: "center",
                  }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: D.muted, display: "block", marginBottom: 8 }}>
                  Confirmar contraseña
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repite la contraseña"
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !password || !confirm}
                style={{
                  fontFamily: SANS, width: "100%",
                  background: loading || !password || !confirm ? "#94A3B8" : D.blue,
                  color: D.white, border: "none",
                  padding: "14px 22px", borderRadius: 8,
                  fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em",
                  cursor: loading || !password || !confirm ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Guardando...</> : "Guardar nueva contraseña"}
              </button>
            </form>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
