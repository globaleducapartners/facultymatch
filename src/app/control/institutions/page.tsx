import { createAdminClient } from "@/lib/supabase-server";
import { Building2, Globe, Mail, Phone, MapPin, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from "next/cache";

async function toggleInstitutionStatus(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  const currentStatus = formData.get("currentStatus") as string;
  const newStatus = currentStatus === "active" ? "blocked" : "active";
  await admin.from("institutions").update({ status: newStatus }).eq("id", id);
  revalidatePath("/control/institutions");
}

async function approveInstitution(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  await admin.from("institutions").update({ status: "active" }).eq("id", id);
  revalidatePath("/control/institutions");
}

async function rejectInstitution(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  await admin.from("institutions").update({ status: "blocked" }).eq("id", id);
  revalidatePath("/control/institutions");
}

export default async function ControlInstitutionsPage() {
  const admin = createAdminClient();

  const { data: institutions, error } = await admin
    .from("institutions")
    .select("*")
    .neq("status", "pending")
    .order("created_at", { ascending: false });

  const { data: pendingInstitutions } = await admin
    .from("institutions")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-black text-navy mb-2">Instituciones</h1>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-medium">
          Error al cargar instituciones: {error.message}
        </div>
      </div>
    );
  }

  const total = institutions?.length ?? 0;
  const active = institutions?.filter(i => i.status === "active").length ?? 0;
  const blocked = institutions?.filter(i => i.status === "blocked").length ?? 0;
  const pendingCount = pendingInstitutions?.length ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-navy">Instituciones</h1>
        <p className="text-gray-500 font-medium mt-1">Gestión de instituciones registradas en la plataforma.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total registradas", value: total, icon: Building2, color: "text-talentia-blue bg-blue-50" },
          { label: "Activas", value: active, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
          { label: "Pendientes", value: pendingCount, icon: Clock, color: "text-amber-600 bg-amber-50" },
          { label: "Bloqueadas", value: blocked, icon: XCircle, color: "text-red-500 bg-red-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-black text-navy">{value}</p>
            <p className="text-sm text-gray-500 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending institutions for approval */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-200 flex items-center justify-between">
            <h2 className="font-bold text-amber-800 flex items-center gap-2">
              <Clock size={16} className="text-amber-600" />
              Instituciones pendientes de aprobación
            </h2>
            <span className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">{pendingCount}</span>
          </div>
          <div className="divide-y divide-amber-100">
            {(pendingInstitutions || []).map(inst => (
              <div key={inst.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-navy text-sm">{inst.name || "Sin nombre"}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    {(inst.country || inst.city) && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                        <MapPin size={11} /> {[inst.city, inst.country].filter(Boolean).join(', ')}
                      </span>
                    )}
                    {inst.contact_email && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                        <Mail size={11} /> {inst.contact_email}
                      </span>
                    )}
                    {inst.created_at && (
                      <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                        <Calendar size={11} /> {new Date(inst.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <form action={approveInstitution}>
                    <input type="hidden" name="id" value={inst.id} />
                    <button type="submit" className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors">
                      <CheckCircle2 size={13} /> Aprobar
                    </button>
                  </form>
                  <form action={rejectInstitution}>
                    <input type="hidden" name="id" value={inst.id} />
                    <button type="submit" className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                      <XCircle size={13} /> Rechazar
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-navy flex items-center gap-2">
            <Building2 size={18} className="text-talentia-blue" />
            Listado de instituciones
          </h2>
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{total} registros</span>
        </div>

        {!institutions || institutions.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 size={28} className="text-gray-300" />
            </div>
            <p className="font-bold text-navy">No hay instituciones registradas aún</p>
            <p className="text-sm text-gray-400 mt-1">Aparecerán aquí cuando se registren instituciones.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {institutions.map((inst) => {
              const statusBadge = inst.status === "active"
                ? <Badge className="bg-green-50 text-green-700 border-none text-[10px] font-black flex items-center gap-1"><CheckCircle2 size={10} /> Activa</Badge>
                : inst.status === "blocked"
                  ? <Badge className="bg-red-50 text-red-600 border-none text-[10px] font-black flex items-center gap-1"><XCircle size={10} /> Bloqueada</Badge>
                  : <Badge className="bg-amber-50 text-amber-700 border-none text-[10px] font-black flex items-center gap-1"><Clock size={10} /> Pendiente</Badge>;

              return (
                <div key={inst.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Logo placeholder */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy to-talentia-blue flex items-center justify-center flex-shrink-0">
                      {inst.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={inst.logo_url} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Building2 size={20} className="text-white" />
                      )}
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-navy text-sm">{inst.name || "Sin nombre"}</h3>
                        {statusBadge}
                        {(inst.institution_type || inst.type) && (
                          <Badge className="bg-gray-50 text-gray-600 border-none text-[10px] font-bold">
                            {inst.institution_type || inst.type}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        {(inst.country || inst.city) && (
                          <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                            <MapPin size={11} /> {[inst.city, inst.country].filter(Boolean).join(', ')}
                          </span>
                        )}
                        {inst.contact_email && (
                          <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                            <Mail size={11} /> {inst.contact_email}
                          </span>
                        )}
                        {inst.phone && (
                          <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                            <Phone size={11} /> {inst.phone}
                          </span>
                        )}
                        {inst.website && (
                          <a
                            href={inst.website.startsWith('http') ? inst.website : `https://${inst.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-talentia-blue font-medium hover:underline"
                          >
                            <Globe size={11} /> {inst.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          </a>
                        )}
                        {inst.created_at && (
                          <span className="flex items-center gap-1 text-xs text-gray-300 font-medium">
                            <Calendar size={11} /> {new Date(inst.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <form action={toggleInstitutionStatus}>
                        <input type="hidden" name="id" value={inst.id} />
                        <input type="hidden" name="currentStatus" value={inst.status || "active"} />
                        <button
                          type="submit"
                          className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
                            inst.status === "blocked"
                              ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-100"
                              : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                          }`}
                        >
                          {inst.status === "blocked" ? "Reactivar" : "Bloquear"}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
