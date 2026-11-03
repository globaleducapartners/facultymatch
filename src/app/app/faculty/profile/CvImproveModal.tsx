"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Sparkles, AlertTriangle, Check, X, Loader2 } from "lucide-react";
import type { CvWizardPrefill } from "@/lib/cv-import-mapping";
import {
  buildCvSuggestions, mergeSuggestionPayloads,
  type CurrentProfileSnapshot, type CvSuggestion, type CvSuggestionPayload,
} from "@/lib/cv-profile-diff";

const CvImportStep = dynamic(() => import("../onboarding/CvImportStep").then((m) => m.CvImportStep), { ssr: false });

const SANS = `'Inter', system-ui, -apple-system, sans-serif`;
const D = {
  blue: "#1B4FD8", navy: "#0D2240", white: "#FFFFFF", ink: "#0C1018",
  muted: "#5B6B85", faint: "#5E6F8E", border: "#D8E2EF", surf: "#F2F6FC",
  amber: "#B45309", amberBg: "#FFFBEB", amberBorder: "#FDE68A",
};

const KIND_LABEL: Record<CvSuggestion["kind"], string> = {
  nuevo: "Nuevo",
  mejora: "Propuesta de mejora",
  "añadir": "Añadir",
};

interface Props {
  userId: string;
  current: CurrentProfileSnapshot;
  /** Un perfil verificado vuelve a revisión si se cambian campos sensibles. */
  verified: boolean;
  onClose: () => void;
  onApply: (payload: CvSuggestionPayload) => Promise<{ ok: boolean; changed: number; estado: string | null }>;
}

