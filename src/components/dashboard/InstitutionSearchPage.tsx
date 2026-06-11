"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Globe,
  MapPin,
  CheckCircle2,
  Award,
  Star,
  Mail,
  Briefcase,
  ExternalLink,
  X,
  Lock,
  Zap,
  ChevronDown,
  Building2,
  GraduationCap,
  Eye,
  FileText,
  Phone,
  AtSign,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EducatorCard } from "./EducatorCard";
import { ContactModal } from "./ContactModal";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";
import { toggleFavorite, switchActiveMode } from "@/app/auth/actions";
import { toast } from "sonner";
import { ProfileViewTracker } from "@/components/profile/ProfileViewTracker";
import { getDocumentUrl } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

const FREE_CONTACTS_LIMIT = 5;

interface InstitutionSearchPageProps {
  initialEducators: any[];
  institutionId: string;
  searchParams: any;
  initialFavorites: string[];
  isPro: boolean;
  searchLimitReached: boolean;
  monthlyContactsUsed: number;
  /** When true: faculty browsing mode — contact locked, no plan/limit UI */
  isReadOnly?: boolean;
  /** When true: user already has an institution profile (dual-mode) */
  isAlreadyInstitution?: boolean;
  /** Base URL for search form and filter chip links */
  searchPath?: string;
}

// ─── Filter chip helpers ──────────────────────────────────────────────────────

const FILTER_KEYS = ["query", "area", "subarea", "language", "country", "aneca", "phd", "modality"] as const;

const FILTER_LABELS: Record<string, string> = {
  query: "Búsqueda",
  area: "Área",
  subarea: "Subárea",
  language: "Idioma",
  country: "País",
  aneca: "ANECA",
  phd: "Solo PhD",
  modality: "Modalidad",
};

function getChipLabel(key: string, value: string): string {
  if (key === "phd") return "Solo PhD";
  return `${FILTER_LABELS[key] ?? key}: ${value}`;
}

