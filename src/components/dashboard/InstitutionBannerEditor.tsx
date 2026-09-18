"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { BannerUpload } from "@/components/profile/BannerUpload";

interface Props {
  institutionId: string;
  currentBannerUrl?: string | null;
}

// Misma banda de portada que el perfil docente (mismo componente
// BannerUpload, con target="institution"): degradado por defecto, foto
// propia o preset temático si la institución lo elige.
export function InstitutionBannerEditor({ institutionId, currentBannerUrl }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="h-36 bg-gradient-to-br from-[#0D2240] via-[#1B4FD8] to-[#4F7FE8] relative overflow-hidden">
      {currentBannerUrl ? (
        <img
          src={currentBannerUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      ) : (
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        />
      )}

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="absolute z-[2] top-3.5 right-3.5 flex items-center gap-1.5 bg-black/40 border border-white/35 rounded-lg px-3 py-1.5 text-white text-xs font-semibold backdrop-blur-sm hover:bg-black/55 transition-colors"
      >
        <Pencil size={12} /> Banner
      </button>

      {pickerOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/55 flex items-center justify-center p-5"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPickerOpen(false);
          }}
        >
          <div className="w-full max-w-[480px]">
            <BannerUpload
              userId={institutionId}
              currentBannerUrl={currentBannerUrl}
              target="institution"
              onClose={() => setPickerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
