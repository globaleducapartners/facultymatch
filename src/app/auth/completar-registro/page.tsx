"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { signUp } from "@/app/auth/actions";
import { Logo } from "@/components/ui/Logo";

// ─── Design tokens (mismos que /login y /signup) ───────────────────────────
const SANS = `var(--font-sans, system-ui, -apple-system, sans-serif)`;
const D = {
  dark: "#071326", navy: "#0D2240", blue: "#1B4FD8", gold: "#E9A030",
  surf: "#F2F6FC", white: "#FFFFFF", ink: "#0C1018", muted: "#6B7280",
  faint: "#9CA3AF", border: "#D8E2EF", error: "#DC2626", errBg: "#FEF2F2",
};

const inp: React.CSSProperties = {
  fontFamily: SANS, width: "100%", fontSize: 14, color: D.ink,
  background: D.white, border: `1px solid ${D.border}`,
  borderRadius: 8, padding: "10px 14px", outline: "none",
  boxSizing: "border-box" as const,
};
const lbl: React.CSSProperties = {
  fontFamily: SANS, fontSize: 13, fontWeight: 500,
  color: D.ink, display: "block", marginBottom: 6,
};

type Role = "faculty" | "institution";

// Un solo paso: llega recién autenticado con Google (sin rol todavía porque
// Google no manda si es docente o institución), confirma quién es, y
// signUp(formData, true) completa el alta — mismo mecanismo que el registro
// por email, solo que la sesión ya existe.
function CompletarRegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [role, setRole] = useState<Role>(
    searchParams.get("intent") === "institution" ? "institution" : "faculty"
  );
  const [terms, setTerms] = useState(false);
  const [termsError, setTermsError] = useState("");

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      setEmail(user.email || "");
      const metaName = (user.user_metadata?.full_name || user.user_metadata?.name || "") as string;
      setFullName(metaName);
      setInstitutionName(metaName);
      setCheckingSession(false);
    });
  }, [router]);

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      setServerError("Indica tu nombre completo.");
      return;
    }
    if (!terms) {
      setTermsError("Debes aceptar los términos para continuar.");
      return;
    }
    setTermsError("");
    setServerError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("fullName", fullName.trim());
    formData.append("role", role);
    if (role === "institution") {
      formData.append("institutionName", institutionName.trim() || fullName.trim());
    }
    formData.append("terms_accepted", "on");
    formData.append("privacy_accepted", "on");
    formData.append("marketing_opt_in", "off");
    const ref = searchParams.get("ref");
    if (ref) formData.append("referralCode", ref);

    const result = await signUp(formData, true);
    // signUp(..., true) hace redirect() en el servidor si todo va bien —
    // solo llegamos aquí si devolvió un error.
    if (result?.error) {
      setServerError(result.error);
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div style={{ minHeight: "100vh", background: D.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: SANS, fontSize: 18, color: "rgba(255,255,255,0.4)" }}>Cargando...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: D.surf, display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", fontFamily: SANS }}>
      <div style={{ marginBottom: 32 }}>
        <Logo />
      </div>

      <div style={{ width: "100%", maxWidth: 440, background: D.white, borderRadius: 14, border: `1px solid ${D.border}`, padding: "32px 32px" }}>
        <h1 style={{ fontFamily: SANS, fontSize: 22, fontWeight: 900, color: D.ink, margin: "0 0 6px", letterSpacing: "-0.03em" }}>
          Un último paso
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 14, color: D.muted, margin: "0 0 24px" }}>
          Conectado como <strong style={{ color: D.ink }}>{email}</strong>. Cuéntanos quién eres para preparar tu cuenta.
        </p>

        {serverError && (
          <div style={{ background: D.errBg, border: "1px solid #FCA5A5", borderRadius: 8, padding: "12px 14px", marginBottom: 20 }}>
            <p style={{ fontFamily: SANS, fontSize: 13, color: D.error, margin: 0 }}>{serverError}</p>
          </div>
        )}

        {/* Selector de rol */}
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>Soy...</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {([
              { value: "faculty" as Role, title: "Docente / experto", desc: "Quiero crear mi perfil" },
              { value: "institution" as Role, title: "Institución", desc: "Quiero buscar docentes" },
            ]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                style={{
                  fontFamily: SANS, textAlign: "left", cursor: "pointer",
                  borderRadius: 10, padding: "14px 14px",
                  border: `2px solid ${role === opt.value ? D.blue : D.border}`,
                  background: role === opt.value ? "rgba(27,79,216,0.06)" : D.white,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: D.ink, marginBottom: 2 }}>{opt.title}</div>
                <div style={{ fontSize: 11.5, color: D.muted }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: role === "institution" ? 14 : 20 }}>
          <label style={lbl}>Nombre completo</label>
          <input style={inp} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="María García" />
        </div>

        {role === "institution" && (
          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Nombre de la institución</label>
            <input style={inp} value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} placeholder="Universidad..." />
            <p style={{ fontFamily: SANS, fontSize: 11.5, color: D.faint, margin: "6px 0 0" }}>
              Puedes ajustarlo después desde tu panel.
            </p>
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox" checked={terms}
              onChange={(e) => { setTerms(e.target.checked); setTermsError(""); }}
              style={{ width: 16, height: 16, accentColor: D.blue, marginTop: 2, flexShrink: 0 }}
            />
            <span style={{ fontFamily: SANS, fontSize: 13, color: D.muted, lineHeight: 1.6 }}>
              He leído y acepto los{" "}
              <a href="/terms" target="_blank" style={{ color: D.blue }}>Términos y condiciones</a>
              {" "}y la{" "}
              <a href="/privacy" target="_blank" style={{ color: D.blue }}>Política de privacidad</a>
            </span>
          </label>
          {termsError && <p style={{ fontFamily: SANS, fontSize: 12, color: D.error, marginTop: 6 }}>{termsError}</p>}
        </div>

        <button
          type="button" onClick={handleSubmit} disabled={loading}
          style={{
            fontFamily: SANS, width: "100%",
            background: loading ? D.muted : D.blue, color: D.white,
            border: "none", padding: "12px 22px", borderRadius: 8,
            fontSize: 14, fontWeight: 700, cursor: loading ? "default" : "pointer",
            letterSpacing: "-0.01em",
          }}
        >
          {loading ? "Creando tu cuenta..." : "Continuar →"}
        </button>
      </div>
    </div>
  );
}

export default function CompletarRegistroPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: D.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: SANS, fontSize: 18, color: "rgba(255,255,255,0.4)" }}>Cargando...</div>
      </div>
    }>
      <CompletarRegistroForm />
    </Suspense>
  );
}
