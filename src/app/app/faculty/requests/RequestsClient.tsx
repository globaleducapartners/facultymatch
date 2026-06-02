"use client";

import { useState } from "react";
import { Archive, Clock, CheckCircle2, Mail, ChevronDown, ChevronUp, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReplyDialog } from "./ReplyDialog";
import { updateStatus } from "./actions";
import { replyToContact } from "@/app/auth/actions";

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
  replied_at: string | null;
  reply_message: string | null;
  institution: { name: string; country: string };
}

interface Props {
  pendingRequests: ContactRequest[];
  repliedRequests: ContactRequest[];
  archivedRequests: ContactRequest[];
}

function RequestCard({ req, isPending = false }: { req: ContactRequest; isPending?: boolean }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpMsg, setFollowUpMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sentOk, setSentOk] = useState(false);

  const instInitials = (req.institution?.name ?? "IN").substring(0, 2).toUpperCase();

  const handleFollowUp = async () => {
    if (!followUpMsg.trim()) return;
    setSending(true);
    await replyToContact(req.id, followUpMsg.trim());
    setSending(false);
    setSentOk(true);
    setShowFollowUp(false);
    setFollowUpMsg("");
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className={`bg-white rounded-2xl border shadow-sm transition-all ${isPending ? "border-blue-100 hover:border-blue-200" : "border-green-100"}`}>
      {/* Header */}
      <div className="flex items-center gap-4 p-5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="w-10 h-10 bg-navy/10 text-navy rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0">
          {instInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-bold text-navy truncate">{req.institution?.name}</h4>
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
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
            {new Date(req.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
            {req.institution?.country && ` · ${req.institution.country}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isPending ? (
            <>
              <Button
                onClick={(e) => { e.stopPropagation(); setReplyOpen(true); }}
                className="bg-talentia-blue hover:bg-blue-700 text-white font-bold rounded-xl h-9 px-4 text-xs"
              >
                <Send size={12} className="mr-1.5" /> Responder
              </Button>
              <Button
                variant="ghost"
                disabled={archiving}
                onClick={async (e) => { e.stopPropagation(); setArchiving(true); await updateStatus(req.id, "archived"); }}
                className="rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 h-9 w-9"
              >
                <Archive size={15} />
              </Button>
            </>
          ) : (
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 uppercase text-[9px] font-black tracking-widest px-3 py-1">
              <CheckCircle2 size={9} className="inline mr-1" /> Respondida
            </Badge>
          )}
          {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </div>

      {/* Conversation thread */}
      {expanded && (() => {
        interface ThreadMessage {
          sender: "institution" | "faculty";
          message: string;
          created_at: string;
        }

        const messages: ThreadMessage[] = [];
        messages.push({
          sender: "institution",
          message: req.message,
          created_at: req.created_at,
        });

        const rawFollowUps = (req as any).follow_ups;
        if (Array.isArray(rawFollowUps) && rawFollowUps.length > 0) {
          rawFollowUps.forEach((fu: any) => {
            messages.push({
              sender: fu.sender,
              message: fu.message,
              created_at: fu.created_at || req.created_at,
            });
          });
        } else if (req.reply_message) {
          messages.push({
            sender: "faculty",
            message: req.reply_message,
            created_at: req.replied_at || req.created_at,
          });
        }

        return (
          <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
            {messages.map((msg, index) => {
              const isInst = msg.sender === "institution";
              return (
                <div key={index} className={`flex flex-col ${isInst ? "items-start" : "items-end"} gap-1`}>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                    {isInst ? req.institution?.name : "Tu respuesta"} {msg.created_at ? `· ${new Date(msg.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}` : ""}
                  </p>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${isInst ? "bg-gray-100 text-navy rounded-tl-sm" : "bg-talentia-blue text-white rounded-tr-sm"}`}>
                    {/* Meta tags for first institution message */}
                    {isInst && index === 0 && (req.modality || req.dates) && (
                      <div className="flex flex-wrap gap-2 mb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {req.modality && <span className="flex items-center gap-1"><Clock size={9} /> {MODALITY_LABELS[req.modality] ?? req.modality}</span>}
                        {req.dates && <span className="flex items-center gap-1"><Clock size={9} /> {req.dates}</span>}
                      </div>
                    )}
                    <p className="text-sm font-medium leading-relaxed break-words">{msg.message}</p>
                  </div>
                </div>
              );
            })}

            {/* Success message */}
            {sentOk && (
              <div className="flex items-center gap-2 py-2 px-4 bg-green-50 rounded-xl text-xs font-bold text-green-700">
                <CheckCircle2 size={13} /> Mensaje enviado.
              </div>
            )}

            {/* Follow-up button for replied conversations */}
            {!isPending && !showFollowUp && !sentOk && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setShowFollowUp(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-talentia-blue hover:underline"
                >
                  <Send size={11} /> Enviar seguimiento
                </button>
              </div>
            )}

            {/* Follow-up compose */}
            {showFollowUp && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Mensaje de seguimiento</p>
                <textarea
                  value={followUpMsg}
                  onChange={e => setFollowUpMsg(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none text-sm font-medium resize-none"
                  placeholder="Escribe tu respuesta..."
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setShowFollowUp(false)} className="rounded-xl font-bold">
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    disabled={sending || !followUpMsg.trim()}
                    onClick={handleFollowUp}
                    className="bg-talentia-blue hover:bg-blue-700 text-white font-bold rounded-xl"
                  >
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <><Send size={12} className="mr-1.5" />Enviar</>}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

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
        <div className="space-y-3">
          {pendingRequests.length > 0 ? (
            pendingRequests.map(req => <RequestCard key={req.id} req={req} isPending />)
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center space-y-3">
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
          <div className="space-y-3">
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
          <div className="space-y-3 opacity-50">
            {archivedRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                <div className="bg-gray-100 p-2.5 rounded-xl flex-shrink-0"><Archive size={18} className="text-gray-300" /></div>
                <div>
                  <h4 className="text-sm font-bold text-navy">{req.institution?.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Archivada · {new Date(req.created_at).toLocaleDateString("es-ES")}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
