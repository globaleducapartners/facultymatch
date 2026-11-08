"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, Eye, Mail, Users, User, Bell, FileText } from "lucide-react";
import Link from "next/link";

const TEMPLATES = [
  { value: "admin_message", label: "Mensaje personalizado", subject: "", body: "" },
  { value: "upload_avatar", label: "Subir foto de perfil", subject: "Mejora tu perfil — sube tu foto", body: "Te invitamos a subir una foto de perfil para mejorar tu visibilidad en FacultyMatch. Los perfiles con foto profesional reciben más visitas de instituciones interesadas." },
  { value: "complete_profile", label: "Completar perfil", subject: "Completa tu perfil al 100%", body: "Tu perfil está incompleto. Te recomendamos completar toda la información académica y profesional para aparecer primero en los resultados de búsqueda de las instituciones." },
  { value: "upload_documents", label: "Subir documentos", subject: "Sube tus documentos académicos", body: "Para completar tu proceso de verificación, necesitamos que subas tus documentos académicos (títulos, certificados, acreditaciones, etc.) desde la sección de documentos de tu perfil." },
  { value: "upload_banner", label: "Añadir portada", subject: "Añade una imagen de portada a tu perfil", body: "Personaliza tu perfil con una imagen de portada (banner). Esto hará que tu perfil destaque frente a las instituciones que visiten tu página." },
];

