import { ApproveButtons } from "./ApproveButtons";
import { InstitutionActions } from "./InstitutionActions";
import { createAdminClient } from "@/lib/supabase-server";
import { Building2, Globe, Mail, Phone, MapPin, Calendar, CheckCircle2, XCircle, Clock, Zap, MessageSquare, Heart, Activity, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

async function toggleInstitutionStatus(formData: FormData) {
  "use server";
  const { createAdminClient } = await import("@/lib/supabase-server");
  const { revalidatePath } = await import("next/cache");
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  const currentStatus = formData.get("currentStatus") as string;
  const newStatus = currentStatus === "blocked" ? "active" : "blocked";
  await admin.from("institutions").update({ status: newStatus }).eq("id", id);
  revalidatePath("/control/institutions");
}

async function deleteInstitution(formData: FormData) {
  "use server";
  const { createAdminClient } = await import("@/lib/supabase-server");
  const { revalidatePath } = await import("next/cache");
  const admin = createAdminClient();
  const id = formData.get("id") as string;

  // Look up the institution to get the owner's user_id
  const { data: inst } = await admin
    .from("institutions")
    .select("user_id")
    .eq("id", id)
    .single();

  // Delete the institution record first
  await admin.from("institutions").delete().eq("id", id);

  if (inst?.user_id) {
    // Check if the owner is a dual-mode faculty user or a pure institution user
    const { data: profile } = await admin
      .from("user_profiles")
      .select("role")
      .eq("id", inst.user_id)
      .single();

    if (profile?.role === "faculty") {
      // Dual-mode user: just reset their institution access, keep the faculty account
      await admin.from("user_profiles").update({
        can_switch_role: false,
        active_mode: "faculty",
      }).eq("id", inst.user_id);
    } else {
      // Pure institution account: delete the auth user (cascades to profiles)
      await admin.auth.admin.deleteUser(inst.user_id);
    }
  }

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

  // Build fallback email map: institution user_id → auth email
  const allInsts = [...(institutions ?? []), ...(pendingInstitutions ?? [])];
  const allUserIds = allInsts.map(i => i.user_id || i.id).filter(Boolean);
  const authEmailMap: Record<string, string> = {};
  if (allUserIds.length > 0) {
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (authData?.users) {
      const idSet = new Set(allUserIds);
      authData.users.forEach(u => {
        if (idSet.has(u.id) && u.email) authEmailMap[u.id] = u.email;
      });
    }
  }
  function getEmail(inst: any): string | null {
    return inst.contact_email || authEmailMap[inst.user_id || inst.id] || null;
  }

  // ── Contacts & Favorites aggregation ──
  const contactStats = new Map<string, { count: number; lastActivity: string }>();
  const favoriteStats = new Map<string, { count: number; lastActivity: string }>();

  const { data: allContacts } = await admin
    .from("contacts")
    .select("institution_id, created_at");
  if (allContacts) {
    for (const c of allContacts) {
      if (!c.institution_id) continue;
      const prev = contactStats.get(c.institution_id) || { count: 0, lastActivity: "" };
      prev.count++;
      if (c.created_at && c.created_at > prev.lastActivity) prev.lastActivity = c.created_at;
      contactStats.set(c.institution_id, prev);
    }
  }

  const { data: allFavorites } = await admin
    .from("favorites")
    .select("institution_id, created_at");
  if (allFavorites) {
    for (const f of allFavorites) {
      if (!f.institution_id) continue;
      const prev = favoriteStats.get(f.institution_id) || { count: 0, lastActivity: "" };
      prev.count++;
      if (f.created_at && f.created_at > prev.lastActivity) prev.lastActivity = f.created_at;
      favoriteStats.set(f.institution_id, prev);
    }
  }

  // Enrich institutions with intention / stats
  type IntentionLevel = "alta" | "media" | "baja";
  function getIntention(instId: string): IntentionLevel {
    const contacts = contactStats.get(instId);
    const favorites = favoriteStats.get(instId);
    const hasContacts = (contacts?.count ?? 0) > 0;
    const hasFavorites = (favorites?.count ?? 0) > 0;
    if (hasContacts) return "alta";
    if (hasFavorites) return "media";
    return "baja";
  }
  function getLastActivity(instId: string): string | null {
    const c = contactStats.get(instId);
    const f = favoriteStats.get(instId);
    const candidates = [c?.lastActivity, f?.lastActivity].filter(Boolean) as string[];
    return candidates.length ? candidates.sort().reverse()[0] : null;
  }

  // Sort: alta first, then media, then baja; secondary by created_at desc
  if (institutions) {
    const intentionRank = { alta: 0, media: 1, baja: 2 };
    institutions.sort((a, b) => {
      const rA = intentionRank[getIntention(a.id)];
      const rB = intentionRank[getIntention(b.id)];
      if (rA !== rB) return rA - rB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

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

  const total = (institutions?.length ?? 0) + (pendingInstitutions?.length ?? 0);
  const active = institutions?.filter(i => i.status === "active" || i.status === "approved").length ?? 0;
  const blocked = institutions?.filter(i => i.status === "blocked").length ?? 0;
  const rejected = institutions?.filter(i => i.status === "rejected").length ?? 0;
  const pendingCount = pendingInstitutions?.length ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-navy">Instituciones</h1>
        <p className="text-gray-500 font-medium mt-1">Gestión de instituciones registradas en la plataforma.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total registradas", value: total, icon: Building2, color: "text-talentia-blue bg-blue-50" },
          { label: "Activas / Aprobadas", value: active, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
          { label: "Pendientes", value: pendingCount, icon: Clock, color: "text-amber-600 bg-amber-50" },
          { label: "Alta intención", value: (institutions ?? []).filter(i => getIntention(i.id) === "alta").length, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
          { label: "Bloqueadas / Rechazadas", value: blocked + rejected, icon: XCircle, color: "text-red-500 bg-red-50" },
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
              <div key={inst.id} className="px-6 py-5 flex flex-col sm:flex-row sm:items-start gap-4">
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
                    {inst.website && (
                      <a href={inst.website.startsWith('http') ? inst.website : `https://${inst.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-talentia-blue font-medium hover:underline">
                        <Globe size={11} /> {inst.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    )}
                    {inst.created_at && (
                      <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                        <Calendar size={11} /> {new Date(inst.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  {inst.description && (
                    <p className="text-xs text-gray-500 font-medium mt-2 line-clamp-2">{inst.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getEmail(inst) && (
                    <a
                      href={`mailto:${getEmail(inst)}?subject=Tu solicitud en FacultyMatch`}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors bg-white"
                    >
                      <Mail size={12} /> Contactar
                    </a>
                  )}
                  <ApproveButtons institutionId={inst.id} />
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
              const isActive = inst.status === "active" || inst.status === "approved";
              const intentionLevel = getIntention(inst.id);
              const intentionBadge = intentionLevel === "alta"
                ? <Badge className="bg-emerald-50 text-emerald-700 border-none text-[10px] font-black flex items-center gap-1"><Zap size={10} /> Alta intención</Badge>
                : intentionLevel === "media"
                  ? <Badge className="bg-amber-50 text-amber-700 border-none text-[10px] font-black flex items-center gap-1"><Heart size={10} /> Int. media</Badge>
                  : <Badge className="bg-gray-100 text-gray-500 border-none text-[10px] font-black flex items-center gap-1">Int. baja</Badge>;
              const statusBadge = isActive
                ? <Badge className="bg-green-50 text-green-700 border-none text-[10px] font-black flex items-center gap-1"><CheckCircle2 size={10} /> Aprobada</Badge>
                : inst.status === "blocked"
                  ? <Badge className="bg-red-50 text-red-600 border-none text-[10px] font-black flex items-center gap-1"><XCircle size={10} /> Bloqueada</Badge>
                  : inst.status === "rejected"
                    ? <Badge className="bg-gray-100 text-gray-500 border-none text-[10px] font-black flex items-center gap-1"><XCircle size={10} /> Rechazada</Badge>
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
                        {intentionBadge}
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
                        {/* Stats */}
                        <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                          <MessageSquare size={11} /> {contactStats.get(inst.id)?.count ?? 0} contactos
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                          <Heart size={11} /> {favoriteStats.get(inst.id)?.count ?? 0} favoritos
                        </span>
                        {(() => {
                          const lastAct = getLastActivity(inst.id);
                          return lastAct ? (
                            <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                              <Activity size={11} /> {new Date(lastAct).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          ) : null;
                        })()}
                      </div>

                      {inst.description && (
                        <p className="text-xs text-gray-400 font-medium mt-2 line-clamp-1">{inst.description}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getEmail(inst) && (
                        <a
                          href={`mailto:${getEmail(inst)}?subject=Comunicación desde FacultyMatch`}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                          title={`Contactar con ${inst.name}`}
                        >
                          <Mail size={12} /> Contactar
                        </a>
                      )}
                      <InstitutionActions
                        inst={{ id: inst.id, name: inst.name, status: inst.status }}
                        toggleAction={toggleInstitutionStatus}
                        deleteAction={deleteInstitution}
                      />
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
