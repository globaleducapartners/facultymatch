"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toggleFavorite } from "@/app/auth/actions";
import { toast } from "sonner";

interface FavoriteButtonProps {
  facultyId: string;
  institutionId: string;
  initialIsFavorite: boolean;
}

export function FavoriteButton({ facultyId, institutionId, initialIsFavorite }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    const result = await toggleFavorite(facultyId, institutionId);
    setLoading(false);
    
    if (result.success) {
      if (result.action === 'added') {
        setIsFavorite(true);
        toast.success("Añadido a favoritos");
      } else {
        setIsFavorite(false);
        toast.success("Eliminado de favoritos");
      }
    } else {
      toast.error("Error al actualizar favoritos");
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleToggle}
      disabled={loading}
      className={`flex-1 h-12 rounded-xl transition-all border-white/20 font-bold ${isFavorite ? "bg-orange-50/20 text-energy-orange" : "bg-white/10 text-white hover:bg-white/20"}`}
    >
      <Star size={18} className={`mr-2 ${isFavorite ? "fill-current" : ""}`} />
      {isFavorite ? "Guardado" : "Guardar"}
    </Button>
  );
}
