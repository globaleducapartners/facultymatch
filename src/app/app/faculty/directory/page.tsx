import { createClient } from "@/lib/supabase-server";
import { InstitutionSearchPage } from "@/components/dashboard/InstitutionSearchPage";
import { redirect } from "next/navigation";

export default async function FacultyDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Institution users go to their own search
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("role, can_switch_role")
    .eq("id", user.id)
    .single();

  if (userProfile?.role === "institution") redirect("/app/institution/search");

  const query    = (params.query    as string) || "";
  const area     = (params.area     as string) || "";
  const subarea  = (params.subarea  as string) || "";
  const country  = (params.country  as string) || "";
  const language = (params.language as string) || "";
  const modality = Array.isArray(params.modality) ? params.modality[0] : (params.modality as string) || "";
  const phd      = (params.phd      as string) || "";
  const aneca    = (params.aneca    as string) || "";

  const hasAreaFilter = !!(area || subarea);

  // Area/subarea pre-query
  let areaMatchIds: string[] = [];
  if (hasAreaFilter) {
    let q = supabase.from("faculty_expertise").select("faculty_id");
    if (area)    q = q.ilike("area", `%${area}%`);
    if (subarea) q = (q as any).or(`area.ilike.%${subarea}%,level.ilike.%${subarea}%`);
    const { data } = await q;
    areaMatchIds = [...new Set((data || []).map((e: any) => e.faculty_id))];
    if (areaMatchIds.length === 0) {
      return (
        <InstitutionSearchPage
          initialEducators={[]}
          institutionId=""
          searchParams={params}
          initialFavorites={[]}
          isPro={false}
          searchLimitReached={false}
          monthlyContactsUsed={0}
          isReadOnly
          isAlreadyInstitution={!!userProfile?.can_switch_role}
        />
      );
    }
  }

  // Name pre-query
  let nameMatchIds: string[] = [];
  if (query) {
    const { data } = await supabase
      .from("user_profiles")
      .select("id")
      .ilike("full_name", `%${query}%`);
    nameMatchIds = (data || []).map((m: any) => m.id);
  }

  let educatorQuery = supabase
    .from("faculty_profiles")
    .select(`*, user:user_profiles(full_name, avatar_url, plan, subscription_status), expertise:faculty_expertise(*)`)
    .in("visibility", ["public", "private"]);

  if (query) {
    const orParts = [`headline.ilike.%${query}%`, `bio.ilike.%${query}%`];
    if (nameMatchIds.length > 0) orParts.push(`id.in.(${nameMatchIds.join(",")})`);
    educatorQuery = educatorQuery.or(orParts.join(","));
  }

  if (country)        educatorQuery = educatorQuery.ilike("location", `%${country}%`);
  if (hasAreaFilter)  educatorQuery = educatorQuery.in("id", areaMatchIds);
  if (phd === "true") educatorQuery = educatorQuery.eq("is_phd", true);
  if (aneca)          educatorQuery = educatorQuery.ilike("aneca_accreditation", `%${aneca}%`);
  if (language)       educatorQuery = (educatorQuery as any).filter("languages", "cs", JSON.stringify([{ lang: language }]));
  if (modality)       educatorQuery = educatorQuery.ilike("availability", `%${modality}%`);

  const { data: educators } = await educatorQuery.range(0, 49);

  const transformedEducators = (educators || [])
    .map((ed: any) => {
      const userJoin = ed.user;
      const userObj = Array.isArray(userJoin) ? userJoin[0] : userJoin;
      const isFacultyPro = userObj?.plan === "faculty-pro" && userObj?.subscription_status === "active";
      return {
        ...ed,
        full_name: userObj?.full_name || ed.full_name || "Docente",
        avatar_url: userObj?.avatar_url || null,
        country: ed.country || ed.location || null,
        city: ed.city || null,
        experience_years: ed.years_teaching || ed.years_experience || 0,
        is_pro: isFacultyPro,
      };
    })
    .sort((a: any, b: any) => {
      if (a.is_pro && !b.is_pro) return -1;
      if (!a.is_pro && b.is_pro) return 1;
      return 0;
    });

  return (
    <InstitutionSearchPage
      initialEducators={transformedEducators}
      institutionId=""
      searchParams={params}
      initialFavorites={[]}
      isPro={false}
      searchLimitReached={false}
      monthlyContactsUsed={0}
      isReadOnly
      isAlreadyInstitution={!!userProfile?.can_switch_role}
    />
  );
}
