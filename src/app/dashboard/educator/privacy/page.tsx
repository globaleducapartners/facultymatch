import { createClient } from "@/lib/supabase-server";
import { ShieldCheck, Eye, EyeOff, Lock, UserPlus, Search, X, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { revalidatePath } from "next/cache";

export default async function PrivacyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: facultyProfile } = await supabase
    .from("faculty_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: visibilityRules } = await supabase
    .from("visibility_rules")
    .select("*, institution:institutions(name, country)")
    .eq("faculty_id", facultyProfile?.id)
    .eq("rule", "block");

  async function updateVisibility(formData: FormData) {
    "use server";
    const mode = formData.get("visibilityMode") as "public" | "institutions_only" | "hidden";
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase
      .from("faculty_profiles")
      .update({ visibility: mode })
      .eq("user_id", user!.id);
      
    revalidatePath("/dashboard/educator/privacy");
  }

  async function unblockInstitution(id: string) {
    "use server";
    const supabase = await createClient();
    await supabase.from("visibility_rules").delete().eq("id", id);
    revalidatePath("/dashboard/educator/privacy");
  }

  async function blockInstitution(formData: FormData) {
    "use server";
    const name = formData.get("institutionName") as string;
    if (!name) return;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: faculty } = await supabase.from("faculty_profiles").select("id").eq("user_id", user!.id).single();
    
    // In a real app, we would search for the institution ID. For MVP, we'll just mock this or assume we have the ID.
    // For now, let's just use a placeholder ID if we find an institution with that name or create one if it doesn't exist (not recommended for block but ok for MVP)
    const { data: inst } = await supabase.from("institutions").select("id").ilike("name", name).limit(1).single();
    
    if (inst) {
      await supabase.from("visibility_rules").insert({
        faculty_id: faculty?.id,
        institution_id: inst.id,
        rule: "block"
      });
      revalidatePath("/dashboard/educator/privacy");
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-navy">Visibilidad & Privacidad</h1>
        <p className="text-gray-500 font-medium">Tú tienes el control total de quién puede ver tu perfil académico.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          {/* Sección 1: Modo de visibilidad */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
                <Eye size={22} className="text-talentia-blue" />
                Modo de visibilidad
              </CardTitle>
              <CardDescription className="font-medium">
                Selecciona cómo quieres que las instituciones te encuentren.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateVisibility}>
                <RadioGroup name="visibilityMode" defaultValue={facultyProfile?.visibility || "public"} className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-100 transition-all cursor-pointer group">
                    <RadioGroupItem value="public" id="public" className="mt-1" />
                    <Label htmlFor="public" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-navy">Público</span>
                      </div>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed">Visible para cualquier usuario y motores de búsqueda.</p>
                    </Label>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-100 transition-all cursor-pointer group">
                    <RadioGroupItem value="institutions_only" id="institutions" className="mt-1" />
                    <Label htmlFor="institutions" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-navy">Solo instituciones</span>
                        <Badge className="bg-talentia-blue text-white text-[8px] font-black uppercase tracking-widest border-none">Recomendado</Badge>
                      </div>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed">Solo las instituciones verificadas en Talentia pueden ver tu perfil completo.</p>
                    </Label>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-100 transition-all cursor-pointer group">
                    <RadioGroupItem value="hidden" id="hidden" className="mt-1" />
                    <Label htmlFor="hidden" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-navy">Oculto</span>
                        <Lock size={14} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed">Nadie podrá encontrarte. Mantienes tu perfil pero no apareces en búsquedas.</p>
                    </Label>
                  </div>
                </RadioGroup>
                <div className="mt-8">
                  <Button type="submit" className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 px-10 rounded-xl shadow-lg shadow-blue-100">
                    Guardar configuración
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

            {/* Sección 2: Control por institución */}
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
                  <ShieldCheck size={22} className="text-energy-orange" />
                  Privacidad Profesional
                </CardTitle>
                <CardDescription className="font-medium">
                  Bloquea instituciones específicas para que nunca puedan ver tu perfil académico.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {facultyProfile?.membership_tier === 'professional' ? (
                  <form action={blockInstitution} className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      name="institutionName"
                      type="text" 
                      placeholder="Escribe el nombre del centro a bloquear..." 
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
                    />
                    <button type="submit" className="hidden">Bloquear</button>
                  </form>
                ) : (
                  <div className="p-8 rounded-2xl bg-blue-50/50 border border-blue-100 text-center space-y-4">
                    <Lock className="mx-auto text-talentia-blue" size={32} />
                    <div className="space-y-1">
                      <p className="font-black text-navy uppercase tracking-widest text-xs">Función Professional</p>
                      <p className="text-sm text-gray-500 font-medium">Actualiza a Professional para bloquear instituciones específicas y ocultar tu perfil de tu centro actual.</p>
                    </div>
                    <Button className="bg-talentia-blue hover:bg-blue-700 text-white font-black rounded-xl h-11 px-8 uppercase tracking-widest text-xs shadow-lg shadow-blue-100">
                      Mejorar plan · 9,99€
                    </Button>
                  </div>
                )}

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Instituciones bloqueadas ({visibilityRules?.length || 0})</h4>
                {visibilityRules && visibilityRules.length > 0 ? (
                  <div className="grid gap-3">
                    {visibilityRules.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-red-100 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-400 transition-colors">
                            <Lock size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-navy">{item.institution?.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{item.institution?.country}</p>
                          </div>
                        </div>
                        <form action={async () => { "use server"; await unblockInstitution(item.id); }}>
                          <button type="submit" className="p-2 text-gray-300 hover:text-red-600 transition-colors">
                            <X size={18} />
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-400 font-medium">No tienes ninguna institución bloqueada.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-8">
          {/* Sección 3: Invitaciones */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-navy text-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <UserPlus size={22} className="text-tech-cyan" />
                Invitaciones directas
              </CardTitle>
              <CardDescription className="text-gray-400 font-medium">
                Genera un enlace temporal para instituciones específicas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-tech-cyan shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-300 font-medium leading-relaxed">
                    Este enlace permitirá ver tu perfil incluso si está en modo &quot;Oculto&quot; o si la institución está bloqueada. Caduca en 7 días.
                  </p>
                </div>
                <Button className="w-full bg-tech-cyan hover:bg-cyan-500 text-navy font-black rounded-xl h-11 uppercase tracking-widest text-xs">
                  Generar enlace único
                </Button>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Enlaces activos</h4>
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <p className="text-xs text-white/40 font-medium">No hay enlaces activos.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 space-y-3">
            <h4 className="text-sm font-black text-energy-orange flex items-center gap-2">
              <ShieldCheck size={18} />
              Protección Anti-Ghosting
            </h4>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              En Talentia, las instituciones solo pueden contactarte si cumples con sus requisitos y tú permites la visibilidad. Tu privacidad es nuestra prioridad académica.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
