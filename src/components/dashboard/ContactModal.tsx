"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { contactFaculty } from "@/app/auth/actions";
import { Loader2, Mail, Calendar, BookOpen, MapPin } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  facultyId: string;
  facultyName: string;
  institutionId: string;
}

export function ContactModal({ isOpen, onClose, facultyId, facultyName, institutionId }: ContactModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    formData.append("facultyId", facultyId);
    formData.append("institutionId", institutionId);
    
    const result = await contactFaculty(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl p-8 border-none shadow-2xl">
        {success ? (
          <div className="py-12 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-2">
              <Mail size={40} />
            </div>
            <h2 className="text-2xl font-black text-navy">¡Solicitud enviada!</h2>
            <p className="text-gray-500 font-medium">Hemos notificado a {facultyName}. Recibirás un correo cuando responda.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-navy">Contactar con {facultyName}</DialogTitle>
              <DialogDescription className="text-gray-500 font-medium">
                Expresa tu interés en una colaboración académica.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                    <BookOpen size={14} /> Tipo de colaboración
                  </label>
                  <select
                    name="reason"
                    required
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium text-sm appearance-none"
                  >
                    <option value="">Seleccionar tipo...</option>
                    <option value="profesor_adjunto">Profesor Adjunto / Invitado</option>
                    <option value="conferenciante">Conferenciante</option>
                    <option value="tutor_tfm">Tutor de TFM / Tesis</option>
                    <option value="diseno_curricular">Diseño Curricular</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                      <MapPin size={14} /> Modalidad
                    </label>
                    <select
                      name="modality"
                      required
                      className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium text-sm appearance-none"
                    >
                      <option value="online">Online</option>
                      <option value="presencial">Presencial</option>
                      <option value="hibrida">Híbrida</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                      <Calendar size={14} /> Fechas estimadas
                    </label>
                    <input
                      name="dates"
                      type="text"
                      required
                      className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium text-sm"
                      placeholder="Ej: Q3 2026 o Oct-Dic"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Mensaje de propuesta</label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium text-sm resize-none"
                    placeholder="Describe brevemente el programa y por qué crees que este docente encaja..."
                  ></textarea>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold animate-in shake-100 duration-500">
                  {error}
                </div>
              )}

              <DialogFooter className="flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="font-bold rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-talentia-blue hover:bg-blue-700 text-white font-bold py-6 rounded-xl shadow-lg shadow-blue-100"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Enviar propuesta"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
