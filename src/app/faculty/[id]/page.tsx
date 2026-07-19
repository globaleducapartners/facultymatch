import { createAdminClient } from "@/lib/supabase-server";
import { notFound, permanentRedirect } from "next/navigation";

// Legacy public profile URL. /docentes/[slug] is now the only canonical
// public profile route — this just resolves the id/slug and redirects.
export default async function LegacyFacultyProfileRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const { data: faculty } = isUUID
    ? await admin.from("faculty_profiles").select("profile_slug, estado_perfil").eq("id", id).maybeSingle()
    : await admin.from("faculty_profiles").select("profile_slug, estado_perfil").eq("profile_slug", id).maybeSingle();

  if (!faculty || faculty.estado_perfil !== "verificado" || !faculty.profile_slug) {
    notFound();
  }

  permanentRedirect(`/docentes/${faculty.profile_slug}`);
}
