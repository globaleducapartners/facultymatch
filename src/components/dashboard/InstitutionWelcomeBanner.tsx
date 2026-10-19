"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

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
    { title: "Completa tu perfil", done: hasDescription, href: "/app/institution" },
    { title: "Busca un docente", done: hasFavorites, href: "/app/institution/search" },
    { title: "Envía una propuesta", done: hasContacts, href: "/app/institution/search" },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  if (completedCount === steps.length) return null;

  return (
    <div className="mb-4 rounded-xl border border-fm-border bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-bold tracking-[-0.02em] text-fm-ink">
            Bienvenido{institutionName ? `, ${institutionName}` : ""}
          </p>
          <p className="mt-0.5 text-sm text-[#5B6B85]">
            {completedCount} de {steps.length} pasos completados
          </p>
        </div>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-md p-1 text-[#5E6F8E] transition-colors hover:bg-fm-surface hover:text-fm-ink"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      </div>

      <ol className="mt-4 grid gap-3 sm:grid-cols-3">
        {steps.map(({ title, done, href }, i) => (
          <li key={title} className="flex items-baseline gap-3">
            <span className={`text-[1.6rem] font-extrabold leading-none tracking-[-0.04em] tabular-nums ${done ? "text-[#B9C6E0]" : "text-fm-blue"}`}>
              {i + 1}
            </span>
            {done ? (
              <span className="text-sm text-[#5E6F8E] line-through">{title}</span>
            ) : (
              <Link href={href} className="text-sm font-bold text-fm-ink hover:text-fm-blue hover:underline">
                {title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