function buildUrlWithout(params: Record<string, any>, removeKey: string, removeValue: string, base: string): string {
  const p = new URLSearchParams();
  FILTER_KEYS.forEach((k) => {
    if (k === removeKey) return;
    const v = params[k];
    if (!v) return;
    if (Array.isArray(v)) v.forEach((val) => p.append(k, val));
    else p.append(k, v as string);
  });
  const str = p.toString();
  return `${base}${str ? `?${str}` : ""}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InstitutionSearchPage({
  initialEducators,
  institutionId,
  searchParams,
  initialFavorites,
  isPro,
  searchLimitReached,
  monthlyContactsUsed,
  isReadOnly = false,
  isAlreadyInstitution = false,
  searchPath,
}: InstitutionSearchPageProps) {
  const basePath = searchPath ?? (isReadOnly ? "/app/faculty/directory" : "/app/institution/search");
  // Open drawer from URL param on first render
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const fid = searchParams.faculty as string | undefined;
    if (fid && initialEducators.find((e) => e.id === fid)) return fid;
    return null;
  });
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(initialFavorites || []);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [usedContacts, setUsedContacts] = useState(monthlyContactsUsed);
  // Direct contact from card (bypasses drawer)
  const [directContactEducator, setDirectContactEducator] = useState<any | null>(null);

  const canContact = !isReadOnly && (isPro || usedContacts < FREE_CONTACTS_LIMIT);

  const selectedEducator = initialEducators.find((e) => e.id === selectedId);

  // Documents: prefer pre-loaded data from server, fallback to on-demand fetch
  const [facultyDocs, setFacultyDocs] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docsFetched, setDocsFetched] = useState(false);

  useEffect(() => {
    if (!selectedEducator) {
      setFacultyDocs([]);
      setDocsFetched(false);
      return;
    }

    // If documents are pre-loaded from server, use them immediately
    const preloaded = (selectedEducator as any).faculty_documents;
    if (Array.isArray(preloaded) && preloaded.length > 0) {
      setFacultyDocs(preloaded);
      setDocsFetched(true);
      return;
    }

    // Fallback: fetch on-demand if no pre-loaded data
    if (!docsFetched) {
      setLoadingDocs(true);
      fetch(`/api/faculty/documents?facultyId=${selectedId}`)
        .then((res) => res.json())
        .then((data) => {
          setFacultyDocs(Array.isArray(data) ? data : []);
        })
        .catch(() => setFacultyDocs([]))
        .finally(() => {
          setLoadingDocs(false);
          setDocsFetched(true);
        });
    }
  }, [selectedEducator, selectedId, docsFetched]);

  // ── URL sync ──────────────────────────────────────────────────────────────

  const openEducator = (id: string) => {
    setSelectedId(id);
    const params = new URLSearchParams(window.location.search);
    params.set("faculty", id);
    window.history.replaceState(null, "", `${basePath}?${params.toString()}`);
  };

  const closeDrawer = () => {
    setSelectedId(null);
    const params = new URLSearchParams(window.location.search);
    params.delete("faculty");
    const str = params.toString();
    window.history.replaceState(null, "", `${basePath}${str ? `?${str}` : ""}`);
  };

  // ── Direct contact from card (no drawer) ──────────────────────────────────

  const handleDirectContact = (educator: any) => {
    setSelectedId(null); // close drawer if open
    setDirectContactEducator(educator);
  };

  const handleCloseDirectContact = () => {
    setDirectContactEducator(null);
  };

  // ── Favorites ─────────────────────────────────────────────────────────────

  const handleToggleFavorite = async (e: React.MouseEvent, facultyId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const result = await toggleFavorite(facultyId, institutionId);
    if (result.success) {
      if (result.action === "added") {
        setFavorites((prev) => [...prev, facultyId]);
        toast.success("Añadido a favoritos");
      } else {
        setFavorites((prev) => prev.filter((id) => id !== facultyId));
        toast.success("Eliminado de favoritos");
      }
    } else {
      toast.error("Error al actualizar favoritos");
    }
  };

  // ── Active filter chips ───────────────────────────────────────────────────

  const activeChips: { key: string; value: string; label: string }[] = [];
  FILTER_KEYS.forEach((key) => {
    const val = searchParams[key];
    if (!val) return;
    if (Array.isArray(val)) {
      val.forEach((v) => activeChips.push({ key, value: v, label: getChipLabel(key, v) }));
    } else {
      activeChips.push({ key, value: val as string, label: getChipLabel(key, val as string) });
    }
  });

  const hasActiveFilters = activeChips.length > 0;
  const hasActiveMoreFilters = ["subarea", "language", "country", "phd", "aneca"].some((k) => searchParams[k]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">
            {isReadOnly ? "Directorio de docentes" : "Buscar docentes"}
          </h1>
          <p className="text-gray-500 font-medium">
            {isReadOnly
              ? "Explora los perfiles del profesorado disponible en la plataforma."
              : "Encuentra el profesorado adecuado para tus programas."}
          </p>
        </div>
        {!isReadOnly && (
          <div className="flex items-center gap-3 flex-wrap">
            <Badge
              variant="outline"
              className={`font-bold px-4 py-1.5 rounded-full ${isPro ? "bg-blue-50 text-talentia-blue border-blue-100" : "bg-gray-50 text-gray-500 border-gray-200"}`}
            >
              {isPro ? "Plan Professional" : "Plan Essential"}
            </Badge>
            <Button variant="outline" asChild className="rounded-full border-gray-200 font-bold">
              <Link href="/app/institution/favorites" className="flex items-center gap-2">
                <Star size={16} className="text-energy-orange fill-energy-orange" />
                Favoritos
              </Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full border-gray-200 font-bold hidden sm:flex">
              <Link href="/app/institution/contacts">Contactos</Link>
            </Button>
          </div>
        )}
      </div>

      {/* ── Read-only banner (faculty mode) ── */}
      {isReadOnly && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Search size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="font-black text-blue-900 text-sm">Modo exploración — solo lectura</p>
              <p className="text-blue-700 text-sm font-medium mt-0.5">
                {isAlreadyInstitution
                  ? "Tienes un perfil de institución. Cambia al modo institución para contactar docentes."
                  : "Puedes ver todos los perfiles, pero necesitas una cuenta de institución para contactar docentes."}
              </p>
            </div>
          </div>
          {isAlreadyInstitution ? (
            <form action={switchActiveMode}>
              <input type="hidden" name="mode" value="institution" />
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-[#1d4ed8] hover:bg-blue-700 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap flex-shrink-0"
              >
                <Zap size={14} /> Cambiar a modo institución
              </button>
            </form>
          ) : (
            <Link
              href="/app/become-institution"
              className="inline-flex items-center gap-2 bg-[#1d4ed8] hover:bg-blue-700 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap flex-shrink-0"
            >
              <Zap size={14} /> Registrar institución
            </Link>
          )}
        </div>
      )}

      {/* ── Search limit banner ── */}
      {!isReadOnly && searchLimitReached && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Lock size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="font-black text-amber-900 text-sm">Has alcanzado el límite de 5 búsquedas mensuales</p>
              <p className="text-amber-700 text-sm font-medium mt-0.5">
                Activa el Plan Professional para búsquedas ilimitadas.
              </p>
            </div>
          </div>
          <Link
            href="/app/institution/billing"
            className="inline-flex items-center gap-2 bg-[#1d4ed8] hover:bg-blue-700 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap flex-shrink-0"
          >
            <Zap size={14} /> Activar Plan Professional
          </Link>
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <form action={basePath} method="get" className="p-4">
          {/* Primary row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Keyword */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              <input
                name="query"
                defaultValue={searchParams.query || ""}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all text-sm font-medium"
                placeholder="Nombre, especialidad, bio..."
              />
            </div>

            {/* Area */}
            <select
              name="area"
              defaultValue={searchParams.area || ""}
              className="px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all text-sm font-medium appearance-none sm:w-52"
            >
              <option value="">Todas las áreas</option>
              <option value="Business & Management">Business & Management</option>
              <option value="Economía & Finanzas">Economía & Finanzas</option>
              <option value="Derecho & Ciencias Políticas">Derecho & CC. Políticas</option>
              <option value="Ingeniería & Tecnología">Ingeniería & Tecnología</option>
              <option value="IA & Datos">IA & Datos</option>
              <option value="Salud & Ciencias">Salud & Ciencias</option>
              <option value="Comunicación & Marketing">Comunicación & Marketing</option>
              <option value="Educación">Educación</option>
              <option value="Otros">Otros</option>
            </select>

            {/* Modality */}
            <select
              name="modality"
              defaultValue={
                Array.isArray(searchParams.modality)
                  ? searchParams.modality[0]
                  : searchParams.modality || ""
              }
              className="px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all text-sm font-medium appearance-none sm:w-44"
            >
              <option value="">Modalidad</option>
              <option value="Online">Online</option>
              <option value="Presencial">Presencial</option>
              <option value="Híbrida">Híbrida</option>
            </select>

            {/* More filters toggle */}
            <button
              type="button"
              onClick={() => setShowMoreFilters((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all whitespace-nowrap ${
                hasActiveMoreFilters
                  ? "bg-blue-50 text-talentia-blue border-blue-100"
                  : showMoreFilters
                  ? "bg-gray-100 text-navy border-gray-200"
                  : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100 hover:text-navy"
              }`}
            >
              <Filter size={14} />
              Más filtros
              {hasActiveMoreFilters && <span className="w-1.5 h-1.5 rounded-full bg-talentia-blue flex-shrink-0" />}
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${showMoreFilters ? "rotate-180" : ""}`}
              />
            </button>

            {/* Submit */}
            <Button
              type="submit"
              className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-10 px-6 rounded-xl shadow-sm shadow-blue-100 whitespace-nowrap"
            >
              Buscar
            </Button>
          </div>

          {/* Expanded more filters */}
          {showMoreFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">
                  Subárea
                </label>
                <input
                  name="subarea"
                  defaultValue={searchParams.subarea || ""}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all text-sm font-medium"
                  placeholder="Ej: Finanzas, IA..."
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">
                  Idioma
                </label>
                <select
                  name="language"
                  defaultValue={searchParams.language || ""}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all text-sm font-medium appearance-none"
                >
                  <option value="">Cualquier idioma</option>
                  <option value="Español">Español</option>
                  <option value="Inglés">Inglés</option>
                  <option value="Francés">Francés</option>
                  <option value="Alemán">Alemán</option>
                  <option value="Portugués">Portugués</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">
                  País
                </label>
                <select
                  name="country"
                  defaultValue={searchParams.country || ""}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all text-sm font-medium appearance-none"
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
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">
                  ANECA
                </label>
                <select
                  name="aneca"
                  defaultValue={searchParams.aneca || ""}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all text-sm font-medium appearance-none"
                >
                  <option value="">Cualquier acreditación</option>
                  <option value="Ayudante Doctor">Ayudante Doctor</option>
                  <option value="Contratado Doctor">Contratado Doctor</option>
                  <option value="Titular de Universidad">Titular de Universidad</option>
                  <option value="Catedrático">Catedrático</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2.5 cursor-pointer group pb-2">
                  <input
                    type="checkbox"
                    name="phd"
                    value="true"
                    defaultChecked={searchParams.phd === "true"}
                    className="rounded border-gray-300 text-talentia-blue focus:ring-talentia-blue w-4 h-4"
                  />
                  <span className="text-sm font-bold text-gray-600 group-hover:text-navy transition-colors">
                    Solo PhD / Doctores
                  </span>
                </label>
              </div>
            </div>
          )}
        </form>

        {/* Active chips */}
        {hasActiveFilters && (
          <div className="px-4 pb-4 flex flex-wrap gap-2 items-center">
            {activeChips.map(({ key, value, label }) => (
              <Link
                key={`${key}-${value}`}
                href={buildUrlWithout(searchParams, key, value, basePath)}
                className="inline-flex items-center gap-1.5 bg-blue-50 text-talentia-blue text-xs font-bold px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
              >
                {label}
                <X size={11} />
              </Link>
            ))}
            <Link
              href={basePath}
              className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
            >
              Limpiar filtros
            </Link>
          </div>
        )}
      </div>

      {/* ── Results count ── */}
      <p className="text-sm font-bold text-gray-400">
        {initialEducators.length}{" "}
        {initialEducators.length === 1 ? "docente encontrado" : "docentes encontrados"}
      </p>

      {/* ── Cards grid ── */}
      {initialEducators.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {initialEducators.map((educator) => (
            <div
              key={educator.id}
              className={`rounded-2xl transition-all ${
                selectedId === educator.id ? "ring-2 ring-[#1B4FD8] shadow-md" : ""
              }`}
            >
              <EducatorCard
                educator={educator}
                institutionId={institutionId}
                isFavorite={favorites.includes(educator.id)}
                canContact={canContact}
                compact
                onCardClick={() => openEducator(educator.id)}
                onContactClick={canContact ? handleDirectContact : undefined}
                onFavoriteClick={institutionId ? (e, id) => handleToggleFavorite(e, id) : undefined}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center text-center">
          <div className="bg-gray-50 p-6 rounded-full text-gray-200 mb-6">
            <Search size={48} />
          </div>
          <h3 className="text-xl font-bold text-navy mb-2">No se han encontrado docentes</h3>
          <p className="text-gray-500 max-w-xs mx-auto font-medium">Prueba a ajustar los filtros de búsqueda.</p>
        </div>
      )}

      {/* ── Detail drawer ── */}
      <Sheet open={!!selectedId} onOpenChange={(open) => { if (!open) closeDrawer(); }}>
        <SheetContent side="right" className="sm:max-w-[480px] w-full p-0 flex flex-col overflow-hidden">
          {selectedEducator && (
            <>
              {/* Track view when drawer opens */}
              <ProfileViewTracker facultyId={selectedEducator.id} />
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex gap-4 items-start flex-shrink-0 pr-14">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                  {selectedEducator.avatar_url ? (
                    <Image
                      src={selectedEducator.avatar_url}
                      alt={selectedEducator.full_name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-talentia-blue/10 flex items-center justify-center">
                      <span className="text-xl font-black text-talentia-blue">
                        {selectedEducator.full_name?.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-navy leading-tight">{selectedEducator.full_name}</h3>
                    {selectedEducator.verified && selectedEducator.verified !== "none" && (
                      <Badge className="bg-blue-50 text-talentia-blue border-none text-[10px] font-black uppercase tracking-widest flex items-center gap-1 flex-shrink-0">
                        <CheckCircle2 size={10} /> Verificado
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-500 mt-0.5 line-clamp-2">
                    {selectedEducator.headline}
                  </p>
                </div>
              </div>

              {/* Scrollable body */}
              {isReadOnly && !isAlreadyInstitution ? (
                /* ── Restricted preview for faculty browsing ── */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
                    <Lock size={36} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-black text-navy mb-2">
                    Perfiles bloqueados
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto mb-8">
                    Si quieres acceder a los datos de los perfiles del directorio debes registrarte como recruiter o institución.
                  </p>
                  <Link
                    href="/signup/institution"
                    className="inline-flex items-center justify-center gap-2 bg-[#1B4FD8] hover:bg-[#0D2240] text-white font-bold h-12 px-8 rounded-xl transition-colors text-sm w-full max-w-xs"
                  >
                    <Building2 size={16} />
                    Registrarme como institución
                  </Link>
                  <p className="text-xs text-gray-400 mt-4">
                    ¿Ya tienes cuenta?{" "}
                    <Link href="/login" className="text-talentia-blue font-bold hover:underline">
                      Inicia sesión
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 space-y-6">
                  {/* Actions */}
                  <div className="space-y-2">
                    <div className="flex gap-3">
                      {isReadOnly ? (
                        isAlreadyInstitution ? (
                          <form action={switchActiveMode} className="flex-1">
                            <input type="hidden" name="mode" value="institution" />
                            <button
                              type="submit"
                              className="w-full inline-flex items-center justify-center gap-2 bg-[#EEF4FF] hover:bg-blue-100 text-[#1B4FD8] font-bold h-11 rounded-xl transition-colors text-sm"
                            >
                              <Zap size={15} /> Cambiar a modo institución
                            </button>
                          </form>
                        ) : (
                          <Link
                            href="/app/become-institution"
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#EEF4FF] hover:bg-blue-100 text-[#1B4FD8] font-bold h-11 rounded-xl transition-colors text-sm"
                          >
                            <Lock size={15} /> Registrar institución para contactar
                          </Link>
                        )
                      ) : canContact ? (
                        <Button
                          onClick={() => setIsContactModalOpen(true)}
                          className="flex-1 bg-energy-orange hover:bg-orange-600 text-white font-bold h-11 rounded-xl shadow-lg shadow-orange-100"
                        >
                          <Mail size={16} className="mr-2" /> Enviar propuesta
                        </Button>
                      ) : (
                        <Link
                          href="/app/institution/billing"
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold h-11 rounded-xl transition-colors text-sm"
                        >
                          <Lock size={15} /> Actualiza a Pro para más contactos
                        </Link>
                      )}
                      {!isReadOnly && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => handleToggleFavorite(e, selectedEducator.id)}
                          className={`h-11 w-11 rounded-xl flex-shrink-0 transition-all ${
                            favorites.includes(selectedEducator.id)
                              ? "text-energy-orange bg-orange-50 border-orange-100"
                              : "text-gray-400 border-gray-200 hover:text-energy-orange hover:bg-orange-50"
                          }`}
                        >
                          <Star
                            size={18}
                            className={favorites.includes(selectedEducator.id) ? "fill-current" : ""}
                          />
                        </Button>
                      )}
                    </div>
                    {!isReadOnly && !isPro && usedContacts < FREE_CONTACTS_LIMIT && (
                      <p className="text-xs text-gray-400 text-center">
                        {usedContacts} de {FREE_CONTACTS_LIMIT} contactos gratuitos usados este mes
                      </p>
                    )}
                    {!isReadOnly && !isPro && usedContacts >= FREE_CONTACTS_LIMIT && (
                      <p className="text-xs text-amber-500 text-center font-medium">
                        Límite mensual alcanzado · <Link href="/app/institution/billing" className="underline">Actualiza a Pro</Link>
                      </p>
                    )}
                  </div>

                  {/* Basic info */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Información básica
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                        <MapPin size={15} className="text-talentia-blue flex-shrink-0" />
                        <span className="truncate">
                          {selectedEducator.country || selectedEducator.location || "España"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                        <Globe size={15} className="text-talentia-blue flex-shrink-0" />
                        <span className="truncate">
                          {(Array.isArray(selectedEducator.languages) ? selectedEducator.languages : [])
                            .map((l: any) => (typeof l === "string" ? l : l.lang ?? l.language ?? ""))
                            .filter(Boolean)
                            .join(", ") || "Español"}
                        </span>
                      </div>
                      {selectedEducator.aneca_accreditation && (
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                          <Award size={15} className="text-talentia-blue flex-shrink-0" />
                          <span className="truncate">{selectedEducator.aneca_accreditation}</span>
                        </div>
                      )}
                      {selectedEducator.experience_years > 0 && (
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                          <Briefcase size={15} className="text-talentia-blue flex-shrink-0" />
                          {selectedEducator.experience_years}+ años exp.
                        </div>
                      )}
                      {selectedEducator.current_institution && (
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                          <Building2 size={15} className="text-talentia-blue flex-shrink-0" />
                          <span className="truncate">{selectedEducator.current_institution}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {selectedEducator.bio && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Biografía</h4>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {selectedEducator.bio}
                      </p>
                    </div>
                  )}

                  {/* Specialties */}
                  {(selectedEducator.expertise?.length > 0 || selectedEducator.faculty_areas?.length > 0) && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Especialidades
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEducator.expertise?.length > 0
                          ? selectedEducator.expertise.map((exp: any) => {
                              if (!exp) return null;
                              const areaLabel = typeof exp.area === "string" ? exp.area : "";
                              const subareaLabel = typeof exp.subarea === "string"
                                ? exp.subarea
                                : (exp.level ?? "");
                              const label = [areaLabel, subareaLabel].filter(Boolean).join(": ");
                              return label ? (
                                <Badge
                                  key={exp.id ?? label}
                                  className="bg-gray-50 text-gray-600 border-none px-3 py-1.5 rounded-xl text-xs font-bold"
                                >
                                  {label}
                                </Badge>
                              ) : null;
                            })
                          : selectedEducator.faculty_areas?.slice(0, 6).map((area: any) => {
                              const label =
                                typeof area === "string" ? area : (area?.name ?? "");
                              return label ? (
                                <Badge
                                  key={label}
                                  className="bg-gray-50 text-gray-600 border-none px-3 py-1.5 rounded-xl text-xs font-bold"
                                >
                                  {label}
                                </Badge>
                              ) : null;
                            })}
                      </div>
                    </div>
                  )}

                  {/* Degrees (up to 3) */}
                  {Array.isArray(selectedEducator.degrees) && selectedEducator.degrees.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Formación</h4>
                      <div className="space-y-2">
                        {selectedEducator.degrees.slice(0, 3).map((deg: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="p-1.5 bg-white rounded-lg text-purple-600 border border-gray-100">
                              <GraduationCap size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-navy truncate">
                                {deg.type || deg.title || deg.degree || "Titulación"}
                              </p>
                              {deg.field && (
                                <p className="text-[11px] font-medium text-talentia-blue truncate">{deg.field}</p>
                              )}
                              {deg.university && (
                                <p className="text-[10px] text-gray-400 truncate">{deg.university}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        {selectedEducator.degrees.length > 3 && (
                          <p className="text-xs text-gray-400 font-medium text-center">
                            +{selectedEducator.degrees.length - 3} más
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Website/LinkedIn */}
                  {(selectedEducator.website || selectedEducator.linkedin_url) && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Enlaces</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEducator.website && (
                          <a
                            href={selectedEducator.website}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-talentia-blue bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors"
                          >
                            <Globe size={12} />
                            Web
                            <ExternalLink size={10} />
                          </a>
                        )}
                        {selectedEducator.linkedin_url && (
                          <a
                            href={selectedEducator.linkedin_url}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A66C2] bg-[#E8F4FD] px-3 py-1.5 rounded-xl hover:bg-[#D0E8F7] transition-colors"
                          >
                            LinkedIn
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Documents ── */}
                  {(loadingDocs || facultyDocs.length > 0) && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Documentos</h4>
                      {loadingDocs ? (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-5 h-5 rounded-full border-2 border-talentia-blue border-t-transparent animate-spin" />
                          <span className="text-xs text-gray-400 font-medium">Cargando...</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {facultyDocs.map((doc: any) => (
                            <a
                              key={doc.id}
                              href={getDocumentUrl(doc.file_path)}
                              target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50/50 hover:border-blue-200 transition-all group border border-transparent"
                            >
                              <div className="p-1.5 bg-white rounded-lg text-slate-400 border border-gray-100 group-hover:text-talentia-blue">
                                <FileText size={14} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-navy truncate">{doc.name || doc.file_name || "Documento"}</p>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase">{doc.doc_type || "PDF"}</p>
                              </div>
                              <ExternalLink size={12} className="text-slate-300 group-hover:text-talentia-blue" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Contact info (Pro only) ── */}
                  {isPro && (selectedEducator.contact_email || selectedEducator.contact_whatsapp || selectedEducator.phone || selectedEducator.contact_linkedin) && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contacto directo</h4>
                      <div className="space-y-2">
                        {selectedEducator.contact_email && (
                          <a href={`mailto:${selectedEducator.contact_email}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50/50 transition-all group">
                            <div className="p-1.5 bg-white rounded-lg text-slate-400 border border-gray-100 group-hover:text-talentia-blue">
                              <AtSign size={14} />
                            </div>
                            <span className="text-xs font-semibold text-navy truncate flex-1">{selectedEducator.contact_email}</span>
                          </a>
                        )}
                        {selectedEducator.contact_whatsapp && (
                          <a href={`https://wa.me/${selectedEducator.contact_whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-green-50/50 transition-all group">
                            <div className="p-1.5 bg-white rounded-lg text-slate-400 border border-gray-100 group-hover:text-green-600">
                              <MessageCircle size={14} />
                            </div>
                            <span className="text-xs font-semibold text-navy truncate flex-1">{selectedEducator.contact_whatsapp}</span>
                          </a>
                        )}
                        {selectedEducator.phone && (
                          <a href={`tel:${selectedEducator.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50/50 transition-all group">
                            <div className="p-1.5 bg-white rounded-lg text-slate-400 border border-gray-100 group-hover:text-talentia-blue">
                              <Phone size={14} />
                            </div>
                            <span className="text-xs font-semibold text-navy truncate flex-1">{selectedEducator.phone}</span>
                          </a>
                        )}
                        {selectedEducator.contact_linkedin && (
                          <a href={selectedEducator.contact_linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50/50 transition-all group">
                            <div className="p-1.5 bg-white rounded-lg text-slate-400 border border-gray-100 group-hover:text-[#0A66C2]">
                              <ExternalLink size={14} />
                            </div>
                            <span className="text-xs font-semibold text-navy truncate flex-1">LinkedIn</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* View count — engagement signal */}
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                    <Eye size={15} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-500">
                      {selectedEducator.view_count ?? 0} {(selectedEducator.view_count ?? 0) === 1 ? "visita" : "visitas"} al perfil
                    </span>
                  </div>
                </div>
              </div>
              )}

              {/* Footer — hidden for restricted preview */}
              {!(isReadOnly && !isAlreadyInstitution) && (
              <div className="p-5 border-t border-gray-100 flex-shrink-0 bg-gray-50/50 flex items-center justify-between">
                <Link
                  href={`/app/faculty/${selectedEducator.id}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-talentia-blue hover:text-navy transition-colors"
                  onClick={closeDrawer}
                >
                  <ExternalLink size={14} />
                  Ver perfil completo
                </Link>
              </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Contact modal (from drawer) */}
      {selectedEducator && canContact && (
        <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          facultyId={selectedEducator.id}
          facultyName={selectedEducator.full_name}
          institutionId={institutionId}
          onSuccess={() => setUsedContacts((n) => n + 1)}
        />
      )}

      {/* Contact modal (from card "Contactar" button — no drawer) */}
      {directContactEducator && canContact && (
        <ContactModal
          isOpen={!!directContactEducator}
          onClose={handleCloseDirectContact}
          facultyId={directContactEducator.id}
          facultyName={directContactEducator.full_name}
          institutionId={institutionId}
          onSuccess={() => { setUsedContacts((n) => n + 1); handleCloseDirectContact(); }}
        />
      )}
    </div>
  );
}
