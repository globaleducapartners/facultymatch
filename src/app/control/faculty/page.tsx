import { createAdminClient } from "@/lib/supabase-server";
import Link from "next/link";
import { Search, CheckCircle2, XCircle, Clock, EyeOff, Eye, GraduationCap, Award, FileCheck } from "lucide-react";

function StatusBadge({ status, visibility }: { status?: string | null; visibility?: string | null }) {
  if (visibility === "hidden") {
    return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 flex items-center gap-1"><EyeOff size={10} /> Oculto</span>;
  }
  if (status === "approved") return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle2 size={10} /> Verificado</span>;
  if (status === "rejected") return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1"><XCircle size={10} /> Rechazado</span>;
  if (status === "requires_info") return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Info requerida</span>;
  return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1"><Clock size={10} /> Pendiente</span>;
}

export default async function FacultyListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const admin = createAdminClient();
  const params = await searchParams;

  let query = admin
    .from("user_profiles")
    .select("id, full_name, email, created_at, verification_status, onboarding_completed")
    .eq("role", "faculty")
    .order("created_at", { ascending: false });

  if (params.status && params.status !== "all") {
    if (params.status === "pending") {
      query = query.or("verification_status.eq.pending,verification_status.is.null");
    } else {
      query = query.eq("verification_status", params.status);
    }
  }

  const { data: faculty } = await query.limit(200);

  // Fetch faculty_profiles for additional info (view_count, visibility, completeness, etc.)
  let profileMap: Record<string, any> = {};
  if (faculty?.length) {
    const ids = faculty.map((f) => f.id);
    const { data: profiles } = await admin
      .from("faculty_profiles")
      .select("user_id, view_count, visibility, headline, country, profile_completeness, is_phd, aneca_accreditation")
      .in("user_id", ids);
    if (profiles) {
      profiles.forEach((p: any) => { profileMap[p.user_id] = p; });
    }
  }

  // Fetch auth.users metadata for last_sign_in_at
  let authUserMap: Record<string, string | null> = {};
  try {
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (authData?.users) {
      authData.users.forEach((u: any) => {
        authUserMap[u.id] = u.last_sign_in_at || null;
      });
    }
  } catch (e) {
    // last_sign_in_at not critical; fallback to user_profiles.created_at
  }

  function fmtDate(iso: string | null | undefined) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  }

  const statusFilter = params.status || "all";

  function ProfileBar({ value }: { value: number | null | undefined }) {
    const pct = value ?? 0;
    let color = "";
    if (pct >= 80) color = "bg-green-500";
    else if (pct >= 50) color = "bg-yellow-500";
    else color = "bg-orange-400";
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
          <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <span className="text-xs font-bold text-gray-500 w-8 text-right">{pct}%</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-navy tracking-tight">Todos los docentes</h1>
        <p className="text-gray-500 font-medium mt-1">{faculty?.length ?? 0} docentes registrados</p>
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
                <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">País</th>
                <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Perfil</th>
                <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">PhD</th>
                <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">ANECA</th>
                <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Visitas</th>
                <th className="text-right px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Último acceso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(faculty ?? []).length === 0 ? (
                <tr><td colSpan={9} className="px-5 py-8 text-center text-sm text-gray-400">No hay docentes registrados</td></tr>
              ) : (
                (faculty ?? []).map((f) => {
                  const fp = profileMap[f.id] || {};
                  return (
                    <tr key={f.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <Link
                          href={`/control/faculty/${f.id}`}
                          className="text-sm font-bold text-navy hover:text-talentia-blue truncate block max-w-[200px]"
                        >
                          {f.full_name || "Sin nombre"}
                        </Link>
                        {fp.headline && (
                          <p className="text-[11px] text-gray-400 truncate max-w-[200px]">{fp.headline}</p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{f.email || "—"}</td>
                      <td className="px-5 py-3 text-sm text-gray-500">{fp.country || "—"}</td>
                      <td className="px-5 py-3 min-w-[120px]">
                        <ProfileBar value={fp.profile_completeness} />
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
                        <StatusBadge status={f.verification_status} visibility={fp.visibility} />
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 font-bold">
                          <Eye size={13} className="text-gray-400" />
                          {fp.view_count ?? 0}
                        </span>
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