const SEGMENTS = [
  { value: "all_faculty", label: "Todos los docentes" },
  { value: "no_avatar", label: "Sin foto de perfil" },
  { value: "incomplete_profile", label: "Perfil incompleto" },
  { value: "pending_verification", label: "Verificación pendiente" },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"segment" | "single">("segment");
  const [template, setTemplate] = useState("admin_message");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [segment, setSegment] = useState("all_faculty");
  const [facultySearch, setFacultySearch] = useState("");
  const [facultyId, setFacultyId] = useState<string | null>(null);
  const [facultyName, setFacultyName] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  function selectTemplate(value: string) {
    const t = TEMPLATES.find((t) => t.value === value);
    setTemplate(value);
    if (t && t.subject) {
      setSubject(t.subject);
      setBody(t.body);
    } else {
      setSubject("");
      setBody("");
    }
  }

  // ── Aviso solo en la plataforma (campana) ──
  const [inSegment, setInSegment] = useState<"improvable" | "all_faculty" | "no_city">("improvable");
  const [inSubject, setInSubject] = useState("Mejora tu perfil en un minuto con IA");
  const [inBody, setInBody] = useState("Sube tu CV y te proponemos cómo completar tu perfil: rellenamos lo que te falta y tú decides qué cambiar. No se borra nada de lo que ya has escrito.");
  const [inLink, setInLink] = useState("/app/faculty/profile?ia=1");
  const [inLoading, setInLoading] = useState(false);
  const [inResult, setInResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Cada segmento propone su propio texto y enlace (se pueden editar).
  const IN_PRESETS = {
    improvable: { type: "cv_ai_improve", subject: "Mejora tu perfil en un minuto con IA", body: "Sube tu CV y te proponemos cómo completar tu perfil: rellenamos lo que te falta y tú decides qué cambiar. No se borra nada de lo que ya has escrito.", link: "/app/faculty/profile?ia=1" },
    all_faculty: { type: "cv_ai_improve", subject: "Mejora tu perfil en un minuto con IA", body: "Sube tu CV y te proponemos cómo completar tu perfil: rellenamos lo que te falta y tú decides qué cambiar. No se borra nada de lo que ya has escrito.", link: "/app/faculty/profile?ia=1" },
    no_city: { type: "complete_city", subject: "Indica tu ciudad para que te encuentren cerca", body: "Las instituciones buscan docentes por cercanía a su campus. Añade tu ciudad (o hasta tres, separadas por «y») y aparecerás en esas búsquedas.", link: "/app/faculty/profile?tab=basic" },
  } as const;

  async function sendInApp() {
    setInLoading(true);
    setInResult(null);
    try {
      const base = { segment: inSegment, subject: inSubject, body: inBody, link: inLink, type: IN_PRESETS[inSegment].type };
      const pre = await fetch("/api/admin/send-inapp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...base, dryRun: true }) }).then((r) => r.json());
      if (!pre.success) { setInResult({ ok: false, message: pre.error || "Error" }); return; }
      if (pre.count === 0) { setInResult({ ok: true, message: "Nadie pendiente: todos los docentes de este segmento ya recibieron este aviso." }); return; }
      if (!confirm(`Se creará el aviso en la plataforma para ${pre.count} docentes (sin correo).\n\n${inSubject}`)) return;
      const res = await fetch("/api/admin/send-inapp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(base) }).then((r) => r.json());
      if (res.success) {
        setInResult({ ok: true, message: `Aviso creado para ${res.sent} docentes.${res.linkSkipped ? " Se ha enviado SIN botón porque falta aplicar la migración del enlace." : ""}` });
      } else {
        setInResult({ ok: false, message: res.error || "Error al crear los avisos" });
      }
    } catch {
      setInResult({ ok: false, message: "Error de conexión" });
    } finally {
      setInLoading(false);
    }
  }

  async function handleSend() {
    if (!subject.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const payload: any = {
        template,
        subject: subject.trim(),
        body: body.trim(),
      };

      if (mode === "segment") {
        payload.segment = segment;
      } else if (facultyId) {
        payload.facultyIds = [facultyId];
      } else {
        setResult({ success: false, message: "Selecciona un docente o segmento" });
        setLoading(false);
        return;
      }

      const res = await fetch("/api/admin/send-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setResult({ success: true, message: `Email enviado a ${data.sent} destinatarios.${data.errors > 0 ? ` (${data.errors} errores)` : ""}` });
        router.refresh();
      } else {
        setResult({ success: false, message: data.error || "Error al enviar" });
      }
    } catch {
      setResult({ success: false, message: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-navy tracking-tight">Notificaciones</h1>
          <p className="text-gray-500 font-medium mt-1">Envía emails y notificaciones a los docentes.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/control/notifications/templates"
            className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <FileText size={14} />
            Plantillas
          </Link>
          <Link
            href="/control/notifications/history"
            className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Mail size={14} />
            Historial
          </Link>
        </div>
      </div>

      {/* Aviso solo en la plataforma */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-talentia-blue" />
          <h2 className="text-sm font-black text-navy">Aviso en la plataforma (sin correo)</h2>
        </div>
        <p className="text-xs text-gray-500 font-medium">
          Aparece en la campana y en el inicio de cada docente. Cada docente lo recibe una sola vez.
        </p>
        <div className="flex flex-wrap gap-2">
          {([["improvable", "Con margen de mejora (perfil por debajo del 100%)"], ["all_faculty", "Todos los docentes"], ["no_city", "Sin ciudad en el perfil"]] as const).map(([v, l]) => (
            <button key={v} type="button" onClick={() => { setInSegment(v); setInSubject(IN_PRESETS[v].subject); setInBody(IN_PRESETS[v].body); setInLink(IN_PRESETS[v].link); }} className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${inSegment === v ? "bg-navy text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>{l}</button>
          ))}
        </div>
        <input value={inSubject} onChange={(e) => setInSubject(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-medium outline-none focus:ring-2 focus:ring-talentia-blue" placeholder="Título" />
        <textarea value={inBody} onChange={(e) => setInBody(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-medium outline-none focus:ring-2 focus:ring-talentia-blue resize-none" placeholder="Texto" />
        <input value={inLink} onChange={(e) => setInLink(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-mono outline-none focus:ring-2 focus:ring-talentia-blue" placeholder="Enlace interno, p. ej. /app/faculty/profile?ia=1" />
        {inResult && (
          <p className={`text-xs font-bold ${inResult.ok ? "text-green-700" : "text-red-600"}`}>{inResult.message}</p>
        )}
        <button onClick={sendInApp} disabled={inLoading || !inSubject.trim() || !inBody.trim()} className="inline-flex items-center gap-2 bg-navy text-white text-xs font-black px-5 py-3 rounded-xl disabled:opacity-50">
          {inLoading ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />} Crear aviso en la plataforma
        </button>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("segment")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-2 ${
            mode === "segment" ? "bg-navy text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Users size={14} />
          Enviar a segmento
        </button>
        <button
          onClick={() => setMode("single")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-2 ${
            mode === "single" ? "bg-navy text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <User size={14} />
          Enviar a un docente
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-black text-navy flex items-center gap-2">
            <Send size={16} className="text-talentia-blue" />
            Componer mensaje
          </h2>

          {/* Template selector */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plantilla</label>
            <select
              value={template}
              onChange={(e) => selectTemplate(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-navy bg-white"
            >
              {TEMPLATES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Recipient selector */}
          {mode === "segment" ? (
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Segmento</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-navy bg-white"
              >
                {SEGMENTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Docente (ID)</label>
              <input
                type="text"
                value={facultySearch}
                onChange={(e) => {
                  setFacultySearch(e.target.value);
                  setFacultyId(e.target.value);
                }}
                placeholder="UUID del docente"
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-navy"
              />
              <p className="text-[10px] text-gray-400 mt-1">Introduce el ID del docente (puedes obtenerlo desde la lista de docentes)</p>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asunto</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-navy"
              placeholder="Asunto del email"
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mensaje</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-navy resize-none"
              placeholder="Cuerpo del mensaje..."
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={loading || !subject.trim()}
            className="w-full px-4 py-3 rounded-xl bg-talentia-blue text-white text-sm font-black hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Enviando...</>
            ) : (
              <><Send size={16} /> Enviar notificación</>
            )}
          </button>

          {/* Result */}
          {result && (
            <div className={`text-xs font-bold px-4 py-3 rounded-xl ${
              result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
              {result.message}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-black text-navy flex items-center gap-2 mb-4">
            <Eye size={16} className="text-gray-400" />
            Vista previa
          </h2>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            {subject ? (
              <>
                <div className="text-center mb-4">
                  <span className="text-lg font-black tracking-wider text-navy">FACULTY<span className="text-talentia-blue">MATCH</span></span>
                </div>
                <h3 className="text-sm font-black text-navy mb-3">{subject}</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{body || "(sin contenido)"}</p>
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">Selecciona una plantilla para ver la vista previa</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}