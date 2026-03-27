import { createClient } from "@/lib/supabase-server";
import {
  User, Globe, Link as LinkIcon, Briefcase, GraduationCap, Phone,
  MapPin, Building2, FileText, Clock, Bell, Mail, MessageSquare,
  Languages, BookOpen,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CVUpload } from "@/components/profile/CVUpload";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { LanguageEditor } from "@/components/profile/LanguageEditor";
import { DegreeEditor } from "@/components/profile/DegreeEditor";
import { InstitutionsTaughtEditor } from "@/components/profile/InstitutionsTaughtEditor";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; tab?: string }>;
}) {
  const { saved, tab } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userMeta = user.user_metadata || {};

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
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

  // ─── Server Actions (one per tab) ────────────────────────────────────────

  async function saveBasicInfo(formData: FormData) {
    "use server";
    const fullName = formData.get("fullName") as string;
    const headline = formData.get("headline") as string;
    const bio = formData.get("bio") as string;
    const country = formData.get("country") as string;
    const city = formData.get("city") as string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("user_profiles").update({ full_name: fullName }).eq("id", user.id);
    await supabase.from("faculty_profiles")
      .update({
        headline, bio, country, city,
        location: [city, country].filter(Boolean).join(", ") || null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    revalidatePath("/app/faculty/profile");
    revalidatePath("/app/faculty");
    redirect("/app/faculty/profile?saved=1&tab=basic");
  }

  async function saveExperience(formData: FormData) {
    "use server";
    const currentInstitution = formData.get("currentInstitution") as string;
    const yearsExperience = parseInt(formData.get("yearsExperience") as string) || 0;
    const availability = formData.get("availability") as string;
    const isPhd = formData.get("isPhd") === "on";
    const academicLevel = formData.get("academicLevel") as string;
    const institutionsTaughtRaw = formData.get("institutionsTaught") as string;
    const institutionsTaught = JSON.parse(institutionsTaughtRaw || "[]");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("faculty_profiles")
      .update({
        current_institution: currentInstitution,
        years_experience: yearsExperience,
        availability,
        is_phd: isPhd,
        academic_level: academicLevel,
        institutions_taught: institutionsTaught,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    revalidatePath("/app/faculty/profile");
    revalidatePath("/app/faculty");
    redirect("/app/faculty/profile?saved=1&tab=experience");
  }

  async function saveFormacion(formData: FormData) {
    "use server";
    const degreesRaw = formData.get("degrees") as string;
    const degrees = JSON.parse(degreesRaw || "[]");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("faculty_profiles")
      .update({ degrees, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    revalidatePath("/app/faculty/profile");
    revalidatePath("/app/faculty");
    redirect("/app/faculty/profile?saved=1&tab=formacion");
  }

  async function saveLanguages(formData: FormData) {
    "use server";
    const languagesRaw = formData.get("languages") as string;
    const languages = JSON.parse(languagesRaw || "[]");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("faculty_profiles")
      .update({ languages, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    revalidatePath("/app/faculty/profile");
    revalidatePath("/app/faculty");
    redirect("/app/faculty/profile?saved=1&tab=idiomas");
  }

  async function saveResearch(formData: FormData) {
    "use server";
    const hasAneca = formData.get("hasAneca") === "on";
    const otherAccreditation = (formData.get("otherAccreditation") as string)?.trim() || "";
    const anecaAccreditation = [
      hasAneca ? "Titular de Universidad (ANECA)" : null,
      otherAccreditation || null,
    ].filter(Boolean).join(" · ") || null;
    const researchPublications = formData.get("researchPublications") as string;
    const googleScholarId = formData.get("googleScholarId") as string;
    const orcidId = formData.get("orcidId") as string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("faculty_profiles")
      .update({
        aneca_accreditation: anecaAccreditation,
        research_publications: researchPublications,
        google_scholar_id: googleScholarId,
        orcid_id: orcidId,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    revalidatePath("/app/faculty/profile");
    revalidatePath("/app/faculty");
    redirect("/app/faculty/profile?saved=1&tab=research");
  }

  async function saveLinks(formData: FormData) {
    "use server";
    const linkedinUrl = formData.get("linkedinUrl") as string;
    const website = formData.get("website") as string;
    const phone = formData.get("phone") as string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("faculty_profiles")
      .update({
        linkedin_url: linkedinUrl,
        website,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    revalidatePath("/app/faculty/profile");
    revalidatePath("/app/faculty");
    redirect("/app/faculty/profile?saved=1&tab=links");
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
    revalidatePath("/app/faculty");
    redirect("/app/faculty/profile?saved=1&tab=preferences");
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const inputCls =
    "w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium";
  const labelCls = "text-xs font-black uppercase tracking-widest text-gray-400 ml-1";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-navy">Mi perfil</h1>
        <p className="text-gray-500 font-medium">Gestiona tu identidad académica y profesional.</p>
      </div>

      {saved === "1" && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center gap-3 text-green-800 font-bold text-sm">
          ✓ Cambios guardados correctamente
        </div>
      )}

      {/* Avatar + name header */}
      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <AvatarUpload
              userId={user.id}
              currentAvatarUrl={profile?.avatar_url || facultyProfile?.avatar_url}
              name={profile?.full_name || userMeta.full_name}
            />
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-black text-navy">
                {profile?.full_name || userMeta.full_name || "Tu nombre"}
              </h2>
              <p className="text-gray-500 font-medium text-sm mt-1">
                {facultyProfile?.headline || "Añade tu titular académico"}
              </p>
              <p className="text-xs text-gray-400 mt-2">{user.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    facultyProfile?.visibility === "public"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      facultyProfile?.visibility === "public"
                        ? "bg-green-500"
                        : "bg-orange-500"
                    }`}
                  />
                  {facultyProfile?.visibility === "public" ? "Perfil público" : "Perfil privado"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={tab || "basic"} className="space-y-6">
        <TabsList className="bg-white p-1 rounded-2xl border border-gray-100 w-full overflow-x-auto justify-start flex-nowrap">
          {[
            { value: "basic", icon: User, label: "Datos básicos" },
            { value: "experience", icon: Briefcase, label: "Experiencia" },
            { value: "formacion", icon: GraduationCap, label: "Formación" },
            { value: "idiomas", icon: Languages, label: "Idiomas" },
            { value: "research", icon: BookOpen, label: "Investigación" },
            { value: "documents", icon: FileText, label: "Documentos" },
            { value: "links", icon: Globe, label: "Enlaces" },
            { value: "preferences", icon: Bell, label: "Contacto" },
          ].map(({ value, icon: Icon, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-xl data-[state=active]:bg-talentia-blue data-[state=active]:text-white flex items-center gap-2 px-4 py-2.5 text-sm whitespace-nowrap"
            >
              <Icon size={15} /> {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Datos básicos ── */}
        <TabsContent value="basic">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-navy">Información básica</CardTitle>
              <CardDescription className="font-medium">
                Estos datos son los que primero verán las instituciones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={saveBasicInfo} className="space-y-6 max-w-3xl">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className={labelCls}>Nombre completo</label>
                    <input
                      name="fullName"
                      defaultValue={profile?.full_name || userMeta.full_name}
                      required
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Titular académico</label>
                    <input
                      name="headline"
                      defaultValue={facultyProfile?.headline}
                      placeholder="Ej: PhD | Finance | Online teaching"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className={`${labelCls} flex items-center gap-1`}>
                      <Globe size={12} /> País
                    </label>
                    <input
                      name="country"
                      defaultValue={facultyProfile?.country || userMeta.country}
                      placeholder="Ej: España"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={`${labelCls} flex items-center gap-1`}>
                      <MapPin size={12} /> Ciudad
                    </label>
                    <input
                      name="city"
                      defaultValue={facultyProfile?.city || userMeta.city}
                      placeholder="Ej: Madrid"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Biografía profesional</label>
                  <textarea
                    name="bio"
                    defaultValue={facultyProfile?.bio}
                    rows={6}
                    placeholder="Resume tu trayectoria académica e investigadora..."
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 px-10 rounded-xl transition-all shadow-lg shadow-blue-100"
                >
                  Guardar cambios
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Experiencia ── */}
        <TabsContent value="experience">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-navy">Trayectoria e Institución</CardTitle>
              <CardDescription className="font-medium">
                Detalla tu experiencia actual y años de docencia.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={saveExperience} className="space-y-6 max-w-3xl">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className={`${labelCls} flex items-center gap-1`}>
                      <Building2 size={12} /> Institución actual
                    </label>
                    <input
                      name="currentInstitution"
                      defaultValue={facultyProfile?.current_institution}
                      placeholder="Ej: Universidad Autónoma de Madrid"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={`${labelCls} flex items-center gap-1`}>
                      <Briefcase size={12} /> Años de experiencia
                    </label>
                    <input
                      name="yearsExperience"
                      type="number"
                      min={0}
                      defaultValue={facultyProfile?.years_experience ?? ""}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className={`${labelCls} flex items-center gap-1`}>
                      <GraduationCap size={12} /> Nivel académico máximo
                    </label>
                    <select
                      name="academicLevel"
                      defaultValue={facultyProfile?.academic_level || ""}
                      className={`${inputCls} appearance-none`}
                    >
                      <option value="">Sin especificar</option>
                      <option value="Grado">Grado / Licenciatura</option>
                      <option value="Master">Máster</option>
                      <option value="Doctorado">Doctorado (PhD)</option>
                      <option value="Postdoctorado">Postdoctorado</option>
                      <option value="Catedratico">Catedrático</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className={`${labelCls} flex items-center gap-1`}>
                      <Clock size={12} /> Disponibilidad
                    </label>
                    <select
                      name="availability"
                      defaultValue={facultyProfile?.availability || "open"}
                      className={`${inputCls} appearance-none`}
                    >
                      <option value="open">Disponible inmediatamente</option>
                      <option value="next_semester">Disponible desde próximo semestre</option>
                      <option value="occasional">Asignaturas puntuales</option>
                      <option value="weekends">Solo fines de semana / intensivos</option>
                      <option value="online_only">Solo online</option>
                      <option value="limited">Disponible en 6 meses</option>
                      <option value="invite_only">Solo por invitación directa</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      name="isPhd"
                      defaultChecked={facultyProfile?.is_phd ?? false}
                      className="h-4 w-4 rounded accent-talentia-blue"
                    />
                    <div>
                      <p className="text-sm font-bold text-navy">Soy Doctor/a (PhD)</p>
                      <p className="text-xs text-gray-400 font-medium">
                        Se mostrará el badge de PhD en tu perfil.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls}>Instituciones donde has impartido docencia</label>
                  <InstitutionsTaughtEditor
                    initialInstitutions={(facultyProfile?.institutions_taught as string[] | null) || []}
                  />
                </div>

                <Button
                  type="submit"
                  className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 px-10 rounded-xl transition-all shadow-lg shadow-blue-100"
                >
                  Guardar cambios
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Formación ── */}
        <TabsContent value="formacion">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-navy">Formación académica</CardTitle>
              <CardDescription className="font-medium">
                Añade tus títulos y certificaciones académicas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={saveFormacion} className="space-y-6 max-w-3xl">
                <DegreeEditor initialDegrees={(facultyProfile?.degrees as any[] | null) || []} />
                <Button
                  type="submit"
                  className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 px-10 rounded-xl transition-all shadow-lg shadow-blue-100"
                >
                  Guardar formación
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Idiomas ── */}
        <TabsContent value="idiomas">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-navy">Idiomas</CardTitle>
              <CardDescription className="font-medium">
                Indica los idiomas en los que puedes impartir docencia y tu nivel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={saveLanguages} className="space-y-6 max-w-3xl">
                <LanguageEditor initialLanguages={(facultyProfile?.languages as any[] | null) || []} />
                <Button
                  type="submit"
                  className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 px-10 rounded-xl transition-all shadow-lg shadow-blue-100"
                >
                  Guardar idiomas
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Investigación ── */}
        <TabsContent value="research">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-navy">Perfil Investigador</CardTitle>
              <CardDescription className="font-medium">
                Acreditaciones y métricas de investigación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={saveResearch} className="space-y-6 max-w-3xl">
                <div className="space-y-3">
                  <label className={labelCls}>Acreditaciones académicas</label>
                  {/* ANECA checkbox */}
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      name="hasAneca"
                      defaultChecked={!!(facultyProfile?.aneca_accreditation?.includes("ANECA"))}
                      className="h-4 w-4 rounded accent-talentia-blue shrink-0"
                    />
                    <div>
                      <p className="text-sm font-bold text-navy">Acreditación ANECA — Titular de Universidad</p>
                      <p className="text-xs text-gray-400 font-medium">
                        Marca si dispones de la acreditación ANECA para Titular de Universidad o Catedrático.
                      </p>
                    </div>
                  </label>
                  {/* Other accreditation */}
                  <div className="space-y-1.5">
                    <label className={labelCls}>Otra acreditación</label>
                    <input
                      name="otherAccreditation"
                      defaultValue={
                        facultyProfile?.aneca_accreditation
                          ?.replace("Titular de Universidad (ANECA)", "")
                          .replace(" · ", "")
                          .trim() || ""
                      }
                      placeholder="Ej: Acreditación AQU, ANECA Ayudante Doctor..."
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Publicaciones relevantes</label>
                  <textarea
                    name="researchPublications"
                    defaultValue={facultyProfile?.research_publications}
                    rows={4}
                    placeholder="Lista tus publicaciones principales..."
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium resize-none"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className={labelCls}>Google Scholar ID</label>
                    <input
                      name="googleScholarId"
                      defaultValue={facultyProfile?.google_scholar_id}
                      placeholder="Ej: XXXXXXX"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>ORCID iD</label>
                    <input
                      name="orcidId"
                      defaultValue={facultyProfile?.orcid_id}
                      placeholder="Ej: 0000-0000-0000-0000"
                      className={inputCls}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 px-10 rounded-xl transition-all shadow-lg shadow-blue-100"
                >
                  Guardar cambios
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Documentos ── */}
        <TabsContent value="documents">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-navy">Curriculum Vitae</CardTitle>
              <CardDescription className="font-medium">
                Sube tu CV actualizado para que las instituciones puedan descargarlo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CVUpload facultyId={user.id} existingDocs={documents || []} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Enlaces ── */}
        <TabsContent value="links">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-navy">Presencia Digital</CardTitle>
              <CardDescription className="font-medium">
                Enlaces a tus perfiles profesionales y académicos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={saveLinks} className="space-y-6 max-w-3xl">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className={`${labelCls} flex items-center gap-1`}>
                      <LinkIcon size={12} /> LinkedIn URL
                    </label>
                    <input
                      name="linkedinUrl"
                      defaultValue={facultyProfile?.linkedin_url}
                      placeholder="https://linkedin.com/in/..."
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={`${labelCls} flex items-center gap-1`}>
                      <Globe size={12} /> Web Personal
                    </label>
                    <input
                      name="website"
                      defaultValue={facultyProfile?.website}
                      placeholder="https://..."
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={`${labelCls} flex items-center gap-1`}>
                    <Phone size={12} /> Teléfono
                  </label>
                  <input
                    name="phone"
                    defaultValue={facultyProfile?.phone}
                    placeholder="+34 600 000 000"
                    className={inputCls}
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 px-10 rounded-xl transition-all shadow-lg shadow-blue-100"
                >
                  Guardar cambios
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Contacto / Preferencias ── */}
        <TabsContent value="preferences">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
                <MessageSquare size={20} className="text-talentia-blue" /> Preferencias de contacto
              </CardTitle>
              <CardDescription className="font-medium">
                Elige cómo quieres que las instituciones te contacten.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateContactPreferences} className="space-y-6 max-w-3xl">
                <div className="space-y-2">
                  <label className={labelCls}>Método preferido de contacto</label>
                  <select
                    name="preferredContact"
                    defaultValue={facultyProfile?.preferred_contact_method || "email"}
                    className={`${inputCls} appearance-none`}
                  >
                    <option value="email">Por email</option>
                    <option value="whatsapp">Por WhatsApp</option>
                    <option value="linkedin">Por LinkedIn</option>
                    <option value="platform">Solo a través de la plataforma</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className={`${labelCls} flex items-center gap-1`}>
                      <Mail size={12} /> Email de contacto
                    </label>
                    <input
                      name="contactEmail"
                      defaultValue={facultyProfile?.contact_email || user.email}
                      placeholder="tu@email.com"
                      type="email"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={`${labelCls} flex items-center gap-1`}>
                      <Phone size={12} /> WhatsApp
                    </label>
                    <input
                      name="contactWhatsapp"
                      defaultValue={facultyProfile?.contact_whatsapp}
                      placeholder="+34 600 000 000"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={`${labelCls} flex items-center gap-1`}>
                    <LinkIcon size={12} /> LinkedIn para contacto
                  </label>
                  <input
                    name="contactLinkedin"
                    defaultValue={facultyProfile?.contact_linkedin || facultyProfile?.linkedin_url}
                    placeholder="https://linkedin.com/in/..."
                    className={inputCls}
                  />
                </div>

                <div className="space-y-1 pt-2">
                  <p className={`${labelCls} mb-3 flex items-center gap-1`}>
                    <Bell size={12} /> Notificaciones
                  </p>
                  {[
                    {
                      name: "notifyNewOffers",
                      label: "Nuevas oportunidades de instituciones",
                      defaultChecked: facultyProfile?.notify_new_offers ?? true,
                    },
                    {
                      name: "notifyMessages",
                      label: "Mensajes directos de instituciones",
                      defaultChecked: facultyProfile?.notify_messages ?? true,
                    },
                    {
                      name: "notifyWeeklyDigest",
                      label: "Resumen semanal de actividad",
                      defaultChecked: facultyProfile?.notify_weekly_digest ?? false,
                    },
                  ].map(({ name, label, defaultChecked }) => (
                    <label
                      key={name}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-all"
                    >
                      <span className="text-sm font-medium text-navy">{label}</span>
                      <input
                        type="checkbox"
                        name={name}
                        defaultChecked={defaultChecked}
                        className="h-4 w-4 rounded accent-talentia-blue"
                      />
                    </label>
                  ))}
                </div>

                <Button
                  type="submit"
                  className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 px-10 rounded-xl transition-all shadow-lg shadow-blue-100"
                >
                  Guardar preferencias
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
