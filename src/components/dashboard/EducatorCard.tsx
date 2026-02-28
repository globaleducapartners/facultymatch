"use client";

import { useState } from "react";
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
}

export function EducatorCard({ educator, institutionId, isFavorite: initialIsFavorite }: EducatorCardProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite || false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const result = await toggleFavorite(educator.id, institutionId);
    if (result.success) {
      setIsFavorite(result.action === 'added');
      toast.success(result.action === 'added' ? "Añadido a favoritos" : "Eliminado de favoritos");
    } else {
      toast.error("Error al actualizar favoritos");
    }
  };

  return (
    <div key={educator.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 shrink-0 border border-gray-100 overflow-hidden">
          {educator.avatar_url ? (
            <img src={educator.avatar_url} alt={educator.full_name} className="w-full h-full object-cover" />
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
                  {educator.verified !== 'none' && (
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
                  {educator.languages?.join(', ') || "Español"}
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

            {educator.expertise?.slice(0, 3).map((exp: any) => (
              <Badge key={exp.id} variant="secondary" className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold border-none">
                {exp.area}: {exp.subarea}
              </Badge>
            ))}
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
