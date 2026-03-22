import { createClient } from "@/lib/supabase-server";
import { Building2, MapPin, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminInstitutionsPage() {
  const supabase = await createClient();

  // Get institution users from user_profiles (role = institution)
  const { data: institutionUsers } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("role", "institution")
    .order("created_at", { ascending: false });

  // Also get institutions table entries
  const { data: institutions } = await supabase
    .from("institutions")
    .select("*")
    .order("updated_at", { ascending: false });

  const total = institutionUsers?.length ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-navy">Instituciones</h1>
        <p className="text-gray-500 font-medium">Todos los centros e instituciones registradas en la plataforma.</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl text-orange-700 font-bold text-sm">
          <Building2 size={16} /> {total} instituciones registradas
        </div>
      </div>

      {/* Institution users */}
      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-navy">Cuentas Institucionales</CardTitle>
          <CardDescription>Usuarios registrados con rol de institución.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {institutionUsers && institutionUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-widest">Institución</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-widest">ID usuario</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-widest">Onboarding</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-widest">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {institutionUsers.map((u: any) => {
                    const initials = u.full_name?.substring(0, 2).toUpperCase() ?? "??";
                    return (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700 font-black text-xs flex-shrink-0">
                              {initials}
                            </div>
                            <p className="font-bold text-navy">{u.full_name ?? "Sin nombre"}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400 font-mono">
                          {u.id.substring(0, 12)}…
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={`${u.onboarding_completed ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-600"} border-none text-[10px] font-black uppercase`}>
                            {u.onboarding_completed ? "Completado" : "Pendiente"}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400 font-medium">
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
              No hay instituciones registradas aún.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Institutions table entries */}
      {institutions && institutions.length > 0 && (
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-navy">Perfiles Institucionales</CardTitle>
            <CardDescription>Datos de las instituciones en la base de datos.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-widest">Nombre</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-widest">Ubicación</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-widest">Web</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-widest">Actualización</th>
                  </tr>
                </thead>
                <tbody>
                  {institutions.map((inst: any) => (
                    <tr key={inst.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-navy">{inst.name}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                          {inst.location ? <><MapPin size={12} />{inst.location}</> : "—"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {inst.website ? (
                          <a href={inst.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 text-xs font-medium hover:underline">
                            <Globe size={12} /> {inst.website.replace(/^https?:\/\//, "").substring(0, 30)}
                          </a>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-400 font-medium">
                        {new Date(inst.updated_at).toLocaleDateString("es-ES")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
