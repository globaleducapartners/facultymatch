"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ChevronRight, CheckCircle2, MapPin, Globe, Award, Mail, Briefcase, Lock } from "lucide-react";
import Link from "next/link";
import { ContactModal } from "./ContactModal";
import { toggleFavorite } from "@/app/auth/actions";
import { toast } from "sonner";

const AVAIL_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  open:          { label: "Disponible ahora",     color: "#059669", bg: "#F0FDF4" },
  next_semester: { label: "Próximo semestre",      color: "#0891B2", bg: "#EFF9FF" },
  occasional:    { label: "Asignaturas puntuales", color: "#7C3AED", bg: "#F5F3FF" },
  weekends:      { label: "Fines de semana",       color: "#D97706", bg: "#FFFBEB" },
  online_only:   { label: "Solo online",           color: "#1B4FD8", bg: "#EFF6FF" },
  limited:       { label: "En 6 meses",            color: "#6B7280", bg: "#F3F4F6" },
  invite_only:   { label: "Por invitación",        color: "#0D2240", bg: "#EEF4FF" },
};

interface EducatorCardProps {
  educator: any;
  institutionId: string;
  isFavorite?: boolean;
  compact?: boolean;
  canContact?: boolean;
  /** Compact mode: call parent to handle contact directly (skips local modal) */
  onContactClick?: (educator: any) => void;
  /** Compact mode: call parent to handle favourite toggle */
  onFavoriteClick?: (e: React.MouseEvent, educatorId: string) => void;
  /** Compact mode: open detail drawer for this educator */
  onCardClick?: () => void;
}

