"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, RefreshCw, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";

const SANS = `'Inter', system-ui, -apple-system, sans-serif`;
const D = {
  blue: "#1B4FD8",
  navy: "#0D2240",
  gold: "#E9A030",
  white: "#FFFFFF",
  ink: "#0C1018",
  muted: "#6B7280",
  border: "#D8E2EF",
  green: "#059669",
  greenBg: "#F0FDF4",
};

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  missing_token: {
    title: "Enlace inválido",
    description: "El enlace no contiene un token de activación. Revisa que el enlace esté completo.",
  },
  invalid_token: {
    title: "Enlace no reconocido",
    description: "Este enlace de activación no es válido. Puede que ya haya sido utilizado o que el enlace esté mal formado.",
  },
  already_used: {
    title: "Cuenta ya activada",
    description: "Esta cuenta ya fue activada. Puedes iniciar sesión con tu correo y contraseña.",
  },
  expired: {
    title: "Enlace expirado",
    description: "El enlace de activación ha expirado (vigencia de 24 horas). Solicita un nuevo enlace abajo.",
  },
  server_error: {
    title: "Error del servidor",
    description: "Ocurrió un error al procesar tu solicitud. Intenta de nuevo o contacta con soporte.",
  },
};

interface Props {
  searchParams: Promise<{ email?: string; error?: string }>;
}

export default function VerificarEmailPage({ searchParams }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState("");

  // Read searchParams
  useEffect(() => {
    searchParams.then((params) => {
      if (params.email) setEmail(params.email);
      if (params.error && ERROR_MESSAGES[params.error]) {
        setError(params.error);
      }
    });
  }, [searchParams]);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (!email.trim() || sending || cooldown > 0) return;

    setSending(true);
    setResendMessage("");

    try {
      const res = await fetch("/auth/re-enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      // Always show the neutral message — the API returns the same
      // response regardless of whether the email exists
      setResendMessage(
        data.message ||
          "Si existe una cuenta con ese correo, hemos enviado un nuevo enlace de activación."
      );
      setError("");

      // Client-side cooldown (UI only — server has its own cooldown)
      setCooldown(60);
    } catch {
      setResendMessage(
        "Si existe una cuenta con ese correo, hemos enviado un nuevo enlace de activación."
      );
      setCooldown(60);
    } finally {
      setSending(false);
    }
  }, [email, sending, cooldown]);

  return (
    <div style={{ fontFamily: SANS, minHeight: "100vh", background: "#F2F6FC", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 480, width: "100%" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: D.navy, letterSpacing: "-1px" }}>
            FACULTY<span style={{ color: D.blue }}>MATCH</span>
          </div>
        </div>

        <div style={{ background: D.white, border: `1px solid ${D.border}`, borderRadius: 20, padding: 40, boxShadow: "0 4px 24px rgba(13,34,64,0.08)" }}>

          {/* Error banner from activar route */}
          {error && ERROR_MESSAGES[error] && (
            <div style={{
              marginBottom: 24, padding: "14px 16px", borderRadius: 12,
              background: error === "already_used" ? D.greenBg : "#FEF2F2",
              border: `1px solid ${error === "already_used" ? "#A7F3D0" : "#FCA5A5"}`,
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              {error === "already_used" ? (
                <CheckCircle2 size={18} style={{ color: D.green, flexShrink: 0, marginTop: 2 }} />
              ) : (
                <AlertTriangle size={18} style={{ color: "#DC2626", flexShrink: 0, marginTop: 2 }} />
              )}
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: error === "already_used" ? D.green : "#DC2626", margin: 0 }}>
                  {ERROR_MESSAGES[error].title}
                </p>
                <p style={{ fontSize: 12, color: error === "already_used" ? D.green : "#991B1B", margin: "4px 0 0", lineHeight: 1.5 }}>
                  {ERROR_MESSAGES[error].description}
                </p>
              </div>
            </div>
          )}

          {/* Success state */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", background: "#EFF6FF",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <Mail size={30} style={{ color: D.blue }} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: D.ink, margin: "0 0 8px", letterSpacing: "-0.03em" }}>
              Revisa tu correo
            </h1>
            <p style={{ fontSize: 14, color: D.muted, lineHeight: 1.6, margin: 0 }}>
              Te hemos enviado un enlace de activación a <strong style={{ color: D.ink }}>{email || "tu correo"}</strong>.
            </p>
          </div>

          {/* Steps */}
          <div style={{ marginBottom: 28 }}>
            {[
              { num: "1", text: "Abre el correo que te hemos enviado" },
              { num: "2", text: "Haz clic en el botón «Activar mi cuenta»" },
              { num: "3", text: "Completa tu perfil docente en unos minutos" },
            ].map((step) => (
              <div key={step.num} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", marginBottom: 8,
                background: "#F8FAFC", borderRadius: 10,
                border: `1px solid ${D.border}`,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", background: D.blue,
                  color: "#fff", fontSize: 11, fontWeight: 900,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {step.num}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: D.ink }}>{step.text}</span>
              </div>
            ))}
          </div>

          {/* Email input + resend */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: D.muted, display: "block", marginBottom: 6 }}>
              Correo electrónico
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                style={{
                  flex: 1, fontFamily: SANS, fontSize: 14, padding: "10px 14px",
                  border: `1px solid ${D.border}`, borderRadius: 10,
                  outline: "none", color: D.ink, background: "#F8FAFC",
                }}
              />
              <button
                onClick={handleResend}
                disabled={sending || cooldown > 0 || !email.trim()}
                style={{
                  fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "#fff",
                  background: sending || cooldown > 0 ? D.border : D.blue,
                  border: "none", borderRadius: 10, padding: "10px 18px",
                  cursor: sending || cooldown > 0 ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  whiteSpace: "nowrap", opacity: sending || cooldown > 0 ? 0.6 : 1,
                }}
              >
                <RefreshCw size={14} style={{ animation: sending ? "spin 1s linear infinite" : "none" }} />
                {cooldown > 0 ? `${cooldown}s` : sending ? "Enviando..." : "Reenviar"}
              </button>
            </div>
          </div>

          {/* Resend message — always neutral, never reveals if email exists */}
          {resendMessage && (
            <div style={{
              padding: "10px 14px", borderRadius: 10,
              background: D.greenBg, border: `1px solid #A7F3D0`,
              fontSize: 13, color: D.green, fontWeight: 600, marginBottom: 16,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <CheckCircle2 size={16} />
              {resendMessage}
            </div>
          )}

          <div style={{ borderTop: `1px solid ${D.border}`, paddingTop: 20, textAlign: "center" }}>
            <p style={{ fontSize: 12, color: D.muted, lineHeight: 1.6, margin: 0 }}>
              ¿No recibes el correo? Revisa la carpeta de spam o{" "}
              <a href={`mailto:support@facultymatch.app?subject=Problema%20con%20activación%20de%20cuenta`}
                 style={{ color: D.blue, fontWeight: 700, textDecoration: "underline" }}>
                contacta con soporte
              </a>.
            </p>
          </div>
        </div>

        {/* Back to login */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <a href="/login" style={{
            fontFamily: SANS, fontSize: 13, color: D.muted, fontWeight: 600,
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            <ArrowLeft size={14} /> Volver al inicio de sesión
          </a>
        </div>
      </div>
    </div>
  );
}