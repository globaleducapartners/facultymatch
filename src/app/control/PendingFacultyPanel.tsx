"use client";

import { useState } from "react";
import {
  Eye, CheckCircle2, XCircle, ChevronRight, Loader2, X,
  Mail, Phone, MapPin, Linkedin, GraduationCap, Globe,
  ShieldCheck, AlignLeft, Clock, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Faculty = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  verification_status: string | null;
  verification_notes: string | null;
  faculty_areas: string[];
  availability: string | null;
  modalities: string[];
  linkedin_url: string | null;
  bio: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  headline: string | null;
  academic_level: string | null;
  phone: string | null;
  aneca_accreditation: boolean;
};

const TEMP_DOMAINS = ["mailinator", "tempmail", "guerrillamail", "yopmail", "throwam", "trashmail", "sharklasers", "guerrillamailblock"];
const REJECT_REASONS = ["Perfil incompleto", "Datos no verificables", "Institución no reconocida", "Otro"];

function initials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

function isValidEmail(email: string | null) {
  if (!email) return false;
  const domain = email.split("@")[1]?.toLowerCase() || "";
  return !TEMP_DOMAINS.some(d => domain.includes(d));
}

function isValidLinkedIn(url: string | null) {
  return !!url && url.includes("linkedin.com/in/");
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

export default function PendingFacultyPanel({ faculty: initialFaculty }: { faculty: Faculty[] }) {
  const [faculty, setFaculty] = useState<Faculty[]>(initialFaculty);
  const [selected, setSelected] = useState<Faculty | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [infoModal, setInfoModal] = useState<{ id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectCustom, setRejectCustom] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [notes, setNotes] = useState("");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const checklistItems = [
    { key: "email", label: "Email válido y profesional", auto: true },
    { key: "linkedin", label: "LinkedIn verificado y coherente", auto: true },
    { key: "academic", label: "Nivel académico creíble", auto: false },
    { key: "institutions", label: "Instituciones reconocibles", auto: false },
    { key: "bio", label: "Bio profesional adecuada", auto: false },
    { key: "content", label: "Sin contenido inapropiado", auto: false },
  ];

  function openDrawer(f: Faculty) {
    setSelected(f);
    setNotes(f.verification_notes || "");
    // Auto-fill checklist
    setChecklist({
      email: isValidEmail(f.email),
      linkedin: isValidLinkedIn(f.linkedin_url),
    });
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setTimeout(() => setSelected(null), 300);
  }

  async function callApi(facultyId: string, action: string, extra?: object) {
    const res = await fetch("/api/admin/verify-faculty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facultyId, action, notes, ...extra }),
    });
    if (!res.ok) throw new Error(await res.text());
    setFaculty(prev => prev.filter(f => f.id !== facultyId));
  }

  async function handleQuickApprove(f: Faculty) {
    setLoading(`approve-${f.id}`);
    try { await callApi(f.id, "approve"); }
    catch (e) { alert("Error al aprobar: " + e); }
    setLoading(null);
  }

  async function handleApprove() {
    if (!selected) return;
    setLoading("drawer-approve");
    try { await callApi(selected.id, "approve"); closeDrawer(); }
    catch (e) { alert("Error al aprobar: " + e); }
    setLoading(null);
  }

  async function handleReject() {
    const id = rejectModal?.id || selected?.id;
    if (!id) return;
    const reason = rejectCustom || rejectReason;
    if (!reason) return;
    setLoading("reject");
    try {
      await callApi(id, "reject", { rejectionReason: reason });
      setRejectModal(null);
      if (selected?.id === id) closeDrawer();
    } catch (e) { alert("Error al rechazar: " + e); }
    setLoading(null);
  }

  async function handleRequestInfo() {
    if (!infoModal?.id || !infoMessage) return;
    setLoading("info");
    try {
      await callApi(infoModal.id, "requires_info", { infoMessage });
      setInfoModal(null);
      if (selected?.id === infoModal.id) closeDrawer();
    } catch (e) { alert("Error: " + e); }
    setLoading(null);
  }

  return (
    <>
      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-navy">Perfiles pendientes</h2>
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
            {faculty.length} en cola
          </span>
        </div>

        {faculty.length === 0 ? (
          <div className="py-20 text-center">
            <CheckCircle2 size={40} className="text-green-400 mx-auto mb-4" />
            <p className="font-black text-navy">¡Cola vacía!</p>
            <p className="text-sm text-gray-400 mt-1">No hay perfiles pendientes de revisión.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/50 text-xs font-black uppercase tracking-widest text-gray-400">
                  <th className="px-6 py-3 text-left">Docente</th>
                  <th className="px-6 py-3 text-left">Nivel académico</th>
                  <th className="px-6 py-3 text-left">Áreas</th>
                  <th className="px-6 py-3 text-left">País</th>
                  <th className="px-6 py-3 text-left">Registro</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {faculty.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-talentia-blue/10 flex items-center justify-center text-talentia-blue font-black text-xs flex-shrink-0">
                          {initials(f.full_name)}
                        </div>
                        <div>
                          <p className="font-bold text-navy text-sm">{f.full_name || "Sin nombre"}</p>
                          <p className="text-xs text-gray-400">{f.email || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{f.academic_level || "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(f.faculty_areas || []).slice(0, 2).map(a => (
                          <span key={a} className="bg-blue-50 text-talentia-blue text-[10px] font-black px-2 py-0.5 rounded-full">{a}</span>
                        ))}
                        {(f.faculty_areas || []).length > 2 && (
                          <span className="text-[10px] text-gray-400 font-bold">+{f.faculty_areas.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{f.country || "—"}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs font-medium">{fmtDate(f.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openDrawer(f)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <Eye size={13} /> Ver
                        </button>
                        <button
                          onClick={() => handleQuickApprove(f)}
                          disabled={loading === `approve-${f.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-xs font-bold text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          {loading === `approve-${f.id}` ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                          Aprobar
                        </button>
                        <button
                          onClick={() => setRejectModal({ id: f.id, name: f.full_name || "este docente" })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
                        >
                          <XCircle size={13} /> Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Drawer */}
      {selected && (
        <>
          <div
            className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            onClick={closeDrawer}
          />
          <div
            className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-talentia-blue/10 flex items-center justify-center text-talentia-blue font-black text-base flex-shrink-0">
                  {initials(selected.full_name)}
                </div>
                <div>
                  <h2 className="font-black text-navy text-lg">{selected.full_name || "Sin nombre"}</h2>
                  <p className="text-sm text-gray-400">{selected.email} · Registrado el {fmtDate(selected.created_at)}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase">
                    Pendiente de revisión
                  </span>
                </div>
              </div>
              <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-600 mt-1">
                <X size={20} />
              </button>
            </div>

            {/* Action Bar */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex gap-2">
              <Button
                onClick={handleApprove}
                disabled={loading === "drawer-approve"}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black h-9 rounded-xl text-sm"
              >
                {loading === "drawer-approve" ? <Loader2 size={15} className="animate-spin mr-1" /> : <CheckCircle2 size={15} className="mr-1" />}
                Aprobar
              </Button>
              <Button
                onClick={() => setRejectModal({ id: selected.id, name: selected.full_name || "" })}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-black h-9 rounded-xl text-sm"
                variant="ghost"
              >
                <XCircle size={15} className="mr-1" /> Rechazar
              </Button>
              <Button
                onClick={() => setInfoModal({ id: selected.id })}
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-black h-9 rounded-xl text-sm"
                variant="ghost"
              >
                <AlertCircle size={15} className="mr-1" /> Pedir info
              </Button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              {/* Datos Personales */}
              <Section title="Datos Personales">
                <InfoRow icon={<Mail size={14} />} label="Email" value={selected.email} />
                <InfoRow icon={<Phone size={14} />} label="Teléfono" value={selected.phone} />
                <InfoRow icon={<MapPin size={14} />} label="País" value={[selected.city, selected.country].filter(Boolean).join(", ") || selected.location} />
                <InfoRow
                  icon={<Linkedin size={14} />}
                  label="LinkedIn"
                  value={selected.linkedin_url
                    ? <a href={selected.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-talentia-blue font-bold hover:underline">{selected.linkedin_url}</a>
                    : null
                  }
                />
              </Section>

              {/* Perfil Académico */}
              <Section title="Perfil Académico">
                <InfoRow icon={<GraduationCap size={14} />} label="Nivel académico" value={selected.academic_level} />
                <InfoRow icon={<ShieldCheck size={14} />} label="Acreditación ANECA" value={selected.aneca_accreditation ? "Sí" : "No"} />
                <div className="space-y-1.5">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Áreas de conocimiento</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(selected.faculty_areas || []).map(a => (
                      <span key={a} className="bg-blue-50 text-talentia-blue text-xs font-bold px-2.5 py-1 rounded-full">{a}</span>
                    ))}
                    {!selected.faculty_areas?.length && <span className="text-gray-400 text-sm">—</span>}
                  </div>
                </div>
                <InfoRow icon={<AlignLeft size={14} />} label="Bio" value={selected.bio} multiline />
              </Section>

              {/* Disponibilidad */}
              <Section title="Disponibilidad">
                <InfoRow icon={<Clock size={14} />} label="Disponibilidad" value={selected.availability} />
                <div className="space-y-1.5">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Modalidades</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(selected.modalities || []).map(m => (
                      <span key={m} className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">{m}</span>
                    ))}
                    {!selected.modalities?.length && <span className="text-gray-400 text-sm">—</span>}
                  </div>
                </div>
              </Section>

              {/* Checklist */}
              <Section title="Checklist de Verificación">
                <div className="space-y-2">
                  {checklistItems.map(item => {
                    const checked = item.auto
                      ? (item.key === "email" ? isValidEmail(selected.email) : isValidLinkedIn(selected.linkedin_url))
                      : !!checklist[item.key];
                    return (
                      <label key={item.key} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        checked ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      } ${item.auto ? "cursor-default" : ""}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={item.auto}
                          onChange={e => !item.auto && setChecklist(p => ({ ...p, [item.key]: e.target.checked }))}
                          className="accent-green-600 h-4 w-4 flex-shrink-0"
                        />
                        <span className={`text-sm font-bold ${checked ? "text-green-700" : "text-gray-600"}`}>
                          {item.label}
                        </span>
                        {item.auto && (
                          <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-gray-400">auto</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </Section>

              {/* Notas internas */}
              <Section title="Notas Internas">
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Escribe notas privadas sobre este perfil..."
                  className="w-full h-28 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-talentia-blue resize-none"
                />
                <p className="text-xs text-gray-400">Las notas se guardan al aprobar, rechazar o pedir más info.</p>
              </Section>
            </div>
          </div>
        </>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <Modal title="Rechazar perfil" onClose={() => { setRejectModal(null); setRejectReason(""); setRejectCustom(""); }}>
          <p className="text-sm text-gray-500 mb-4">Indica el motivo para rechazar a <strong>{rejectModal.name}</strong>.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {REJECT_REASONS.map(r => (
              <button
                key={r}
                onClick={() => setRejectReason(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  rejectReason === r ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-600 border-gray-200 hover:border-red-300"
                }`}
              >{r}</button>
            ))}
          </div>
          <textarea
            value={rejectCustom}
            onChange={e => setRejectCustom(e.target.value)}
            placeholder="O escribe un motivo personalizado..."
            className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4"
          />
          <Button
            onClick={handleReject}
            disabled={loading === "reject" || (!rejectReason && !rejectCustom)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black h-11 rounded-xl"
          >
            {loading === "reject" ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            Confirmar rechazo
          </Button>
        </Modal>
      )}

      {/* Request More Info Modal */}
      {infoModal && (
        <Modal title="Pedir más información" onClose={() => { setInfoModal(null); setInfoMessage(""); }}>
          <p className="text-sm text-gray-500 mb-4">Indica qué información necesitas del docente.</p>
          <textarea
            value={infoMessage}
            onChange={e => setInfoMessage(e.target.value)}
            placeholder="Ej: Por favor, añade tu titulación y el enlace a tu perfil de LinkedIn..."
            className="w-full h-28 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-talentia-blue resize-none mb-4"
          />
          <Button
            onClick={handleRequestInfo}
            disabled={loading === "info" || !infoMessage}
            className="w-full bg-talentia-blue hover:bg-blue-700 text-white font-black h-11 rounded-xl"
          >
            {loading === "info" ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            Enviar solicitud
          </Button>
        </Modal>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value, multiline }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; multiline?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        {value ? (
          <p className={`text-sm font-medium text-navy mt-0.5 ${multiline ? "whitespace-pre-wrap" : "truncate"}`}>
            {value}
          </p>
        ) : (
          <p className="text-sm text-gray-300 mt-0.5">—</p>
        )}
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-60" onClick={onClose} />
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-navy">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}