export function EducatorCard({ educator, institutionId, isFavorite: initialIsFavorite, compact, canContact = true, onContactClick, onFavoriteClick, onCardClick }: EducatorCardProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite || false);

  // Sync local favorite state when parent re-renders with updated prop
  useEffect(() => {
    setIsFavorite(initialIsFavorite ?? false);
  }, [initialIsFavorite]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const result = await toggleFavorite(educator.id, institutionId);
    if (result.success) {
      setIsFavorite(result.action === "added");
      toast.success(result.action === "added" ? "Añadido a favoritos" : "Eliminado de favoritos");
    } else {
      toast.error("Error al actualizar favoritos");
    }
  };

  const mainArea = educator.expertise?.[0]
    ? (typeof educator.expertise[0].area === "string" ? educator.expertise[0].area : educator.expertise[0].area?.name ?? null)
    : educator.faculty_areas?.[0]
    ? (typeof educator.faculty_areas[0] === "string" ? educator.faculty_areas[0] : educator.faculty_areas[0]?.name ?? null)
    : null;

  const mainLanguage =
    Array.isArray(educator.languages) && educator.languages.length > 0
      ? typeof educator.languages[0] === "string"
        ? educator.languages[0]
        : (educator.languages[0].lang ?? educator.languages[0].language ?? null)
      : null;

  const isVerified = educator.verified && educator.verified !== "none";
  const avail = educator.availability ? (AVAIL_LABELS[educator.availability] || AVAIL_LABELS.open) : null;
  const initials = educator.full_name?.substring(0, 2).toUpperCase() || "??";
  const locationStr = [educator.city, educator.country || educator.location].filter(Boolean).join(", ");

  // ─── LinkedIn-style compact card ─────────────────────────────────────────
  if (compact) {
    return (
      <div
        className="bg-white rounded-2xl border border-[#D8E2EF] shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col overflow-hidden h-full relative group"
        onClick={() => onCardClick?.()}
      >
        {/* Pro badge */}
        {educator.is_pro && (
          <span className="absolute top-3 right-3 z-10 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md">
            Pro
          </span>
        )}

        {/* Cover + Avatar */}
        <div className="relative">
          {/* Cover strip */}
          <div className="h-16 bg-gradient-to-br from-[#0D2240] to-[#1B4FD8]" />
          {/* Avatar */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-8">
            <div className="w-16 h-16 rounded-full border-[3px] border-white overflow-hidden shadow-lg bg-[#0D2240] flex items-center justify-center">
              {educator.avatar_url ? (
                <Image src={educator.avatar_url} alt={educator.full_name} width={64} height={64} className="object-cover w-full h-full" />
              ) : (
                <span className="text-white text-base font-black">{initials}</span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-10 px-4 pb-4 flex flex-col gap-2 flex-1 text-center">
          {/* Name */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <h3 className="text-sm font-black text-[#0C1018] leading-tight group-hover:text-[#1B4FD8] transition-colors">
              {educator.full_name}
            </h3>
            {educator.is_phd && (
              <span className="text-[9px] font-black text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full border border-purple-200">PhD</span>
            )}
            {isVerified && <CheckCircle2 size={12} className="text-[#1B4FD8] flex-shrink-0" />}
          </div>

          {/* Headline */}
          <p className="text-xs text-[#6B7280] font-medium line-clamp-2 leading-snug">
            {educator.headline || "Docente académico"}
          </p>

          {/* Location */}
          {locationStr && (
            <div className="flex items-center justify-center gap-1 text-[#9CA3AF]">
              <MapPin size={10} />
              <span className="text-[11px] font-medium truncate">{locationStr}</span>
            </div>
          )}

          {/* Availability */}
          {avail && (
            <div className="flex justify-center">
              <span
                className="text-[10px] font-black px-2.5 py-1 rounded-full"
                style={{ color: avail.color, background: avail.bg }}
              >
                {avail.label}
              </span>
            </div>
          )}

          {/* Main area + years */}
          <div className="flex items-center justify-center flex-wrap gap-1 mt-1">
            {mainArea && (
              <span className="text-[10px] font-bold text-[#1B4FD8] bg-[#EFF6FF] px-2 py-0.5 rounded-lg truncate max-w-[120px]">
                {mainArea}
              </span>
            )}
            {educator.experience_years > 0 && (
              <span className="text-[10px] font-bold text-[#6B7280] bg-[#F2F6FC] border border-[#D8E2EF] px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Briefcase size={8} />
                {educator.experience_years}a
              </span>
            )}
            {educator.aneca_accreditation && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Award size={8} />
                ANECA
              </span>
            )}
          </div>

          {/* Language */}
          {mainLanguage && (
            <div className="flex items-center justify-center gap-1 text-[#9CA3AF]">
              <Globe size={10} />
              <span className="text-[11px] font-medium">{mainLanguage}</span>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action buttons */}
          <div className="flex gap-2 pt-2 mt-auto">
            {institutionId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onFavoriteClick) onFavoriteClick(e, educator.id);
                  else handleToggleFavorite(e);
                }}
                className={`flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                  isFavorite
                    ? "text-amber-500 bg-amber-50 border-amber-100"
                    : "text-[#9CA3AF] border-[#D8E2EF] hover:text-amber-500 hover:bg-amber-50"
                }`}
              >
                <Star size={14} className={isFavorite ? "fill-current" : ""} />
              </button>
            )}
            {canContact ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onContactClick) onContactClick(educator);
                  else setIsContactModalOpen(true);
                }}
                className="flex-1 bg-[#1B4FD8] hover:bg-[#0D2240] text-white text-xs font-bold h-9 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Mail size={12} /> Contactar
              </button>
            ) : (
              <Link
                href="/app/institution/billing"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-[#F2F6FC] text-[#6B7280] text-xs font-bold h-9 rounded-xl flex items-center justify-center gap-1.5 border border-[#D8E2EF]"
              >
                <Lock size={12} /> Ver más
              </Link>
            )}
          </div>
        </div>

        {/* Only render local ContactModal when no parent handler is provided */}
        {!onContactClick && (
          <ContactModal
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
            facultyId={educator.id}
            facultyName={educator.full_name}
            institutionId={institutionId}
          />
        )}
      </div>
    );
  }

  // ─── Full card (list/legacy mode) ────────────────────────────────────────
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 shrink-0 border border-gray-100 overflow-hidden relative">
          {educator.avatar_url ? (
            <Image src={educator.avatar_url} alt={educator.full_name} fill sizes="96px" className="object-cover" />
          ) : (
            <div className="bg-talentia-blue/10 text-talentia-blue w-full h-full flex items-center justify-center">
              <span className="text-2xl font-black">{initials}</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-bold text-navy group-hover:text-talentia-blue transition-colors">
                  {educator.full_name}
                </h3>
                {isVerified && (
                  <Badge className="bg-blue-50 text-talentia-blue border-none text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 size={10} /> Verificado
                  </Badge>
                )}
                {educator.aneca_accreditation && (
                  <Badge className="bg-orange-50 text-orange-600 border-none text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <Award size={10} /> {educator.aneca_accreditation}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-bold text-gray-600 mt-1">{educator.headline}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <MapPin size={14} className="text-gray-300" />
                  {educator.country || "España"}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <Globe size={14} className="text-gray-300" />
                  {(Array.isArray(educator.languages) ? educator.languages : [])
                    .map((l: any) => (typeof l === "string" ? l : l.lang ?? l.language ?? ""))
                    .filter(Boolean)
                    .join(", ") || "Español"}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleToggleFavorite}
                className={`p-2 h-10 w-10 rounded-xl transition-all ${isFavorite ? "text-energy-orange bg-orange-50" : "text-gray-300 hover:text-energy-orange hover:bg-orange-50"}`}
              >
                <Star size={20} className={isFavorite ? "fill-current" : ""} />
              </Button>
              <Button
                onClick={() => setIsContactModalOpen(true)}
                className="bg-energy-orange hover:bg-orange-600 text-white font-bold rounded-xl h-10 px-6 shadow-lg shadow-orange-100"
              >
                Contactar
              </Button>
            </div>
          </div>

          <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-2 max-w-3xl">
            {educator.bio || "Este docente aún no ha completado su biografía profesional."}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {educator.expertise?.length > 0
              ? educator.expertise.slice(0, 3).map((exp: any) => {
                  const areaLabel = typeof exp.area === "string" ? exp.area : (exp.area?.name ?? "");
                  const subareaLabel = typeof exp.subarea === "string" ? exp.subarea : (exp.subarea?.name ?? "");
                  const label = [areaLabel, subareaLabel].filter(Boolean).join(": ");
                  return label ? (
                    <Badge key={exp.id ?? label} variant="secondary" className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold border-none max-w-[200px] truncate">
                      {label}
                    </Badge>
                  ) : null;
                })
              : educator.faculty_areas?.slice(0, 3).map((area: any) => {
                  const label = typeof area === "string" ? area : (area?.name ?? "");
                  return label ? (
                    <Badge key={label} variant="secondary" className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold border-none max-w-[200px] truncate">
                      {label}
                    </Badge>
                  ) : null;
                })}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-end">
        <Button variant="link" asChild className="text-talentia-blue font-bold text-sm hover:no-underline group/btn">
          <Link href={`/app/faculty/${educator.id}`} className="flex items-center gap-2">
            Ver perfil completo
            <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-all" />
          </Link>
        </Button>
      </div>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        facultyId={educator.id}
        facultyName={educator.full_name}
        institutionId={institutionId}
      />
    </div>
  );
}
