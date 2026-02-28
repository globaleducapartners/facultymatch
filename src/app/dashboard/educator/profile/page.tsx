import { createClient } from "@/lib/supabase-server";
import { User, FileText, Globe, Link as LinkIcon, Briefcase, GraduationCap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const { data: facultyProfile } = await supabase
    .from("faculty_profiles")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  async function updateBasicInfo(formData: FormData) {
    "use server";
    const fullName = formData.get("fullName") as string;
    const bio = formData.get("bio") as string;
    const headline = formData.get("headline") as string;
    const country = formData.get("country") as string;
    const city = formData.get("city") as string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("faculty_profiles").update({ 
      full_name: fullName,
      bio, 
      headline,
      country,
      city
    }).eq("user_id", user!.id);
    
    revalidatePath("/dashboard/educator/profile");
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-navy">Mi perfil</h1>
        <p className="text-gray-500 font-medium">Gestiona tu identidad académica y profesional.</p>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="bg-white p-1 rounded-2xl border border-gray-100 w-full md:w-auto overflow-x-auto justify-start flex-nowrap">
          <TabsTrigger value="basic" className="rounded-xl data-[state=active]:bg-talentia-blue data-[state=active]:text-white flex items-center gap-2 px-6 py-2.5">
            <User size={16} /> Datos básicos
          </TabsTrigger>
          <TabsTrigger value="experience" className="rounded-xl data-[state=active]:bg-talentia-blue data-[state=active]:text-white flex items-center gap-2 px-6 py-2.5">
            <GraduationCap size={16} /> Experiencia
          </TabsTrigger>
          <TabsTrigger value="languages" className="rounded-xl data-[state=active]:bg-talentia-blue data-[state=active]:text-white flex items-center gap-2 px-6 py-2.5">
            <Globe size={16} /> Idiomas
          </TabsTrigger>
          <TabsTrigger value="availability" className="rounded-xl data-[state=active]:bg-talentia-blue data-[state=active]:text-white flex items-center gap-2 px-6 py-2.5">
            <Briefcase size={16} /> Modalidad & niveles
          </TabsTrigger>
          <TabsTrigger value="links" className="rounded-xl data-[state=active]:bg-talentia-blue data-[state=active]:text-white flex items-center gap-2 px-6 py-2.5">
            <LinkIcon size={16} /> Enlaces
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-navy">Información básica</CardTitle>
              <CardDescription className="font-medium">Estos datos son los que primero verán las instituciones.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateBasicInfo} className="space-y-6 max-w-2xl">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Nombre completo</label>
                    <input
                      name="fullName"
                      defaultValue={facultyProfile?.full_name}
                      className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Titular académico</label>
                    <input
                      name="headline"
                      defaultValue={facultyProfile?.headline}
                      className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
                      placeholder="Ej: PhD | Finance | Online teaching"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">País</label>
                    <input
                      name="country"
                      defaultValue={facultyProfile?.country}
                      className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
                      placeholder="Ej: España"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Ciudad</label>
                    <input
                      name="city"
                      defaultValue={facultyProfile?.city}
                      className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
                      placeholder="Ej: Barcelona"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Biografía profesional</label>
                  <textarea
                    name="bio"
                    defaultValue={facultyProfile?.bio}
                    rows={6}
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium resize-none"
                    placeholder="Resume tu trayectoria académica e investigadora..."
                  />
                </div>

                <Button type="submit" className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 px-10 rounded-xl transition-all shadow-lg shadow-blue-100">
                  Guardar cambios
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs as placeholders for now */}
        <TabsContent value="experience">
          <Card className="border-none shadow-sm rounded-2xl p-12 text-center">
            <GraduationCap size={48} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-navy">Experiencia académica</h3>
            <p className="text-gray-500 font-medium">Sección en desarrollo. Pronto podrás detallar tu historial docente.</p>
          </Card>
        </TabsContent>
        <TabsContent value="languages">
          <Card className="border-none shadow-sm rounded-2xl p-12 text-center">
            <Globe size={48} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-navy">Idiomas</h3>
            <p className="text-gray-500 font-medium">Sección en desarrollo. Pronto podrás añadir tus competencias lingüísticas.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
