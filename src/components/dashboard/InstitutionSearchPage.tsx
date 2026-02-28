"use client";

import { useState } from "react";
import { Search, Filter, GraduationCap, Globe, MapPin, ChevronRight, CheckCircle2, Award, Star, Mail, Briefcase, BookOpen, ExternalLink, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EducatorCard } from "./EducatorCard";
import { ContactModal } from "./ContactModal";
import Link from "next/link";
import { toggleFavorite } from "@/app/auth/actions";
import { toast } from "sonner";

interface InstitutionSearchPageProps {
  initialEducators: any[];
  institutionId: string;
  searchParams: any;
  initialFavorites: string[];
}

export function InstitutionSearchPage({ initialEducators, institutionId, searchParams, initialFavorites }: InstitutionSearchPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(initialFavorites || []);

  const selectedEducator = initialEducators.find(e => e.id === selectedId);

  const handleToggleFavorite = async (e: React.MouseEvent, facultyId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const result = await toggleFavorite(facultyId, institutionId);
    if (result.success) {
      if (result.action === 'added') {
        setFavorites([...favorites, facultyId]);
        toast.success("Añadido a favoritos");
      } else {
        setFavorites(favorites.filter(id => id !== facultyId));
        toast.success("Eliminado de favoritos");
      }
    } else {
      toast.error("Error al actualizar favoritos");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">Buscar docentes</h1>
          <p className="text-gray-500 font-medium">Encuentra el profesorado adecuado para tus programas.</p>
        </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-blue-50 text-talentia-blue border-blue-100 font-bold px-4 py-1.5 rounded-full">
              Plan Starter: 10 contactos/mes
            </Badge>
            <Button variant="outline" asChild className="rounded-full border-gray-200 font-bold">
              <Link href="/app/institution/favorites" className="flex items-center gap-2">
                <Star size={16} className="text-energy-orange fill-energy-orange" /> Favoritos
              </Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full border-gray-200 font-bold">
              <Link href="/app/institution/contacts">Ver contactos enviados</Link>
            </Button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative items-start">
        {/* Left Sidebar: Filters */}
        <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center justify-between text-navy">
                <div className="flex items-center gap-2">
                  <Filter size={20} className="text-talentia-blue" />
                  <h2 className="font-bold">Filtros académicos</h2>
                </div>
                {Object.keys(searchParams).length > 0 && (
                  <Link href="/app/institution" className="text-xs font-bold text-gray-400 hover:text-talentia-blue transition-colors">
                    Limpiar
                  </Link>
                )}
              </div>
            
              <form action="/app/institution" method="get" className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Búsqueda por palabra clave</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      name="query"
                      defaultValue={searchParams.query || ""}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all text-sm font-medium"
                      placeholder="Nombre, especialidad, bio..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Área Académica</label>
                  <select 
                    name="area"
                    defaultValue={searchParams.area || ""}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all text-sm font-medium appearance-none"
                  >
                    <option value="">Todas las áreas</option>
                    <option value="Negocios">Negocios & Management</option>
                    <option value="Tecnología">Ingeniería & Tech</option>
                    <option value="Salud">Salud & Ciencias</option>
                    <option value="Humanidades">Artes & Humanidades</option>
                    <option value="Derecho">Derecho & Ciencias Sociales</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Subárea / Especialidad</label>
                  <input
                    name="subarea"
                    defaultValue={searchParams.subarea || ""}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all text-sm font-medium"
                    placeholder="Ej: Finanzas, IA, Marketing..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Idioma</label>
                  <select 
                    name="language"
                    defaultValue={searchParams.language || ""}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all text-sm font-medium appearance-none"
                  >
                    <option value="">Cualquier idioma</option>
                    <option value="Español">Español</option>
                    <option value="Inglés">Inglés</option>
                    <option value="Francés">Francés</option>
                    <option value="Alemán">Alemán</option>
                    <option value="Portugués">Portugués</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">País</label>
                  <select 
                    name="country"
                    defaultValue={searchParams.country || ""}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all text-sm font-medium appearance-none"
                  >
                    <option value="">Cualquier país</option>
                    <option value="España">España</option>
                    <option value="México">México</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Chile">Chile</option>
                    <option value="USA">EE.UU.</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Acreditación ANECA</label>
                  <select 
                    name="aneca"
                    defaultValue={searchParams.aneca || ""}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all text-sm font-medium appearance-none"
                  >
                    <option value="">Cualquier acreditación</option>
                    <option value="Ayudante Doctor">Ayudante Doctor</option>
                    <option value="Contratado Doctor">Contratado Doctor</option>
                    <option value="Titular de Universidad">Titular de Universidad</option>
                    <option value="Catedrático">Catedrático</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 text-talentia-blue">Nivel Académico</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="phd" 
                      value="true" 
                      defaultChecked={searchParams.phd === "true"}
                      className="rounded border-gray-300 text-talentia-blue focus:ring-talentia-blue" 
                    />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-navy transition-colors">Solo PhD / Doctores</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Modalidad de docencia</label>
                  <div className="space-y-2">
                    {['Online', 'Presencial', 'Híbrida'].map((m) => (
                      <label key={m} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          name="modality" 
                          value={m.toLowerCase()} 
                          defaultChecked={Array.isArray(searchParams.modality) ? searchParams.modality.includes(m.toLowerCase()) : searchParams.modality === m.toLowerCase()}
                          className="rounded border-gray-300 text-talentia-blue focus:ring-talentia-blue" 
                        />
                        <span className="text-sm font-medium text-gray-600 group-hover:text-navy transition-colors">{m}</span>
                      </label>
                    ))}
                  </div>
                </div>

              <Button type="submit" className="w-full bg-talentia-blue hover:bg-blue-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-blue-100 transition-all">
                Aplicar filtros
              </Button>
            </form>
          </div>
        </aside>

        {/* Center/Right Content: List + Preview */}
        <div className={`lg:col-span-9 transition-all duration-500 ${selectedId ? 'grid grid-cols-1 xl:grid-cols-2 gap-6' : 'space-y-6'}`}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-navy">{initialEducators.length} Docentes encontrados</h2>
            </div>

            <div className="grid gap-6">
              {initialEducators.length > 0 ? (
                initialEducators.map((educator) => (
                    <div 
                      key={educator.id} 
                      onClick={() => setSelectedId(educator.id)}
                      className={`cursor-pointer transition-all ${selectedId === educator.id ? 'ring-2 ring-talentia-blue shadow-lg' : ''} rounded-2xl`}
                    >
                      <EducatorCard 
                        educator={educator} 
                        institutionId={institutionId} 
                        isFavorite={favorites.includes(educator.id)}
                      />
                    </div>
                ))
              ) : (
                <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center text-center">
                  <div className="bg-gray-50 p-6 rounded-full text-gray-200 mb-6">
                    <Search size={48} />
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-2">No se han encontrado docentes</h3>
                  <p className="text-gray-500 max-w-xs mx-auto font-medium">
                    Prueba a ajustar los filtros de búsqueda.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel (Sticky) */}
          {selectedEducator && (
            <div className="hidden xl:block xl:sticky xl:top-24 h-[calc(100vh-8rem)] animate-in slide-in-from-right-8 duration-500">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 h-full overflow-y-auto flex flex-col">
                <div className="p-8 border-b border-gray-50 flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-talentia-blue/10 text-talentia-blue rounded-2xl flex items-center justify-center text-xl font-black">
                      {selectedEducator.full_name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-navy">{selectedEducator.full_name}</h3>
                      <p className="text-sm font-bold text-gray-500">{selectedEducator.headline}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedId(null)}
                    className="rounded-full hover:bg-gray-100"
                  >
                    <X size={20} />
                  </Button>
                </div>

                <div className="p-8 space-y-8 flex-1">
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setIsContactModalOpen(true)}
                        className="flex-1 bg-energy-orange hover:bg-orange-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-orange-100"
                      >
                        <Mail size={18} className="mr-2" /> Contactar ahora
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={(e) => handleToggleFavorite(e, selectedEducator.id)}
                        className={`h-12 w-12 rounded-xl transition-all ${favorites.includes(selectedEducator.id) ? "text-energy-orange bg-orange-50 border-orange-100" : "text-gray-300 border-gray-100 hover:text-energy-orange hover:bg-orange-50"}`}
                      >
                        <Star size={20} className={favorites.includes(selectedEducator.id) ? "fill-current" : ""} />
                      </Button>
                    </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Información básica</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                        <MapPin size={18} className="text-talentia-blue" />
                        {selectedEducator.country || "España"}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                        <Globe size={18} className="text-talentia-blue" />
                        {selectedEducator.languages?.join(', ') || "Español"}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                        <Award size={18} className="text-talentia-blue" />
                        {selectedEducator.aneca_accreditation || "Sin acreditar"}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                        <Briefcase size={18} className="text-talentia-blue" />
                        {selectedEducator.experience_years}+ años exp.
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Biografía</h4>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                      {selectedEducator.bio}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Especialidades</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEducator.expertise?.map((exp: any) => (
                        <Badge key={exp.id} className="bg-gray-50 text-gray-600 border-none px-4 py-2 rounded-xl text-xs font-bold">
                          {exp.area}: {exp.subarea}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                  <div className="p-8 border-t border-gray-50 bg-gray-50/30">
                    <Button variant="outline" asChild className="w-full rounded-2xl border-gray-200 bg-white font-bold h-12">
                      <Link href={`/app/faculty/${selectedEducator.id}`}>
                        Ver perfil completo <ExternalLink size={16} className="ml-2" />
                      </Link>
                    </Button>
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedEducator && (
        <ContactModal 
          isOpen={isContactModalOpen} 
          onClose={() => setIsContactModalOpen(false)}
          facultyId={selectedEducator.id}
          facultyName={selectedEducator.full_name}
          institutionId={institutionId}
        />
      )}
    </div>
  );
}
