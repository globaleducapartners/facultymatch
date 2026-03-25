import { createClient } from "@/lib/supabase-server";
import { Award, Book, ChevronRight, X, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SpecialtyForm } from "./SpecialtyForm";

export default async function SpecialtiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: facultyProfile } = await supabase
    .from("faculty_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const { data: expertise } = await supabase
    .from("faculty_expertise")
    .select("*")
    .eq("faculty_id", facultyProfile?.id);

  const specialties = expertise || [];

  async function addSpecialty(formData: FormData) {
    "use server";
    const area = formData.get("area") as string;
    const subarea = formData.get("subarea") as string;
    const topicsStr = formData.get("topics") as string;
    const topics = topicsStr ? topicsStr.split(",").map((s) => s.trim()).filter(Boolean) : [];

    if (!area) return;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: faculty } = await supabase
      .from("faculty_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    await supabase.from("faculty_expertise").insert({
      faculty_id: faculty?.id,
      area,
      subarea: subarea || null,
      topics,
    });
    revalidatePath("/app/faculty/specialties");
  }

  async function removeExpertise(id: string) {
    "use server";
    const supabase = await createClient();
    await supabase.from("faculty_expertise").delete().eq("id", id);
    revalidatePath("/app/faculty/specialties");
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">Especialidades</h1>
          <p className="text-gray-500 font-medium">
            Define tus áreas de conocimiento y temas de investigación.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
                <Book size={22} className="text-talentia-blue" />
                Tus áreas de conocimiento
              </CardTitle>
              <CardDescription className="font-medium">
                Las instituciones te encontrarán principalmente por estos temas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {specialties.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                    Especialidades activas ({specialties.length})
                  </h4>
                  <div className="grid gap-4">
                    {specialties.map(
                      (item: { id: string; area: string; subarea?: string; topics?: string[] }) => (
                        <div
                          key={item.id}
                          className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-blue-100 hover:shadow-md transition-all group"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-navy">{item.area}</span>
                              {item.subarea && (
                                <>
                                  <ChevronRight size={14} className="text-gray-300" />
                                  <span className="text-sm font-bold text-gray-600">
                                    {item.subarea}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.topics?.map((topic: string, i: number) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="bg-blue-50 text-talentia-blue text-[10px] border-none"
                                >
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <form
                            action={async () => {
                              "use server";
                              await removeExpertise(item.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="p-2 text-gray-300 hover:text-red-600 transition-colors bg-gray-50 rounded-xl"
                            >
                              <X size={16} />
                            </button>
                          </form>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center space-y-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Award size={32} className="text-gray-200" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-navy font-bold">Sin especialidades</p>
                    <p className="text-gray-500 text-sm font-medium">
                      Añade al menos una para aparecer en las búsquedas.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-gray-50">
                <h4 className="text-sm font-bold text-navy mb-4">Añadir nueva área</h4>
                <SpecialtyForm action={addSpecialty} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="p-6 rounded-2xl bg-navy text-white space-y-6">
            <div className="flex items-center gap-2 text-tech-cyan">
              <AlertCircle size={20} />
              <h4 className="text-sm font-bold">Consejo Académico</h4>
            </div>
            <p className="text-xs text-gray-300 font-medium leading-relaxed">
              Las instituciones buscan perfiles con al menos 3-5 especialidades bien definidas.
              Sé específico: en lugar de &quot;Derecho&quot;, usa &quot;Derecho Administrativo&quot;
              o &quot;Derecho Digital&quot;.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
