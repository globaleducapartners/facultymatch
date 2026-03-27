import { createClient } from "@/lib/supabase-server";
import {
  CheckCircle2, ShieldCheck, Upload, FileText, GraduationCap,
  AlertCircle, ArrowRight, Loader2, Languages, MapPin, Eye,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CVUpload } from "@/components/profile/CVUpload";
import { revalidatePath } from "next/cache";

export default async function VerificationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("verification_status, verification_notes")
    .eq("id", user.id)
    .single();

  const { data: facultyProfile } = await supabase
    .from("faculty_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: documents } = await supabase
    .from("faculty_documents")
    .select("*")
    .eq("faculty_id", user.id)
    .order("created_at", { ascending: false });

  const verificationStatus = userProfile?.verification_status || "pending";
  const verificationNotes = userProfile?.verification_notes;

  const hasIdDocument = (documents?.length ?? 0) > 0;
  const hasLanguages = (facultyProfile?.languages?.length ?? 0) > 0;
  const hasAreas = (facultyProfile?.faculty_areas?.length ?? 0) > 0;

  const steps = [
    {
      id: 1,
      label: "Titular académico",
      completed: !!facultyProfile?.headline,
      icon: FileText,
      href: "/app/faculty/profile?tab=basic",
    },
    {
      id: 2,
      label: "Localización definida",
      completed: !!(facultyProfile?.location || (facultyProfile?.city && facultyProfile?.country)),
      icon: MapPin,
      href: "/app/faculty/profile?tab=basic",
    },
    {
      id: 3,
      label: "Experiencia docente (años)",
      completed: (facultyProfile?.years_experience ?? 0) > 0,
      icon: GraduationCap,
      href: "/app/faculty/profile?tab=experience",
    },
    {
      id: 4,
      label: "Idiomas indicados",
      completed: hasLanguages,
      icon: Languages,
      href: "/app/faculty/profile?tab=idiomas",
    },
    {
      id: 5,
      label: "Área de especialidad",
      completed: hasAreas,
      icon: GraduationCap,
      href: "/app/faculty/specialties",
    },
    {
      id: 6,
      label: "Documento de identidad",
      completed: !!hasIdDocument,
      icon: Upload,
      href: "#documents",
    },
    {
      id: 7,
      label: "Perfil público",
      completed: facultyProfile?.visibility === "public",
      icon: Eye,
      href: "/app/faculty/privacy",
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  async function requestVerification() {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("user_profiles")
      .update({ verification_status: "pending" })
      .eq("id", user.id);
    revalidatePath("/app/faculty/verification");
  }

  const statusBadge = {
    approved: { label: "Verificado", cls: "bg-tech-cyan text-white border-tech-cyan" },
    pending: { label: "En revisión", cls: "bg-orange-50 text-energy-orange border-energy-orange/30" },
    requires_info: { label: "Requiere info", cls: "bg-blue-50 text-talentia-blue border-talentia-blue/30" },
    rejected: { label: "Rechazado", cls: "bg-red-50 text-red-600 border-red-200" },
  }[verificationStatus] ?? { label: "Sin verificar", cls: "bg-gray-50 text-gray-400 border-gray-100" };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">Verificación académica</h1>
          <p className="text-gray-500 font-medium">
            Eleva tu credibilidad institucional con el sello Verificado de FacultyMatch.
          </p>
        </div>
        <Badge
          variant="outline"
          className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2 ${statusBadge.cls}`}
        >
          {statusBadge.label}
        </Badge>
      </div>

      {verificationStatus === "requires_info" && verificationNotes && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-talentia-blue shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-900 text-sm">Información requerida</p>
            <p className="text-sm text-blue-700 mt-1">{verificationNotes}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-navy">Checklist de requisitos</CardTitle>
              <CardDescription className="font-medium">
                Debes cumplir estos puntos para solicitar la verificación oficial.
              </CardDescription>
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
                  <div
                    key={step.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      step.completed
                        ? "bg-blue-50/30 border-blue-100"
                        : "bg-gray-50/50 border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          step.completed
                            ? "bg-white text-talentia-blue shadow-sm"
                            : "bg-white text-gray-300 shadow-sm"
                        }`}
                      >
                        <step.icon size={20} />
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          step.completed ? "text-navy" : "text-gray-500"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {step.completed ? (
                      <CheckCircle2 size={20} className="text-tech-cyan" />
                    ) : (
                      <Link
                        href={step.href}
                        className="flex items-center gap-1 text-talentia-blue hover:text-blue-700 font-bold text-xs uppercase tracking-widest transition-colors"
                      >
                        Completar <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4">
                {verificationStatus === "pending" && completedCount > 0 ? (
                  <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 flex flex-col items-center text-center space-y-3">
                    <Loader2 className="animate-spin text-energy-orange" size={24} />
                    <h4 className="text-sm font-bold text-navy">Tu solicitud está en revisión</h4>
                    <p className="text-xs text-gray-500 font-medium max-w-sm">
                      Nuestro equipo académico está validando tus documentos. Recibirás una
                      notificación en un plazo de 48-72 horas.
                    </p>
                  </div>
                ) : verificationStatus === "approved" ? (
                  <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center text-center space-y-3">
                    <ShieldCheck className="text-talentia-blue" size={32} />
                    <h4 className="text-sm font-bold text-navy">¡Eres un docente Verificado!</h4>
                    <p className="text-xs text-gray-500 font-medium max-w-sm">
                      Tu perfil ahora goza de máxima visibilidad y confianza institucional.
                    </p>
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
          {/* Document upload */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-navy text-white" id="documents">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Upload size={22} className="text-tech-cyan" />
                Subir documentos
              </CardTitle>
              <CardDescription className="text-gray-400 font-medium">
                Sube tu CV y documento de identidad para la validación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CVUpload facultyId={user.id} existingDocs={documents || []} />
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
