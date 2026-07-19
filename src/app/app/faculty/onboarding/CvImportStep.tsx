"use client";

import { useState } from "react";
import {
  Upload, Loader2, AlertCircle, Sparkles, ClipboardPaste, ArrowRight, ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  buildCvReviewItems, mapCvProfileToWizardPrefill,
  type CvReviewItem, type CvWizardPrefill,
} from "@/lib/cv-import-mapping";
import type { CvProfile } from "@/lib/cv-extraction-schema";

const SANS = `'Inter', system-ui, -apple-system, sans-serif`;
const D = {
  blue: "#1B4FD8", navy: "#0D2240", white: "#FFFFFF", ink: "#0C1018",
  muted: "#6B7280", faint: "#9CA3AF", border: "#D8E2EF", surf: "#F2F6FC",
  green: "#059669", greenBg: "#F0FDF4",
};

const ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_BYTES = 10 * 1024 * 1024;

type Status = "idle" | "paste" | "uploading" | "extracting" | "review" | "error";

const ERROR_MESSAGES: Record<string, string> = {
  rate_limited: "Has usado tus 3 intentos de hoy con IA. Puedes rellenar el formulario manualmente o volver mañana.",
  file_too_large: "El archivo es demasiado grande (máximo 10MB).",
  empty_document: "No hemos podido leer texto de ese archivo. Prueba con otro archivo o pega el texto directamente.",
  extraction_failed: "No hemos podido leer tu CV esta vez. Puedes intentarlo de nuevo o completar el formulario manualmente.",
  file_not_found: "El archivo no llegó a subirse bien. Inténtalo de nuevo.",
  default: "Algo ha fallado. Puedes intentarlo de nuevo o completar el formulario manualmente.",
};

interface Props {
  userId: string;
  onConfirm: (prefill: CvWizardPrefill) => void;
  /** Volver a la pantalla de elección (no entra al formulario directamente) */
  onBack: () => void;
}

