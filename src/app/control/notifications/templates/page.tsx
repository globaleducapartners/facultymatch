import Link from "next/link";
import { ArrowLeft, Eye, Mail, FileText, Image, User, BookOpen } from "lucide-react";

const TEMPLATES = [
  {
    id: "upload_avatar",
    label: "Subir foto de perfil",
    icon: User,
    color: "blue",
    subject: "Mejora tu perfil — sube tu foto",
    body: "Te invitamos a subir una foto de perfil para mejorar tu visibilidad en FacultyMatch. Los perfiles con foto profesional reciben más visitas de instituciones interesadas.",
    description: "Recordatorio para que el docente añada una foto de perfil profesional.",
  },
  {
    id: "complete_profile",
    label: "Completar perfil",
    icon: FileText,
    color: "amber",
    subject: "Completa tu perfil al 100%",
    body: "Tu perfil está incompleto. Te recomendamos completar toda la información académica y profesional para aparecer primero en los resultados de búsqueda de las instituciones.",
    description: "Notificación para que el docente complete todas las secciones de su perfil.",
  },
  {
    id: "upload_documents",
    label: "Subir documentos",
    icon: BookOpen,
    color: "purple",
    subject: "Sube tus documentos académicos",
    body: "Para completar tu proceso de verificación, necesitamos que subas tus documentos académicos (títulos, certificados, acreditaciones, etc.) desde la sección de documentos de tu perfil.",
    description: "Solicitud de documentos académicos para completar la verificación.",
  },
  {
    id: "upload_banner",
    label: "Añadir portada",
    icon: Image,
    color: "green",
    subject: "Añade una imagen de portada a tu perfil",
    body: "Personaliza tu perfil con una imagen de portada (banner). Esto hará que tu perfil destaque frente a las instituciones que visiten tu página.",
    description: "Invitación a personalizar el perfil con una imagen de portada.",
  },
  {
    id: "admin_message",
    label: "Mensaje personalizado",
    icon: Mail,
    color: "gray",
    subject: "Mensaje del equipo de FacultyMatch",
    body: "Hemos publicado una actualización importante en la plataforma. Por favor, revisa tu perfil para mantenerlo actualizado.",
    description: "Plantilla genérica para mensajes personalizados del administrador.",
  },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  blue:   { bg: "bg-blue-50",   text: "text-talentia-blue", border: "border-blue-100", icon: "bg-blue-100 text-talentia-blue" },
  amber:  { bg: "bg-amber-50",  text: "text-amber-600",     border: "border-amber-100", icon: "bg-amber-100 text-amber-600" },
  purple: { bg: "bg-purple-50", text: "text-purple-600",    border: "border-purple-100", icon: "bg-purple-100 text-purple-600" },
  green:  { bg: "bg-green-50",  text: "text-green-600",     border: "border-green-100", icon: "bg-green-100 text-green-600" },
  gray:   { bg: "bg-gray-50",   text: "text-gray-600",      border: "border-gray-200", icon: "bg-gray-100 text-gray-600" },
};

export default function TemplatesPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <Link
          href="/control/notifications"
          className="text-xs font-black text-gray-400 hover:text-navy transition-colors flex items-center gap-1 mb-2"
        >
          <ArrowLeft size={12} />
          Volver a notificaciones
        </Link>
        <h1 className="text-3xl font-black text-navy tracking-tight">Plantillas de email</h1>
        <p className="text-gray-500 font-medium mt-1">
          Plantillas predefinidas para notificaciones a docentes. Puedes personalizar el asunto y el cuerpo al enviarlas.
        </p>
      </div>

      <div className="grid gap-4">
        {TEMPLATES.map((tpl) => {
          const c = COLOR_MAP[tpl.color] || COLOR_MAP.gray;
          return (
            <div key={tpl.id} className={`bg-white rounded-2xl border ${c.border} shadow-sm overflow-hidden`}>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0`}>
                    <tpl.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <h3 className="text-base font-black text-navy">{tpl.label}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{tpl.description}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${c.bg} ${c.text} whitespace-nowrap`}>
                        {tpl.id}
                      </span>
                    </div>

                    <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asunto</span>
                          <p className="text-sm font-bold text-navy mt-0.5">{tpl.subject}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cuerpo</span>
                          <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{tpl.body}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`px-6 py-3 ${c.bg} border-t ${c.border} flex items-center justify-between`}>
                <span className="text-xs font-semibold text-gray-500">
                  Se usa en las notificaciones automáticas y manuales a docentes
                </span>
                <Link
                  href={`/control/notifications`}
                  className={`text-xs font-black ${c.text} hover:underline flex items-center gap-1`}
                >
                  <Mail size={12} />
                  Usar plantilla
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}