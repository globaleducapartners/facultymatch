"use client";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function ApproveButtons({ institutionId }: { institutionId: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handle(action: "approve" | "reject") {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch("/api/admin/approve-institution", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institutionId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        router.refresh();
      } else {
        setError(data.error || "Error desconocido");
      }
    } catch (e) {
      setError("Error de red");
    }
    setLoading(null);
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
          onClick={() => handle("reject")}
          disabled={!!loading}
          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <XCircle size={13} />
          {loading === "reject" ? "Rechazando..." : "Rechazar"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
