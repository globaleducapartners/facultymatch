import { createAdminClient } from "@/lib/supabase-server";
import Link from "next/link";
import { Search, CheckCircle2, XCircle, Clock, EyeOff, GraduationCap } from "lucide-react";

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

  // Fetch faculty_profiles for additional info (view_count, visibility)
  let profileMap: Record<string, any> = {};
  if (faculty?.length) {
    const ids = faculty.map((f) => f.id);
    const { data: profiles } = await admin
      .from("faculty_profiles")
      .select("user_id, view_count, visibility, headline, country")
      .in("user_id", ids);
    if (profiles) {
      profiles.forEach((p: any) => { profileMap[p.user_id] = p; });
    }
  }

  function fmtDate(iso: string | null | undefined) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  }

  const statusFilter = params.status || "all";

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
                <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Visitas</th>
                <th className="text-right px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(faculty ?? []).length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No hay docentes registrados</td></tr>
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
                      <td className="px-5 py-3 text-center">
                        <StatusBadge status={f.verification_status} visibility={fp.visibility} />
                      </td>
                      <td className="px-5 py-3 text-center text-sm text-gray-500 font-bold">
                        {fp.view_count ?? 0}
                      </td>
                      <td className="px-5 py-3 text-right text-sm text-gray-400">{fmtDate(f.created_at)}</td>
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