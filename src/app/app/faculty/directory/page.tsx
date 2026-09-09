import { createClient, createAdminClient } from "@/lib/supabase-server";
import { InstitutionSearchPage } from "@/components/dashboard/InstitutionSearchPage";
import { redirect } from "next/navigation";
import { parseFacultySearchParams, searchFacultyProfiles } from "@/lib/faculty-search";

export default async function FacultyDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const filters = parseFacultySearchParams(params);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Institution users go to their own search
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("role, can_switch_role")
    .eq("id", user.id)
    .single();

  if (userProfile?.role === "institution") redirect("/app/institution/search");

  const admin = createAdminClient();

  // Mismo motor de búsqueda que /app/institution/search (src/lib/faculty-search.ts)
  // — sin blockedFacultyIds (las reglas de bloqueo son cosa de instituciones,
  // no aplican a docentes viendo a sus colegas) y con las mismas tarjetas
  // "pendiente de verificación" que ya se ven desde el lado institución.
  const { transformedEducators, transformedPending } = await searchFacultyProfiles(admin, filters, {
    logPrefix: "[faculty/directory]",
  });

  return (
    <InstitutionSearchPage
      initialEducators={transformedEducators}
      pendingEducators={transformedPending}
      institutionId=""
      searchParams={params}
      initialFavorites={[]}
      isPro={false}
      contactMonthlyLimit={null}
      searchLimitReached={false}
      monthlyContactsUsed={0}
      isReadOnly
      isAlreadyInstitution={!!userProfile?.can_switch_role}
    />
  );
}
