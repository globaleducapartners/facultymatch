"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  EyeOff, Eye, CheckCircle2, XCircle, Trash2, Send, Loader2, AlertTriangle,
} from "lucide-react";
import {
  hideFaculty, unhideFaculty, revokeFaculty, activateFaculty,
  deleteFaculty, sendNotification,
} from "./actions";

interface Props {
  facultyId: string;
  isHidden: boolean;
  isVerified: boolean;
  verificationStatus: string | null;
  facultyName: string;
}

export function FacultyActions({ facultyId, isHidden, isVerified, verificationStatus, facultyName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showActivateConfirm, setShowActivateConfirm] = useState(false);
  const [notifyType, setNotifyType] = useState("admin_message");
  const [notifySubject, setNotifySubject] = useState("");
  const [notifyBody, setNotifyBody] = useState("");
  const [notifySendEmail, setNotifySendEmail] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleAction(action: string, fn: () => Promise<void>) {
    setLoading(action);
    setMessage(null);
    try {
      await fn();
      setMessage({ type: "success", text: "Acción completada correctamente" });
      router.refresh();
    } catch (e: any) {
      setMessage({ type: "error", text: e?.message || "Error al ejecutar la acción" });
    } finally {
      setLoading(null);
    }
  }

  async function handleActivate(force = false) {
    setLoading("activate");
    setMessage(null);
    try {
      await activateFaculty(facultyId, force);
      setMessage({ type: "success", text: "Acción completada correctamente" });
      setShowActivateConfirm(false);
      router.refresh();
    } catch (e: any) {
      if (e?.message?.includes("ONBOARDING_INCOMPLETE")) {
        setShowActivateConfirm(true);
      } else {
        setMessage({ type: "error", text: e?.message || "Error al ejecutar la acción" });
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleSendNotification() {
    if (!notifySubject.trim()) return;
    setLoading("notify");
    setMessage(null);
    try {
      await sendNotification(facultyId, notifyType, notifySubject, notifyBody || undefined, notifySendEmail);
      setMessage({ type: "success", text: "Notificación enviada correctamente" });
      setShowNotifyModal(false);
      setNotifySubject("");
      setNotifyBody("");
      router.refresh();
    } catch (e: any) {
      setMessage({ type: "error", text: e?.message || "Error al enviar notificación" });
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    setLoading("delete");
    setMessage(null);
    try {
      await deleteFaculty(facultyId);
      setMessage({ type: "success", text: "Docente eliminado correctamente" });
      setTimeout(() => router.push("/control/faculty"), 1500);
    } catch (e: any) {
      setMessage({ type: "error", text: e?.message || "Error al eliminar" });
    } finally {
      setLoading(null);
    }
  }

  const templates = [
    { value: "admin_message", label: "Mensaje personalizado" },
    { value: "upload_avatar", label: "Subir foto de perfil", subject: "Mejora tu perfil — sube tu foto", body: "Te invitamos a subir una foto de perfil para mejorar tu visibilidad en FacultyMatch. Los perfiles con foto reciben más visitas." },
    { value: "complete_profile", label: "Completar perfil", subject: "Completa tu perfil al 100%", body: "Tu perfil está incompleto. Te recomendamos completar toda la información para aparecer primero en los resultados de búsqueda." },
    { value: "upload_documents", label: "Subir documentos", subject: "Sube tus documentos académicos", body: "Para completar tu verificación, necesitamos que subas tus documentos académicos (títulos, certificados, etc.)." },
    { value: "upload_banner", label: "Añadir portada", subject: "Añade una imagen de portada a tu perfil", body: "Personaliza tu perfil con una imagen de portada. Esto hará que tu perfil destaque frente a las instituciones." },
  ];

  function selectTemplate(value: string) {
    const t = templates.find((t) => t.value === value);
    setNotifyType(value);
    if (t && t.subject) {
      setNotifySubject(t.subject);
      setNotifyBody(t.body || "");
    }
  }

  const btnBase = "px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2";

  return (
    <div className="space-y-3">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Hide / Unhide */}
        {isHidden ? (
          <button
            onClick={() => handleAction("unhide", () => unhideFaculty(facultyId))}
            disabled={loading !== null}
            className={`${btnBase} bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50`}
          >
            {loading === "unhide" ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
            Mostrar en directorio
          </button>
        ) : (
          <button
            onClick={() => handleAction("hide", () => hideFaculty(facultyId))}
            disabled={loading !== null}
            className={`${btnBase} bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50`}
          >
            {loading === "hide" ? <Loader2 size={14} className="animate-spin" /> : <EyeOff size={14} />}
            Ocultar del directorio
          </button>
        )}

        {/* Verify / Revoke */}
        {isVerified ? (
          <button
            onClick={() => handleAction("revoke", () => revokeFaculty(facultyId))}
            disabled={loading !== null}
            className={`${btnBase} bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50`}
          >
            {loading === "revoke" ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
            Revocar verificación
          </button>
        ) : (
          <button
            onClick={() => handleActivate()}
            disabled={loading !== null}
            className={`${btnBase} bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50`}
          >
            {loading === "activate" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Activar / Verificar
          </button>
        )}

        {/* Send notification */}
        <button
          onClick={() => setShowNotifyModal(true)}
          disabled={loading !== null}
          className={`${btnBase} bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50`}
        >
          <Send size={14} />
          Enviar notificación
        </button>

        {/* Delete */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={loading !== null}
          className={`${btnBase} bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 ml-auto`}
        >
          {loading === "delete" ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          Eliminar cuenta
        </button>
      </div>

      {/* Feedback message */}
      {message && (
        <div className={`text-xs font-bold px-4 py-2 rounded-xl ${
          message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      {/* Notification Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowNotifyModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black text-navy">Enviar notificación a {facultyName}</h3>

            {/* Template selector */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plantilla</label>
              <select
                value={notifyType}
                onChange={(e) => selectTemplate(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-navy bg-white"
              >
                {templates.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asunto</label>
              <input
                type="text"
                value={notifySubject}
                onChange={(e) => setNotifySubject(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-navy"
                placeholder="Asunto del mensaje"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mensaje</label>
              <textarea
                value={notifyBody}
                onChange={(e) => setNotifyBody(e.target.value)}
                rows={4}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm text-navy resize-none"
                placeholder="Cuerpo del mensaje (opcional)"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifySendEmail}
                onChange={(e) => setNotifySendEmail(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-semibold text-navy">Enviar también por email</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowNotifyModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-black text-gray-500 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendNotification}
                disabled={loading === "notify" || !notifySubject.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-black hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading === "notify" ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activate confirmation — onboarding incomplete */}
      {showActivateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowActivateConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} className="text-amber-600" />
            </div>
            <h3 className="text-lg font-black text-navy text-center">Onboarding incompleto</h3>
            <p className="text-sm text-gray-500 text-center">
              {facultyName} no ha completado el onboarding. Verificarlo igualmente puede
              exponer un perfil sin revisar en el directorio público. ¿Confirmas la verificación?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowActivateConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-black text-gray-500 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleActivate(true)}
                disabled={loading === "activate"}
                className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-black hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading === "activate" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Verificar igualmente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mx-auto">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-black text-navy text-center">¿Eliminar cuenta de {facultyName}?</h3>
            <p className="text-sm text-gray-500 text-center">
              Esta acción es irreversible. Se eliminará la cuenta de usuario, su perfil,
              documentos y todos los datos asociados.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-black text-gray-500 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading === "delete"}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-black hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading === "delete" ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}