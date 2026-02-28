import { createClient } from "@/lib/supabase-server";
import { Settings, Mail, Lock, Bell, Trash2, ShieldCheck, Download, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { revalidatePath } from "next/cache";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: educatorProfile } = await supabase
    .from("educator_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  async function updateNotifications(enabled: boolean) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("educator_profiles").update({ notifications_enabled: enabled }).eq("id", user!.id);
    revalidatePath("/app/faculty/settings");
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-navy">Ajustes de cuenta</h1>
        <p className="text-gray-500 font-medium">Gestiona tu seguridad, notificaciones y datos privados.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Sección 1: Cuenta & Seguridad */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
                <ShieldCheck size={22} className="text-talentia-blue" />
                Seguridad & Acceso
              </CardTitle>
              <CardDescription className="font-medium">Gestiona cómo accedes a tu cuenta académica.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm text-gray-400">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Correo electrónico</p>
                      <p className="text-sm font-bold text-navy">{user.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-gray-200 text-navy font-bold rounded-xl h-10 px-6 hover:bg-gray-50 transition-colors">
                    Cambiar email
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm text-gray-400">
                      <Lock size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contraseña</p>
                      <p className="text-sm font-bold text-navy">••••••••••••</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-gray-200 text-navy font-bold rounded-xl h-10 px-6 hover:bg-gray-50 transition-colors">
                    Actualizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección 2: Notificaciones */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
                <Bell size={22} className="text-energy-orange" />
                Preferencias de Notificaciones
              </CardTitle>
              <CardDescription className="font-medium">Elige qué avisos quieres recibir en tu email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="divide-y divide-gray-50">
                <div className="py-4 flex items-center justify-between gap-8">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-navy">Solicitudes de contacto</h4>
                    <p className="text-xs text-gray-500 font-medium">Recibe un aviso cuando una institución quiera contactarte.</p>
                  </div>
                  <Switch checked={educatorProfile?.notifications_enabled} className="bg-talentia-blue data-[state=checked]:bg-talentia-blue" />
                </div>

                <div className="py-4 flex items-center justify-between gap-8">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-navy">Estado de verificación</h4>
                    <p className="text-xs text-gray-500 font-medium">Noticias sobre el progreso de tu verificación oficial.</p>
                  </div>
                  <Switch checked={true} className="bg-talentia-blue data-[state=checked]:bg-talentia-blue" />
                </div>

                <div className="py-4 flex items-center justify-between gap-8">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-navy">Actualizaciones de la plataforma</h4>
                    <p className="text-xs text-gray-500 font-medium">Novedades y recursos para potenciar tu carrera.</p>
                  </div>
                  <Switch checked={false} className="bg-talentia-blue data-[state=checked]:bg-talentia-blue" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección 3: Datos & GDPR */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
                <Download size={22} className="text-tech-cyan" />
                Tus datos (GDPR)
              </CardTitle>
              <CardDescription className="font-medium">Tienes derecho a exportar o eliminar tus datos en cualquier momento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <Button variant="outline" className="flex-1 w-full border-gray-100 hover:bg-gray-50 text-navy font-bold rounded-xl h-12 flex items-center justify-center gap-2">
                  <Download size={18} /> Exportar mis datos
                </Button>
                <Button variant="outline" className="flex-1 w-full border-red-100 hover:bg-red-50 text-red-600 font-bold rounded-xl h-12 flex items-center justify-center gap-2">
                  <Trash2 size={18} /> Eliminar mi cuenta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 space-y-6">
            <div className="flex items-center gap-2 text-navy">
              <AlertTriangle size={20} className="text-energy-orange" />
              <h4 className="text-sm font-black uppercase tracking-widest">Zona de riesgo</h4>
            </div>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Si eliminas tu cuenta, todos tus datos académicos, documentos y contactos se perderán permanentemente. Esta acción no se puede deshacer.
            </p>
            <div className="pt-2">
              <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 font-black uppercase tracking-widest text-[10px] p-0 h-auto">
                Entiendo los riesgos
              </Button>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-blue-50/50 border border-blue-100 text-center space-y-4">
            <Badge className="bg-talentia-blue text-white text-[8px] font-black uppercase tracking-widest border-none">Plan Académico</Badge>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-navy">Gratis de por vida</h4>
              <p className="text-xs text-gray-500 font-medium">Para todos los docentes e investigadores del mundo.</p>
            </div>
            <div className="pt-4">
              <Button className="w-full bg-navy text-white font-bold rounded-xl h-11 hover:bg-black transition-colors">
                Ver otros planes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
