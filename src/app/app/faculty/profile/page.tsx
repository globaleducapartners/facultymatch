import { createClient } from "@/lib/supabase-server";
import { User, Globe, Link as LinkIcon, Briefcase, GraduationCap, Phone, MapPin, Building2, FileText, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CVUpload } from "@/components/profile/CVUpload";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: facultyProfile } = await supabase
    .from("faculty_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: documents } = await supabase
    .from("faculty_documents")
    .select("*")
    .eq("faculty_id", user.id)
    .order("created_at", { ascending: false });

async function updateProfile(formData: FormData) {
"use server";
const fullName = formData.get("fullName") as string;
const headline = formData.get("headline") as string;
const bio = formData.get("bio") as string;
const country = formData.get("country") as string;
const city = formData.get("city") as string;
const phone = formData.get("phone") as string;
const website = formData.get("website") as string;
const linkedinUrl = formData.get("linkedinUrl") as string;
const currentInstitution = formData.get("currentInstitution") as string;
const yearsExperience = parseInt(formData.get("yearsExperience") as string) || 0;
const availability = formData.get("availability") as string;
const anecaAccreditation = formData.get("anecaAccreditation") as string;
const researchPublications = formData.get("researchPublications") as string;
const googleScholarId = formData.get("googleScholarId") as string;

const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) return;

// Update user_profiles
await supabase.from("user_profiles").update({ 
full_name: fullName 
}).eq("id", user.id);

// Update faculty_profiles
await supabase.from("faculty_profiles").update({ 
headline,
bio, 
country,
city,
phone,
website,
linkedin_url: linkedinUrl,
current_institution: currentInstitution,
years_experience: yearsExperience,
availability,
aneca_accreditation: anecaAccreditation,
research_publications: researchPublications,
google_scholar_id: googleScholarId
}).eq("id", user.id);

revalidatePath("/app/faculty/profile");
revalidatePath("/app/faculty");
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
<TabsTrigger value="research" className="rounded-xl data-[state=active]:bg-talentia-blue data-[state=active]:text-white flex items-center gap-2 px-6 py-2.5">
<Briefcase size={16} /> Investigación
</TabsTrigger>
<TabsTrigger value="documents" className="rounded-xl data-[state=active]:bg-talentia-blue data-[state=active]:text-white flex items-center gap-2 px-6 py-2.5">
<FileText size={16} /> Documentos
</TabsTrigger>
<TabsTrigger value="links" className="rounded-xl data-[state=active]:bg-talentia-blue data-[state=active]:text-white flex items-center gap-2 px-6 py-2.5">
<Globe size={16} /> Enlaces
</TabsTrigger>
</TabsList>

<TabsContent value="basic" className="space-y-6">
<Card className="border-none shadow-sm rounded-2xl overflow-hidden">
<CardHeader>
<CardTitle className="text-xl font-bold text-navy">Información básica</CardTitle>
<CardDescription className="font-medium">Estos datos son los que primero verán las instituciones.</CardDescription>
</CardHeader>
<CardContent>
<form action={updateProfile} className="space-y-6 max-w-3xl">
<div className="grid md:grid-cols-2 gap-6">
<div className="space-y-1.5">
<label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Nombre completo</label>
<input
name="fullName"
defaultValue={profile?.full_name}
required
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
<label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1"><Globe size={12} /> País</label>
<input
name="country"
defaultValue={facultyProfile?.country}
className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
placeholder="Ej: España"
/>
</div>
<div className="space-y-1.5">
<label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1"><MapPin size={12} /> Ciudad</label>
<input
name="city"
defaultValue={facultyProfile?.city}
className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
placeholder="Ej: Madrid"
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

<TabsContent value="experience">
<Card className="border-none shadow-sm rounded-2xl overflow-hidden">
<CardHeader>
<CardTitle className="text-xl font-bold text-navy">Trayectoria e Institución</CardTitle>
<CardDescription className="font-medium">Detalla tu experiencia actual y años de docencia.</CardDescription>
</CardHeader>
<CardContent>
<form action={updateProfile} className="space-y-6 max-w-3xl">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1"><Building2 size={12} /> Institución actual</label>
                      <input
                        name="currentInstitution"
                        defaultValue={facultyProfile?.current_institution}
                        className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
                        placeholder="Ej: Universidad de Madrid"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1"><Briefcase size={12} /> Años de experiencia</label>
                      <input
                        name="yearsExperience"
                        type="number"
                        defaultValue={facultyProfile?.years_experience}
                        className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1"><Clock size={12} /> Disponibilidad</label>
                    <select
                      name="availability"
                      defaultValue={facultyProfile?.availability || "open"}
                      className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium appearance-none"
                    >
                      <option value="open">Abierto a ofertas (Full availability)</option>
                      <option value="limited">Disponibilidad limitada</option>
                      <option value="invite_only">Solo por invitación directa</option>
                    </select>
                  </div>

<Button type="submit" className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 px-10 rounded-xl transition-all shadow-lg shadow-blue-100">
Guardar cambios
</Button>
</form>
</CardContent>
</Card>
</TabsContent>

<TabsContent value="research">
<Card className="border-none shadow-sm rounded-2xl overflow-hidden">
<CardHeader>
<CardTitle className="text-xl font-bold text-navy">Perfil Investigador</CardTitle>
<CardDescription className="font-medium">Acreditaciones y métricas de investigación.</CardDescription>
</CardHeader>
<CardContent>
<form action={updateProfile} className="space-y-6 max-w-3xl">
<div className="space-y-1.5">
<label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Acreditación ANECA / Otros</label>
<input
name="anecaAccreditation"
defaultValue={facultyProfile?.aneca_accreditation}
className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
placeholder="Ej: Titular de Universidad (ANECA)"
/>
</div>
<div className="space-y-1.5">
<label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Publicaciones Relevantes & ORCID</label>
<textarea
name="researchPublications"
defaultValue={facultyProfile?.research_publications}
rows={4}
className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium resize-none"
placeholder="Lista tus publicaciones principales o incluye tu código ORCID..."
/>
</div>
<div className="space-y-1.5">
<label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Google Scholar ID</label>
<input
name="googleScholarId"
defaultValue={facultyProfile?.google_scholar_id}
className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
/>
</div>
<Button type="submit" className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 px-10 rounded-xl transition-all shadow-lg shadow-blue-100">
Guardar cambios
</Button>
</form>
</CardContent>
</Card>
</TabsContent>

<TabsContent value="documents">
<Card className="border-none shadow-sm rounded-2xl overflow-hidden">
<CardHeader>
<CardTitle className="text-xl font-bold text-navy">Curriculum Vitae</CardTitle>
<CardDescription className="font-medium">Sube tu CV actualizado para que las instituciones puedan descargarlo.</CardDescription>
</CardHeader>
<CardContent>
<CVUpload facultyId={user.id} existingDocs={documents || []} />
</CardContent>
</Card>
</TabsContent>

<TabsContent value="links">
<Card className="border-none shadow-sm rounded-2xl overflow-hidden">
<CardHeader>
<CardTitle className="text-xl font-bold text-navy">Presencia Digital</CardTitle>
<CardDescription className="font-medium">Enlaces a tus perfiles profesionales y académicos.</CardDescription>
</CardHeader>
<CardContent>
<form action={updateProfile} className="space-y-6 max-w-3xl">
<div className="grid md:grid-cols-2 gap-6">
<div className="space-y-1.5">
<label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1"><LinkIcon size={12} /> LinkedIn URL</label>
<input
name="linkedinUrl"
defaultValue={facultyProfile?.linkedin_url}
className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
placeholder="https://linkedin.com/in/..."
/>
</div>
<div className="space-y-1.5">
<label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1"><Globe size={12} /> Web Personal / Portfolio</label>
<input
name="website"
defaultValue={facultyProfile?.website}
className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
placeholder="https://..."
/>
</div>
</div>
<div className="space-y-1.5">
<label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1"><Phone size={12} /> Teléfono de contacto</label>
<input
name="phone"
defaultValue={facultyProfile?.phone}
className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
/>
</div>
<Button type="submit" className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 px-10 rounded-xl transition-all shadow-lg shadow-blue-100">
Guardar cambios
</Button>
</form>
</CardContent>
</Card>
</TabsContent>
</Tabs>
</div>
);
}

