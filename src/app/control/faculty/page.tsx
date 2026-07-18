import { createAdminClient } from "@/lib/supabase-server";
import Link from "next/link";
import {
  CheckCircle2, XCircle, Clock, EyeOff, Eye,
  GraduationCap, Award, MessageSquare, AlertCircle,
} from "lucide-react";

// ── Profile Completeness Calculator ───────────────────────────────────────

function calculateCompleteness(fp: any): number {
  const fields = [
    fp.headline,
    fp.bio,
    fp.country,
    fp.linkedin_url,
    fp.is_phd,
    fp.aneca_accreditation,
    fp.faculty_areas && Array.isArray(fp.faculty_areas) && fp.faculty_areas.length > 0,
    fp.levels && Array.isArray(fp.levels) && fp.levels.length > 0,
    fp.languages && Array.isArray(fp.languages) && fp.languages.length > 0,
    fp.avatar_url || fp.photo,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

// ── ───────────────────────────────────────────────────────────────────────

function StatusBadge({ status, visibility }: { status?: string | null; visibility?: string | null }) {
  if (visibility === "private") {
    return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 flex items-center gap-1"><EyeOff size={10} /> Oculto</span>;
  }
  if (status === "verificado") return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle2 size={10} /> Verificado</span>;
  if (status === "rechazado") return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1"><XCircle size={10} /> Rechazado</span>;
  if (status === "en_revision") return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1"><Clock size={10} /> En revisión</span>;
  if (status === "incompleto") return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1"><AlertCircle size={10} /> Incompleto</span>;
  if (status === "pendiente_verificacion") return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Sin verificar email</span>;
  return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1"><Clock size={10} /> {status || "Desconocido"}</span>;
}

export default async function FacultyListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const admin = createAdminClient();
  const params = await searchParams;

  // Fetch faculty_profiles ordered by view_count DESC (primary sort)
  let profileQuery = admin
    .from("faculty_profiles")
    .select("user_id, view_count, visibility, headline, country, profile_completeness, is_phd, aneca_accreditation, bio, linkedin_url, faculty_areas, levels, languages, avatar_url, estado_perfil")
    .order("view_count", { ascending: false })
    .limit(200);

  const { data: allProfiles } = await profileQuery;

  // Check if any profile has stored non-zero completeness
  const hasStoredCompleteness = (allProfiles ?? []).some(
    (fp: any) => fp.profile_completeness !== null && fp.profile_completeness !== 0
  );

  // Build resolved profile data
  const profileIds = (allProfiles ?? []).map((fp: any) => fp.user_id);

  // Fetch user_profiles matching these faculty
  let userMap: Record<string, any> = {};
  if (profileIds.length > 0) {
    const { data: users } = await admin
      .from("user_profiles")
      .select("id, full_name, email, created_at, onboarding_completed")
      .in("id", profileIds)
      .eq("role", "faculty");

    if (users) {
      users.forEach((u: any) => { userMap[u.id] = u; });
    }
  }

  // Build combined faculty list sorted by view_count DESC
  const facultyList = (allProfiles ?? [])
    .filter((fp: any) => userMap[fp.user_id])
    .map((fp: any) => {
      const user = userMap[fp.user_id];
      const completeness = hasStoredCompleteness
        ? (fp.profile_completeness ?? 0)
        : calculateCompleteness(fp);
      return { ...user, _profile: { ...fp, _completeness: completeness } };
    });

  // Apply status filter on the combined list using estado_perfil from faculty_profiles
  let filteredFaculty = facultyList;
  if (params.status && params.status !== "all") {
    const statusMap: Record<string, string> = {
      "pending": "en_revision",
      "approved": "verificado",
      "rejected": "rechazado",
      "requires_info": "incompleto",
    };
    const targetStatus = statusMap[params.status] || params.status;
    filteredFaculty = facultyList.filter(
      (f: any) => f._profile?.estado_perfil === targetStatus
    );
  }

  // ── Contact counts per faculty ──────────────────────────────────────────

  let contactCountMap: Record<string, number> = {};
  if (profileIds.length > 0) {
    const { data: contactRows } = await admin
      .from("contacts")
      .select("faculty_id")
      .in("faculty_id", profileIds);
    if (contactRows) {
      contactRows.forEach((c: any) => {
        contactCountMap[c.faculty_id] = (contactCountMap[c.faculty_id] ?? 0) + 1;
      });
    }
  }

  // ── Auth users for last_sign_in ─────────────────────────────────────────

  let authUserMap: Record<string, string | null> = {};
  try {
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (authData?.users) {
      authData.users.forEach((u: any) => {
        authUserMap[u.id] = u.last_sign_in_at || null;
      });
    }
  } catch (e) {
    // last_sign_in_at not critical
  }

  // ── ─────────────────────────────────────────────────────────────────────

  function fmtDate(iso: string | null | undefined) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  }

  const statusFilter = params.status || "all";

  function ProfileBar({ value }: { value: number }) {
    const pct = Math.min(value, 100);
    let color = "";
    if (pct >= 70) color = "bg-green-500";
    else if (pct >= 30) color = "bg-orange-400";
    else color = "bg-red-400";
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
          <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.max(4, pct)}%` }} />
        </div>
        <span className={`text-xs font-bold w-8 text-right ${pct >= 70 ? "text-green-600" : pct >= 30 ? "text-orange-500" : "text-red-500"}`}>
          {pct}%
        </span>
      </div>
    );
  }

  function ActionBadge({ viewCount, contactCount, completeness }: { viewCount: number; contactCount: number; completeness: number }) {
    if (viewCount > 3 && contactCount === 0) {
      return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 whitespace-nowrap">Perfil sin conversión</span>;
    }
    if (completeness < 40) {
      return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700 whitespace-nowrap">Completar perfil</span>;
    }
    if (contactCount > 0) {
      return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700 whitespace-nowrap">Activo</span>;
    }
    return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 whitespace-nowrap">Sin actividad</span>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-navy tracking-tight">Todos los docentes</h1>
        <p className="text-gray-500 font-medium mt-1">{filteredFaculty.length} docentes</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "Todos", value: "all" },
          { label: "Verificados", value: "approved" },
          { label: "Pendientes", value: "pending" },
          { label: "Info requerida", value: "requires_info" },
          { label: "Rechazados", value: "rejected" },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={`/control/faculty?status=${tab.value}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === tab.value
                ? "bg-navy text-white"
                : "bg-white text-navy border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre</th>
                <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Perfil</th>
                <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Visitas</th>
                <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contactos</th>
                <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">PhD</th>
                <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">ANECA</th>
                <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Acción recomendada</th>
                <th className="text-right px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Último acceso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredFaculty.length === 0 ? (
                <tr><td colSpan={10} className="px-5 py-8 text-center text-sm text-gray-400">No hay docentes registrados</td></tr>
              ) : (
                filteredFaculty.map((f: any) => {
                  const fp = f._profile || {};
                  const completeness = fp._completeness ?? 0;
                  const viewCount = fp.view_count ?? 0;
                  const contactCount = contactCountMap[f.id] ?? 0;
                  return (
                    <tr key={f.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <Link
                          href={`/control/faculty/${f.id}`}
                          className="text-sm font-bold text-navy hover:text-talentia-blue truncate block max-w-[180px]"
                        >
                          {f.full_name || "Sin nombre"}
                        </Link>
                        {fp.headline && (
                          <p className="text-[11px] text-gray-400 truncate max-w-[180px]">{fp.headline}</p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{f.email || "—"}</td>

                      {/* Profile progress bar */}
                      <td className="px-5 py-3 min-w-[130px]">
                        <ProfileBar value={completeness} />
                      </td>

                      {/* Visits */}
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 font-bold">
                          <Eye size={13} className="text-gray-400" />
                          {viewCount}
                        </span>
                      </td>

                      {/* Contacts received */}
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 font-bold">
                          <MessageSquare size={13} className="text-gray-400" />
                          {contactCount}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-center">
                        {fp.is_phd ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-black"><GraduationCap size={10} /> PhD</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {fp.aneca_accreditation ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black"><Award size={10} /> ANECA</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <StatusBadge status={fp.estado_perfil} visibility={fp.visibility} />
                      </td>

                      {/* Recommended action */}
                      <td className="px-5 py-3 text-center">
                        <ActionBadge viewCount={viewCount} contactCount={contactCount} completeness={completeness} />
                      </td>

                      <td className="px-5 py-3 text-right text-sm text-gray-400">
                        {authUserMap[f.id] ? fmtDate(authUserMap[f.id]) : (
                          <span className="text-gray-300" title="Usando fecha de registro">{fmtDate(f.created_at)} <span className="text-[9px]">(Registro)</span></span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}