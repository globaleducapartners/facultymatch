"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Sparkles, CheckCircle2, Circle, ArrowRight, UserCircle2, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  institutionName: string;
  institutionId: string;
  hasDescription: boolean;
  hasFavorites: boolean;
  hasContacts: boolean;
  storageKey: string;
}

export function InstitutionWelcomeBanner({
  institutionName,
  hasDescription,
  hasFavorites,
  hasContacts,
  storageKey,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey);
    if (!dismissed) setVisible(true);
  }, [storageKey]);

  const dismiss = () => {
    localStorage.setItem(storageKey, "1");
    setVisible(false);
  };

  if (!visible) return null;

  const steps = [
    {
      icon: UserCircle2,
      title: "Completa tu perfil institucional",
      desc: "Añade descripción, logo y datos de contacto",
      done: hasDescription,
      href: "/app/institution/profile",
    },
    {
      icon: Search,
      title: "Busca tu primer docente",
      desc: "Filtra por área, idioma o modalidad",
      done: hasFavorites,
      href: "/app/institution",
    },
    {
      icon: Send,
      title: "Envía una propuesta",
      desc: "Contacta directamente con el profesorado",
      done: hasContacts,
      href: "/app/institution",
    },
  ];

  const completedCount = steps.filter(s => s.done).length;
  const allDone = completedCount === steps.length;

  if (allDone) return null;

  return (
    <div className="bg-gradient-to-br from-navy to-blue-800 rounded-2xl p-6 text-white relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500 mb-6">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-energy-orange/10 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      {/* Dismiss */}
      <button
        onClick={dismiss}
        className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors p-1 rounded-lg hover:bg-white/10"
        aria-label="Cerrar"
      >
        <X size={16} />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-energy-orange/20 flex items-center justify-center flex-shrink-0">
          <Sparkles size={20} className="text-energy-orange" />
        </div>
        <div>
          <h2 className="text-lg font-black leading-tight">
            ¡Bienvenido a FacultyMatch{institutionName ? `, ${institutionName}` : ""}!
          </h2>
          <p className="text-white/60 text-sm font-medium mt-0.5">
            Completa estos pasos para empezar a encontrar el profesorado ideal.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        {steps.map(({ icon: Icon, title, desc, done, href }) => (
          <Link
            key={title}
            href={done ? "#" : href}
            onClick={done ? (e) => e.preventDefault() : undefined}
            className={`group flex items-start gap-3 p-4 rounded-xl transition-all ${
              done
                ? "bg-white/5 cursor-default"
                : "bg-white/10 hover:bg-white/15 cursor-pointer"
            }`}
          >
            <div className={`mt-0.5 flex-shrink-0 ${done ? "text-green-400" : "text-white/40 group-hover:text-white/70"}`}>
              {done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold leading-tight ${done ? "text-white/50 line-through" : "text-white"}`}>
                {title}
              </p>
              <p className="text-xs text-white/40 font-medium mt-0.5 line-clamp-1">{desc}</p>
            </div>
            {!done && (
              <ArrowRight size={14} className="text-white/30 group-hover:text-white/60 flex-shrink-0 mt-1 transition-all group-hover:translate-x-0.5" />
            )}
          </Link>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-energy-orange rounded-full transition-all duration-700"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-black text-white/50 whitespace-nowrap">
          {completedCount}/{steps.length} completados
        </span>
        <Button
          size="sm"
          onClick={dismiss}
          variant="ghost"
          className="text-white/40 hover:text-white/70 text-xs font-bold h-7 px-3 hover:bg-white/10 rounded-lg"
        >
          No mostrar más
        </Button>
      </div>
    </div>
  );
}
