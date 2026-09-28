import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// Registra una visita a un perfil docente: incrementa el contador (como
// antes) y guarda quién ha sido (institución/docente/admin/anónimo) en
// page_views, para que /control/faculty/[id] pueda mostrar quién ha
// visitado el perfil, no solo cuántas veces.
export async function POST(req: NextRequest) {
  try {
    const { facultyId, source } = await req.json();
    if (!facultyId || typeof facultyId !== "string") {
      return NextResponse.json({ error: "facultyId is required" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Quién visita — a partir de la sesión del servidor, nunca de lo que
    // mande el cliente (evitaría que alguien se autoetiquete como
    // "institución").
    const supabase = await createClient();
    const { data: { user: viewer } } = await supabase.auth.getUser();

    // Una visita del propio docente a su perfil no cuenta como interés real.
    if (viewer?.id === facultyId) {
      return NextResponse.json({ success: true, skipped: "self_view" });
    }

    let viewerType = "anonymous";
    let viewerLabel: string | null = null;

    if (viewer) {
      const { data: viewerProfile } = await admin
        .from("user_profiles")
        .select("role, active_mode, full_name")
        .eq("id", viewer.id)
        .maybeSingle();
      const role = viewerProfile?.active_mode || viewerProfile?.role || "faculty";
      viewerType = role === "admin" || role === "super_admin" ? "admin" : role;

      if (viewerType === "institution") {
        const { data: inst } = await admin
          .from("institutions")
          .select("name")
          .eq("user_id", viewer.id)
          .maybeSingle();
        viewerLabel = inst?.name || null;
      } else {
        viewerLabel = viewerProfile?.full_name || null;
      }
    }

    const { error: rpcError } = await admin.rpc("increment_faculty_view_count", {
      p_faculty_id: facultyId,
    });

    if (rpcError) {
      // Fallback: direct read-then-update using the admin client (bypasses RLS)
      // This has a tiny race window but only fires if the RPC function hasn't been created yet
      const { data: current, error: readError } = await admin
        .from("faculty_profiles")
        .select("view_count")
        .eq("id", facultyId)
        .single();

      if (readError) {
        console.error("Error reading view_count:", readError);
        return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
      }

      const { error: updateError } = await admin
        .from("faculty_profiles")
        .update({ view_count: (current?.view_count ?? 0) + 1 })
        .eq("id", facultyId);

      if (updateError) {
        console.error("Error updating view_count:", updateError);
        return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
      }
    }

    // Best-effort: nunca bloquea la respuesta al visitante por un fallo aquí.
    admin.from("page_views").insert({
      path: source === "public" ? `/docentes/${facultyId}` : `/app/faculty/${facultyId}`,
      user_id: viewer?.id || null,
      user_type: viewerType,
      metadata: { faculty_id: facultyId, viewer_label: viewerLabel },
    }).then(({ error }) => {
      if (error) console.error("[track-view] page_views insert error:", error);
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Track view error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
