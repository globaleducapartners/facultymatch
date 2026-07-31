import { createClient } from "@/lib/supabase-server";
import {
  CheckCircle2, ShieldCheck, Upload, FileText, GraduationCap,
  AlertCircle, ArrowRight, Loader2, Languages, MapPin, Eye, Download,
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

  const { data: facultyProfile } = await supabase
    .from("faculty_profiles")
    .select("*, verification_notes")
    .eq("id", user.id)
    .maybeSingle();

  const { data: documents } = await supabase
    .from("faculty_documents")
    .select("*")
    .eq("faculty_id", user.id)
    .order("created_at", { ascending: false });

  const verificationStatus = facultyProfile?.estado_perfil || "incompleto";
  const verificationNotes = facultyProfile?.verification_notes;

  const { data: expertiseData } = await supabase
    .from("faculty_expertise")
    .select("id")
    .eq("faculty_id", user.id)
    .limit(1);
  const hasExpertise = (expertiseData?.length ?? 0) > 0;

  const hasIdDocument = (documents?.length ?? 0) > 0;
  const hasLanguages = (facultyProfile?.languages?.length ?? 0) > 0;
  const hasAreas = hasExpertise || (facultyProfile?.faculty_areas?.length ?? 0) > 0;

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

    // Re-check completeness against fresh data — never trust the client's
    // disabled-button state, and never trust a closure captured at an
    // earlier render (the profile may have changed since this page loaded).
    const { data: fp } = await supabase
      .from("faculty_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (!fp || fp.estado_perfil === "verificado" || fp.estado_perfil === "en_revision") return;

    const { data: docs } = await supabase
      .from("faculty_documents")
      .select("id")
      .eq("faculty_id", user.id)
      .limit(1);
    const { data: expertise } = await supabase
      .from("faculty_expertise")
      .select("id")
      .eq("faculty_id", user.id)
      .limit(1);

    const freshSteps = [
      !!fp.headline,
      !!(fp.location || (fp.city && fp.country)),
      (fp.years_experience ?? 0) > 0,
      (fp.languages?.length ?? 0) > 0,
      (expertise?.length ?? 0) > 0 || (fp.faculty_areas?.length ?? 0) > 0,
      (docs?.length ?? 0) > 0,
      fp.visibility === "public",
    ];
    const complete = freshSteps.every(Boolean);
    if (!complete) return;

    await supabase
      .from("faculty_profiles")
      .update({ estado_perfil: "en_revision" })
      .eq("id", user.id);
    revalidatePath("/app/faculty/verification");
  }

  const badges: Record<string, { label: string; cls: string }> = {
    // Verificado usa el dorado de marca — es la misma señal de confianza
    // que el resto de la web. En_revision es un estado de espera, no una
    // señal de marca, así que se queda en el ámbar semántico habitual.
    verificado: { label: "Verificado", cls: "bg-fm-gold text-white border-fm-gold" },
    en_revision: { label: "En revisión", cls: "bg-amber-50 text-amber-600 border-amber-200" },
    incompleto: { label: "Incompleto", cls: "bg-blue-50 text-fm-blue border-fm-blue/30" },
    rechazado: { label: "Rechazado", cls: "bg-red-50 text-red-600 border-red-200" },
  };

  const statusBadge = badges[verificationStatus as string] ?? { label: "Sin verificar", cls: "bg-gray-50 text-gray-400 border-gray-100" };

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

      {verificationStatus === "incompleto" && verificationNotes && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-fm-blue shrink-0 mt-0.5" />
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
                            ? "bg-white text-fm-blue shadow-sm"
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
                      <CheckCircle2 size={20} className="text-fm-gold" />
                    ) : (
                      <Link
                        href={step.href}
                        className="flex items-center gap-1 text-fm-blue hover:text-blue-700 font-bold text-xs uppercase tracking-widest transition-colors"
                      >
                        Completar <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4">
                {verificationStatus === "en_revision" && completedCount > 0 ? (
                  <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 flex flex-col items-center text-center space-y-3">
                    <Loader2 className="animate-spin text-fm-gold" size={24} />
                    <h4 className="text-sm font-bold text-navy">Tu solicitud está en revisión</h4>
                    <p className="text-xs text-gray-500 font-medium max-w-sm">
                      Nuestro equipo académico está validando tus documentos. Recibirás una
                      notificación en un plazo de 48-72 horas.
                    </p>
                  </div>
                ) : verificationStatus === "verificado" ? (
                  <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center text-center space-y-4">
                    <ShieldCheck className="text-fm-blue" size={32} />
                    <h4 className="text-sm font-bold text-navy">¡Eres un docente Verificado!</h4>
                    <p className="text-xs text-gray-500 font-medium max-w-sm">
                      Tu perfil ahora goza de máxima visibilidad y confianza institucional.
                    </p>
                    <a
                      href="/api/perfil-pdf"
                      download
                      className="inline-flex items-center gap-2 bg-fm-blue hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors mt-2"
                    >
                      <Download size={16} />
                      Descargar perfil verificado (PDF)
                    </a>
                  </div>
                ) : (
                  <form action={requestVerification}>
                    <Button
                      type="submit"
                      disabled={progress < 100}
                      className={`w-full h-14 rounded-xl font-bold transition-all shadow-lg ${
                        progress === 100
                          ? "bg-fm-blue hover:bg-blue-700 text-white shadow-blue-100"
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
                <Upload size={22} className="text-fm-gold" />
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
            <div className="flex items-center gap-2 text-fm-blue">
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
                  <div className="w-1.5 h-1.5 rounded-full bg-fm-gold" />
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
