import { createAdminClient } from "@/lib/supabase-server";
import Link from "next/link";
import { Clock, CheckCircle2, Users, Building2, MessageSquare, ArrowRight } from "lucide-react";
import PendingFacultyPanel from "./PendingFacultyPanel";

export default async function ControlPage() {
  const admin = createAdminClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Counts — now from faculty_profiles.estado_perfil
  const [
    { count: pendingCount },
    { count: approvedToday },
    { count: approvedMonth },
    { count: totalFaculty },
    { count: totalInstitutions },
    { count: contactsThisWeek },
  ] = await Promise.all([
    admin.from('faculty_profiles').select('*', { count: 'exact', head: true })
      .eq('estado_perfil', 'en_revision'),
    admin.from('faculty_profiles').select('*', { count: 'exact', head: true })
      .eq('estado_perfil', 'verificado')
      .gte('verificado_en', today.toISOString()),
    admin.from('faculty_profiles').select('*', { count: 'exact', head: true })
      .eq('estado_perfil', 'verificado')
      .gte('verificado_en', startOfMonth.toISOString()),
    admin.from('faculty_profiles').select('*', { count: 'exact', head: true }),
    admin.from('institutions').select('*', { count: 'exact', head: true }),
    admin.from('contacts').select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart.toISOString()),
  ]);

  // Fetch pending users (en_revision = waiting for admin review)
  const { data: pendingRaw, error: pendingError } = await admin
    .from('faculty_profiles')
    .select('user_id, estado_perfil, verification_notes, updated_at, faculty_areas, availability, modalities, linkedin_url, bio, location, city, country, headline, degrees, languages, website, google_scholar_id, orcid_id, is_phd, aneca_accreditation, academic_level, name_visibility, banner_url')
    .eq('estado_perfil', 'en_revision')
    .order('updated_at', { ascending: true })
    .limit(100);

  let userMap: Record<string, any> = {};
  let docsMap: Record<string, any[]> = {};

  if (pendingRaw && pendingRaw.length > 0) {
    const ids = pendingRaw.map((p) => p.user_id);

    // Fetch user_profiles for full_name and email
    const { data: users } = await admin
      .from("user_profiles")
      .select("id, full_name, email, created_at")
      .in("id", ids)
      .eq("role", "faculty");
    if (users) users.forEach((u: any) => { userMap[u.id] = u; });

    // Auth user metadata (email, academic_level, phone, areas, etc.)
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (authData?.users) {
      const idSet = new Set(ids);
      authData.users.forEach((u) => {
        if (idSet.has(u.id)) {
          userMap[u.id] = {
            ...(userMap[u.id] || {}),
            id: u.id,
            email: u.email,
            academic_level: u.user_metadata?.academic_level,
            phone: u.user_metadata?.phone,
            aneca_accreditation: u.user_metadata?.aneca_accreditation,
            knowledge_areas: u.user_metadata?.knowledge_areas || [],
            modalities: u.user_metadata?.modalities || [],
            availability: u.user_metadata?.availability,
            website: u.user_metadata?.website,
            google_scholar: u.user_metadata?.google_scholar_id,
            orcid: u.user_metadata?.orcid_id,
            is_phd_u: u.user_metadata?.is_phd || false,
            languages: u.user_metadata?.languages || [],
          };
        }
      });
    }

    // Faculty documents
    const { data: docs } = await admin
      .from('faculty_documents')
      .select('id, faculty_id, name, doc_type, created_at')
      .in('faculty_id', ids);
    if (docs) {
      docs.forEach((d: any) => {
        if (!docsMap[d.faculty_id]) docsMap[d.faculty_id] = [];
        docsMap[d.faculty_id].push(d);
      });
    }
  }

  const pendingFaculty = (pendingRaw ?? []).map((p: any) => {
    const user = userMap[p.user_id] || {};
    return {
      id: p.user_id,
      full_name: user.full_name || null,
      email: user.email || null,
      created_at: user.created_at || null,
      verification_status: p.estado_perfil,
      verification_notes: p.verification_notes || null,
      faculty_areas: p.faculty_areas?.length > 0 ? p.faculty_areas : (user.knowledge_areas || []),
      availability: p.availability || user.availability || null,
      modalities: p.modalities?.length > 0 ? p.modalities : (user.modalities || []),
      linkedin_url: p.linkedin_url || null,
      bio: p.bio || null,
      location: p.location || null,
      city: p.city || null,
      country: p.country || null,
      headline: p.headline || null,
      profile_updated_at: p.updated_at || null,
      academic_level: user.academic_level || p.academic_level || null,
      phone: user.phone || null,
      aneca_accreditation: user.aneca_accreditation || p.aneca_accreditation || false,
      degrees: p.degrees || [],
      languages: p.languages?.length > 0 ? p.languages : (user.languages || []),
      website: p.website || user.website || null,
      google_scholar_id: p.google_scholar_id || user.google_scholar || null,
      orcid_id: p.orcid_id || user.orcid || null,
      is_phd: p.is_phd || user.is_phd_u || false,
      name_visibility: p.name_visibility || 'public',
      documents: docsMap[p.user_id] || [],
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-navy tracking-tight">Panel de administración</h1>
          <p className="text-gray-500 font-medium mt-1">
            Resumen rápido y cola de verificación de docentes.
          </p>
        </div>
        <Link
          href="/control/metrics"
          className="flex items-center gap-1.5 text-xs font-bold text-talentia-blue hover:underline"
        >
          Ver métricas completas <ArrowRight size={13} />
        </Link>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Pendientes de revisar", value: pendingCount ?? 0, icon: Clock, color: "bg-amber-50 text-amber-600" },
          { label: "Aprobados este mes", value: approvedMonth ?? 0, icon: CheckCircle2, color: "bg-green-50 text-green-600" },
          { label: "Docentes totales", value: totalFaculty ?? 0, icon: Users, color: "bg-blue-50 text-talentia-blue" },
          { label: "Instituciones", value: totalInstitutions ?? 0, icon: Building2, color: "bg-purple-50 text-purple-600" },
          { label: "Contactos (7 días)", value: contactsThisWeek ?? 0, icon: MessageSquare, color: "bg-orange-50 text-energy-orange" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${kpi.color}`}>
              <kpi.icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-black text-navy leading-tight">{kpi.value}</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide truncate">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-black text-navy tracking-tight">Verificación de docentes</h2>
        <p className="text-gray-500 font-medium mt-0.5 text-sm">
          Revisa y aprueba los perfiles pendientes de verificación.
        </p>
      </div>

      <PendingFacultyPanel
        faculty={pendingFaculty}
        error={pendingError?.message || null}
        initialMetrics={{
          pending: pendingCount ?? 0,
          approvedToday: approvedToday ?? 0,
          approvedMonth: approvedMonth ?? 0,
          total: totalFaculty ?? 0,
        }}
      />
    </div>
  );
}
