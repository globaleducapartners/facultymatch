"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { replyToContact } from "@/app/auth/actions";

interface Props {
  contactId: string;
  institutionName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReplyDialog({ contactId, institutionName, isOpen, onClose, onSuccess }: Props) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    const result = await replyToContact(contactId, message.trim());
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      onSuccess();
      onClose();
      setMessage("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] rounded-3xl p-8 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-navy">Responder a {institutionName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Tu respuesta</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-fm-blue outline-none transition-all font-medium text-sm resize-none"
              placeholder="Escribe tu respuesta a la institución. Se enviará por email..."
            />
          </div>
          {error && (
            <p className="text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="font-bold rounded-xl">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !message.trim()}
              className="flex-1 bg-fm-blue hover:bg-blue-700 text-white font-bold py-6 rounded-xl shadow-lg shadow-blue-100"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <><Send size={15} className="mr-2" />Enviar respuesta</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
