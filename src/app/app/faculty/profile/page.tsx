import { createClient } from "@/lib/supabase-server";
import { User, Globe, Link as LinkIcon, Briefcase, GraduationCap, Phone, MapPin, Building2, FileText, Clock, Bell, Mail, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CVUpload } from "@/components/profile/CVUpload";
import { AvatarUpload } from "@/components/profile/AvatarUpload";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: facultyProfile } = await supabase
    .from("faculty_profiles")
    .select("*")
    .eq("user_id", user.id)
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

    await supabase.from("user_profiles").update({ full_name: fullName }).eq("id", user.id);
    await supabase.from("faculty_profiles").upsert({
      user_id: user.id,
      headline, bio, country, city, phone, website,
      location: [city, country].filter(Boolean).join(', ') || undefined,
      linkedin_url: linkedinUrl,
      current_institution: currentInstitution,
      years_experience: yearsExperience,
      availability,
      aneca_accreditation: anecaAccreditation,
      research_publications: researchPublications,
      google_scholar_id: googleScholarId,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    revalidatePath("/app/faculty/profile");
    revalidatePath("/app/faculty");
  }

  async function updateContactPreferences(formData: FormData) {
    "use server";
    const contactEmail = formData.get("contactEmail") as string;
    const contactWhatsapp = formData.get("contactWhatsapp") as string;
    const contactLinkedin = formData.get("contactLinkedin") as string;
    const notifyNewOffers = formData.get("notifyNewOffers") === "on";
    const notifyMessages = formData.get("notifyMessages") === "on";
    const notifyWeeklyDigest = formData.get("notifyWeeklyDigest") === "on";
    const preferredContact = formData.get("preferredContact") as string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("faculty_profiles").update({
      contact_email: contactEmail,
      contact_whatsapp: contactWhatsapp,
      contact_linkedin: contactLinkedin,
      notify_new_offers: notifyNewOffers,
      notify_messages: notifyMessages,
      notify_weekly_digest: notifyWeeklyDigest,
      preferred_contact_method: preferredContact,
    }).eq("user_id", user.id);

    revalidatePath("/app/faculty/profile");
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-navy">Mi perfil</h1>
        <p className="text-gray-500 font-medium">Gestiona tu identidad académica y profesional.</p>
      </div>

      {/* Avatar + name header */}
      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <AvatarUpload
              userId={user.id}
              currentAvatarUrl={profile?.avatar_url || facultyProfile?.avatar_url}
              name={profile?.full_name}
            />
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-black text-navy">{profile?.full_name || "Tu nombre"}</h2>
              <p className="text-gray-500 font-medium text-sm mt-1">{facultyProfile?.headline || "Añade tu titular académico"}</p>
              <p className="text-xs text-gray-400 mt-2">{user.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${facultyProfile?.visibility === 'public' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${facultyProfile?.visibility === 'public' ? 'bg-green-500' : 'bg-orange-500'}`} />
                  {facultyProfile?.visibility === 'public' ? 'Perfil público' : 'Perfil privado'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="bg-white p-1 rounded-2xl border border-gray-100 w-full overflow-x-auto justify-start flex-nowrap">
          <TabsTrigger value="basic" className="rounded-xl data-[state=active]:bg-talentia-blue data-[state=active]:text-white flex items-center gap-2 px-5 py-2.5 text-sm whitespace-nowrap">
            <User size={15} /> Datos básicos
          </TabsTrigger>
          <TabsTrigger value="experience" className="rounded-xl data-[state=active]:bg-talentia-blue data-[state=active]:text-white flex items-center gap-2 px-5 py-2.5 text-sm whitespace-nowrap">
            <GraduationCap size={15} /> Experiencia
          </TabsTrigger>
          <TabsTrigger value="research" className="rounded-xl data-[state=active]:bg-talentia-blue data-[state=active]:text-white flex items-center gap-2 px-5 py-2.5 text-sm whitespace-nowrap">
            <Briefcase size={15} /> Investigación
          </TabsTrigger>
          <TabsTrigger value="documents" className="rounded-xl data-[state=active]:bg-talentia-blue data-[state=active]:text-white flex items-center gap-2 px-5 py-2.5 text-sm whitespace-nowrap">
            <FileText size={15} /> Documentos
          </TabsTrigger>
          <TabsTrigger value="links" className="rounded-xl data-[state=active]:bg-talentia-blue data-[state=active]:text-white flex items-center gap-2 px-5 py-2.5 text-sm whitespace-nowrap">
            <Globe size={15} /> Enlaces
          </TabsTrigger>
          <TabsTrigger value="preferences" className="rounded-xl data-[state=active]:bg-talentia-blue data-[state=active]:text-white flex items-center gap-2 px-5 py-2.5 text-sm whitespace-nowrap">
            <Bell size={15} /> Contacto
          </TabsTrigger>
        </TabsList>

        {/* Basic */}
        <TabsContent value="basic">
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
                    <input name="fullName" defaultValue={profile?.full_name} required
                      className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Titular académico</label>
                    <input name="headline" defaultValue={facultyProfile?.headline}
                      className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
                      placeholder="Ej: PhD | Finance | Online teaching" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1"><Globe size={12} /> País</label>
                    <input name="country" defaultValue={facultyProfile?.country}
                      className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
                      placeholder="Ej: España" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1"><MapPin size={12} /> Ciudad</label>
                    <input name="city" defaultValue={facultyProfile?.city}
                      className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
                      placeholder="Ej: Madrid" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Biografía profesional</label>
                  <textarea name="bio" defaultValue={facultyProfile?.bio} rows={6}
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium resize-none"
                    placeholder="Resume tu trayectoria académica e investigadora..." />
                </div>
                {/* hidden fields needed by updateProfile */}
                <input type="hidden" name="linkedinUrl" value={facultyProfile?.linkedin_url || ""} />
                <input type="hidden" name="phone" value={facultyProfile?.phone || ""} />
                <input type="hidden" name="website" value={facultyProfile?.website || ""} />
                <input type="hidden" name="currentInstitution" value={facultyProfile?.current_institution || ""} />
                <input type="hidden" name="yearsExperience" value={facultyProfile?.years_experience || ""} />
                <input type="hidden" name="availability" value={facultyProfile?.availability || ""} />
                <input type="hidden" name="anecaAccreditation" value={facultyProfile?.aneca_accreditation || ""} />
                <input type="hidden" name="researchPublications" value={facultyProfile?.research_publications || ""} />
                <input type="hidden" name="googleScholarId" value={facultyProfile?.google_scholar_id || ""} />
                <Button type="submit" className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 px-10 rounded-xl transition-all shadow-lg shadow-blue-100">
                  Guardar cambios
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experience */}
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
                    <input name="currentInstitution" defaultValue={facultyProfile?.current_institution}
                      className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
                      placeholder="Ej: Universidad de Madrid" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1"><Briefcase size={12} /> Años de experiencia</label>
                    <input name="yearsExperience" type="number" defaultValue={facultyProfile?.years_experience}
                      className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1"><Clock size={12} /> Disponibilidad</label>
                  <select name="availability" defaultValue={facultyProfile?.availability || "open"}
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium appearance-none">
                    <option value="open">Disponible inmediatamente</option>
                    <option value="next_semester">Disponible desde próximo semestre</option>
                    <option value="occasional">Disponible para asignaturas puntuales</option>
                    <option value="weekends">Solo fines de semana / intensivos</option>
                    <option value="online_only">Solo online</option>
                    <option value="limited">Actualmente ocupado – disponible en 6 meses</option>
                    <option value="invite_only">Solo por invitación directa</option>
                  </select>
                </div>
                <input type="hidden" name="fullName" value={profile?.full_name || ""} />
                <input type="hidden" name="headline" value={facultyProfile?.headline || ""} />
                <input type="hidden" name="bio" value={facultyProfile?.bio || ""} />
                <input type="hidden" name="country" value={facultyProfile?.country || ""} />
                <input type="hidden" name="city" value={facultyProfile?.city || ""} />
                <input type="hidden" name="linkedinUrl" value={facultyProfile?.linkedin_url || ""} />
                <input type="hidden" name="phone" value={facultyProfile?.phone || ""} />
                <input type="hidden" name="website" value={facultyProfile?.website || ""} />
                <input type="hidden" name="anecaAccreditation" value={facultyProfile?.aneca_accreditation || ""} />
                <input type="hidden" name="researchPublications" value={facultyProfile?.research_publications || ""} />
                <input type="hidden" name="googleScholarId" value={facultyProfile?.google_scholar_id || ""} />
                <Button type="submit" className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 px-10 rounded-xl transition-all shadow-lg shadow-blue-100">
                  Guardar cambios
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Research */}
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
                  <input name="anecaAccreditation" defaultValue={facultyProfile?.aneca_accreditation}
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
                    placeholder="Ej: Titular de Universidad (ANECA)" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Publicaciones Relevantes & ORCID</label>
                  <textarea name="researchPublications" defaultValue={facultyProfile?.research_publications} rows={4}
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium resize-none"
                    placeholder="Lista tus publicaciones principales o incluye tu código ORCID..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Google Scholar ID</label>
                  <input name="googleScholarId" defaultValue={facultyProfile?.google_scholar_id}
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium" />
                </div>
                <input type="hidden" name="fullName" value={profile?.full_name || ""} />
                <input type="hidden" name="headline" value={facultyProfile?.headline || ""} />
                <input type="hidden" name="bio" value={facultyProfile?.bio || ""} />
                <input type="hidden" name="country" value={facultyProfile?.country || ""} />
                <input type="hidden" name="city" value={facultyProfile?.city || ""} />
                <input type="hidden" name="linkedinUrl" value={facultyProfile?.linkedin_url || ""} />
                <input type="hidden" name="phone" value={facultyProfile?.phone || ""} />
                <input type="hidden" name="website" value={facultyProfile?.website || ""} />
                <input type="hidden" name="currentInstitution" value={facultyProfile?.current_institution || ""} />
                <input type="hidden" name="yearsExperience" value={facultyProfile?.years_experience || ""} />
                <input type="hidden" name="availability" value={facultyProfile?.availability || ""} />
                <Button type="submit" className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 px-10 rounded-xl transition-all shadow-lg shadow-blue-100">
                  Guardar cambios
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents */}
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

        {/* Links */}
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
                    <input name="linkedinUrl" defaultValue={facultyProfile?.linkedin_url}
                      className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
                      placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1"><Globe size={12} /> Web Personal</label>
                    <input name="website" defaultValue={facultyProfile?.website}
                      className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
                      placeholder="https://..." />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1"><Phone size={12} /> Teléfono</label>
                  <input name="phone" defaultValue={facultyProfile?.phone}
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium" />
                </div>
                <input type="hidden" name="fullName" value={profile?.full_name || ""} />
                <input type="hidden" name="headline" value={facultyProfile?.headline || ""} />
                <input type="hidden" name="bio" value={facultyProfile?.bio || ""} />
                <input type="hidden" name="country" value={facultyProfile?.country || ""} />
                <input type="hidden" name="city" value={facultyProfile?.city || ""} />
                <input type="hidden" name="currentInstitution" value={facultyProfile?.current_institution || ""} />
                <input type="hidden" name="yearsExperience" value={facultyProfile?.years_experience || ""} />
                <input type="hidden" name="availability" value={facultyProfile?.availability || ""} />
                <input type="hidden" name="anecaAccreditation" value={facultyProfile?.aneca_accreditation || ""} />
                <input type="hidden" name="researchPublications" value={facultyProfile?.research_publications || ""} />
                <input type="hidden" name="googleScholarId" value={facultyProfile?.google_scholar_id || ""} />
                <Button type="submit" className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 px-10 rounded-xl transition-all shadow-lg shadow-blue-100">
                  Guardar cambios
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Preferences */}
        <TabsContent value="preferences">
          <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
                  <MessageSquare size={20} className="text-talentia-blue" /> Preferencias de contacto
                </CardTitle>
                <CardDescription className="font-medium">Elige cómo quieres que las instituciones te contacten.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={updateContactPreferences} className="space-y-6 max-w-3xl">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Método preferido de contacto</label>
                    <select name="preferredContact" defaultValue={(facultyProfile as any)?.preferred_contact_method || "email"}
                      className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium appearance-none">
                      <option value="email">Por email</option>
                      <option value="whatsapp">Por WhatsApp</option>
                      <option value="linkedin">Por LinkedIn</option>
                      <option value="platform">Solo a través de la plataforma</option>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1"><Mail size={12} /> Email de contacto</label>
                      <input name="contactEmail" defaultValue={(facultyProfile as any)?.contact_email || user.email}
                        className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium"
                        placeholder="tu@email.com" type="email" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1"><Phone size={12} /> WhatsApp</label>
                      <input name="contactWhatsapp" defaultValue={(facultyProfile as any)?.contact_whatsapp}
                        className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium"
                        placeholder="+34 600 000 000" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1"><LinkIcon size={12} /> LinkedIn para contacto</label>
                    <input name="contactLinkedin" defaultValue={(facultyProfile as any)?.contact_linkedin || facultyProfile?.linkedin_url}
                      className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium"
                      placeholder="https://linkedin.com/in/..." />
                  </div>

                  <div className="space-y-1 pt-2">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 mb-3 flex items-center gap-1"><Bell size={12} /> Notificaciones</p>
                    {[
                      { name: "notifyNewOffers", label: "Nuevas oportunidades de instituciones", defaultChecked: (facultyProfile as any)?.notify_new_offers ?? true },
                      { name: "notifyMessages", label: "Mensajes directos de instituciones", defaultChecked: (facultyProfile as any)?.notify_messages ?? true },
                      { name: "notifyWeeklyDigest", label: "Resumen semanal de actividad", defaultChecked: (facultyProfile as any)?.notify_weekly_digest ?? false },
                    ].map(({ name, label, defaultChecked }) => (
                      <label key={name} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-all">
                        <span className="text-sm font-medium text-navy">{label}</span>
                        <input type="checkbox" name={name} defaultChecked={defaultChecked}
                          className="h-4 w-4 rounded accent-talentia-blue" />
                      </label>
                    ))}
                  </div>

                  <Button type="submit" className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 px-10 rounded-xl transition-all shadow-lg shadow-blue-100">
                    Guardar preferencias
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
