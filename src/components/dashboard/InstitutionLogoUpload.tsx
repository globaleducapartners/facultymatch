"use client";

import { useRef, useState, useTransition } from "react";
import { Building2, Camera, Loader2, X } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface Props {
  institutionId: string;
  currentLogoUrl?: string | null;
  onUpdate?: (url: string) => void;
}

export function InstitutionLogoUpload({ institutionId, currentLogoUrl, onUpdate }: Props) {
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("El archivo no puede superar 2 MB.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${institutionId}/logo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("institution-logos")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("institution-logos")
        .getPublicUrl(path);

      // Add cache-busting to force browser refresh
      const urlWithBust = `${publicUrl}?t=${Date.now()}`;

      // Update institutions table via API
      const res = await fetch("/api/institution/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logo_url: publicUrl }),
      });

      if (!res.ok) throw new Error("No se pudo guardar la URL del logo.");

      setLogoUrl(urlWithBust);
      onUpdate?.(publicUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeLogo = async () => {
    setUploading(true);
    try {
      const res = await fetch("/api/institution/logo", {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("No se pudo eliminar el logo.");
      setLogoUrl(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-navy to-talentia-blue flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo institucional" className="w-full h-full object-cover" />
        ) : (
          <Building2 size={28} className="text-white" />
        )}

        {/* Overlay on hover */}
        {!uploading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
            title="Cambiar logo"
          >
            <Camera size={18} className="text-white" />
          </button>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
            <Loader2 size={18} className="text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Remove button (shown when logo exists) */}
      {logoUrl && !uploading && (
        <button
          type="button"
          onClick={removeLogo}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          title="Eliminar logo"
        >
          <X size={10} />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />

      {error && (
        <p className="absolute top-full left-0 mt-1 text-xs text-red-500 font-medium whitespace-nowrap">{error}</p>
      )}
    </div>
  );
}
