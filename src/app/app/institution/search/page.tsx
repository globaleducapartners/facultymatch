import { createClient, createAdminClient } from "@/lib/supabase-server";
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

  // Check institution plan
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("plan, subscription_status")
    .eq("id", user.id)
    .single();

  const isPro = userProfile?.plan === "institution-pro" && userProfile?.subscription_status === "active";

  // Detect if this is an active search (any filter applied)
  const hasSearchParams = !!(
    params.query || params.area || params.subarea || params.country ||
    params.language || params.phd || params.modality || params.aneca
  );

  // Search limit enforcement for Essential plan
  let searchLimitReached = false;
  const admin = createAdminClient();
  const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

  if (!isPro && hasSearchParams) {
    const { data: usageData } = await admin
      .from("search_usage")
      .select("search_count")
      .eq("institution_id", institution.id)
      .eq("month", currentMonth)
      .maybeSingle();

    const currentCount = usageData?.search_count ?? 0;

    if (currentCount >= 2) {
      searchLimitReached = true;
    } else {
      // Atomic increment via PostgreSQL function
      await admin.rpc("increment_search_usage", {
        p_institution_id: institution.id,
        p_month: currentMonth,
      });
    }
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

  // Faculty who have blocked this institution — check both institution_id and institution_name
  const [{ data: blockedById }, { data: blockedByName }] = await Promise.all([
    admin
      .from("visibility_rules")
      .select("faculty_id")
      .eq("institution_id", institution.id)
      .eq("rule", "block"),
    institution.name
      ? admin
          .from("visibility_rules")
          .select("faculty_id")
          .ilike("institution_name", institution.name)
          .eq("rule", "block")
      : Promise.resolve({ data: null }),
  ]);

  const blockedFacultyIds = new Set([
    ...(blockedById || []).map((r: any) => r.faculty_id),
    ...(blockedByName || []).map((r: any) => r.faculty_id),
  ]);

  // Search — include plan + subscription_status for pro priority sorting
  let educatorQuery = supabase
    .from("faculty_profiles")
    .select(`*, user:user_profiles(full_name, avatar_url, plan, subscription_status), expertise:faculty_expertise(*)`)
    .in('visibility', ['public', 'private']);

  if (query) {
    educatorQuery = educatorQuery.or(`headline.ilike.%${query}%,bio.ilike.%${query}%`);
  }
  if (country) {
    educatorQuery = educatorQuery.ilike('location', `%${country}%`);
  }

  const { data: educators } = await educatorQuery.limit(150);

  let filteredEducators = (educators || []).filter(ed =>
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
      const isFacultyPro = userObj?.plan === 'faculty-pro' && userObj?.subscription_status === 'active';
      return {
        ...ed,
        full_name: userObj?.full_name || (ed as any).full_name || "Docente",
        avatar_url: userObj?.avatar_url || null,
        country: (ed as any).country || ed.location || null,
        city: (ed as any).city || null,
        experience_years: (ed as any).years_teaching || (ed as any).years_experience || 0,
        is_pro: isFacultyPro,
      };
    })
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
        isPro={isPro}
        searchLimitReached={searchLimitReached}
      />
    </>
  );
}
