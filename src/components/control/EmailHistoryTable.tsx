"use client";

import { useState } from "react";
import { Mail, RefreshCw, Loader2 } from "lucide-react";

interface EmailLog {
  id: string;
  recipient_id?: string | null;
  recipient_email: string;
  template: string;
  subject: string;
  sent_at: string;
  metadata?: { admin_id?: string } | null;
}

interface Props {
  logs: EmailLog[];
  onResend?: (log: EmailLog) => Promise<void>;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const TEMPLATE_LABELS: Record<string, string> = {
  approval: "Aprobación",
  rejection: "Rechazo",
  requires_info: "Info requerida",
  profile_reminder: "Recordatorio perfil",
  broadcast: "Broadcast",
  upload_avatar: "Subir foto",
  complete_profile: "Completar perfil",
  upload_documents: "Subir documentos",
  upload_banner: "Añadir portada",
  admin_message: "Mensaje admin",
};

export function EmailHistoryTable({ logs, onResend }: Props) {
  const [filterTemplate, setFilterTemplate] = useState<string>("all");
  const [resending, setResending] = useState<string | null>(null);

  const templates = [...new Set(logs.map((l) => l.template))];

  const filtered = filterTemplate === "all"
    ? logs
    : logs.filter((l) => l.template === filterTemplate);

  async function handleResend(log: EmailLog) {
    if (!onResend) return;
    setResending(log.id);
    try {
      await onResend(log);
    } finally {
      setResending(null);
    }
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Mail size={20} className="text-gray-400" />
        </div>
        <p className="font-bold text-navy text-sm">No hay emails enviados</p>
        <p className="text-gray-400 text-xs mt-1">Los emails enviados desde el panel aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Template filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFilterTemplate("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            filterTemplate === "all" ? "bg-navy text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Todos
        </button>
        {templates.map((t) => (
          <button
            key={t}
            onClick={() => setFilterTemplate(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterTemplate === t ? "bg-navy text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {TEMPLATE_LABELS[t] || t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
              <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plantilla</th>
              <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Destinatario</th>
              <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asunto</th>
              {onResend && (
                <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Acción</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">{fmtDate(log.sent_at)}</td>
                <td className="px-5 py-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-talentia-blue">
                    {TEMPLATE_LABELS[log.template] || log.template}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-gray-700 font-semibold">{log.recipient_email}</td>
                <td className="px-5 py-3 text-sm text-navy font-semibold max-w-[300px] truncate">{log.subject}</td>
                {onResend && (
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => handleResend(log)}
                      disabled={resending === log.id}
                      className="inline-flex items-center gap-1 text-xs font-black text-talentia-blue hover:underline disabled:opacity-50"
                    >
                      {resending === log.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <RefreshCw size={12} />
                      )}
                      Reenviar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}