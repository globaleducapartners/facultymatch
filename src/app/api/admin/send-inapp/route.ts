import { createClient, createAdminClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// Aviso solo en la plataforma (campana + tarjeta del inicio), sin correo.
// Segmentos: "improvable" (completitud < 100 %), "all_faculty" o "no_city"
// (docentes que ya terminaron el asistente pero no indicaron ciudad: quienes
// aún están en el asistente la pedirán allí). Excluye cuentas de prueba y
// suspendidas, y no repite el mismo aviso (mismo `type`) a quien ya lo recibió.
const SEGMENTS = ["improvable", "all_faculty", "no_city"] as const;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: me } = await admin.from("user_profiles").select("role").eq("id", user.id).single();
  if (!me || (me.role !== "admin" && me.role !== "super_admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { segment, subject, body, link, type, dryRun } = await request.json();
  if (!SEGMENTS.includes(segment)) return NextResponse.json({ error: "Segmento no válido" }, { status: 400 });
  if (!subject?.trim() || !body?.trim()) return NextResponse.json({ error: "Faltan asunto o texto" }, { status: 400 });
  const kind = typeof type === "string" && /^[a-z0-9_]{3,40}$/.test(type) ? type : "admin_message";
  const safeLink = typeof link === "string" && link.startsWith("/app/") ? link : null;

  const { data: users } = await admin.from("user_profiles").select("id, email").eq("role", "faculty").limit(2000);
  const { data: fps } = await admin
    .from("faculty_profiles")
    .select("user_id, estado_perfil, profile_completeness, city, onboarding_status")
    .limit(2000);
  const fpById = new Map((fps || []).map((f: any) => [f.user_id, f]));

  let ids = (users || [])
    .filter((u: any) => !/prueba|@facultymatch\.app$/i.test(u.email || ""))
    .filter((u: any) => fpById.get(u.id)?.estado_perfil !== "suspendido")
    .filter((u: any) => {
      const f = fpById.get(u.id);
      if (segment === "all_faculty") return true;
      if (segment === "no_city") return f?.onboarding_status === "completed" && !(f?.city || "").trim();
      return (f?.profile_completeness ?? 0) < 100;
    })
    .map((u: any) => u.id as string);

  // No repetir el mismo aviso
  const { data: already } = await admin.from("admin_notifications").select("faculty_id").eq("type", kind);
  const done = new Set((already || []).map((a: any) => a.faculty_id));
  ids = ids.filter((id) => !done.has(id));

  if (dryRun) return NextResponse.json({ success: true, count: ids.length });
  if (ids.length === 0) return NextResponse.json({ success: true, sent: 0, withLink: false });

  const rows = (withLink: boolean) =>
    ids.map((id) => ({
      faculty_id: id, type: kind, subject: subject.trim(), body: body.trim(), admin_id: user.id,
      ...(withLink && safeLink ? { link: safeLink } : {}),
    }));

  let withLink = !!safeLink;
  let { error } = await admin.from("admin_notifications").insert(rows(withLink));
  if (error && withLink) {
    // La columna `link` aún no existe (migración sin aplicar): se envía sin botón.
    withLink = false;
    ({ error } = await admin.from("admin_notifications").insert(rows(false)));
  }
  if (error) {
    console.error("[send-inapp]", error);
    return NextResponse.json({ error: "No se pudieron crear las notificaciones" }, { status: 500 });
  }
  return NextResponse.json({ success: true, sent: ids.length, withLink, linkSkipped: !!safeLink && !withLink });
}
