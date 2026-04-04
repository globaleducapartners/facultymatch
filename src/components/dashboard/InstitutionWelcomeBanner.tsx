"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Sparkles, CheckCircle2, Circle, ArrowRight, UserCircle2, Search, Send } from "lucide-react";

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
      title: "Completa tu perfil",
      done: hasDescription,
      href: "/app/institution/profile",
    },
    {
      icon: Search,
      title: "Busca un docente",
      done: hasFavorites,
      href: "/app/institution",
    },
    {
      icon: Send,
      title: "Envía una propuesta",
      done: hasContacts,
      href: "/app/institution",
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;

  if (allDone) return null;

  return (
    <div className="bg-gradient-to-r from-navy to-blue-800 rounded-2xl px-5 py-4 text-white relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500 mb-4">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />

      {/* Dismiss */}
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-white/40 hover:text-white/80 transition-colors p-1 rounded-lg hover:bg-white/10"
        aria-label="Cerrar"
      >
        <X size={14} />
      </button>

      {/* Content row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pr-6">
        {/* Title */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-energy-orange/20 flex items-center justify-center">
            <Sparkles size={16} className="text-energy-orange" />
          </div>
          <div>
            <p className="text-sm font-black leading-tight">
              ¡Bienvenido{institutionName ? `, ${institutionName}` : ""}!
            </p>
            <p className="text-white/50 text-xs font-medium">
              {completedCount}/{steps.length} pasos completados
            </p>
          </div>
        </div>

        {/* Progress bar (mobile) */}
        <div className="sm:hidden h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-energy-orange rounded-full transition-all duration-700"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="flex flex-1 gap-2 flex-wrap sm:flex-nowrap">
          {steps.map(({ icon: Icon, title, done, href }) => (
            <Link
              key={title}
              href={done ? "#" : href}
              onClick={done ? (e) => e.preventDefault() : undefined}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-1 min-w-0 ${
                done
                  ? "bg-white/5 cursor-default opacity-60"
                  : "bg-white/10 hover:bg-white/15 cursor-pointer"
              }`}
            >
              <span className={`flex-shrink-0 ${done ? "text-green-400" : "text-white/40 group-hover:text-white/70"}`}>
                {done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
              </span>
              <span className={`truncate ${done ? "line-through text-white/40" : "text-white"}`}>{title}</span>
              {!done && (
                <ArrowRight
                  size={12}
                  className="text-white/30 group-hover:text-white/60 flex-shrink-0 ml-auto transition-transform group-hover:translate-x-0.5"
                />
              )}
            </Link>
          ))}
        </div>

        {/* Progress bar (desktop) */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-energy-orange rounded-full transition-all duration-700"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
          <button
            onClick={dismiss}
            className="text-white/30 hover:text-white/60 text-xs font-bold transition-colors whitespace-nowrap hover:bg-white/10 px-2 py-1 rounded-lg"
          >
            No mostrar
          </button>
        </div>
      </div>
    </div>
  );
}
