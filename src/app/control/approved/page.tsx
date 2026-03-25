import { createAdminClient } from "@/lib/supabase-server";
import FacultyListPanel from "../FacultyListPanel";

export default async function ApprovedPage() {
  const admin = createAdminClient();

  const { data: raw } = await admin
    .from("user_profiles")
    .select("id, full_name, created_at, verified_at, verification_notes")
    .eq("role", "faculty")
    .eq("verification_status", "approved")
    .order("verified_at", { ascending: false })
    .limit(200);

  let metaMap: Record<string, any> = {};
  let fpMap: Record<string, any> = {};

  if (raw && raw.length > 0) {
    const ids = raw.map((p) => p.id);

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
          };
        }
      });
    }

    const { data: fps } = await admin
      .from("faculty_profiles")
      .select("user_id, faculty_areas, availability, modalities, linkedin_url, bio, location, city, country, headline")
      .in("user_id", ids);
    if (fps) fps.forEach((fp: any) => { fpMap[fp.user_id] = fp; });
  }

  const faculty = (raw ?? []).map((p: any) => {
    const meta = metaMap[p.id] || {};
    const fp = fpMap[p.id] || {};
    return {
      id: p.id,
      full_name: p.full_name,
      email: meta.email || null,
      created_at: p.created_at,
      verified_at: p.verified_at,
      verification_status: "approved",
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
      academic_level: meta.academic_level || null,
      phone: meta.phone || null,
      aneca_accreditation: meta.aneca_accreditation || false,
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-navy tracking-tight">Docentes Aprobados</h1>
        <p className="text-gray-500 font-medium mt-1">Perfiles verificados y activos en la plataforma.</p>
      </div>
      <FacultyListPanel faculty={faculty} mode="approved" title="Docentes verificados" />
    </div>
  );
}
