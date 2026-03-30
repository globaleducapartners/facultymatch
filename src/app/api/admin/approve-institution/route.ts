import { createClient, createAdminClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "FacultyMatch <noreply@facultymatch.app>";
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  const { data: adminProfile } = await admin.from("user_profiles").select("role").eq("id", user.id).single();
  if (!adminProfile || (adminProfile.role !== "admin" && adminProfile.role !== "super_admin"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { institutionId, action } = await request.json();
  if (!institutionId || !action) return NextResponse.json({ error: "Missing data" }, { status: 400 });
  const newStatus = action === "approve" ? "active" : "blocked";
  const { error } = await admin.from("institutions").update({ status: newStatus, verified_at: action === "approve" ? new Date().toISOString() : null }).eq("id", institutionId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (action === "approve") {
    const { data: inst } = await admin.from("institutions").select("name, contact_email, user_id").eq("id", institutionId).single();
    const { data: authUser } = inst?.user_id ? await admin.auth.admin.getUserById(inst.user_id) : { data: null };
    const email = inst?.contact_email || authUser?.user?.email;
    const name = inst?.name || "tu institución";
    if (email) resend.emails.send({ from: FROM, to: [email], subject: `✅ ${name} aprobada en FacultyMatch`, html: `<p>Hola, <strong>${name}</strong> ha sido aprobada. <a href="https://www.facultymatch.app/app/institution">Acceder →</a></p>` }).catch(() => {});
    resend.emails.send({ from: FROM, to: ["support@facultymatch.app"], subject: `✅ Institución aprobada: ${name}`, html: `<p>${name} aprobada. ID: ${institutionId}</p>` }).catch(() => {});
  }
  return NextResponse.json({ success: true });
}