export function CvImproveModal({ userId, current, verified, onClose, onApply }: Props) {
  const [stage, setStage] = useState<"upload" | "compare" | "done">("upload");
  const [suggestions, setSuggestions] = useState<CvSuggestion[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [doneInfo, setDoneInfo] = useState<{ changed: number; estado: string | null } | null>(null);

  function handleConfirm(prefill: CvWizardPrefill) {
    const list = buildCvSuggestions(current, prefill, verified);
    setSuggestions(list);
    setChecked(Object.fromEntries(list.map((s) => [s.key, s.defaultChecked])));
    setStage("compare");
  }

  const selected = useMemo(() => suggestions.filter((s) => checked[s.key]), [suggestions, checked]);
  const sendsToReview = verified && selected.some((s) => s.sensitive);

  async function apply() {
    setSaving(true);
    setError("");
    try {
      const res = await onApply(mergeSuggestionPayloads(selected));
      setDoneInfo({ changed: res.changed, estado: res.estado });
      setStage("done");
    } catch {
      setError("No se han podido guardar los cambios. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Mejorar mi perfil con IA"
      style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(7,19,38,0.55)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5vh 16px", overflowY: "auto" }}
    >
      <div style={{ width: "100%", maxWidth: 640, background: D.white, borderRadius: 16, padding: 28, fontFamily: SANS, position: "relative" }}>
        <button onClick={onClose} aria-label="Cerrar" style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: D.muted }}>
          <X size={18} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <Sparkles size={20} color={D.blue} />
          <h2 style={{ fontSize: 19, fontWeight: 800, color: D.ink, letterSpacing: "-0.03em", margin: 0 }}>Mejorar mi perfil con IA</h2>
        </div>

        {stage === "upload" && (
          <>
            <p style={{ fontSize: 14, color: D.muted, lineHeight: 1.6, margin: "0 0 18px" }}>
              Sube tu CV o el PDF de tu LinkedIn. Rellenamos lo que te falte y te proponemos mejoras; tú eliges qué cambiar.
              No sustituimos nada de lo que ya has escrito. Tu CV solo se usa para esto y se borra al terminar la lectura.
            </p>
            <CvImportStep
              userId={userId}
              onConfirm={handleConfirm}
              onBack={onClose}
              backLabel="Cancelar"
              reviewNote="Revisa lo que hemos leído. En el siguiente paso eliges qué cambios aplicar; nada se guarda todavía."
              confirmLabel="Ver cambios propuestos"
            />
          </>
        )}

        {stage === "compare" && (
          <>
            {suggestions.length === 0 ? (
              <>
                <p style={{ fontSize: 14, color: D.muted, lineHeight: 1.6, margin: "0 0 20px" }}>
                  Tu perfil ya contiene todo lo que hemos podido leer en tu CV. No hay nada nuevo que añadir.
                </p>
                <button onClick={onClose} style={primaryBtn}>Cerrar</button>
              </>
            ) : (
              <>
                <p style={{ fontSize: 14, color: D.muted, lineHeight: 1.6, margin: "0 0 16px" }}>
                  Marca los cambios que quieres aplicar. Lo que ya tienes escrito no se borra: los campos nuevos se rellenan y las listas solo reciben lo que falta.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {suggestions.map((s) => (
                    <label key={s.key} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", background: D.surf, borderRadius: 10, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={!!checked[s.key]}
                        onChange={(e) => setChecked((c) => ({ ...c, [s.key]: e.target.checked }))}
                        style={{ marginTop: 3, accentColor: D.blue }}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: D.faint, margin: "0 0 3px" }}>
                          {s.label} · {KIND_LABEL[s.kind]}
                          {s.sensitive && verified && <span style={{ color: D.amber }}> · afecta a la verificación</span>}
                        </p>
                        {s.current && (
                          <p style={{ fontSize: 12.5, color: D.muted, margin: "0 0 3px", whiteSpace: "pre-line", textDecoration: s.kind === "mejora" ? "line-through" : "none" }}>
                            {s.current.length > 160 ? s.current.slice(0, 160) + "…" : s.current}
                          </p>
                        )}
                        <p style={{ fontSize: 13.5, color: D.ink, margin: 0, whiteSpace: "pre-line" }}>
                          {s.proposed.length > 400 ? s.proposed.slice(0, 400) + "…" : s.proposed}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {sendsToReview && (
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: D.amberBg, border: `1px solid ${D.amberBorder}`, borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
                    <AlertTriangle size={16} color={D.amber} style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: 12.5, color: D.amber, lineHeight: 1.55, margin: 0 }}>
                      Has marcado cambios en campos que verificamos. Si los aplicas, tu perfil volverá a revisión y no aparecerá en el directorio hasta que nuestro equipo lo confirme de nuevo.
                    </p>
                  </div>
                )}

                {error && <p style={{ fontSize: 13, color: "#B91C1C", margin: "0 0 12px" }}>{error}</p>}

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button onClick={onClose} disabled={saving} style={secondaryBtn}>Cancelar</button>
                  <button onClick={apply} disabled={saving || selected.length === 0} style={{ ...primaryBtn, opacity: saving || selected.length === 0 ? 0.55 : 1 }}>
                    {saving ? <><Loader2 size={15} className="animate-spin" /> Guardando…</> : <><Check size={15} /> Aplicar {selected.length} {selected.length === 1 ? "cambio" : "cambios"}</>}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {stage === "done" && (
          <>
            <p style={{ fontSize: 15, color: D.ink, fontWeight: 700, margin: "0 0 6px" }}>
              {doneInfo && doneInfo.changed > 0 ? "¡Listo! Tu perfil se ha actualizado." : "No se ha cambiado nada."}
            </p>
            {doneInfo?.estado === "en_revision" && verified && (
              <p style={{ fontSize: 13.5, color: D.muted, lineHeight: 1.6, margin: "0 0 18px" }}>
                Como has modificado campos verificados, tu perfil está de nuevo en revisión. Te avisaremos cuando quede confirmado.
              </p>
            )}
            <button onClick={() => { window.location.href = "/app/faculty/profile?saved=1"; }} style={primaryBtn}>Ver mi perfil</button>
          </>
        )}
      </div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  fontFamily: SANS, fontSize: 14, fontWeight: 700, color: "#fff", background: D.blue,
  border: "none", borderRadius: 10, padding: "11px 22px", cursor: "pointer",
  display: "inline-flex", alignItems: "center", gap: 6,
};
const secondaryBtn: React.CSSProperties = {
  fontFamily: SANS, fontSize: 14, fontWeight: 600, color: D.muted, background: D.white,
  border: `1px solid ${D.border}`, borderRadius: 10, padding: "11px 22px", cursor: "pointer",
};