export function CvImportStep({ userId, onConfirm, onBack }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [reviewItems, setReviewItems] = useState<CvReviewItem[]>([]);
  const [prefill, setPrefill] = useState<CvWizardPrefill | null>(null);

  async function callExtractEndpoint(body: { storagePath: string } | { text: string }) {
    setStatus("extracting");
    setErrorMessage(null);

    const res = await fetch("/api/onboarding/extract-cv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (json?.error === "not_a_cv") {
        setErrorMessage(
          `Esto no parece un CV${json.detalle ? ` (parece ${json.detalle})` : ""}. Prueba con otro archivo o completa el formulario manualmente.`
        );
      } else {
        setErrorMessage(ERROR_MESSAGES[json?.error] || ERROR_MESSAGES.default);
      }
      setStatus("error");
      return;
    }

    const profile = json.profile as CvProfile;
    setReviewItems(buildCvReviewItems(profile));
    setPrefill(mapCvProfileToWizardPrefill(profile));
    setStatus("review");
  }

  async function handleFile(file: File) {
    setErrorMessage(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage("Solo se permiten archivos PDF o DOCX.");
      setStatus("error");
      return;
    }
    if (file.size > MAX_BYTES) {
      setErrorMessage("El archivo es demasiado grande (máximo 10MB).");
      setStatus("error");
      return;
    }

    setStatus("uploading");

    const ext = file.name.split(".").pop();
    const storagePath = `${userId}/${crypto.randomUUID()}.${ext}`;
    const supabase = createClient();

    const { error: uploadError } = await supabase.storage
      .from("cv-uploads-temp")
      .upload(storagePath, file);

    if (uploadError) {
      setErrorMessage(ERROR_MESSAGES.default);
      setStatus("error");
      return;
    }

    await callExtractEndpoint({ storagePath });
  }

  async function handlePasteSubmit() {
    if (pastedText.trim().length < 20) return;
    await callExtractEndpoint({ text: pastedText });
  }

  function reset() {
    setStatus("idle");
    setErrorMessage(null);
    setPastedText("");
    setReviewItems([]);
    setPrefill(null);
  }

  function handleConfirm() {
    if (prefill) onConfirm(prefill);
  }

  // ── Review screen ──────────────────────────────────────────────────────
  if (status === "review") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: D.greenBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={18} color={D.green} />
          </div>
          <div>
            <h2 style={{ fontFamily: SANS, fontSize: 16, fontWeight: 800, color: D.ink, margin: 0 }}>
              Esto es lo que hemos leído de tu CV
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 12, color: D.muted, margin: "2px 0 0" }}>
              Revísalo — podrás editar cada campo en el formulario. Nada se guarda todavía.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {reviewItems.map((item) => (
            <div
              key={item.key}
              style={{
                display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                gap: 12, padding: "10px 14px", background: D.surf, borderRadius: 10,
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: D.faint, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px" }}>
                  {item.label}
                </p>
                <p style={{ fontFamily: SANS, fontSize: 13, color: D.ink, margin: 0, whiteSpace: "pre-line" }}>
                  {item.value}
                </p>
              </div>
              {item.confidence && (
                item.evidence ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        className={
                          item.confidence === "alta"
                            ? "bg-green-50 text-green-700 border-green-200 cursor-help"
                            : "bg-amber-50 text-amber-700 border-amber-200 cursor-help"
                        }
                      >
                        {item.confidence}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[240px]">
                      “{item.evidence}”
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Badge
                    className={
                      item.confidence === "alta"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }
                  >
                    {item.confidence}
                  </Badge>
                )
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={reset}
            style={{
              fontFamily: SANS, fontSize: 13, fontWeight: 600, color: D.muted,
              background: D.white, border: `1px solid ${D.border}`, borderRadius: 10,
              padding: "11px 18px", cursor: "pointer",
            }}
          >
            Probar con otro CV
          </button>
          <button
            onClick={handleConfirm}
            style={{
              fontFamily: SANS, fontSize: 14, fontWeight: 700, color: "#fff",
              background: D.blue, border: "none", borderRadius: 10,
              padding: "11px 24px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, marginLeft: "auto",
            }}
          >
            Usar estos datos <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  // ── Uploading / extracting ─────────────────────────────────────────────
  if (status === "uploading" || status === "extracting") {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center" }}>
        <Loader2 size={28} className="animate-spin" color={D.blue} style={{ margin: "0 auto 16px" }} />
        <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: D.ink, margin: 0 }}>
          {status === "uploading" ? "Subiendo tu CV…" : "Leyendo tu CV…"}
        </p>
        <p style={{ fontFamily: SANS, fontSize: 12, color: D.muted, margin: "4px 0 0" }}>
          Esto tarda unos segundos.
        </p>
      </div>
    );
  }

  // ── Paste-text mode ─────────────────────────────────────────────────────
  if (status === "paste") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <textarea
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Pega aquí el texto de tu CV o tu perfil de LinkedIn…"
          rows={10}
          style={{
            fontFamily: SANS, width: "100%", fontSize: 13, color: D.ink,
            background: D.white, border: `1px solid ${D.border}`, borderRadius: 10,
            padding: "12px 14px", outline: "none", resize: "vertical",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setStatus("idle")}
            style={{
              fontFamily: SANS, fontSize: 13, fontWeight: 600, color: D.muted,
              background: D.white, border: `1px solid ${D.border}`, borderRadius: 10,
              padding: "11px 18px", cursor: "pointer",
            }}
          >
            Volver
          </button>
          <button
            onClick={handlePasteSubmit}
            disabled={pastedText.trim().length < 20}
            style={{
              fontFamily: SANS, fontSize: 14, fontWeight: 700, color: "#fff",
              background: pastedText.trim().length >= 20 ? D.blue : D.border,
              border: "none", borderRadius: 10, padding: "11px 24px",
              cursor: pastedText.trim().length >= 20 ? "pointer" : "not-allowed",
              marginLeft: "auto",
            }}
          >
            Extraer con IA
          </button>
        </div>
      </div>
    );
  }

  // ── Idle / error (upload dropzone) ──────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <button
        onClick={onBack}
        style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, color: D.muted,
          background: "none", border: "none", cursor: "pointer", padding: 0,
          display: "flex", alignItems: "center", gap: 5, alignSelf: "flex-start",
        }}
      >
        <ArrowLeft size={13} /> Elegir otra opción
      </button>

      <label style={{ position: "relative", display: "block", cursor: "pointer" }}>
        <input
          type="file"
          accept=".pdf,.docx"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <div style={{
          padding: "40px 24px", border: `2px dashed ${D.border}`, borderRadius: 16,
          textAlign: "center", background: D.surf, transition: "all 0.2s",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", background: D.white,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}>
            <Upload size={22} color={D.blue} />
          </div>
          <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: D.ink, margin: "0 0 4px" }}>
            ¿Tienes un CV a mano? Súbelo y te ahorramos el formulario
          </p>
          <p style={{ fontFamily: SANS, fontSize: 12, color: D.muted, margin: 0 }}>
            PDF o DOCX, máximo 10MB — también vale el export de LinkedIn en PDF
          </p>
        </div>
      </label>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <button
          onClick={() => setStatus("paste")}
          style={{
            fontFamily: SANS, fontSize: 12, fontWeight: 600, color: D.blue,
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
          }}
        >
          <ClipboardPaste size={13} /> O pega el texto directamente
        </button>
      </div>

      {status === "error" && errorMessage && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          padding: "12px 14px", borderRadius: 10,
          background: "#FEF2F2", border: "1px solid #FCA5A5",
        }}>
          <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontFamily: SANS, fontSize: 13, color: "#DC2626", margin: 0 }}>{errorMessage}</p>
        </div>
      )}

      <p style={{ fontFamily: SANS, fontSize: 11, color: D.faint, textAlign: "center", margin: 0 }}>
        Tu CV solo se usa para rellenar tu perfil y se borra en cuanto termina la lectura.
      </p>
    </div>
  );
}
