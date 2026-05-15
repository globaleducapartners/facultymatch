"use client";

import { Trash2 } from "lucide-react";

interface InstitutionActionsProps {
  inst: {
    id: string;
    name: string | null;
    status: string | null;
  };
  toggleAction: (fd: FormData) => Promise<void>;
  deleteAction: (fd: FormData) => Promise<void>;
}

export function InstitutionActions({ inst, toggleAction, deleteAction }: InstitutionActionsProps) {
  return (
    <>
      <form action={toggleAction}>
        <input type="hidden" name="id" value={inst.id} />
        <input type="hidden" name="currentStatus" value={inst.status || "active"} />
        <button
          type="submit"
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
            inst.status === "blocked"
              ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-100"
              : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
          }`}
        >
          {inst.status === "blocked" ? "Reactivar" : "Bloquear"}
        </button>
      </form>
      <form
        action={deleteAction}
        onSubmit={(e) => {
          if (!confirm(`¿Eliminar permanentemente "${inst.name}"? Esta acción no se puede deshacer.`)) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={inst.id} />
        <button
          type="submit"
          className="text-xs font-bold p-2 rounded-xl transition-colors bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 border border-gray-100"
          title="Eliminar institución (duplicada o inválida)"
        >
          <Trash2 size={14} />
        </button>
      </form>
    </>
  );
}
