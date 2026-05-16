"use client";

import { useState } from "react";
import { Mail, Send, Users, Building2, Globe, CheckCircle2, AlertCircle } from "lucide-react";

const SEGMENTS = [
  { value: "faculty", label: "Docentes", icon: Users, desc: "Todos los docentes registrados en la plataforma" },
  { value: "institution", label: "Instituciones", icon: Building2, desc: "Todos los usuarios con perfil de institución" },
  { value: "all", label: "Todos los usuarios", icon: Globe, desc: "Docentes e instituciones" },
];

export default function MailingPage() {
  const [segment, setSegment] = useState("faculty");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ sent?: number; errors?: number; total?: number; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    if (!confirm(`¿Enviar este email a todos los ${SEGMENTS.find(s => s.value === segment)?.label.toLowerCase()}?\n\nAsunto: ${subject}`)) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/send-broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, segment }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Error de red. Inténtalo de nuevo." });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
      <div>
        <h1 className="text-3xl font-black text-navy tracking-tight">Mailing</h1>
        <p className="text-gray-500 font-medium mt-1">Envía emails a segmentos de usuarios de la plataforma.</p>
      </div>

      {/* Result banner */}
      {result && (
        <div className={`rounded-2xl p-4 flex items-start gap-3 ${result.error ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
          {result.error
            ? <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            : <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />}
          <div>
            <p className={`text-sm font-black ${result.error ? "text-red-800" : "text-green-800"}`}>
              {result.error ? "Error" : "Email enviado"}
            </p>
            <p className={`text-xs font-medium mt-0.5 ${result.error ? "text-red-600" : "text-green-600"}`}>
              {result.error || `${result.sent} enviados · ${result.errors ?? 0} errores · ${result.total} destinatarios totales`}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Segment selector */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400">Destinatarios</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SEGMENTS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSegment(s.value)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  segment === s.value
                    ? "border-talentia-blue bg-blue-50"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${segment === s.value ? "bg-talentia-blue text-white" : "bg-gray-100 text-gray-400"}`}>
                  <s.icon size={16} />
                </div>
                <p className={`text-sm font-black ${segment === s.value ? "text-navy" : "text-gray-600"}`}>{s.label}</p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5 leading-tight">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400">Asunto del email</label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
            placeholder="Novedades en FacultyMatch..."
            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium text-sm"
          />
        </div>

        {/* Body */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400">Cuerpo del email</label>
          <p className="text-xs text-gray-400 font-medium">Texto plano. Los saltos de línea se convierten en párrafos.</p>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            required
            rows={10}
            placeholder="Hola,&#10;&#10;Queremos informarte de las últimas novedades en FacultyMatch...&#10;&#10;Un saludo,&#10;El equipo de FacultyMatch"
            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium text-sm resize-none"
          />
        </div>

        {/* Preview hint */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Mail size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 font-medium">
            El email se enviará con la plantilla corporativa de FacultyMatch desde <strong>noreply@facultymatch.app</strong>.
            El remitente es de sólo lectura: las respuestas van a <strong>support@facultymatch.app</strong>.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !subject.trim() || !body.trim()}
          className="flex items-center gap-2 bg-talentia-blue hover:bg-navy text-white font-black px-6 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={16} />
          {loading ? "Enviando..." : `Enviar a ${SEGMENTS.find(s => s.value === segment)?.label}`}
        </button>
      </form>
    </div>
  );
}
