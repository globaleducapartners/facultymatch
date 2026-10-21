"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTZ } from "@/lib/utils";
import {
  Gift,
  Copy,
  Check,
  Mail,
  Loader2,
  Trophy,
  Users,
  Link2,
} from "lucide-react";
import type { Referral, ReferralStats } from "./page";

const SITE = "https://www.facultymatch.app";
const GOAL = 10;
const MAX_INVITES = 20;

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  registered: "Registrado",
  successful: "Exitosa",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "text-amber-700",
  registered: "text-fm-blue",
  successful: "text-green-700",
};

interface Props {
  userId: string;
  referrals: Referral[];
  stats: ReferralStats;
}

export default function ReferralsClient({ userId, referrals, stats }: Props) {
  const router = useRouter();
  const referralLink = `${SITE}/signup?ref=${userId}`;
  const shareText = "Estoy en FacultyMatch, un directorio de docentes y expertos verificados para universidades y escuelas de negocio. Crea tu perfil gratis:";

  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  const progressPct = Math.min(100, (stats.successful_referrals / GOAL) * 100);
  const hasWon = stats.successful_referrals >= GOAL;
  const canSendMore = stats.invitations_sent < MAX_INVITES;

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSendLoading(true);
    setSendError(null);
    setSendSuccess(false);
    try {
      const res = await fetch("/api/referrals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendError(data.error || "Error al enviar la invitación");
      } else {
        setSendSuccess(true);
        setInviteEmail("");
        setTimeout(() => {
          setSendSuccess(false);
          router.refresh();
        }, 1500);
      }
    } catch {
      setSendError("Error de red. Inténtalo de nuevo.");
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <div className="space-y-8 duration-500 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-fm-blue/10 rounded-xl flex items-center justify-center">
            <Gift size={20} className="text-fm-blue" />
          </div>
          <h1 className="text-3xl font-extrabold text-fm-navy tracking-tight">
            Invita a colegas y gana 1 año de Professional
          </h1>
        </div>
        <p className="text-gray-500 font-medium mt-2 ml-13">
          Cuando 10 colegas se registren con tu enlace y verifiquen su perfil, te regalamos un año del plan Professional.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Link + Form + List */}
        <div className="lg:col-span-2 space-y-6">

          {/* My referral link */}
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="pb-4 bg-gray-50/50">
              <CardTitle className="text-lg font-extrabold text-fm-navy flex items-center gap-2">
                <Link2 size={18} className="text-fm-blue" />
                Mi enlace de invitación
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <p className="text-sm text-gray-600 font-medium">
                Comparte este enlace con tus colegas docentes. Cuando se registren y su perfil quede verificado, contará para tu progreso.
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
                  {referralLink}
                </div>
                <Button
                  onClick={copyLink}
                  className={`rounded-xl h-12 px-5 font-extrabold shrink-0 transition-all ${
 copied
 ? "bg-green-500 hover:bg-green-500 text-white"
 : "bg-fm-blue hover:bg-fm-navy text-white"
 }`}
                >
                  {copied ? (
                    <><Check size={16} className="mr-1.5" />Copiado</>
                  ) : (
                    <><Copy size={16} className="mr-1.5" />Copiar</>
                  )}
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-fm-blue">
                <a href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${referralLink}`)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Compartir por WhatsApp
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Compartir en LinkedIn
                </a>
                <a href={`mailto:?subject=${encodeURIComponent("Te recomiendo FacultyMatch")}&body=${encodeURIComponent(`${shareText} ${referralLink}`)}`} className="hover:underline">
                  Compartir por email
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Invite by email */}
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="pb-4 bg-gray-50/50">
              <CardTitle className="text-lg font-extrabold text-fm-navy flex items-center gap-2">
                <Mail size={18} className="text-fm-blue" />
                Invitar por email
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <p className="text-sm text-gray-600 font-medium">
                Envía una invitación directa. Tu colega recibirá un email con tu enlace y un código con un mes de Professional gratis.
              </p>
              <form onSubmit={sendInvite} className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="colega@universidad.edu"
                  disabled={!canSendMore || sendLoading}
                  className="flex-1 h-12 px-4 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-fm-blue transition-all disabled:bg-gray-50 disabled:text-gray-500"
                />
                <Button
                  type="submit"
                  disabled={!canSendMore || sendLoading || !inviteEmail.trim()}
                  className="bg-fm-blue hover:opacity-90 text-white font-extrabold rounded-xl h-12 px-5 shrink-0 disabled:opacity-60"
                >
                  {sendLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Enviar invitación"
                  )}
                </Button>
              </form>
              {!canSendMore && (
                <p className="text-xs text-amber-600 font-medium bg-white border border-fm-border rounded-xl px-3 py-2">
                  Has alcanzado el límite de 20 invitaciones por email. Tu enlace personal sigue funcionando sin límite.
                </p>
              )}
              {sendError && (
                <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {sendError}
                </p>
              )}
              {sendSuccess && (
                <p className="text-xs text-green-600 font-medium bg-white border border-fm-border rounded-xl px-3 py-2 flex items-center gap-1.5">
                  <Check size={13} /> Invitación enviada correctamente.
                </p>
              )}
              <p className="text-[11px] text-gray-500 font-medium">
                {MAX_INVITES - stats.invitations_sent} invitaciones por email disponibles.
              </p>
            </CardContent>
          </Card>

          {/* Invitation list */}
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="pb-4 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-extrabold text-fm-navy flex items-center gap-2">
                  <Users size={18} className="text-fm-blue" />
                  Mis invitaciones enviadas
                </CardTitle>
                <span className="text-sm font-bold text-gray-500">{referrals.length}/{MAX_INVITES}</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {referrals.length === 0 ? (
                <div className="py-16 text-center px-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Gift size={24} className="text-fm-blue" />
                  </div>
                  <p className="font-extrabold text-fm-navy">Aún no has enviado ninguna invitación</p>
                  <p className="text-sm text-gray-500 font-medium mt-1 max-w-xs mx-auto">
                    Comparte tu enlace o envía un email a tus colegas para empezar a ganar tu año de Professional.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-3 bg-gray-50/50">
                    <span className="text-[11px] font-bold text-gray-500">Email</span>
                    <span className="text-[11px] font-bold text-gray-500">Fecha</span>
                    <span className="text-[11px] font-bold text-gray-500">Estado</span>
                  </div>
                  {referrals.map(ref => (
                    <div key={ref.id} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-6 py-4 hover:bg-gray-50/50 transition-colors">
                      <span className="text-sm font-medium text-fm-navy truncate">{ref.invitee_email}</span>
                      <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                        {formatDateTZ(ref.created_at)}
                      </span>
                      <span className={`text-xs font-bold ${STATUS_CLASS[ref.status] || "text-gray-500"}`}>
                        {STATUS_LABEL[ref.status] || ref.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Progress */}
        <div className="space-y-6">
          <Card
            className={`border-none shadow-sm rounded-2xl overflow-hidden ${
 hasWon
 ? "bg-fm-navy"
 : "bg-white"
 }`}
          >
            <CardContent className="pt-6 pb-6 space-y-5">
              {hasWon ? (
                <>
                  <div className="flex items-center gap-2">
                    <Trophy size={20} className="text-yellow-300" />
                    <span className="text-xs font-bold text-yellow-300">¡Meta alcanzada!</span>
                  </div>
                  <p className="text-lg font-extrabold text-white leading-tight">
                    ¡Has ganado tu año de Professional! Está activo en tu cuenta.
                  </p>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-300 rounded-full w-full" />
                  </div>
                  <p className="text-sm font-medium text-white/80">
                    10 de 10 colegas han verificado su perfil.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Gift size={18} className="text-fm-blue" />
                    <span className="text-xs font-bold text-fm-blue">Tu progreso</span>
                  </div>
                  <div className="text-center py-2">
                    <span className="text-5xl font-extrabold text-fm-navy">{stats.successful_referrals}</span>
                    <span className="text-xl font-extrabold text-gray-300"> / 10</span>
                    <p className="text-xs font-bold text-gray-500 mt-1">Colegas verificados</p>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-fm-blue rounded-full transition-all duration-700"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-600 text-center">
                    <strong className="text-fm-navy">{stats.successful_referrals}</strong> de 10 colegas han verificado su perfil.
                    {stats.successful_referrals < 10 && (
                      <> Te faltan <strong className="text-fm-blue">{10 - stats.successful_referrals}</strong> más.</>
                    )}
                  </p>
                  <div className="bg-white border border-fm-border rounded-2xl p-4 space-y-1">
                    <p className="text-xs font-bold text-fm-blue">Premio</p>
                    <p className="text-sm font-bold text-fm-navy">1 año de acceso Professional</p>
                    <p className="text-xs text-gray-500 font-medium">Se activa automáticamente al llegar a 10 colegas verificados.</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* How it works */}
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardContent className="pt-5 pb-5 space-y-4">
              <p className="text-xs font-bold text-fm-navy">¿Cómo funciona?</p>
              {[
                { n: "1", text: "Comparte tu enlace o envía invitaciones por email." },
                { n: "2", text: "Tu colega se registra y completa su perfil." },
                { n: "3", text: "Cuando se verifique, suma a tu contador." },
                { n: "4", text: "Al llegar a 10, recibes 1 año de Professional gratis." },
              ].map(step => (
                <div key={step.n} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-fm-blue text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {step.n}
                  </span>
                  <p className="text-sm text-gray-600 font-medium leading-snug">{step.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
