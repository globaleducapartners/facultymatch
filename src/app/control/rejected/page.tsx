import { createAdminClient } from "@/lib/supabase-server";
import FacultyListPanel from "../FacultyListPanel";

export default async function RejectedPage() {
  const admin = createAdminClient();

  const { data: raw } = await admin
    .from("faculty_profiles")
    .select("user_id, estado_perfil, verificado_en, verification_notes")
    .eq("estado_perfil", "rechazado")
    .order("verificado_en", { ascending: false, nulls: "last" })
    .limit(200);

  let userMap: Record<string, any> = {};
  let fpMap: Record<string, any> = {};
  let docsMap: Record<string, any[]> = {};

  if (raw && raw.length > 0) {
    const ids = raw.map((p) => p.user_id);

    const { data: users } = await admin
      .from("user_profiles")
      .select("id, full_name, email, created_at")
      .in("id", ids)
      .eq("role", "faculty");
    if (users) users.forEach((u: any) => { userMap[u.id] = u; });

    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (authData?.users) {
      const idSet = new Set(ids);
      authData.users.forEach((u) => {
        if (idSet.has(u.id)) {
          userMap[u.id] = { ...(userMap[u.id] || {}), id: u.id, ...u.user_metadata };
        }
      });
    }

    const { data: fps } = await admin
      .from("faculty_profiles")
      .select("user_id, faculty_areas, availability, modalities, linkedin_url, bio, location, city, country, headline, updated_at, degrees, languages, website, google_scholar_id, orcid_id, is_phd, aneca_accreditation, academic_level, name_visibility")
      .in("user_id", ids);
    if (fps) fps.forEach((fp: any) => { fpMap[fp.user_id] = fp; });

    const { data: docs } = await admin
      .from("faculty_documents")
      .select("id, faculty_id, name, doc_type, created_at")
      .in("faculty_id", ids);
    if (docs) {
      docs.forEach((d: any) => {
        if (!docsMap[d.faculty_id]) docsMap[d.faculty_id] = [];
        docsMap[d.faculty_id].push(d);
      });
    }
  }

  const faculty = (raw ?? []).map((p: any) => {
    const user = userMap[p.user_id] || {};
    const fp = fpMap[p.user_id] || {};
    return {
      id: p.user_id,
      full_name: user.full_name || null,
      email: user.email || null,
      created_at: user.created_at || null,
      verified_at: p.verificado_en,
      verification_status: "rejected",
      verification_notes: p.verification_notes,
      faculty_areas: fp.faculty_areas?.length > 0 ? fp.faculty_areas : (user.knowledge_areas || []),
      availability: fp.availability || user.availability || null,
      modalities: fp.modalities?.length > 0 ? fp.modalities : (user.modalities || []),
      linkedin_url: fp.linkedin_url || null,
      bio: fp.bio || null,
      location: fp.location || null,
      city: fp.city || null,
      country: fp.country || null,
      headline: fp.headline || null,
      profile_updated_at: fp.updated_at || null,
      academic_level: user.academic_level || fp.academic_level || null,
      phone: user.phone || null,
      aneca_accreditation: user.aneca_accreditation || fp.aneca_accreditation || false,
      degrees: fp.degrees || [],
      languages: fp.languages || [],
      website: fp.website || null,
      google_scholar_id: fp.google_scholar_id || null,
      orcid_id: fp.orcid_id || null,
      is_phd: fp.is_phd || false,
      name_visibility: fp.name_visibility || "public",
      documents: docsMap[p.user_id] || [],
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-navy tracking-tight">Docentes Rechazados</h1>
        <p className="text-gray-500 font-medium mt-1">Perfiles que no superaron la verificación. Puedes reactivarlos.</p>
      </div>
      <FacultyListPanel faculty={faculty} mode="rejected" title="Perfiles rechazados" />
    </div>
  );
}
