import { createClient, createAdminClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

type Admin = ReturnType<typeof createAdminClient>;

// Borra todos los archivos de una carpeta de un bucket (avatars/<id>/…, banners/<id>/…).
async function removeFolder(admin: Admin, bucket: string, folder: string) {
  try {
    const { data } = await admin.storage.from(bucket).list(folder, { limit: 1000 });
    const paths = (data || []).filter((f) => f.name).map((f) => `${folder}/${f.name}`);
    if (paths.length > 0) await admin.storage.from(bucket).remove(paths);
  } catch (e) {
    console.error(`[delete-account] storage ${bucket}/${folder}:`, e);
  }
}

// Borra filas por una columna; un fallo se registra pero no impide seguir con el resto del borrado.
async function removeRows(admin: Admin, table: string, column: string, value: string) {
  const { error } = await admin.from(table).delete().eq(column, value);
  if (error) console.error(`[delete-account] ${table}.${column}:`, error.message);
}

// Eliminar la cuenta debe borrar de la plataforma todo lo que se describe en la
// Política de privacidad (apartado 7): perfil, archivos subidos, registros de
// actividad y comunicaciones, y cancelar la suscripción de pago si la hay.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role } = await request.json();
  const admin = createAdminClient();

  try {
    // 1) Suscripción de pago: se cancela PRIMERO. Si no se puede, no se borra la
    //    cuenta (así nadie sigue pagando una suscripción de una cuenta que ya no existe).
    const { data: billing } = await admin
      .from("user_profiles")
      .select("stripe_subscription_id")
      .eq("id", user.id)
      .maybeSingle();
    if (billing?.stripe_subscription_id) {
      try {
        if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY no configurada");
        await new Stripe(process.env.STRIPE_SECRET_KEY).subscriptions.cancel(billing.stripe_subscription_id);
      } catch (e: any) {
        const alreadyGone = e?.code === "resource_missing" || /already.*cancel|No such subscription/i.test(e?.message || "");
        if (!alreadyGone) {
          console.error("[delete-account] no se pudo cancelar la suscripción:", e);
          return NextResponse.json(
            { error: "No hemos podido cancelar tu suscripción, así que no hemos eliminado la cuenta. Escribe a support@facultymatch.app y lo resolvemos." },
            { status: 502 }
          );
        }
      }
    }

    // 2) Datos propios del rol
    if (role === "institution") {
      const { data: inst } = await admin.from("institutions").select("id").eq("user_id", user.id).maybeSingle();
      const instId = inst?.id ?? user.id;
      await removeFolder(admin, "institution-logos", instId);
      await removeFolder(admin, "banners", user.id);
      await removeRows(admin, "contacts", "institution_id", instId);
      await removeRows(admin, "favorites", "institution_id", instId);
      await removeRows(admin, "visibility_rules", "institution_id", instId);
      await removeRows(admin, "search_usage", "institution_id", instId);
      await removeRows(admin, "institutions", "user_id", user.id);
    } else if (role === "faculty") {
      const { data: fp } = await admin.from("faculty_profiles").select("id").eq("user_id", user.id).maybeSingle();
      if (fp) {
        const { data: docs } = await admin.from("faculty_documents").select("file_path").eq("faculty_id", fp.id);
        const docPaths = (docs || []).map((d: any) => d.file_path).filter(Boolean);
        if (docPaths.length > 0) await admin.storage.from("faculty_documents").remove(docPaths);
        await removeFolder(admin, "faculty_documents", user.id);
        await removeFolder(admin, "banners", user.id);
        await removeRows(admin, "contacts", "faculty_id", fp.id);
        await removeRows(admin, "favorites", "faculty_id", fp.id);
        await removeRows(admin, "visibility_rules", "faculty_id", fp.id);
        await removeRows(admin, "profile_views", "faculty_id", fp.id);
        await removeRows(admin, "faculty_documents", "faculty_id", fp.id);
        await removeRows(admin, "faculty_expertise", "faculty_id", fp.id);
        await removeRows(admin, "faculty_places", "faculty_id", fp.id);
        await removeRows(admin, "admin_notifications", "faculty_id", fp.id);
        await removeRows(admin, "faculty_profiles", "user_id", user.id);
      }
    }

    // 3) Archivos y registros comunes a cualquier cuenta
    await removeFolder(admin, "avatars", user.id);
    await removeRows(admin, "profile_views", "viewer_id", user.id);
    await removeRows(admin, "page_views", "user_id", user.id);
    await removeRows(admin, "click_events", "user_id", user.id);
    await removeRows(admin, "notifications", "user_id", user.id);
    await removeRows(admin, "cv_extraction_usage", "user_id", user.id);
    await removeRows(admin, "consents", "user_id", user.id);
    await removeRows(admin, "activation_tokens", "user_id", user.id);
    await removeRows(admin, "email_logs", "recipient_id", user.id);
    if (user.email) await removeRows(admin, "email_logs", "recipient_email", user.email);

    // Referidos: se borran los que envió; si fue invitado, se anonimiza su dirección en la fila de quien le invitó.
    await removeRows(admin, "referrals", "referrer_id", user.id);
    const { error: refErr } = await admin
      .from("referrals")
      .update({ invitee_email: "[eliminado]", invitee_id: null })
      .eq("invitee_id", user.id);
    if (refErr) console.error("[delete-account] referrals.invitee:", refErr.message);
    if (user.email) {
      const { error: refMailErr } = await admin
        .from("referrals")
        .update({ invitee_email: "[eliminado]" })
        .ilike("invitee_email", user.email);
      if (refMailErr) console.error("[delete-account] referrals.invitee_email:", refMailErr.message);
    }

    await admin.from("user_profiles").delete().eq("id", user.id);
    await admin.auth.admin.deleteUser(user.id);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("[delete-account]", e);
    return NextResponse.json({ error: e.message || "Error eliminando cuenta" }, { status: 500 });
  }
}
