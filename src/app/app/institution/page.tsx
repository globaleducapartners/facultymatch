import { createClient, createAdminClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { extractDomainFromWebsite, extractDomainFromEmail } from "@/lib/domain";
import {
  Building2, Globe, MapPin, Phone, Mail, Users, Calendar,
  Link as LinkIcon, Save, ShieldCheck, Download,
  AlertTriangle, Search, ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { InstitutionLogoUpload } from "@/components/dashboard/InstitutionLogoUpload";
import { SecuritySettingsSection } from "@/components/settings/SecuritySettingsSection";
import { DeleteAccountButton } from "@/components/settings/DeleteAccountButton";
import { InstitutionSaveButton } from "@/components/dashboard/InstitutionSaveButton";

export default async function InstitutionDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: errorParam } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const admin = createAdminClient();
  let { data: institution } = await admin
    .from("institutions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Auto-create institution record if missing
  if (!institution) {
    const meta = user.user_metadata || {};
    const cityCountry = [meta.city, meta.country].filter(Boolean).join(", ");
    const { data: newInst } = await admin
      .from("institutions")
      .insert({
        id: user.id,
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
    const modality = formData.get("modality") as string;
    const cityCountry = [city, country].filter(Boolean).join(", ");

    // Domain validation: if website changed, verify it matches the account email domain
    if (website && user.email) {
      const websiteDomain = extractDomainFromWebsite(website);
      const emailDomain = extractDomainFromEmail(user.email);
      if (websiteDomain && emailDomain) {
        const emailDomainLower = emailDomain.toLowerCase();
        const websiteDomainLower = websiteDomain.toLowerCase();
        const isValidDomain = emailDomainLower === websiteDomainLower ||
          emailDomainLower.endsWith("." + websiteDomainLower);
        if (!isValidDomain) {
          redirect(`/app/institution?error=domain-mismatch`);
        }
      } else if (!websiteDomain) {
        redirect(`/app/institution?error=invalid-website`);
      }
    }

    const adminClient = createAdminClient();
    const { data: existing } = await adminClient.from("institutions").select("id").eq("user_id", user.id).maybeSingle();

    if (existing) {
      await adminClient.from("institutions").update({
        name, description, country, city,
        location: cityCountry || null,
        website, phone,
        contact_email: contactEmail,
        institution_type: institutionType,
        type: institutionType,
        founded_year: foundedYear,
        num_students: numStudents,
        linkedin_url: linkedinUrl,
        modality: modality || null,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id);
    } else {
      await adminClient.from("institutions").insert({
        id: user.id,
        user_id: user.id,
        name, description, country, city,
        location: cityCountry || null,
        website, phone,
        contact_email: contactEmail,
        institution_type: institutionType,
        type: institutionType,
        founded_year: foundedYear,
        num_students: numStudents,
        linkedin_url: linkedinUrl,
        modality: modality || null,
        status: "active",
      });
    }

    // Email notification
    if (user.email) {
      const r = new Resend(process.env.RESEND_API_KEY);
      r.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "FacultyMatch <noreply@facultymatch.app>",
        to: [user.email],
        subject: "Perfil institucional actualizado — FacultyMatch",
        html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
<tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;max-width:600px;">
<tr><td style="background:#0B1220;padding:24px 40px;text-align:center;border-radius:16px 16px 0 0;">
  <span style="color:#fff;font-size:20px;font-weight:900;">FACULTY<span style="color:#2563EB;">MATCH</span></span>
</td></tr>
<tr><td style="padding:40px;">
  <h2 style="margin:0 0 12px;color:#0B1220;font-size:22px;font-weight:900;">Perfil actualizado correctamente</h2>
  <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0 0 24px;">
    Hemos guardado los cambios en el perfil de <strong style="color:#0B1220;">${name}</strong>.
  </p>
  <a href="https://www.facultymatch.app/app/institution" style="display:inline-block;background:#2563EB;color:#fff;padding:14px 28px;border-radius:10px;font-weight:700;text-decoration:none;">
    Ver mi dashboard →
  </a>
</td></tr>
<tr><td style="background:#f8fafc;padding:16px 40px;text-align:center;border-top:1px solid #e2e8f0;border-radius:0 0 16px 16px;">
  <p style="margin:0;font-size:11px;color:#94a3b8;">FacultyMatch · www.facultymatch.app</p>
</td></tr>
</table></td></tr></table>
</body></html>`,
      }).catch(e => console.warn("[updateInstitution] email failed:", e));
    }

    revalidatePath("/app/institution");
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
  const isBlocked = (institution as any)?.status === "blocked";

  const instTypeLabel: Record<string, string> = {
    university: "Universidad pública", private_university: "Universidad privada",
    business_school: "Business School", polytechnic: "Escuela Politécnica",
    online: "Universidad online", research: "Centro de investigación", other: "Centro educativo",
  };
  // Map old Spanish text values (stored from signup form) to the select option keys
  const legacyTypeMap: Record<string, string> = {
    "Universidad pública": "university",
    "Universidad privada": "private_university",
    "Business School": "business_school",
    "Centro de FP Superior": "polytechnic",
    "Centro online": "online",
    "Academia / Instituto": "other",
    "Empresa con formación interna": "other",
    "Otro": "other",
  };
  const rawInstType = (institution as any)?.institution_type as string | null | undefined;
  const normalizedInstType = rawInstType ? (legacyTypeMap[rawInstType] ?? rawInstType) : "university";
  const typeLabel = instTypeLabel[normalizedInstType] || rawInstType || "Institución";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Search CTA hero */}
      <Link href="/app/institution/search" className="block group">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D2240] to-[#1B4FD8] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-300">
          <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle at 80% 50%, #fff 0%, transparent 70%)" }} />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
              <Search size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Directorio de docentes</p>
              <h2 className="text-white text-base font-black leading-tight">Buscar profesorado</h2>
            </div>
          </div>
          <span className="relative inline-flex items-center gap-2 bg-white text-[#1B4FD8] font-black px-4 py-2 rounded-xl text-sm group-hover:bg-blue-50 transition-colors flex-shrink-0">
            Buscar ahora <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </Link>

      {errorParam === "domain-mismatch" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center gap-3 text-red-700 font-bold text-sm">
          ✗ El dominio de la web debe coincidir con el dominio de tu correo electrónico institucional.
        </div>
      )}
      {errorParam === "invalid-website" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center gap-3 text-red-700 font-bold text-sm">
          ✗ La URL de la web institucional no es válida. Asegúrate de incluir el dominio completo.
        </div>
      )}

      {/* Blocked banner */}
      {isBlocked && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-800">Cuenta bloqueada</p>
            <p className="text-xs text-red-600 font-medium mt-0.5">
              Tu cuenta ha sido bloqueada por nuestro equipo. Contacta con soporte para más información.
            </p>
          </div>
        </div>
      )}

      {/* ── Two-column layout: left form, right sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

        {/* ── LEFT: LinkedIn-style profile + form ── */}
        <div className="space-y-5">

          {/* Profile card (cover + logo + name) */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            {/* Cover band */}
            <div className="h-36 bg-gradient-to-br from-[#0D2240] via-[#1B4FD8] to-[#4F7FE8] relative">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
            </div>
            <CardContent className="pt-0 pb-5 px-6">
              {/* Logo overlapping cover */}
              <div className="flex items-end justify-between" style={{ marginTop: -44 }}>
                <div className="relative z-10 p-1 bg-white rounded-2xl shadow-md">
                  <InstitutionLogoUpload
                    institutionId={institution?.id ?? ""}
                    currentLogoUrl={institution?.logo_url ?? null}
                  />
                </div>
                <div className="flex items-center gap-2 pb-1">
                  {isBlocked && (
                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-100">
                      <AlertTriangle size={10} /> Bloqueada
                    </span>
                  )}
                </div>
              </div>
              {/* Name + meta */}
              <div className="mt-3">
                <h1 className="text-2xl font-black text-[#0C1018] leading-tight">{institution?.name || "Mi Institución"}</h1>
                <p className="text-sm text-gray-500 font-medium mt-0.5">
                  {typeLabel || "Institución"}{[institution?.city, institution?.country].filter(Boolean).length > 0 && " · "}
                  {[institution?.city, institution?.country].filter(Boolean).join(", ")}
                  {(institution as any)?.modality && ` · ${(institution as any).modality}`}
                </p>
                {(institution as any)?.website && (
                  <a href={(institution as any).website} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#1B4FD8] font-medium hover:underline mt-1 inline-block">
                    🌐 {((institution as any).website as string).replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile edit form */}
          <form action={updateInstitution} className="space-y-5">
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
                <select name="institutionType" defaultValue={normalizedInstType}
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
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Modalidad de estudios</label>
                <select name="modality" defaultValue={(institution as any)?.modality || ""}
                  className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium appearance-none">
                  <option value="">Sin especificar</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Online">Online</option>
                  <option value="Híbrida">Híbrida</option>
                  <option value="A distancia">A distancia</option>
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
                <input name="phone" defaultValue={(institution as any)?.phone ?? ''}
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
                <input name="linkedinUrl" defaultValue={(institution as any)?.linkedin_url ?? ''}
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
                <input name="foundedYear" type="number" defaultValue={(institution as any)?.founded_year ?? ''}
                  className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium"
                  placeholder="1960" min="1800" max="2030" />
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

        <div className="flex justify-end">
          <InstitutionSaveButton />
        </div>
      </form>

        </div>{/* end LEFT column */}

        {/* ── RIGHT sidebar ── */}
        <div className="space-y-4 lg:sticky lg:top-6">

          {/* Progress card */}
          <Card className="border-none shadow-sm rounded-2xl">
            <CardContent className="pt-5 pb-5">
              <p className="text-sm font-black text-[#0C1018] mb-3">Progreso del perfil</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">
                  {profileCompletion < 60 ? "Empieza a completar tu perfil" : profileCompletion < 80 ? "Casi completo" : "Perfil completo"}
                </span>
                <span className="text-xl font-black" style={{ color: profileCompletion >= 80 ? "#059669" : "#1B4FD8" }}>
                  {profileCompletion}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${profileCompletion}%`, background: profileCompletion >= 80 ? "#059669" : "#1B4FD8" }} />
              </div>
            </CardContent>
          </Card>

          {/* Quick access */}
          <Card className="border-none shadow-sm rounded-2xl">
            <CardContent className="pt-5 pb-5">
              <p className="text-sm font-black text-[#0C1018] mb-3">Accesos rápidos</p>
              <div className="space-y-2">
                <Link href="/app/institution/search" className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#F2F6FC] transition-colors group">
                  <Search size={15} className="text-[#1B4FD8] flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0D2240]">Buscar docentes</span>
                </Link>
                <Link href="/app/institution/favorites" className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#F2F6FC] transition-colors group">
                  <span className="text-[#E9A030] text-sm">★</span>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0D2240]">Mis favoritos</span>
                </Link>
                <Link href="/app/institution/contacts" className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#F2F6FC] transition-colors group">
                  <Mail size={15} className="text-[#1B4FD8] flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0D2240]">Contactos enviados</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          {profileCompletion < 100 && (
            <Card className="border-none shadow-sm rounded-2xl">
              <CardContent className="pt-5 pb-5">
                <p className="text-sm font-black text-[#0C1018] mb-3">Mejora tu visibilidad</p>
                <div className="space-y-2.5">
                  {!institution?.name && <Tip text="Añade el nombre de tu institución" />}
                  {!(institution as any)?.description && <Tip text="Escribe una descripción de la institución" />}
                  {!institution?.website && <Tip text="Añade tu web oficial" />}
                  {!(institution as any)?.contact_email && <Tip text="Añade un email de contacto" />}
                  {!institution?.country && <Tip text="Indica el país y ciudad" />}
                </div>
              </CardContent>
            </Card>
          )}
        </div>{/* end RIGHT sidebar */}

      </div>{/* end grid */}

      {/* Settings section */}
      <div className="pt-4 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-navy mb-1">Configuración de cuenta</h2>
        <p className="text-gray-500 font-medium mb-6">Gestiona la seguridad y tus datos.</p>

        {/* Security */}
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
              <ShieldCheck size={18} className="text-talentia-blue" /> Seguridad & Acceso
            </CardTitle>
            <CardDescription className="font-medium">Gestiona cómo accedes a tu cuenta.</CardDescription>
          </CardHeader>
          <CardContent>
            <SecuritySettingsSection currentEmail={user.email!} />
          </CardContent>
        </Card>

        {/* GDPR */}
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
              <Download size={18} className="text-talentia-blue" /> Tus datos (GDPR)
            </CardTitle>
            <CardDescription className="font-medium">
              Tienes derecho a exportar o eliminar tus datos en cualquier momento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <a
                href={`/api/institution/export-data`}
                className="flex-1 w-full border border-gray-200 hover:bg-gray-50 text-navy font-bold rounded-xl h-12 flex items-center justify-center gap-2 text-sm transition-colors"
              >
                <Download size={18} /> Exportar mis datos
              </a>
            </div>
            <div className="p-5 rounded-2xl bg-red-50/50 border border-red-100">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-red-500" />
                <h4 className="text-sm font-black text-red-700">Eliminar cuenta</h4>
              </div>
              <p className="text-xs text-red-600 font-medium mb-4 leading-relaxed">
                Si eliminas tu cuenta, todos los datos de tu institución se perderán permanentemente. Esta acción no se puede deshacer.
              </p>
              <DeleteAccountButton role="institution" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
      <span className="text-xs text-gray-500 font-medium">{text}</span>
    </div>
  );
}
