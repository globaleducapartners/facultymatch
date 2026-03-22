"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { Camera, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string | null;
  name?: string | null;
}

export function AvatarUpload({ userId, currentAvatarUrl, name }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const initials = name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setError("Solo se permiten imágenes JPG, PNG o WebP.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("La imagen es demasiado grande (máximo 3MB).");
      return;
    }

    setUploading(true);
    setError(null);

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      const ext = file.name.split(".").pop();
      const filePath = `${userId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update user_profiles
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Also update faculty_profiles
      await supabase
        .from("faculty_profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", userId);

      setPreview(publicUrl);
      router.refresh();
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      setError(err.message || "Error al subir la imagen.");
      setPreview(currentAvatarUrl || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <label className="relative cursor-pointer group">
        <input
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          disabled={uploading}
        />
        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-talentia-blue to-navy flex items-center justify-center border-4 border-white shadow-xl group-hover:shadow-2xl transition-all">
          {preview ? (
            <Image
              src={preview}
              alt={name || "Avatar"}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <span className="text-2xl font-black text-white">{initials}</span>
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-2xl flex items-center justify-center">
            {uploading ? (
              <Loader2 size={20} className="text-white animate-spin" />
            ) : (
              <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-all" />
            )}
          </div>
        </div>
      </label>
      <p className="text-xs text-gray-400 font-medium text-center">
        {uploading ? "Subiendo..." : "Clic para cambiar foto"}
      </p>
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
}
