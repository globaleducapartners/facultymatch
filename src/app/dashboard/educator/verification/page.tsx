import { createClient } from "@/lib/supabase-server";
import { CheckCircle2, ShieldCheck, Upload, FileText, GraduationCap, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { revalidatePath } from "next/cache";

export default async function VerificationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: educatorProfile } = await supabase
    .from("educator_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const status = educatorProfile?.verification_status || 'none';
  
  const steps = [
    { id: 1, label: "Perfil básico completo", completed: (educatorProfile?.profile_score || 0) >= 40, icon: CheckCircle2 },
    { id: 2, label: "Subida de Curriculum (PDF)", completed: !!educatorProfile?.resume_url, icon: FileText },
    { id: 3, label: "Acreditación de Doctorado", completed: false, icon: GraduationCap },
    { id: 4, label: "Experiencia docente contrastada", completed: false, icon: GraduationCap },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  async function requestVerification() {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("educator_profiles").update({ verification_status: 'pending' }).eq("id", user!.id);
    revalidatePath("/dashboard/educator/verification");
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">Verificación académica</h1>
          <p className="text-gray-500 font-medium">Eleva tu credibilidad institucional con el sello Verificado de Talentia.</p>
        </div>
        <Badge variant="outline" className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2 ${
          status === 'verified' ? 'bg-tech-cyan text-white border-tech-cyan' :
          status === 'pending' ? 'bg-orange-50 text-energy-orange border-energy-orange/30' :
          'bg-gray-50 text-gray-400 border-gray-100'
        }`}>
          {status === 'none' ? 'Sin verificar' : 
           status === 'pending' ? 'En revisión' : 
           status === 'verified' ? 'Verificado' : 
           status === 'rejected' ? 'Rechazado' : status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-navy">Checklist de requisitos</CardTitle>
              <CardDescription className="font-medium">Debes cumplir estos puntos para solicitar la verificación oficial.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  <span>Progreso de verificación</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-gray-100" />
              </div>

              <div className="grid gap-4">
                {steps.map((step) => (
                  <div key={step.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    step.completed ? "bg-blue-50/30 border-blue-100" : "bg-gray-50/50 border-gray-100"
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        step.completed ? "bg-white text-talentia-blue shadow-sm" : "bg-white text-gray-300 shadow-sm"
                      }`}>
                        <step.icon size={20} />
                      </div>
                      <span className={`text-sm font-bold ${step.completed ? "text-navy" : "text-gray-500"}`}>{step.label}</span>
                    </div>
                    {step.completed ? (
                      <CheckCircle2 size={20} className="text-tech-cyan" />
                    ) : (
                      <Button variant="ghost" className="text-talentia-blue hover:text-blue-700 font-bold text-xs p-0 h-auto uppercase tracking-widest">
                        Completar <ArrowRight size={14} className="ml-1" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4">
                {status === 'pending' ? (
                  <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 flex flex-col items-center text-center space-y-3">
                    <Loader2 className="animate-spin text-energy-orange" size={24} />
                    <h4 className="text-sm font-bold text-navy">Tu solicitud está en revisión</h4>
                    <p className="text-xs text-gray-500 font-medium max-w-sm">Nuestro equipo académico está validando tus documentos. Recibirás una notificación en un plazo de 48-72 horas.</p>
                  </div>
                ) : status === 'verified' ? (
                  <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center text-center space-y-3">
                    <ShieldCheck className="text-talentia-blue" size={32} />
                    <h4 className="text-sm font-bold text-navy">¡Eres un docente Verificado!</h4>
                    <p className="text-xs text-gray-500 font-medium max-w-sm">Tu perfil ahora goza de máxima visibilidad y confianza institucional en la red Talentia.</p>
                  </div>
                ) : (
                  <form action={requestVerification}>
                    <Button 
                      type="submit"
                      disabled={progress < 100}
                      className={`w-full h-14 rounded-xl font-bold transition-all shadow-lg ${
                        progress === 100 
                        ? "bg-talentia-blue hover:bg-blue-700 text-white shadow-blue-100" 
                        : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                      }`}
                    >
                      Solicitar verificación oficial
                    </Button>
                    {progress < 100 && (
                      <p className="text-center text-[10px] text-gray-400 font-medium mt-3 uppercase tracking-widest">
                        Necesitas el 100% para habilitar la solicitud.
                      </p>
                    )}
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-navy text-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Upload size={22} className="text-tech-cyan" />
                Subir documentos
              </CardTitle>
              <CardDescription className="text-gray-400 font-medium">Archivos necesarios para la validación.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl text-center space-y-4 hover:bg-white/5 transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto group-hover:bg-tech-cyan group-hover:text-navy transition-all">
                  <Upload size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold">Arrastra o selecciona un archivo</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Solo PDF, máx 10MB</p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Documentos subidos</h4>
                {educatorProfile?.resume_url ? (
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-tech-cyan" />
                      <span className="text-xs font-medium truncate max-w-[120px]">CV_Academico.pdf</span>
                    </div>
                    <Badge className="bg-tech-cyan text-navy text-[8px] font-black uppercase tracking-widest border-none px-2 py-0.5">Listo</Badge>
                  </div>
                ) : (
                  <p className="text-xs text-white/20 italic text-center py-4">No hay documentos todavía.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 space-y-4">
            <div className="flex items-center gap-2 text-talentia-blue">
              <ShieldCheck size={20} />
              <h4 className="text-sm font-bold">¿Por qué verificarse?</h4>
            </div>
            <ul className="space-y-3">
              {[
                "Aumenta x5 tus contactos",
                "Certifica tu grado de PhD",
                "Badge exclusivo de confianza",
                "Prioridad en resultados",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-tech-cyan" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
