import { createClient } from "@/lib/supabase-server";
import { InstitutionSearchPage } from "@/components/dashboard/InstitutionSearchPage";

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
  const language = (params.language as string) || "";
  const country = (params.country as string) || "";
  const aneca = (params.aneca as string) || "";
  const phd = (params.phd as string) || "";
  const modality = params.modality; // Can be string or array

  const { data: { user } } = await supabase.auth.getUser();

  const { data: institution } = await supabase
    .from("institutions")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  // Fetch favorites to show in the UI
  const { data: favoritesData } = await supabase
    .from("favorites")
    .select("faculty_id")
    .eq("institution_id", institution?.id);
  
  const favorites = favoritesData?.map(f => f.faculty_id) || [];

  // Search logic
  let educatorQuery = supabase
    .from("faculty_profiles")
    .select(`
      *,
      expertise:faculty_expertise(*)
    `)
    .in('visibility', ['public', 'institutions_only']); // Allow both public and institution-only profiles

  // Visibility filter: Exclude profiles that have blocked this institution
  // This is also handled by RLS, but keeping it for explicit filtering if needed
  if (institution?.id) {
    educatorQuery = educatorQuery.not('hidden_from_institutions', 'cs', `{${institution.id}}`);
  }

  if (query) {
    educatorQuery = educatorQuery.or(`full_name.ilike.%${query}%,headline.ilike.%${query}%,bio.ilike.%${query}%`);
  }

  if (country) {
    educatorQuery = educatorQuery.eq('country', country);
  }

  if (aneca) {
    educatorQuery = educatorQuery.eq('aneca_accreditation', aneca);
  }

  const { data: educators } = await educatorQuery.limit(100);

  // Client-side filtering for complex cases or many-to-many relations
  let filteredEducators = educators || [];
  
  if (area) {
    filteredEducators = filteredEducators.filter(ed => 
      ed.expertise?.some((exp: any) => exp.area.includes(area))
    );
  }

  if (subarea) {
    filteredEducators = filteredEducators.filter(ed => 
      ed.expertise?.some((exp: any) => 
        exp.subarea.toLowerCase().includes(subarea.toLowerCase()) ||
        exp.topics?.some((t: string) => t.toLowerCase().includes(subarea.toLowerCase()))
      )
    );
  }

  if (language) {
    filteredEducators = filteredEducators.filter(ed => 
      ed.languages?.includes(language)
    );
  }

    if (phd === "true") {
      filteredEducators = filteredEducators.filter(ed => 
        ed.degree_level?.toLowerCase().includes('phd') || 
        ed.degree_level?.toLowerCase().includes('doctor') ||
        ed.headline?.toLowerCase().includes('phd') || 
        ed.headline?.toLowerCase().includes('doctor') ||
        ed.bio?.toLowerCase().includes('doctorado') ||
        ed.bio?.toLowerCase().includes('phd')
      );
    }

  if (modality) {
    const modalities = Array.isArray(modality) ? modality : [modality];
    filteredEducators = filteredEducators.filter(ed => 
      modalities.some(m => 
        ed.modalities?.includes(m) || 
        ed.bio?.toLowerCase().includes(m.toLowerCase()) || 
        ed.headline?.toLowerCase().includes(m.toLowerCase())
      )
    );
  }

  return (
    <InstitutionSearchPage 
      initialEducators={filteredEducators} 
      institutionId={institution?.id || ""} 
      searchParams={params}
      initialFavorites={favorites}
    />
  );
}
