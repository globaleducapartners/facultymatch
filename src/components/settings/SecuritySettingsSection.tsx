"use client";

import { useState } from "react";
import { Mail, Lock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateEmail, updatePassword } from "@/app/auth/actions";

interface Props {
  currentEmail: string;
}

export function SecuritySettingsSection({ currentEmail }: Props) {
  const [emailOpen, setEmailOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  async function handleEmailSubmit(formData: FormData) {
    setLoadingEmail(true);
    setEmailMsg(null);
    const result = await updateEmail(formData);
    if ("error" in result) {
      setEmailMsg({ type: "error", text: result.error! });
    } else {
      setEmailMsg({ type: "success", text: result.success! });
      setEmailOpen(false);
    }
    setLoadingEmail(false);
  }

  async function handlePasswordSubmit(formData: FormData) {
    setLoadingPassword(true);
    setPasswordMsg(null);
    const result = await updatePassword(formData);
    if ("error" in result) {
      setPasswordMsg({ type: "error", text: result.error! });
    } else {
      setPasswordMsg({ type: "success", text: result.success! });
      setPasswordOpen(false);
    }
    setLoadingPassword(false);
  }

  const inputCls =
    "w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium text-sm";

  return (
    <div className="space-y-4">
      {/* Email row */}
      <div className="rounded-xl border border-gray-100 bg-gray-50/50 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-xl shadow-sm text-gray-400 shrink-0">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Correo electrónico
              </p>
              <p className="text-sm font-bold text-navy">{currentEmail}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => { setEmailOpen(!emailOpen); setEmailMsg(null); }}
            className="border-gray-200 text-navy font-bold rounded-xl h-10 px-6 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            Cambiar email
            {emailOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </Button>
        </div>

        {emailOpen && (
          <div className="px-5 pb-5 border-t border-gray-100">
            <form action={handleEmailSubmit} className="pt-4 space-y-3 max-w-sm">
              <input
                name="newEmail"
                type="email"
                required
                placeholder="nuevo@email.com"
                className={inputCls}
              />
              {emailMsg && (
                <div className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg ${emailMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                  {emailMsg.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {emailMsg.text}
                </div>
              )}
              <Button
                type="submit"
                disabled={loadingEmail}
                className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-10 px-6 rounded-xl text-sm"
              >
                {loadingEmail ? "Enviando..." : "Enviar confirmación"}
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Password row */}
      <div className="rounded-xl border border-gray-100 bg-gray-50/50 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-xl shadow-sm text-gray-400 shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Contraseña
              </p>
              <p className="text-sm font-bold text-navy">••••••••••••</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => { setPasswordOpen(!passwordOpen); setPasswordMsg(null); }}
            className="border-gray-200 text-navy font-bold rounded-xl h-10 px-6 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            Actualizar
            {passwordOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </Button>
        </div>

        {passwordOpen && (
          <div className="px-5 pb-5 border-t border-gray-100">
            <form action={handlePasswordSubmit} className="pt-4 space-y-3 max-w-sm">
              <input
                name="newPassword"
                type="password"
                required
                minLength={8}
                placeholder="Nueva contraseña (mín. 8 caracteres)"
                className={inputCls}
              />
              <input
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirmar nueva contraseña"
                className={inputCls}
              />
              {passwordMsg && (
                <div className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg ${passwordMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                  {passwordMsg.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {passwordMsg.text}
                </div>
              )}
              <Button
                type="submit"
                disabled={loadingPassword}
                className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-10 px-6 rounded-xl text-sm"
              >
                {loadingPassword ? "Guardando..." : "Actualizar contraseña"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
