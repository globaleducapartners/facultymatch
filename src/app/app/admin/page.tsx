import { createClient } from "@/lib/supabase-server";
import { Users, Building2, FileCheck, TrendingUp, ArrowUpRight, CheckCircle2, Clock, UserCheck, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Stats — count from user_profiles (all registered users)
  const { count: facultyCount } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "faculty");

  const { count: institutionCount } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "institution");

  const { count: verifiedCount } = await supabase
    .from("faculty_profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_verified", true);

  const { count: activeCount } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true });

  // Recent faculty users (all faculty-role users, with their faculty_profile if exists)
  const { data: recentFaculty } = await supabase
    .from("user_profiles")
    .select("*, faculty_profiles(*)")
    .eq("role", "faculty")
    .order("created_at", { ascending: false })
    .limit(5);

  // Recent institutions from user_profiles
  const { data: institutionUsers } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("role", "institution")
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Docentes Registrados", value: facultyCount ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50", href: "/app/admin/educators" },
    { label: "Instituciones", value: institutionCount ?? 0, icon: Building2, color: "text-orange-600", bg: "bg-orange-50", href: "/app/admin/institutions" },
    { label: "Perfiles Verificados", value: verifiedCount ?? 0, icon: UserCheck, color: "text-green-600", bg: "bg-green-50", href: "/app/admin/verifications" },
    { label: "Perfiles Activos", value: activeCount ?? 0, icon: TrendingUp, color: "text-cyan-600", bg: "bg-cyan-50", href: "/app/admin" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-navy">Panel de Administración</h1>
        <p className="text-gray-500 font-medium">Gestión global de la red FacultyMatch.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Link key={idx} href={stat.href}>
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`${stat.bg} ${stat.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                    <stat.icon size={24} />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-black text-navy">{stat.value}</p>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Faculty */}
        <Card className="lg:col-span-7 border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold text-navy">Docentes Recientes</CardTitle>
              <CardDescription className="font-medium">Últimas altas de docentes en la plataforma.</CardDescription>
            </div>
            <Button variant="link" asChild className="text-talentia-blue font-bold text-sm">
              <Link href="/app/admin/educators">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {recentFaculty && recentFaculty.length > 0 ? (
                  recentFaculty.map((u: any) => {
                    const fp = Array.isArray(u.faculty_profiles) ? u.faculty_profiles[0] : u.faculty_profiles;
                    const initials = u.full_name?.substring(0, 2).toUpperCase() ?? "??";
                    return (
                      <div key={u.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-navy">{u.full_name ?? "Sin nombre"}</p>
                            <p className="text-xs text-gray-400 font-medium">
                              {fp?.headline ?? "Sin perfil"} · {fp?.location ?? "—"} · {new Date(u.created_at).toLocaleDateString("es-ES")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={`${fp?.is_verified ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"} border-none text-[10px] font-black uppercase`}>
                            {fp?.is_verified ? "Verificado" : "Pendiente"}
                          </Badge>
                          <Badge className={`${u.onboarding_completed ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"} border-none text-[10px] font-black uppercase`}>
                            {u.onboarding_completed ? "Onboarding ✓" : "Nuevo"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="p-12 text-center text-gray-400 font-medium italic">
                  No hay docentes registrados aún.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Institutions */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold text-navy">Centros Recientes</CardTitle>
                <CardDescription className="font-medium text-xs">Últimas instituciones registradas.</CardDescription>
              </div>
              <Button variant="link" asChild className="text-talentia-blue font-bold text-sm">
                <Link href="/app/admin/institutions">Ver todas</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {institutionUsers && institutionUsers.length > 0 ? (
                  institutionUsers.map((u: any) => (
                    <div key={u.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700 font-black text-xs flex-shrink-0">
                          {u.full_name?.substring(0, 2).toUpperCase() ?? "??"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-navy">{u.full_name ?? "Sin nombre"}</p>
                          <p className="text-[10px] text-gray-400 font-medium">
                            {new Date(u.created_at).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-orange-50 text-orange-600 border-none text-[10px] font-black uppercase">
                        Institución
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400 font-medium italic text-sm">
                    No hay instituciones registradas aún.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-navy text-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start bg-white/5 hover:bg-white/10 text-white border-none rounded-xl h-11 font-bold group">
                <Link href="/app/admin/educators">
                  <Users size={16} className="mr-3 text-tech-cyan" />
                  Ver todos los docentes
                  <ArrowUpRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              </Button>
              <Button asChild className="w-full justify-start bg-white/5 hover:bg-white/10 text-white border-none rounded-xl h-11 font-bold group">
                <Link href="/app/admin/institutions">
                  <Building2 size={16} className="mr-3 text-energy-orange" />
                  Ver todos los centros
                  <ArrowUpRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              </Button>
              <Button asChild className="w-full justify-start bg-white/5 hover:bg-white/10 text-white border-none rounded-xl h-11 font-bold group">
                <Link href="/app/admin/verifications">
                  <FileCheck size={16} className="mr-3 text-cyan-400" />
                  Cola de verificación
                  <ArrowUpRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
