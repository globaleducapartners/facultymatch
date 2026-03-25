import { createAdminClient } from "@/lib/supabase-server";
import PendingFacultyPanel from "./PendingFacultyPanel";

export default async function ControlPage() {
  const admin = createAdminClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    { count: pendingCount },
    { count: approvedToday },
    { count: approvedMonth },
    { count: totalFaculty },
    { data: pendingRaw },
  ] = await Promise.all([
    admin.from('user_profiles').select('*', { count: 'exact', head: true })
      .eq('role', 'faculty').eq('verification_status', 'pending'),
    admin.from('user_profiles').select('*', { count: 'exact', head: true })
      .eq('role', 'faculty').eq('verification_status', 'approved')
      .gte('verified_at', today.toISOString()),
    admin.from('user_profiles').select('*', { count: 'exact', head: true })
      .eq('role', 'faculty').eq('verification_status', 'approved')
      .gte('verified_at', startOfMonth.toISOString()),
    admin.from('user_profiles').select('*', { count: 'exact', head: true })
      .eq('role', 'faculty'),
    admin.from('user_profiles')
      .select(`
        id, full_name, email, created_at, verification_status, verification_notes,
        faculty_profiles!left(
          faculty_areas, availability, modalities, linkedin_url,
          bio, location, city, country, headline
        )
      `)
      .eq('role', 'faculty')
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: true })
      .limit(100),
  ]);

  // Fetch user metadata (academic_level, phone, aneca) from auth
  let metaMap: Record<string, { email?: string; academic_level?: string; phone?: string; aneca_accreditation?: boolean }> = {};
  if (pendingRaw && pendingRaw.length > 0) {
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (authData?.users) {
      const ids = new Set(pendingRaw.map(p => p.id));
      authData.users.forEach(u => {
        if (ids.has(u.id)) {
          metaMap[u.id] = {
            email: u.email,
            academic_level: u.user_metadata?.academic_level,
            phone: u.user_metadata?.phone,
            aneca_accreditation: u.user_metadata?.aneca_accreditation,
          };
        }
      });
    }
  }

  const pendingFaculty = (pendingRaw ?? []).map((p: any) => {
    const fp = Array.isArray(p.faculty_profiles) ? p.faculty_profiles[0] : p.faculty_profiles;
    const meta = metaMap[p.id] || {};
    return {
      id: p.id,
      full_name: p.full_name,
      email: p.email || meta.email || null,
      created_at: p.created_at,
      verification_status: p.verification_status,
      verification_notes: p.verification_notes,
      faculty_areas: fp?.faculty_areas ?? [],
      availability: fp?.availability ?? null,
      modalities: fp?.modalities ?? [],
      linkedin_url: fp?.linkedin_url ?? null,
      bio: fp?.bio ?? null,
      location: fp?.location ?? null,
      city: fp?.city ?? null,
      country: fp?.country ?? null,
      headline: fp?.headline ?? null,
      academic_level: meta.academic_level ?? null,
      phone: meta.phone ?? null,
      aneca_accreditation: meta.aneca_accreditation ?? false,
    };
  });

  const metrics = [
    { label: "Pendientes de revisión", value: pendingCount ?? 0, color: "bg-amber-50 text-amber-700 border-amber-100" },
    { label: "Aprobados hoy", value: approvedToday ?? 0, color: "bg-green-50 text-green-700 border-green-100" },
    { label: "Aprobados este mes", value: approvedMonth ?? 0, color: "bg-blue-50 text-blue-700 border-blue-100" },
    { label: "Total en la plataforma", value: totalFaculty ?? 0, color: "bg-gray-50 text-gray-700 border-gray-200" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-navy tracking-tight">Verificación de Docentes</h1>
        <p className="text-gray-500 font-medium mt-1">
          Revisa y aprueba los perfiles pendientes de verificación.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className={`rounded-2xl border p-5 ${m.color}`}>
            <p className="text-3xl font-black">{m.value}</p>
            <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-70">{m.label}</p>
          </div>
        ))}
      </div>

      <PendingFacultyPanel faculty={pendingFaculty} />
    </div>
  );
}
