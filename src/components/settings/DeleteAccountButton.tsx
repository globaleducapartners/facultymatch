"use client";

import { useState } from "react";
import { Trash2, Loader2, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  role: "faculty" | "institution";
}

export function DeleteAccountButton({ role }: Props) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (confirm !== "ELIMINAR") return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al eliminar la cuenta.");
        setLoading(false);
        return;
      }
      window.location.href = "/?account_deleted=1";
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl h-10 px-6 text-sm flex items-center gap-2"
      >
        <Trash2 size={15} /> Eliminar mi cuenta
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => { setOpen(false); setConfirm(""); setError(null); }} />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle size={20} />
                  <h3 className="text-lg font-black">Eliminar cuenta</h3>
                </div>
                <button onClick={() => { setOpen(false); setConfirm(""); setError(null); }} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-gray-600 font-medium mb-4 leading-relaxed">
                Esta acción es <strong className="text-red-600">permanente e irreversible</strong>.
                Se eliminarán todos tus datos, perfil y registros asociados.
              </p>
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                Escribe ELIMINAR para confirmar
              </p>
              <input
                type="text"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="ELIMINAR"
                className="w-full px-4 py-3 rounded-xl border border-red-200 bg-red-50/50 focus:ring-2 focus:ring-red-400 outline-none font-bold text-navy mb-4 text-sm"
              />
              {error && (
                <p className="text-xs text-red-600 font-bold mb-3">{error}</p>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => { setOpen(false); setConfirm(""); setError(null); }}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={confirm !== "ELIMINAR" || loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl"
                >
                  {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                  Eliminar definitivamente
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
