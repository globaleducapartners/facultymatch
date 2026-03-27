import { createClient } from "@/lib/supabase-server";
import { Settings, Mail, Lock, Bell, Trash2, ShieldCheck, Download, AlertTriangle, Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { StripeUpgradeButton } from "@/components/profile/StripeUpgradeButton";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: facultyProfile } = await supabase
    .from("faculty_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const isPro = profile?.plan === "faculty-pro";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-navy">Ajustes de cuenta</h1>
        <p className="text-gray-500 font-medium">Gestiona tu seguridad, notificaciones y datos privados.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Sección 1: Seguridad */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
                <ShieldCheck size={22} className="text-talentia-blue" />
                Seguridad & Acceso
              </CardTitle>
              <CardDescription className="font-medium">
                Gestiona cómo accedes a tu cuenta académica.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm text-gray-400">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Correo electrónico
                      </p>
                      <p className="text-sm font-bold text-navy">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="border-gray-200 text-navy font-bold rounded-xl h-10 px-6 hover:bg-gray-50 transition-colors"
                  >
                    Cambiar email
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm text-gray-400">
                      <Lock size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Contraseña
                      </p>
                      <p className="text-sm font-bold text-navy">••••••••••••</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="border-gray-200 text-navy font-bold rounded-xl h-10 px-6 hover:bg-gray-50 transition-colors"
                  >
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
              <CardDescription className="font-medium">
                Elige qué avisos quieres recibir en tu email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="divide-y divide-gray-50">
                {[
                  {
                    title: "Solicitudes de contacto",
                    desc: "Recibe un aviso cuando una institución quiera contactarte.",
                    checked: facultyProfile?.is_active,
                  },
                  {
                    title: "Estado de verificación",
                    desc: "Noticias sobre el progreso de tu verificación oficial.",
                    checked: true,
                  },
                  {
                    title: "Actualizaciones de la plataforma",
                    desc: "Novedades y recursos para potenciar tu carrera.",
                    checked: false,
                  },
                ].map((item) => (
                  <div key={item.title} className="py-4 flex items-center justify-between gap-8">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-navy">{item.title}</h4>
                      <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
                    </div>
                    <Switch
                      checked={item.checked ?? false}
                      className="bg-talentia-blue data-[state=checked]:bg-talentia-blue"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sección 3: GDPR */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
                <Download size={22} className="text-tech-cyan" />
                Tus datos (GDPR)
              </CardTitle>
              <CardDescription className="font-medium">
                Tienes derecho a exportar o eliminar tus datos en cualquier momento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <Button
                  variant="outline"
                  className="flex-1 w-full border-gray-100 hover:bg-gray-50 text-navy font-bold rounded-xl h-12 flex items-center justify-center gap-2"
                >
                  <Download size={18} /> Exportar mis datos
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 w-full border-red-100 hover:bg-red-50 text-red-600 font-bold rounded-xl h-12 flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} /> Eliminar mi cuenta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* Danger zone */}
          <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 space-y-6">
            <div className="flex items-center gap-2 text-navy">
              <AlertTriangle size={20} className="text-energy-orange" />
              <h4 className="text-sm font-black uppercase tracking-widest">Zona de riesgo</h4>
            </div>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Si eliminas tu cuenta, todos tus datos académicos, documentos y contactos se perderán
              permanentemente. Esta acción no se puede deshacer.
            </p>
            <Button
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 font-black uppercase tracking-widest text-[10px] p-0 h-auto"
            >
              Entiendo los riesgos
            </Button>
          </div>

          {/* Plan card */}
          {isPro ? (
            <div className="p-8 rounded-2xl bg-blue-50/50 border border-blue-100 text-center space-y-4">
              <Badge className="bg-talentia-blue text-white text-[8px] font-black uppercase tracking-widest border-none">
                Plan Profesional
              </Badge>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 size={20} className="text-green-500" />
                  <h4 className="text-lg font-black text-navy">Activo</h4>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Tienes acceso a todas las funciones profesionales.
                </p>
              </div>
              <div className="pt-2 space-y-2">
                {[
                  "Privacidad avanzada",
                  "Ocultar de tu institución",
                  "Invitaciones privadas",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                    <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 space-y-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-navy text-white text-[8px] font-black uppercase tracking-widest border-none">
                  Plan Gratuito
                </Badge>
                <span className="text-[10px] font-bold text-gray-400">ACTIVO</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-talentia-blue" />
                  <h4 className="text-base font-black text-navy">Pasa al Plan Profesional</h4>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Desbloquea funciones avanzadas de privacidad y visibilidad.
                </p>
              </div>
              <ul className="space-y-2">
                {[
                  "Ocultar perfil de tu institución actual",
                  "Gestión avanzada de privacidad",
                  "Invitaciones privadas ilimitadas",
                  "Soporte prioritario",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-talentia-blue shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="pt-2">
                <StripeUpgradeButton userEmail={user.email!} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
