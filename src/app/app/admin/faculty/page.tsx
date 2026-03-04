import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { Users, ShieldCheck, Mail, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function AdminFacultyPage() {
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  if (!currentUser) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    redirect("/dashboard");
  }

  // Join faculty_profiles + user_profiles to see GDPR consents
  const { data: faculty, error } = await supabase
    .from("faculty_profiles")
    .select(`
      id,
      full_name,
      headline,
      location,
      visibility,
      is_active,
      user_profiles (
        terms_accepted_at,
        privacy_accepted_at,
        marketing_opt_in
      )
    `)
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching faculty list:", error);
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-navy tracking-tight">Docentes Registrados</h1>
          <p className="text-gray-500 font-medium">Gestión y auditoría de perfiles académicos y consentimientos GDPR.</p>
        </div>
        <div className="flex gap-2 bg-talentia-blue/10 px-4 py-2 rounded-2xl">
          <Users size={20} className="text-talentia-blue" />
          <span className="font-bold text-talentia-blue">{faculty?.length || 0} Registrados</span>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-blue-900/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Docente</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Ubicación</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Estado / Visibilidad</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Consentimiento GDPR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {faculty?.map((f: any) => (
                <tr key={f.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-navy group-hover:text-talentia-blue transition-colors leading-tight">
                        {f.full_name || "Sin nombre"}
                      </span>
                      <span className="text-xs text-gray-400 font-medium mt-0.5">{f.headline || "Sin titular académico"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase tracking-tight italic">
                      <MapPin size={14} className="text-talentia-blue/40" />
                      {f.location || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                        f.visibility === 'public' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      )}>
                        {f.visibility}
                      </span>
                      {f.is_active ? (
                        <span className="w-2 h-2 rounded-full bg-talentia-blue animate-pulse" title="Activo" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-gray-200" title="Inactivo" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex gap-3">
                      <div 
                        title={f.user_profiles?.terms_accepted_at ? `Términos aceptados el ${new Date(f.user_profiles.terms_accepted_at).toLocaleDateString()}` : "Términos no aceptados"} 
                        className={cn(
                          "p-1.5 rounded-lg flex items-center justify-center transition-all",
                          f.user_profiles?.terms_accepted_at ? "bg-blue-50 text-blue-500 shadow-sm shadow-blue-100" : "bg-red-50 text-red-300"
                        )}
                      >
                        <ShieldCheck size={18} />
                      </div>
                      <div 
                        title={f.user_profiles?.privacy_accepted_at ? `Privacidad aceptada el ${new Date(f.user_profiles.privacy_accepted_at).toLocaleDateString()}` : "Privacidad no aceptada"} 
                        className={cn(
                          "p-1.5 rounded-lg flex items-center justify-center transition-all",
                          f.user_profiles?.privacy_accepted_at ? "bg-blue-50 text-blue-500 shadow-sm shadow-blue-100" : "bg-red-50 text-red-300"
                        )}
                      >
                        <FileCheck size={18} className="rotate-3" />
                      </div>
                      <div 
                        title={f.user_profiles?.marketing_opt_in ? "Acepta comunicaciones comerciales" : "Rechaza comunicaciones comerciales"} 
                        className={cn(
                          "p-1.5 rounded-lg flex items-center justify-center transition-all",
                          f.user_profiles?.marketing_opt_in ? "bg-purple-50 text-purple-500 shadow-sm shadow-purple-100" : "bg-gray-50 text-gray-300"
                        )}
                      >
                        <Mail size={18} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {faculty?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No hay docentes registrados todavía.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FileCheck({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  );
}
