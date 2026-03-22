import { createClient } from "@/lib/supabase-server";
import { Users, UserCheck, MapPin, BadgeCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminEducatorsPage() {
  const supabase = await createClient();

  // Get all faculty users with their faculty_profile if they have one
  const { data: facultyUsers } = await supabase
    .from("user_profiles")
    .select("*, faculty_profiles(*)")
    .eq("role", "faculty")
    .order("created_at", { ascending: false });

  const total = facultyUsers?.length ?? 0;
  const withProfile = facultyUsers?.filter((u: any) => {
    const fp = Array.isArray(u.faculty_profiles) ? u.faculty_profiles[0] : u.faculty_profiles;
    return !!fp;
  }).length ?? 0;
  const verified = facultyUsers?.filter((u: any) => {
    const fp = Array.isArray(u.faculty_profiles) ? u.faculty_profiles[0] : u.faculty_profiles;
    return fp?.is_verified;
  }).length ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-navy">Docentes</h1>
        <p className="text-gray-500 font-medium">Todos los docentes registrados en la plataforma.</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl text-blue-700 font-bold text-sm">
          <Users size={16} /> {total} registrados
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-xl text-purple-700 font-bold text-sm">
          <BadgeCheck size={16} /> {withProfile} con perfil completo
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl text-green-700 font-bold text-sm">
          <UserCheck size={16} /> {verified} verificados
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-navy">Listado de Docentes</CardTitle>
          <CardDescription>Todos los usuarios con rol docente y su estado de perfil.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {facultyUsers && facultyUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-widest">Docente</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-widest">Especialidad</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-widest">Ubicación</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-widest">Estado</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-widest">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {facultyUsers.map((u: any) => {
                    const fp = Array.isArray(u.faculty_profiles) ? u.faculty_profiles[0] : u.faculty_profiles;
                    const initials = u.full_name?.substring(0, 2).toUpperCase() ?? "??";
                    const areas = Array.isArray(fp?.faculty_areas) ? fp.faculty_areas.slice(0, 2) : [];
                    return (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-xs flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-bold text-navy text-sm">{u.full_name ?? "Sin nombre"}</p>
                              <p className="text-xs text-gray-400">{u.id.substring(0, 8)}…</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {areas.length > 0 ? areas.map((a: string, i: number) => (
                              <Badge key={i} className="bg-blue-50 text-blue-700 border-none text-[10px] font-bold">{a}</Badge>
                            )) : <span className="text-gray-300 text-xs">Sin perfil aún</span>}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                            {fp?.location ? <><MapPin size={12} />{fp.location}</> : "—"}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                            <Badge className={`${fp?.is_verified ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"} border-none text-[10px] font-black uppercase w-fit`}>
                              {fp?.is_verified ? "Verificado" : "Sin verificar"}
                            </Badge>
                            <Badge className={`${u.onboarding_completed ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"} border-none text-[10px] font-black uppercase w-fit`}>
                              {u.onboarding_completed ? "Perfil completo" : "Nuevo usuario"}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400 font-medium whitespace-nowrap">
                          {new Date(u.created_at).toLocaleDateString("es-ES")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center text-gray-400 font-medium italic">
              No hay docentes registrados aún.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
