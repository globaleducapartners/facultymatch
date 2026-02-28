import { createClient } from "@/lib/supabase-server";
import { Users, Building2, FileCheck, Tags, AlertCircle, TrendingUp, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();
  
  // Stats
  const { count: facultyCount } = await supabase.from("faculty_profiles").select("*", { count: "exact", head: true });
  const { count: institutionCount } = await supabase.from("institutions").select("*", { count: "exact", head: true });
    const { data: recentFaculty } = await supabase.from("faculty_profiles").select("*").order("updated_at", { ascending: false }).limit(3);
    const { data: recentInstitutions } = await supabase.from("institutions").select("*").order("created_at", { ascending: false }).limit(3);
    const { data: recentLogs } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(5);

    const stats = [
      { label: "Docentes Totales", value: facultyCount || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
      { label: "Instituciones", value: institutionCount || 0, icon: Building2, color: "text-orange-600", bg: "bg-orange-50" },
      { label: "Verificaciones Pendientes", value: pendingVerifications || 0, icon: FileCheck, color: "text-cyan-600", bg: "bg-cyan-50" },
      { label: "Solicitudes (Demand)", value: "124", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    ];


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-navy">Panel de Administración</h1>
        <p className="text-gray-500 font-medium">Gestión global de la red Talentia.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-none shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
                <Badge variant="outline" className="border-green-100 text-green-600 bg-green-50/50 text-[10px] font-bold">
                  +12% este mes
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-black text-navy">{stat.value}</p>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Verifications Queue */}
        <Card className="lg:col-span-8 border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-navy">Cola de Verificación</CardTitle>
              <CardDescription className="font-medium">Perfiles esperando revisión documental.</CardDescription>
            </div>
            <Button variant="link" asChild className="text-talentia-blue font-bold text-sm">
              <Link href="/app/admin/verifications">Ver todas</Link>
            </Button>
          </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {recentFaculty && recentFaculty.length > 0 ? (
                  recentFaculty.map((f: any) => (
                    <div key={f.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-talentia-blue/10 flex items-center justify-center text-talentia-blue overflow-hidden border border-blue-50 font-black">
                            {f.avatar_url ? (
                              <img src={f.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              f.full_name?.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-navy">{f.full_name}</p>
                            <p className="text-xs text-gray-500 font-medium">{f.headline || 'Docente'} · {new Date(f.updated_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${f.verified === 'none' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-talentia-blue'} border-none text-[10px] font-black uppercase tracking-widest`}>
                          {f.verified === 'none' ? 'Pendiente' : f.verified}
                        </Badge>
                        <Button size="sm" className="bg-talentia-blue hover:bg-blue-700 text-white font-bold rounded-lg h-9">
                          Gestionar
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-gray-400 font-medium italic">No hay perfiles registrados.</div>
                )}
              </div>
            </CardContent>

        </Card>

        {/* Quick Actions & Maintenance */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-navy text-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-white/5 hover:bg-white/10 text-white border-none rounded-xl h-12 font-bold group">
                <Tags size={18} className="mr-3 text-tech-cyan" />
                Gestionar Taxonomía
                <ArrowUpRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-all" />
              </Button>
              <Button className="w-full justify-start bg-white/5 hover:bg-white/10 text-white border-none rounded-xl h-12 font-bold group">
                <Building2 size={18} className="mr-3 text-energy-orange" />
                Validar Institución
                <ArrowUpRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-all" />
              </Button>
              <Button className="w-full justify-start bg-white/5 hover:bg-white/10 text-white border-none rounded-xl h-12 font-bold group">
                <AlertCircle size={18} className="mr-3 text-cyan-400" />
                Reportes de Moderación
                <Badge className="ml-auto bg-energy-orange text-white border-none text-[10px]">2</Badge>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-navy">Logs del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentLogs && recentLogs.length > 0 ? (
                recentLogs.map((log: { id: string; action: string; created_at: string }) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className="mt-1">
                      <CheckCircle2 size={14} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy">{log.action}</p>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{new Date(log.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 font-medium text-center py-4 italic">No hay actividad reciente.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
