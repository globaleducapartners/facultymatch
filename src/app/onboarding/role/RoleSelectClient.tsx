"use client";

import { useState } from "react";
import { GraduationCap, Building2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { assignRole } from "@/app/auth/actions";

type Role = "faculty" | "institution";

export default function RoleSelectClient({ userId }: { userId: string }) {
  const [selected, setSelected] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    if (!selected) return;
    setLoading(true);
    setError(null);

    const result = await assignRole(selected);

    if (result?.error) {
      setError("No se pudo guardar tu rol. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    // Hard navigation so middleware picks up the new role from a fresh request
    const destination = selected === "faculty" ? "/onboarding" : "/app/institution";
    window.location.href = destination;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-10">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo />
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-navy tracking-tight">
            ¿Cómo vas a usar FacultyMatch?
          </h1>
          <p className="text-gray-500 font-medium">
            Selecciona tu rol para personalizar tu experiencia.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setSelected("faculty")}
            className={cn(
              "group relative p-6 rounded-3xl border-2 text-left transition-all focus:outline-none",
              selected === "faculty"
                ? "border-talentia-blue bg-blue-50 shadow-lg shadow-blue-100"
                : "border-gray-200 bg-white hover:border-talentia-blue/40 hover:shadow-md"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors",
              selected === "faculty" ? "bg-talentia-blue" : "bg-gray-100 group-hover:bg-blue-100"
            )}>
              <GraduationCap size={24} className={selected === "faculty" ? "text-white" : "text-gray-500 group-hover:text-talentia-blue"} />
            </div>
            <h3 className="font-black text-navy text-lg leading-tight">Soy Docente</h3>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Crea tu perfil académico y recibe oportunidades de instituciones.
            </p>
            {selected === "faculty" && (
              <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-talentia-blue flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            )}
          </button>

          <button
            onClick={() => setSelected("institution")}
            className={cn(
              "group relative p-6 rounded-3xl border-2 text-left transition-all focus:outline-none",
              selected === "institution"
                ? "border-talentia-blue bg-blue-50 shadow-lg shadow-blue-100"
                : "border-gray-200 bg-white hover:border-talentia-blue/40 hover:shadow-md"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors",
              selected === "institution" ? "bg-talentia-blue" : "bg-gray-100 group-hover:bg-blue-100"
            )}>
              <Building2 size={24} className={selected === "institution" ? "text-white" : "text-gray-500 group-hover:text-talentia-blue"} />
            </div>
            <h3 className="font-black text-navy text-lg leading-tight">Soy Institución</h3>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Busca y conecta con docentes calificados para tu institución.
            </p>
            {selected === "institution" && (
              <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-talentia-blue flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-center text-sm text-red-600 font-medium">{error}</p>
        )}

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="w-full h-14 bg-talentia-blue hover:bg-navy text-white font-black rounded-2xl text-base shadow-lg shadow-blue-100 transition-all disabled:opacity-40"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              Continuar
              <ArrowRight size={20} />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
