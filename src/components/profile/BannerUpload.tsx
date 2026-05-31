"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { Loader2, Upload, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Preset banners (3:1 aspect ratio, thematic) ─────────────────────────────
const PRESETS = [
  {
    id: "salud",
    label: "CC. de la Salud",
    url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1500&h=500",
  },
  {
    id: "empresariales",
    label: "CC. Empresariales",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1500&h=500",
  },
  {
    id: "tecnologia",
    label: "CC. Tecnológicas",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1500&h=500",
  },
] as const;

interface BannerUploadProps {
  userId: string;
  currentBannerUrl?: string | null;
  onClose: () => void;
}

export function BannerUpload({ userId, currentBannerUrl, onClose }: BannerUploadProps) {
  const [tab, setTab] = useState<"presets" | "upload">("presets");
  const [selected, setSelected] = useState<string | null>(currentBannerUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  const saveBanner = async (url: string) => {
    setUploading(true);
    setError(null);
    try {
      const { error: dbErr } = await supabase
        .from("faculty_profiles")
        .update({ banner_url: url })
        .eq("user_id", userId);
      if (dbErr) throw dbErr;
      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar el banner.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Solo se permiten imágenes JPG, PNG o WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen es demasiado grande (máximo 5 MB).");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${userId}/banner.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("banners")
        .upload(filePath, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from("banners").getPublicUrl(filePath);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      await saveBanner(publicUrl);
    } catch (err: any) {
      setError(err.message || "Error al subir el banner.");
      setUploading(false);
    }
  };

  const removePreset = async () => {
    await saveBanner("");
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #D8E2EF", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #D8E2EF" }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#0C1018" }}>Personalizar banner</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", display: "flex" }}>
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #D8E2EF" }}>
        {(["presets", "upload"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: "11px 0", border: "none", cursor: "pointer",
              background: tab === t ? "#EFF6FF" : "#fff",
              color: tab === t ? "#1B4FD8" : "#6B7280",
              fontSize: 13, fontWeight: 700,
              borderBottom: tab === t ? "2px solid #1B4FD8" : "2px solid transparent",
            }}
          >
            {t === "presets" ? "Elegir preset" : "Subir imagen"}
          </button>
        ))}
      </div>

      <div style={{ padding: "20px" }}>
        {tab === "presets" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 12, color: "#6B7280", fontWeight: 500, margin: 0 }}>
              Selecciona un fondo temático para tu perfil (proporciones 3:1).
            </p>

            {/* Reset option */}
            <div
              onClick={() => setSelected("")}
              style={{
                borderRadius: 12, overflow: "hidden", cursor: "pointer",
                border: selected === "" || selected === null ? "2px solid #1B4FD8" : "2px solid #D8E2EF",
                height: 64,
                background: "linear-gradient(135deg, #0D2240 0%, #1B4FD8 55%, #4F7FE8 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600 }}>Gradiente por defecto</span>
              {(selected === "" || selected === null) && (
                <div style={{ position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: "50%", background: "#1B4FD8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check size={13} color="#fff" />
                </div>
              )}
            </div>

            {PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => setSelected(preset.url)}
                style={{
                  borderRadius: 12, overflow: "hidden", cursor: "pointer",
                  border: selected === preset.url ? "2px solid #1B4FD8" : "2px solid #D8E2EF",
                  position: "relative",
                }}
              >
                <img
                  src={preset.url}
                  alt={preset.label}
                  style={{ width: "100%", height: 72, objectFit: "cover", display: "block" }}
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to right, rgba(0,0,0,0.45), transparent)",
                  display: "flex", alignItems: "center", paddingLeft: 14,
                }}>
                  <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{preset.label}</span>
                </div>
                {selected === preset.url && (
                  <div style={{ position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: "50%", background: "#1B4FD8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={13} color="#fff" />
                  </div>
                )}
              </div>
            ))}

            {error && (
              <p style={{ fontSize: 12, color: "#DC2626", fontWeight: 500, margin: 0 }}>{error}</p>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                onClick={() => selected !== undefined && saveBanner(selected || "")}
                disabled={uploading || selected === currentBannerUrl}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "#1B4FD8", color: "#fff", border: "none",
                  padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                  cursor: (uploading || selected === currentBannerUrl) ? "not-allowed" : "pointer",
                  opacity: (uploading || selected === currentBannerUrl) ? 0.6 : 1,
                }}
              >
                {uploading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={14} />}
                {uploading ? "Guardando…" : "Aplicar banner"}
              </button>
              <button onClick={onClose} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #D8E2EF", background: "transparent", color: "#6B7280", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {tab === "upload" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 12, color: "#6B7280", fontWeight: 500, margin: 0 }}>
              Sube una imagen en proporción 3:1 (p. ej. 1500×500 px). Formatos: JPG, PNG, WebP · máximo 5 MB.
            </p>

            <label style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 10, padding: "32px 20px",
              border: "2px dashed #D8E2EF", borderRadius: 12,
              cursor: uploading ? "not-allowed" : "pointer",
              background: "#F9FAFB",
            }}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={handleFileUpload}
                disabled={uploading}
              />
              {uploading
                ? <Loader2 size={24} color="#6B7280" style={{ animation: "spin 1s linear infinite" }} />
                : <Upload size={24} color="#9CA3AF" />
              }
              <span style={{ fontSize: 13, fontWeight: 600, color: "#6B7280" }}>
                {uploading ? "Subiendo…" : "Haz clic para seleccionar imagen"}
              </span>
            </label>

            {error && (
              <p style={{ fontSize: 12, color: "#DC2626", fontWeight: 500, margin: 0 }}>{error}</p>
            )}

            <button onClick={onClose} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #D8E2EF", background: "transparent", color: "#6B7280", fontSize: 13, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start" }}>
              Cancelar
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
