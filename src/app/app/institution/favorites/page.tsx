import { createAdminClient, getCurrentUser } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { EducatorCard } from "@/components/dashboard/EducatorCard";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function FavoritesPage() {
  const admin = createAdminClient();
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { data: institution } = await admin
    .from("institutions")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!institution) redirect("/app/institution");

  // Step 1: get favorite faculty IDs for this institution
  const { data: favoriteRows } = await admin
    .from("favorites")
    .select("faculty_id")
    .eq("institution_id", institution.id);

  const facultyIds = (favoriteRows || []).map((r: any) => r.faculty_id).filter(Boolean);

  let educators: any[] = [];

  if (facultyIds.length > 0) {
    // Step 2: get faculty profiles + expertise
    const { data: profiles } = await admin
      .from("faculty_profiles")
      .select("*, expertise:faculty_expertise(*)")
      .in("id", facultyIds);

    // Step 3: get user profiles for names + avatars
    const { data: userProfiles } = await admin
      .from("user_profiles")
      .select("id, full_name, avatar_url")
      .in("id", facultyIds);

    const userMap = Object.fromEntries((userProfiles || []).map((u: any) => [u.id, u]));

    educators = (profiles || []).map((fp: any) => {
      const u = userMap[fp.id];
      return {
        ...fp,
        full_name: u?.full_name || fp.full_name || "Docente",
        avatar_url: u?.avatar_url || fp.avatar_url || null,
      };
    });
  }

  return (
    <div className="space-y-8 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-fm-navy">Mis favoritos</h1>
        <p className="text-gray-500 font-medium">Docentes guardados para futuros programas.</p>
      </div>

      {educators.length > 0 ? (
        <div className="grid gap-6">
          {educators.map((educator: any) => (
            <EducatorCard
              key={educator.id}
              educator={educator}
              institutionId={institution.id}
              isFavorite={true}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-20 rounded-2xl border border-gray-200 flex flex-col items-center text-center">
          <div className="bg-white p-6 rounded-full text-fm-blue mb-6">
            <Star size={48} />
          </div>
          <h3 className="text-xl font-bold text-fm-navy mb-2">Aún no tienes favoritos</h3>
          <p className="text-gray-500 max-w-xs mx-auto font-medium">
            Explora el directorio y guarda los perfiles que mejor encajen con tu institución.
          </p>
          <Button asChild className="mt-8 bg-fm-blue hover:bg-blue-700 text-white font-bold h-12 rounded-xl px-8">
            <Link href="/app/institution/search">Explorar docentes</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
