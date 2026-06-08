import { createAdminClient } from "@/lib/supabase-server";
import PendingFacultyPanel from "./PendingFacultyPanel";

export default async function ControlPage() {
  const admin = createAdminClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Counts
  const [
    { count: pendingCount },
    { count: approvedToday },
    { count: approvedMonth },
    { count: totalFaculty },
  ] = await Promise.all([
    admin.from('user_profiles').select('*', { count: 'exact', head: true })
      .eq('role', 'faculty').or('verification_status.eq.pending,verification_status.is.null'),
    admin.from('user_profiles').select('*', { count: 'exact', head: true })
      .eq('role', 'faculty').eq('verification_status', 'approved')
      .gte('verified_at', today.toISOString()),
    admin.from('user_profiles').select('*', { count: 'exact', head: true })
      .eq('role', 'faculty').eq('verification_status', 'approved')
      .gte('verified_at', startOfMonth.toISOString()),
    admin.from('user_profiles').select('*', { count: 'exact', head: true })
      .eq('role', 'faculty'),
  ]);

  // Fetch pending users (no join — avoids FK resolution issues)
  const { data: pendingRaw, error: pendingError } = await admin
    .from('user_profiles')
    .select('id, full_name, created_at, verification_status, verification_notes')
    .eq('role', 'faculty')
    .or('verification_status.eq.pending,verification_status.is.null')
    .order('created_at', { ascending: true })
    .limit(100);

  let metaMap: Record<string, any> = {};
  let fpMap: Record<string, any> = {};
  let docsMap: Record<string, any[]> = {};

  if (pendingRaw && pendingRaw.length > 0) {
    const ids = pendingRaw.map((p) => p.id);

    // Auth user metadata (email, academic_level, phone, areas, etc.)
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (authData?.users) {
      const idSet = new Set(ids);
      authData.users.forEach((u) => {
        if (idSet.has(u.id)) {
          metaMap[u.id] = {
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
            is_phd: u.user_metadata?.is_phd || false,
            languages: u.user_metadata?.languages || [],
          };
        }
      });
    }

    // Faculty profiles batch (for those who completed onboarding)
    const { data: fps } = await admin
      .from('faculty_profiles')
      .select('user_id, faculty_areas, availability, modalities, linkedin_url, bio, location, city, country, headline, updated_at, degrees, languages, website, google_scholar_id, orcid_id, is_phd, aneca_accreditation, academic_level, contact_email, contact_whatsapp, contact_linkedin, banner_url, name_visibility')
      .in('user_id', ids);
    if (fps) {
      fps.forEach((fp: any) => { fpMap[fp.user_id] = fp; });
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
    const meta = metaMap[p.id] || {};
    const fp = fpMap[p.id] || {};
    return {
      id: p.id,
      full_name: p.full_name,
      email: meta.email || null,
      created_at: p.created_at,
      verification_status: p.verification_status,
      verification_notes: p.verification_notes,
      faculty_areas: fp.faculty_areas?.length > 0 ? fp.faculty_areas : (meta.knowledge_areas || []),
      availability: fp.availability || meta.availability || null,
      modalities: fp.modalities?.length > 0 ? fp.modalities : (meta.modalities || []),
      linkedin_url: fp.linkedin_url || null,
      bio: fp.bio || null,
      location: fp.location || null,
      city: fp.city || null,
      country: fp.country || null,
      headline: fp.headline || null,
      profile_updated_at: fp.updated_at || null,
      academic_level: meta.academic_level || fp.academic_level || null,
      phone: meta.phone || null,
      aneca_accreditation: meta.aneca_accreditation || fp.aneca_accreditation || false,
      degrees: fp.degrees || [],
      languages: fp.languages?.length > 0 ? fp.languages : (meta.languages || []),
      website: fp.website || meta.website || null,
      google_scholar_id: fp.google_scholar_id || meta.google_scholar || null,
      orcid_id: fp.orcid_id || meta.orcid || null,
      is_phd: fp.is_phd || meta.is_phd || false,
      name_visibility: fp.name_visibility || 'public',
      documents: docsMap[p.id] || [],
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-navy tracking-tight">Verificación de Docentes</h1>
        <p className="text-gray-500 font-medium mt-1">
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
