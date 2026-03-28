import { createClient } from "@/lib/supabase-server";
import { InstitutionSearchPage } from "@/components/dashboard/InstitutionSearchPage";
import { InstitutionWelcomeBanner } from "@/components/dashboard/InstitutionWelcomeBanner";

export default async function InstitutionDashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const query = (params.query as string) || "";
  const area = (params.area as string) || "";
  const subarea = (params.subarea as string) || "";
  const country = (params.country as string) || "";

  const { data: { user } } = await supabase.auth.getUser();

  const { data: institution } = await supabase
    .from("institutions")
    .select("id, name, type, country, location, website, description, created_at")
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!institution) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="max-w-md text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-black text-navy mb-3">Perfil institucional incompleto</h2>
          <p className="text-gray-500 font-medium">
            Para poder contactar docentes necesitas completar tu perfil institucional primero.
          </p>
        </div>
      </div>
    );
  }

  // Fetch favorites to show in the UI
  const { data: favoritesData } = await supabase
    .from("favorites")
    .select("faculty_id")
    .eq("institution_id", institution?.id);

  const favorites = favoritesData?.map(f => f.faculty_id) || [];

  // Check if institution has sent any contacts (for welcome banner)
  const { count: contactsCount } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("institution_id", institution?.id);

  // Search logic (JOIN with user_profiles to get full_name)
  let educatorQuery = supabase
    .from("faculty_profiles")
    .select(`
      *,
      user:user_profiles(full_name, avatar_url),
      expertise:faculty_expertise(*)
    `)
    .eq('visibility', 'public'); 

  if (query) {
    // Note: We can filter by bio/headline in faculty_profiles, 
    // and ideally we would filter by full_name in joined user_profiles,
    // but PostgREST filtering on joined tables can be tricky.
    // For now, let's filter what we can on the main table.
    educatorQuery = educatorQuery.or(`headline.ilike.%${query}%,bio.ilike.%${query}%`);
  }

  if (country) {
    // Assuming 'location' contains country or we use a partial match
    educatorQuery = educatorQuery.ilike('location', `%${country}%`);
  }

  const { data: educators } = await educatorQuery.limit(100);

  // Client-side filtering for complex cases
  let filteredEducators = educators || [];

  // If query was provided, let's also filter by full_name client-side if needed
  if (query) {
    filteredEducators = filteredEducators.filter(ed => 
      (ed as any).user?.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      ed.headline?.toLowerCase().includes(query.toLowerCase()) ||
      ed.bio?.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  if (area) {
    filteredEducators = filteredEducators.filter(ed => 
      (ed as any).expertise?.some((exp: any) => 
        exp.area.toLowerCase().includes(area.toLowerCase())
      )
    );
  }

  if (subarea) {
    filteredEducators = filteredEducators.filter(ed => 
      (ed as any).expertise?.some((exp: any) => 
        exp.level?.toLowerCase().includes(subarea.toLowerCase()) || // Level as subarea fallback
        exp.area.toLowerCase().includes(subarea.toLowerCase())
      )
    );
  }

    // Transform for UI — handle user join (may be object or array depending on FK constraint)
    const transformedEducators = filteredEducators.map(ed => {
      const userJoin = (ed as any).user;
      const userObj = Array.isArray(userJoin) ? userJoin[0] : userJoin;
      return {
        ...ed,
        full_name: userObj?.full_name || (ed as any).full_name || "Docente",
        avatar_url: userObj?.avatar_url || null,
        // Normalize location fields
        country: (ed as any).country || ed.location || null,
        city: (ed as any).city || null,
        // Map experience to correct field names
        experience_years: (ed as any).years_teaching || (ed as any).years_experience || 0,
      };
    });

  const isNewUser = !!(institution.created_at &&
    new Date().getTime() - new Date(institution.created_at).getTime() < 1000 * 60 * 60 * 24 * 30);

  return (
    <>
      {isNewUser && (
        <InstitutionWelcomeBanner
          institutionName={institution.name || ""}
          institutionId={institution.id}
          hasDescription={!!institution.description}
          hasFavorites={favorites.length > 0}
          hasContacts={(contactsCount ?? 0) > 0}
          storageKey={`fm_welcome_inst_${institution.id}`}
        />
      )}
      <InstitutionSearchPage
        initialEducators={transformedEducators}
        institutionId={institution?.id || ""}
        searchParams={params}
        initialFavorites={favorites}
      />
    </>
  );
}
