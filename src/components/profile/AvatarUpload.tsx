"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { Camera, Loader2, AlertCircle, ZoomIn, ZoomOut, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

const CROP_SIZE = 256; // px — the square canvas size

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string | null;
  name?: string | null;
}

export function AvatarUpload({ userId, currentAvatarUrl, name }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Crop state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const startMouseRef = useRef({ x: 0, y: 0 });
  const startOffsetRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  const supabase = createClient();
  const router = useRouter();

  const initials = name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  // ── Draw canvas whenever scale / offset / image changes ────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);

    const baseScale = Math.max(CROP_SIZE / img.naturalWidth, CROP_SIZE / img.naturalHeight);
    const totalScale = baseScale * scale;
    const drawW = img.naturalWidth * totalScale;
    const drawH = img.naturalHeight * totalScale;
    const drawX = (CROP_SIZE - drawW) / 2 + offset.x;
    const drawY = (CROP_SIZE - drawH) / 2 + offset.y;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Dark vignette outside the circle
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, CROP_SIZE, CROP_SIZE);
    ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2 - 1, 0, Math.PI * 2, true);
    ctx.fillStyle = "rgba(0,0,0,0.48)";
    ctx.fill("evenodd");
    ctx.restore();
  }, [scale, offset, cropSrc]);

  // ── Load image when cropSrc changes ────────────────────────────────────
  useEffect(() => {
    if (!cropSrc) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setOffset({ x: 0, y: 0 });
      setScale(1);
    };
    img.src = cropSrc;
    return () => { imgRef.current = null; };
  }, [cropSrc]);

  // ── File selection ──────────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Solo se permiten imágenes JPG, PNG o WebP.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("La imagen es demasiado grande (máximo 8 MB).");
      return;
    }
    setError(null);
    setCropSrc(URL.createObjectURL(file));
  };

  // ── Drag handlers ───────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    startMouseRef.current = { x: e.clientX, y: e.clientY };
    startOffsetRef.current = { ...offset };
    e.preventDefault();
  };
  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    setOffset({
      x: startOffsetRef.current.x + (e.clientX - startMouseRef.current.x),
      y: startOffsetRef.current.y + (e.clientY - startMouseRef.current.y),
    });
  };
  const onMouseUp = () => { isDraggingRef.current = false; setIsDragging(false); };

  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const t = e.touches[0];
    isDraggingRef.current = true;
    startMouseRef.current = { x: t.clientX, y: t.clientY };
    startOffsetRef.current = { ...offset };
  };
  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const t = e.touches[0];
    setOffset({
      x: startOffsetRef.current.x + (t.clientX - startMouseRef.current.x),
      y: startOffsetRef.current.y + (t.clientY - startMouseRef.current.y),
    });
    e.preventDefault();
  };
  const onTouchEnd = () => { isDraggingRef.current = false; };

  // ── Confirm crop & upload ───────────────────────────────────────────────
  const confirmCrop = async () => {
    const img = imgRef.current;
    if (!img) return;
    setUploading(true);
    setError(null);

    try {
      const out = document.createElement("canvas");
      out.width = 400;
      out.height = 400;
      const ctx = out.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      const baseScale = Math.max(CROP_SIZE / img.naturalWidth, CROP_SIZE / img.naturalHeight);
      const totalScale = baseScale * scale;
      const drawX = (CROP_SIZE - img.naturalWidth * totalScale) / 2 + offset.x;
      const drawY = (CROP_SIZE - img.naturalHeight * totalScale) / 2 + offset.y;

      // Map canvas area back to natural image coordinates
      const srcX = -drawX / totalScale;
      const srcY = -drawY / totalScale;
      const srcW = CROP_SIZE / totalScale;
      const srcH = CROP_SIZE / totalScale;

      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, 400, 400);

      const blob = await new Promise<Blob>((resolve, reject) => {
        out.toBlob((b) => (b ? resolve(b) : reject(new Error("Blob failed"))), "image/jpeg", 0.92);
      });

      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      const filePath = `${userId}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      await supabase.from("user_profiles").update({ avatar_url: publicUrl }).eq("id", userId);
      await supabase.from("faculty_profiles").update({ avatar_url: publicUrl }).eq("user_id", userId);

      setPreview(publicUrl);
      setCropSrc(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  // ── Crop UI ─────────────────────────────────────────────────────────────
  if (cropSrc) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <p style={{ fontSize: 12, color: "#6B7280", fontWeight: 600, textAlign: "center", margin: 0 }}>
          Arrastra para centrar · usa el deslizador para hacer zoom
        </p>

        <canvas
          ref={canvasRef}
          width={CROP_SIZE}
          height={CROP_SIZE}
          style={{
            borderRadius: "50%",
            cursor: isDragging ? "grabbing" : "grab",
            boxShadow: "0 0 0 3px #D8E2EF",
            display: "block",
            touchAction: "none",
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />

        {/* Zoom slider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: CROP_SIZE }}>
          <ZoomOut size={15} color="#9CA3AF" />
          <input
            type="range" min={0.5} max={4} step={0.05} value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            style={{ flex: 1, cursor: "pointer", accentColor: "#1B4FD8" }}
          />
          <ZoomIn size={15} color="#9CA3AF" />
        </div>

        {error && (
          <div style={{ display: "flex", gap: 7, padding: "9px 13px", background: "#FEF2F2", borderRadius: 10, color: "#DC2626", fontSize: 12, fontWeight: 500 }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={confirmCrop}
            disabled={uploading}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#1B4FD8", color: "#fff", border: "none",
              padding: "9px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700,
              cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.65 : 1,
            }}
          >
            {uploading
              ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Subiendo…</>
              : <><Check size={14} /> Guardar foto</>
            }
          </button>
          <button
            onClick={() => { setCropSrc(null); setError(null); }}
            disabled={uploading}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "transparent", color: "#6B7280",
              border: "1px solid #D8E2EF",
              padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            <X size={14} /> Cancelar
          </button>
        </div>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  // ── Default avatar display ──────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <label style={{ cursor: "pointer", position: "relative", display: "block" }}>
        <input
          type="file" style={{ display: "none" }}
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
        />
        <div style={{
          width: 96, height: 96, borderRadius: "50%",
          background: preview ? "transparent" : "linear-gradient(135deg, #1B4FD8, #0D2240)",
          border: "4px solid #fff",
          boxShadow: "0 4px 16px rgba(7,19,38,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", position: "relative",
        }}>
          {preview
            ? <img src={preview} alt={name || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ color: "#fff", fontSize: 28, fontWeight: 800 }}>{initials}</span>
          }
          <div
            style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.18s",
              borderRadius: "50%",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.38)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0)"; }}
          >
            <Camera size={20} color="#fff" style={{ opacity: 0.95, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }} />
          </div>
        </div>
      </label>
      <p style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, textAlign: "center", margin: 0 }}>
        Clic para cambiar · se puede recortar
      </p>
      {error && (
        <div style={{ display: "flex", gap: 7, padding: "8px 12px", background: "#FEF2F2", borderRadius: 10, color: "#DC2626", fontSize: 11, fontWeight: 500 }}>
          <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
        </div>
      )}
    </div>
  );
}
