"use client";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function ApproveButtons({ institutionId }: { institutionId: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReasonBox, setShowReasonBox] = useState(false);
  const [reason, setReason] = useState("");
  const router = useRouter();

  async function handle(action: "approve" | "reject", reasonText?: string) {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch("/api/admin/approve-institution", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institutionId, action, reason: reasonText }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowReasonBox(false);
        setReason("");
        router.refresh();
      } else {
        setError(data.error || "Error desconocido");
      }
    } catch (e) {
      setError("Error de red");
    }
    setLoading(null);
  }

  if (showReasonBox) {
    return (
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <textarea
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo del rechazo (se lo mandamos por correo)…"
          rows={2}
          className="text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => handle("reject", reason)}
            disabled={!reason.trim() || !!loading}
            className="flex-1 text-xs font-bold px-3 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading === "reject" ? "Rechazando..." : "Confirmar rechazo"}
          </button>
          <button
            onClick={() => { setShowReasonBox(false); setReason(""); setError(null); }}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
        </div>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => handle("approve")}
          disabled={!!loading}
          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <CheckCircle2 size={13} />
          {loading === "approve" ? "Aprobando..." : "Aprobar"}
        </button>
        <button
          onClick={() => setShowReasonBox(true)}
          disabled={!!loading}
          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <XCircle size={13} />
          Rechazar
        </button>
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
