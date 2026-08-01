"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTZ, formatDateTimeTZ } from "@/lib/utils";
import {
  Mail, MapPin, Calendar, Clock, CheckCircle2, ChevronDown, ChevronUp,
  Send, MessageCircle, ExternalLink, Loader2
} from "lucide-react";
import Link from "next/link";
import { sendFollowUp } from "./actions";

interface Faculty {
  full_name: string;
  avatar_url: string | null;
  headline: string;
  contact_whatsapp: string | null;
}

interface Contact {
  id: string;
  faculty_id: string;
  message: string;
  subject: string | null;
  modality: string | null;
  dates: string | null;
  contract_type: string | null;
  status: string;
  created_at: string;
  reply_message: string | null;
  replied_at: string | null;
}

interface Props {
  contact: Contact;
  faculty: Faculty;
  institutionName: string;
  subjectLabel: string;
}

export function ContactThread({ contact, faculty, institutionName, subjectLabel }: Props) {
  const [expanded, setExpanded] = useState(contact.status === "replied" || contact.status === "sent" || contact.status === "pending");
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpMsg, setFollowUpMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);

  const isSent = contact.status === "sent" || contact.status === "pending";
  const isReplied = contact.status === "replied";
  const isArchived = contact.status === "archived";

  const initials = faculty.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  const handleFollowUp = async () => {
    if (!followUpMsg.trim()) return;
    setSending(true);
    setFollowUpError(null);
    const result = await sendFollowUp(contact.id, followUpMsg.trim());
    setSending(false);
    if (result?.error) {
      setFollowUpError(result.error);
      return;
    }
    setSent(true);
    setShowFollowUp(false);
    setFollowUpMsg("");
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <div className={`bg-white rounded-2xl border shadow-sm transition-all ${isArchived ? "opacity-60 border-gray-100" : isReplied ? "border-green-100" : "border-gray-100 hover:border-blue-100"}`}>
      {/* Header row */}
      <div
        className="flex items-center gap-4 p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Avatar */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-talentia-blue/10 text-talentia-blue flex items-center justify-center flex-shrink-0">
          {faculty.avatar_url ? (
            <Image src={faculty.avatar_url} alt={faculty.full_name} fill sizes="48px" className="object-cover" />
          ) : (
            <span className="text-sm font-black">{initials}</span>
          )}
        </div>

        {/* Name + headline */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-navy truncate">{faculty.full_name}</h3>
            {subjectLabel && (
              <Badge variant="secondary" className="bg-blue-50 text-talentia-blue border-blue-100 text-[9px] font-black uppercase tracking-wider px-2 py-0.5">
                {subjectLabel}
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-400 font-medium truncate">{faculty.headline}</p>
        </div>

        {/* Status + date + expand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:block text-right">
            <Badge className={`border-none text-[10px] font-black uppercase tracking-wider ${
              isReplied ? "bg-green-50 text-green-600" :
              isSent ? "bg-blue-50 text-talentia-blue" :
              "bg-gray-100 text-gray-500"
            }`}>
              {isReplied ? <><CheckCircle2 size={10} className="inline mr-1" />Respondida</> :
               isSent ? <><Clock size={10} className="inline mr-1" />Enviada</> : "Archivada"}
            </Badge>
            <p className="text-[10px] text-gray-400 font-medium mt-1">
              {formatDateTZ(contact.created_at)}
            </p>
          </div>
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
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
          message: contact.message,
          created_at: contact.created_at,
        });

        const rawFollowUps = (contact as any).follow_ups;
        if (Array.isArray(rawFollowUps) && rawFollowUps.length > 0) {
          rawFollowUps.forEach((fu: any) => {
            messages.push({
              sender: fu.sender,
              message: fu.message,
              created_at: fu.created_at || contact.created_at,
            });
          });
        } else if (contact.reply_message) {
          // Fallback: show the latest reply when follow_ups are not available
          messages.push({
            sender: "faculty",
            message: contact.reply_message,
            created_at: contact.replied_at || contact.created_at,
          });
        }

        return (
          <div className="px-5 pb-5 space-y-4 border-t border-gray-50 pt-4">
            {messages.map((msg, index) => {
              const isInst = msg.sender === "institution";
              return (
                <div key={index} className={`flex flex-col ${isInst ? "items-end" : "items-start"} gap-2`}>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {!isInst && (
                      <div className="relative w-5 h-5 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                        {faculty.avatar_url ? (
                          <Image src={faculty.avatar_url} alt={faculty.full_name} fill sizes="20px" className="object-cover" />
                        ) : (
                          <span className="text-[8px] font-black text-gray-500">{initials[0]}</span>
                        )}
                      </div>
                    )}
                    <span>{isInst ? institutionName : faculty.full_name}</span>
                    <span>·</span>
                    <span>{formatDateTimeTZ(msg.created_at)}</span>
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${isInst ? "bg-talentia-blue text-white rounded-tr-sm" : "bg-gray-100 text-navy rounded-tl-sm"}`}>
                    {/* Meta tags only for first institution message */}
                    {isInst && index === 0 && (contact.subject || contact.modality || contact.dates) && (
                      <div className="flex flex-wrap gap-2 mb-3 opacity-80">
                        {contact.subject && (
                          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                            <Mail size={9} /> {subjectLabel || contact.subject}
                          </span>
                        )}
                        {contact.modality && (
                          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                            <MapPin size={9} /> {contact.modality}
                          </span>
                        )}
                        {contact.dates && (
                          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                            <Calendar size={9} /> {contact.dates}
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-sm font-medium leading-relaxed break-words">{msg.message}</p>
                  </div>
                </div>
              );
            })}

            {/* Pending status message when not yet replied */}
            {isSent && !sent && (
              <div className="flex items-center gap-2 py-2 px-4 bg-blue-50 rounded-xl text-xs font-medium text-talentia-blue">
                <Clock size={13} />
                Esperando respuesta del docente...
              </div>
            )}

            {/* Success message after follow-up sent */}
            {sent && (
              <div className="flex items-center gap-2 py-2 px-4 bg-green-50 rounded-xl text-xs font-bold text-green-700">
                <CheckCircle2 size={13} />
                Mensaje de seguimiento enviado correctamente.
              </div>
            )}

            {/* Action buttons */}
            {!isArchived && !sent && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={`/faculty/${contact.faculty_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-talentia-blue hover:underline"
                >
                  <ExternalLink size={12} /> Ver perfil completo
                </Link>

                {faculty.contact_whatsapp && (
                  <a
                    href={`https://wa.me/${faculty.contact_whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:underline"
                  >
                    <MessageCircle size={12} /> WhatsApp
                  </a>
                )}

                {!showFollowUp && (
                  <button
                    onClick={() => setShowFollowUp(true)}
                    className="ml-auto flex items-center gap-1.5 bg-navy text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-900 transition-colors"
                  >
                    <Send size={12} /> Enviar seguimiento
                  </button>
                )}
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
                  placeholder="Escribe tu mensaje de seguimiento..."
                />
                {followUpError && (
                  <p className="text-xs font-bold text-red-600">{followUpError}</p>
                )}
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
    </div>
  );
}
