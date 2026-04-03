import { createClient } from "@/lib/supabase-server";
import { InstitutionSearchPage } from "@/components/dashboard/InstitutionSearchPage";
import { InstitutionWelcomeBanner } from "@/components/dashboard/InstitutionWelcomeBanner";
import { redirect } from "next/navigation";

export default async function InstitutionSearchRoute({
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
  if (!user) redirect("/login");

  const { data: institution } = await supabase
    .from("institutions")
    .select("id, name, type, country, location, website, description, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!institution) {
    redirect("/app/institution");
  }

  // Fetch favorites
  const { data: favoritesData } = await supabase
    .from("favorites")
    .select("faculty_id")
    .eq("institution_id", institution.id);

  const favorites = favoritesData?.map(f => f.faculty_id) || [];

  const { count: contactsCount } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("institution_id", institution.id);

  // Faculty who have blocked this institution (they don't want to appear here)
  const { data: blockedRules } = await supabase
    .from("visibility_rules")
    .select("faculty_id")
    .eq("institution_id", institution.id)
    .eq("rule", "block");

  const blockedFacultyIds = new Set((blockedRules || []).map((r: any) => r.faculty_id));

  // Search — include plan + subscription_status for pro priority sorting
  let educatorQuery = supabase
    .from("faculty_profiles")
    .select(`*, user:user_profiles(full_name, avatar_url, plan, subscription_status), expertise:faculty_expertise(*)`)
    .eq('visibility', 'public');

  if (query) {
    educatorQuery = educatorQuery.or(`headline.ilike.%${query}%,bio.ilike.%${query}%`);
  }
  if (country) {
    educatorQuery = educatorQuery.ilike('location', `%${country}%`);
  }

  const { data: educators } = await educatorQuery.limit(150);

  let filteredEducators = (educators || []).filter(ed =>
    // Exclude faculty who explicitly blocked this institution
    !blockedFacultyIds.has((ed as any).id)
  );

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
        exp.level?.toLowerCase().includes(subarea.toLowerCase()) ||
        exp.area.toLowerCase().includes(subarea.toLowerCase())
      )
    );
  }

  const transformedEducators = filteredEducators
    .map(ed => {
      const userJoin = (ed as any).user;
      const userObj = Array.isArray(userJoin) ? userJoin[0] : userJoin;
      const isPro = userObj?.plan === 'faculty-pro' && userObj?.subscription_status === 'active';
      return {
        ...ed,
        full_name: userObj?.full_name || (ed as any).full_name || "Docente",
        avatar_url: userObj?.avatar_url || null,
        country: (ed as any).country || ed.location || null,
        city: (ed as any).city || null,
        experience_years: (ed as any).years_teaching || (ed as any).years_experience || 0,
        is_pro: isPro,
      };
    })
    // Sort: pro users first, then the rest
    .sort((a, b) => {
      if ((a as any).is_pro && !(b as any).is_pro) return -1;
      if (!(a as any).is_pro && (b as any).is_pro) return 1;
      return 0;
    })
    .slice(0, 100);

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
        institutionId={institution.id || ""}
        searchParams={params}
        initialFavorites={favorites}
      />
    </>
  );
}
