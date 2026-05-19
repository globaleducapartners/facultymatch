"use client";

import { useState } from "react";
import { Archive, Building2, MapPin, Clock, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReplyDialog } from "./ReplyDialog";
import { updateStatus } from "./actions";

const SUBJECT_LABELS: Record<string, string> = {
  profesor_adjunto: "Profesor Adjunto / Invitado",
  conferenciante: "Conferenciante",
  tutor_tfm: "Tutor de TFM / Tesis",
  diseno_curricular: "Diseño Curricular",
  otro: "Otro",
};

const CONTRACT_LABELS: Record<string, string> = {
  docencia_plena: "Docencia plena",
  docencia_semiplena: "Docencia semiplena",
  por_creditos: "Por créditos",
  asignatura_invitada: "Asignatura invitada",
};

const MODALITY_LABELS: Record<string, string> = {
  online: "Online",
  presencial: "Presencial",
  hibrida: "Híbrida",
};

interface ContactRequest {
  id: string;
  message: string;
  subject: string | null;
  modality: string | null;
  dates: string | null;
  contract_type: string | null;
  status: string;
  created_at: string;
  institution: { name: string; country: string };
}

interface Props {
  pendingRequests: ContactRequest[];
  repliedRequests: ContactRequest[];
  archivedRequests: ContactRequest[];
}

function RequestCard({ req, showReply = false }: { req: ContactRequest; showReply?: boolean }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);

  return (
    <div className="p-5 sm:p-6 hover:bg-gray-50/50 transition-colors group">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="bg-gray-100 p-3 rounded-2xl group-hover:bg-white transition-colors flex-shrink-0">
            <Building2 size={22} className="text-gray-400" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-bold text-navy">{req.institution?.name}</h4>
              {req.subject && (
                <Badge variant="secondary" className="bg-blue-50 text-talentia-blue font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 border-blue-100">
                  {SUBJECT_LABELS[req.subject] ?? req.subject}
                </Badge>
              )}
              {req.contract_type && (
                <Badge variant="secondary" className="bg-purple-50 text-purple-600 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 border-purple-100">
                  {CONTRACT_LABELS[req.contract_type] ?? req.contract_type}
                </Badge>
              )}
            </div>
            {req.message && (
              <p className="text-sm font-medium text-gray-600 line-clamp-2">{req.message}</p>
            )}
            <div className="flex items-center gap-3 pt-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest flex-wrap">
              {req.institution?.country && (
                <span className="flex items-center gap-1"><MapPin size={10} /> {req.institution.country}</span>
              )}
              {req.modality && (
                <span className="flex items-center gap-1"><Clock size={10} /> {MODALITY_LABELS[req.modality] ?? req.modality}</span>
              )}
              {req.dates && (
                <span className="flex items-center gap-1"><Clock size={10} /> {req.dates}</span>
              )}
              <span className="flex items-center gap-1"><Clock size={10} /> {new Date(req.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
            </div>
          </div>
        </div>
        {showReply && (
          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-start">
            <Button
              onClick={() => setReplyOpen(true)}
              className="bg-talentia-blue hover:bg-blue-700 text-white font-bold rounded-xl h-10 px-5 text-sm"
            >
              Responder
            </Button>
            <Button
              variant="ghost"
              disabled={archiving}
              onClick={async () => {
                setArchiving(true);
                await updateStatus(req.id, 'archived');
              }}
              className="rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 h-10 w-10"
            >
              <Archive size={16} />
            </Button>
          </div>
        )}
        {!showReply && (
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 uppercase text-[9px] font-black tracking-widest px-3 py-1 flex-shrink-0">
            Respondida
          </Badge>
        )}
      </div>
      <ReplyDialog
        contactId={req.id}
        institutionName={req.institution?.name}
        isOpen={replyOpen}
        onClose={() => setReplyOpen(false)}
        onSuccess={() => { window.location.reload(); }}
      />
    </div>
  );
}

export function RequestsClient({ pendingRequests, repliedRequests, archivedRequests }: Props) {
  return (
    <div className="space-y-6">
      {/* Pending */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
          <Mail size={13} /> Pendientes ({pendingRequests.length})
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          {pendingRequests.length > 0 ? (
            pendingRequests.map(req => <RequestCard key={req.id} req={req} showReply />)
          ) : (
            <div className="py-16 text-center space-y-3">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Mail size={28} className="text-gray-200" />
              </div>
              <p className="text-navy font-bold text-sm">Bandeja vacía</p>
              <p className="text-gray-400 text-xs font-medium">No has recibido ninguna solicitud nueva.</p>
            </div>
          )}
        </div>
      </section>

      {/* Replied */}
      {repliedRequests.length > 0 && (
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
            <CheckCircle2 size={13} /> Respondidas ({repliedRequests.length})
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50 opacity-80">
            {repliedRequests.map(req => <RequestCard key={req.id} req={req} />)}
          </div>
        </section>
      )}

      {/* Archived */}
      {archivedRequests.length > 0 && (
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
            <Archive size={13} /> Archivadas ({archivedRequests.length})
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50 opacity-50">
            {archivedRequests.map(req => (
              <div key={req.id} className="p-5 sm:p-6 flex items-start gap-4">
                <div className="bg-gray-100 p-3 rounded-2xl flex-shrink-0"><Archive size={20} className="text-gray-300" /></div>
                <div>
                  <h4 className="text-sm font-bold text-navy">{req.institution?.name}</h4>
                  <p className="text-xs text-gray-400 mt-1">Archivada el {new Date(req.created_at).toLocaleDateString('es-ES')}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
