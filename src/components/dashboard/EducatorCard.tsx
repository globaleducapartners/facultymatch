"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ChevronRight, CheckCircle2, MapPin, Globe, Award, Mail } from "lucide-react";
import Link from "next/link";
import { ContactModal } from "./ContactModal";
import { toggleFavorite } from "@/app/auth/actions";
import { toast } from "sonner";

interface EducatorCardProps {
  educator: any;
  institutionId: string;
  isFavorite?: boolean;
  compact?: boolean;
}

export function EducatorCard({ educator, institutionId, isFavorite: initialIsFavorite, compact }: EducatorCardProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite || false);

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

  // Derived display values
  const mainArea = educator.expertise?.[0]
    ? (typeof educator.expertise[0].area === "string"
        ? educator.expertise[0].area
        : educator.expertise[0].area?.name ?? null)
    : educator.faculty_areas?.[0]
    ? (typeof educator.faculty_areas[0] === "string"
        ? educator.faculty_areas[0]
        : educator.faculty_areas[0]?.name ?? null)
    : null;

  const mainLanguage =
    Array.isArray(educator.languages) && educator.languages.length > 0
      ? typeof educator.languages[0] === "string"
        ? educator.languages[0]
        : (educator.languages[0].lang ?? educator.languages[0].language ?? null)
      : null;

  const isVerified = educator.verified && educator.verified !== "none";

  // ─── Compact card (grid mode) ────────────────────────────────────────────
  if (compact) {
    return (
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group flex flex-col gap-3 h-full relative">
        {/* Pro indicator */}
        {educator.is_pro && (
          <span className="absolute top-3 right-3 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md">
            Pro
          </span>
        )}

        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
          {educator.avatar_url ? (
            <Image
              src={educator.avatar_url}
              alt={educator.full_name}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-talentia-blue/10 flex items-center justify-center">
              <span className="text-sm font-black text-talentia-blue">
                {educator.full_name?.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Name + verified */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap pr-8">
            <h3 className="text-sm font-bold text-navy group-hover:text-talentia-blue transition-colors leading-tight">
              {educator.full_name}
            </h3>
            {isVerified && (
              <CheckCircle2 size={13} className="text-talentia-blue flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-500 font-medium line-clamp-2 mt-0.5 leading-snug">
            {educator.headline || "Docente"}
          </p>
        </div>

        {/* Main area badge */}
        {mainArea && (
          <Badge className="bg-blue-50 text-talentia-blue border-none text-[10px] font-bold px-2 py-0.5 rounded-lg w-fit max-w-full truncate">
            {mainArea}
          </Badge>
        )}

        {/* Attribute badges */}
        <div className="flex flex-wrap gap-1 mt-auto">
          {mainLanguage && (
            <Badge className="bg-gray-50 text-gray-500 border border-gray-100 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Globe size={9} />
              {mainLanguage}
            </Badge>
          )}
          {educator.modality && (
            <Badge className="bg-gray-50 text-gray-500 border border-gray-100 text-[10px] font-bold px-2 py-0.5 rounded-lg capitalize">
              {educator.modality}
            </Badge>
          )}
          {educator.aneca_accreditation && (
            <Badge className="bg-orange-50 text-orange-600 border-none text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Award size={9} />
              ANECA
            </Badge>
          )}
        </div>
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
              <span className="text-2xl font-black">{educator.full_name?.substring(0, 2).toUpperCase()}</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
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

          {educator.research_publications && (
            <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
              <Globe size={14} className="mt-0.5 shrink-0" />
              <p className="italic line-clamp-1">{educator.research_publications}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {educator.expertise?.length > 0
              ? educator.expertise.slice(0, 3).map((exp: any) => {
                  const areaLabel = typeof exp.area === "string" ? exp.area : (exp.area?.name ?? "");
                  const subareaLabel = typeof exp.subarea === "string" ? exp.subarea : (exp.subarea?.name ?? "");
                  const label = [areaLabel, subareaLabel].filter(Boolean).join(": ");
                  return label ? (
                    <Badge key={exp.id ?? label} variant="secondary" className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold border-none max-w-[200px] truncate" title={label}>
                      {label}
                    </Badge>
                  ) : null;
                })
              : educator.faculty_areas?.slice(0, 3).map((area: any) => {
                  const label = typeof area === "string" ? area : (area?.name ?? "");
                  return label ? (
                    <Badge key={label} variant="secondary" className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold border-none max-w-[200px] truncate" title={label}>
                      {label}
                    </Badge>
                  ) : null;
                })}
            {educator.expertise?.length > 3 && (
              <Badge variant="secondary" className="bg-gray-50 text-gray-400 px-3 py-1 rounded-lg text-xs font-bold border-none">
                +{educator.expertise.length - 3} más
              </Badge>
            )}
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
