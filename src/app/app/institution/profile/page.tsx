import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Building2, Globe, MapPin, Phone, Mail, Users, Calendar, Link as LinkIcon, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InstitutionLogoUpload } from "@/components/dashboard/InstitutionLogoUpload";

export default async function InstitutionProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  let { data: institution } = await supabase
    .from("institutions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Auto-create institution record if it doesn't exist (use signup metadata when available)
  if (!institution) {
    const meta = user.user_metadata || {};
    const cityCountry = [meta.city, meta.country].filter(Boolean).join(', ');
    const { data: newInst } = await supabase
      .from("institutions")
      .insert({
        user_id: user.id,
        name: meta.institution_name || userProfile?.full_name || "Mi Institución",
        institution_type: meta.institution_type ?? null,
        type: meta.institution_type ?? null,
        country: meta.country ?? null,
        city: meta.city ?? null,
        location: cityCountry || null,
        website: meta.website ?? null,
        phone: meta.phone ?? null,
        contact_email: user.email ?? null,
        status: "active",
      })
      .select()
      .single();
    institution = newInst;
  }

  async function updateInstitution(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const country = formData.get("country") as string;
    const city = formData.get("city") as string;
    const website = formData.get("website") as string;
    const phone = formData.get("phone") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const institutionType = formData.get("institutionType") as string;
    const foundedYear = formData.get("foundedYear") ? parseInt(formData.get("foundedYear") as string) : null;
    const numStudents = formData.get("numStudents") as string;
    const linkedinUrl = formData.get("linkedinUrl") as string;

    const { data: existing } = await supabase.from("institutions").select("id").eq("user_id", user.id).single();

    if (existing) {
      await supabase.from("institutions").update({
        name, description, country, city, website, phone,
        contact_email: contactEmail,
        institution_type: institutionType,
        founded_year: foundedYear,
        num_students: numStudents,
        linkedin_url: linkedinUrl,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id);
    } else {
      await supabase.from("institutions").insert({
        user_id: user.id,
        name, description, country, city, website, phone,
        contact_email: contactEmail,
        institution_type: institutionType,
        founded_year: foundedYear,
        num_students: numStudents,
        linkedin_url: linkedinUrl,
        status: "active",
      });
    }

    revalidatePath("/app/institution/profile");
  }

  const fields = [
    institution?.name,
    (institution as any)?.institution_type,
    institution?.country,
    institution?.location ?? (institution as any)?.city,
    institution?.description,
    institution?.website,
  ];
  const profileCompletion = Math.round(fields.filter(Boolean).length / fields.length * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">Perfil Institucional</h1>
          <p className="text-gray-500 font-medium mt-1">Gestiona la información de tu institución.</p>
        </div>
        <Badge className={`self-start sm:self-auto font-bold px-4 py-2 rounded-full border-none text-sm ${profileCompletion >= 80 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
          {profileCompletion}% completado
        </Badge>
      </div>

      {/* Completion banner */}
      {profileCompletion < 80 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Building2 size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800">Completa tu perfil institucional</p>
            <p className="text-xs text-amber-600 font-medium mt-0.5">Un perfil completo genera más confianza en los docentes y mejora los resultados de búsqueda.</p>
          </div>
        </div>
      )}

      {/* Profile completeness bar */}
      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center gap-4">
            {/* Logo upload */}
            <InstitutionLogoUpload
              institutionId={institution?.id ?? ""}
              currentLogoUrl={institution?.logo_url ?? null}
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-navy truncate">{institution?.name || "Mi Institución"}</h2>
              <p className="text-sm text-gray-500 font-medium">{[institution?.city, institution?.country].filter(Boolean).join(", ") || "Ubicación por configurar"}</p>
              <div className="mt-2">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-talentia-blue rounded-full transition-all duration-700" style={{ width: `${profileCompletion}%` }} />
                </div>
                <p className="text-xs text-gray-400 font-medium mt-1">{profileCompletion}% del perfil completado</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main form */}
      <form action={updateInstitution} className="space-y-6">
        {/* Identity */}
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
              <Building2 size={18} className="text-talentia-blue" /> Identidad institucional
            </CardTitle>
            <CardDescription>Información principal de tu institución.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Nombre de la institución <span className="text-red-500">*</span></label>
                <input name="name" defaultValue={institution?.name ?? ''} required
                  className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium"
                  placeholder="Universidad / Escuela de Negocios / Centro..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Tipo de institución</label>
                <select name="institutionType" defaultValue={(institution as any)?.institution_type || "university"}
                  className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium appearance-none">
                  <option value="university">Universidad pública</option>
                  <option value="private_university">Universidad privada</option>
                  <option value="business_school">Business School / MBA</option>
                  <option value="polytechnic">Escuela Politécnica</option>
                  <option value="online">Universidad online</option>
                  <option value="research">Centro de investigación</option>
                  <option value="other">Otro centro educativo</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Descripción de la institución</label>
              <textarea name="description" defaultValue={(institution as any)?.description ?? ''} rows={4}
                className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium resize-none"
                placeholder="Describe brevemente tu institución, misión y programas principales..." />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
              <MapPin size={18} className="text-talentia-blue" /> Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><Globe size={11} /> País</label>
                <input name="country" defaultValue={institution?.country ?? ''}
                  className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium"
                  placeholder="España" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><MapPin size={11} /> Ciudad</label>
                <input name="city" defaultValue={(institution as any)?.city ?? ''}
                  className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium"
                  placeholder="Madrid" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
              <Phone size={18} className="text-talentia-blue" /> Contacto y presencia digital
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><Mail size={11} /> Email de contacto</label>
                <input name="contactEmail" type="email" defaultValue={(institution as any)?.contact_email || user.email}
                  className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium"
                  placeholder="rrhh@universidad.edu" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><Phone size={11} /> Teléfono</label>
                <input name="phone" defaultValue={(institution as any)?.phone}
                  className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium"
                  placeholder="+34 91 000 0000" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><Globe size={11} /> Web oficial</label>
                <input name="website" defaultValue={institution?.website ?? ''}
                  className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium"
                  placeholder="https://www.universidad.edu" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><LinkIcon size={11} /> LinkedIn</label>
                <input name="linkedinUrl" defaultValue={(institution as any)?.linkedin_url}
                  className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium"
                  placeholder="https://linkedin.com/school/..." />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Extra info */}
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
              <Users size={18} className="text-talentia-blue" /> Datos adicionales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><Calendar size={11} /> Año de fundación</label>
                <input name="foundedYear" type="number" defaultValue={(institution as any)?.founded_year}
                  className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium"
                  placeholder="1960" min="1800" max="2024" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><Users size={11} /> Número de estudiantes</label>
                <select name="numStudents" defaultValue={(institution as any)?.num_students || ""}
                  className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium appearance-none">
                  <option value="">Seleccionar...</option>
                  <option value="<500">Menos de 500</option>
                  <option value="500-2000">500 – 2.000</option>
                  <option value="2000-10000">2.000 – 10.000</option>
                  <option value="10000-30000">10.000 – 30.000</option>
                  <option value=">30000">Más de 30.000</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pb-8">
          <Button type="submit" className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 px-10 rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center gap-2">
            <Save size={16} />
            Guardar perfil institucional
          </Button>
        </div>
      </form>
    </div>
  );
}
