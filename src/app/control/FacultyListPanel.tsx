"use client";

import { useState } from "react";
import {
  Eye, X, Mail, Phone, MapPin, Linkedin, GraduationCap,
  ShieldCheck, AlignLeft, Clock, AlertCircle, RefreshCw, Loader2,
} from "lucide-react";
import type { Faculty } from "./PendingFacultyPanel";

function initials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

type ExtendedFaculty = Faculty & { verified_at?: string | null };

export default function FacultyListPanel({
  faculty: initialFaculty,
  mode,
  title,
}: {
  faculty: ExtendedFaculty[];
  mode: "approved" | "rejected";
  title: string;
}) {
  const [faculty, setFaculty] = useState<ExtendedFaculty[]>(initialFaculty);
  const [selected, setSelected] = useState<ExtendedFaculty | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  function openDrawer(f: ExtendedFaculty) {
    setSelected(f);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setTimeout(() => setSelected(null), 300);
  }

  async function handleReactivate(id: string, name: string | null) {
    setLoading(`reactivate-${id}`);
    try {
      const res = await fetch("/api/admin/verify-faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facultyId: id, action: "reactivate", notes: "" }),
      });
      if (!res.ok) throw new Error(await res.text());
      setFaculty((prev) => prev.filter((f) => f.id !== id));
      showToast(`${name || "Docente"} movido de nuevo a revisión`);
      if (selected?.id === id) closeDrawer();
    } catch (e) {
      showToast(`Error: ${e}`);
    }
    setLoading(null);
  }

  return (
    <>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-navy">{title}</h2>
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{faculty.length} docentes</span>
        </div>

        {faculty.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="font-bold">Sin resultados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/50 text-xs font-black uppercase tracking-widest text-gray-400">
                  <th className="px-6 py-3 text-left">Docente</th>
                  <th className="px-6 py-3 text-left">Nivel</th>
                  <th className="px-6 py-3 text-left">Áreas</th>
                  <th className="px-6 py-3 text-left">País</th>
                  {mode === "approved" && <th className="px-6 py-3 text-left">Aprobado</th>}
                  {mode === "rejected" && <th className="px-6 py-3 text-left">Motivo</th>}
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {faculty.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
                          mode === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
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
                        {(f.faculty_areas || []).slice(0, 2).map((a) => (
                          <span key={a} className="bg-blue-50 text-talentia-blue text-[10px] font-black px-2 py-0.5 rounded-full">{a}</span>
                        ))}
                        {(f.faculty_areas || []).length > 2 && (
                          <span className="text-[10px] text-gray-400">+{f.faculty_areas.length - 2}</span>
                        )}
                        {(f.faculty_areas || []).length === 0 && <span className="text-[10px] text-gray-300">—</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{f.country || "—"}</td>
                    {mode === "approved" && (
                      <td className="px-6 py-4 text-gray-500 text-xs">{fmtDate(f.verified_at)}</td>
                    )}
                    {mode === "rejected" && (
                      <td className="px-6 py-4 max-w-[200px]">
                        <p className="text-xs text-gray-500 truncate">{f.verification_notes || "—"}</p>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openDrawer(f)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <Eye size={13} /> Ver perfil
                        </button>
                        {mode === "rejected" && (
                          <button
                            onClick={() => handleReactivate(f.id, f.full_name)}
                            disabled={loading === `reactivate-${f.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
                          >
                            {loading === `reactivate-${f.id}` ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                            Reactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Drawer (read-only) */}
      {selected && (
        <>
          <div
            className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            onClick={closeDrawer}
          />
          <div
            className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base flex-shrink-0 ${
                  mode === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {initials(selected.full_name)}
                </div>
                <div>
                  <h2 className="font-black text-navy text-lg">{selected.full_name || "Sin nombre"}</h2>
                  <p className="text-sm text-gray-400">{selected.email}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    mode === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {mode === "approved" ? "Verificado" : "Rechazado"}
                  </span>
                </div>
              </div>
              <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-600 mt-1">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              <DrawerSection title="Datos Personales">
                <DrawerRow icon={<Mail size={14} />} label="Email" value={selected.email} />
                <DrawerRow icon={<Phone size={14} />} label="Teléfono" value={selected.phone} />
                <DrawerRow icon={<MapPin size={14} />} label="País" value={[selected.city, selected.country].filter(Boolean).join(", ") || selected.location} />
                <DrawerRow
                  icon={<Linkedin size={14} />}
                  label="LinkedIn"
                  value={selected.linkedin_url
                    ? <a href={selected.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-talentia-blue font-bold hover:underline">{selected.linkedin_url}</a>
                    : null
                  }
                />
              </DrawerSection>

              <DrawerSection title="Perfil Académico">
                <DrawerRow icon={<GraduationCap size={14} />} label="Nivel académico" value={selected.academic_level} />
                <DrawerRow icon={<ShieldCheck size={14} />} label="Acreditación ANECA" value={selected.aneca_accreditation ? "Sí" : "No"} />
                <div className="space-y-1.5">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Áreas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(selected.faculty_areas || []).map((a) => (
                      <span key={a} className="bg-blue-50 text-talentia-blue text-xs font-bold px-2.5 py-1 rounded-full">{a}</span>
                    ))}
                    {!selected.faculty_areas?.length && <span className="text-gray-400 text-sm">—</span>}
                  </div>
                </div>
                <DrawerRow icon={<AlignLeft size={14} />} label="Bio" value={selected.bio} multiline />
              </DrawerSection>

              <DrawerSection title="Disponibilidad">
                <DrawerRow icon={<Clock size={14} />} label="Disponibilidad" value={selected.availability} />
                <div className="space-y-1.5">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Modalidades</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(selected.modalities || []).map((m) => (
                      <span key={m} className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">{m}</span>
                    ))}
                    {!selected.modalities?.length && <span className="text-gray-400 text-sm">—</span>}
                  </div>
                </div>
              </DrawerSection>

              {mode === "rejected" && selected.verification_notes && (
                <DrawerSection title="Motivo del rechazo">
                  <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{selected.verification_notes}</p>
                </DrawerSection>
              )}
            </div>

            {mode === "rejected" && (
              <div className="px-6 py-4 border-t border-gray-100">
                <button
                  onClick={() => handleReactivate(selected.id, selected.full_name)}
                  disabled={loading === `reactivate-${selected.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm font-black text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
                >
                  {loading === `reactivate-${selected.id}` ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  Mover de nuevo a revisión
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-2xl shadow-lg text-sm font-bold text-white bg-navy animate-in slide-in-from-bottom-4 duration-300">
          {toast}
        </div>
      )}
    </>
  );
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DrawerRow({ icon, label, value, multiline }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; multiline?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        {value ? (
          <p className={`text-sm font-medium text-navy mt-0.5 ${multiline ? "whitespace-pre-wrap" : "truncate"}`}>{value}</p>
        ) : (
          <p className="text-sm text-gray-300 mt-0.5">—</p>
        )}
      </div>
    </div>
  );
}
