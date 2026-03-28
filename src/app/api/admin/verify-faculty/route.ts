import { createClient, createAdminClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "FacultyMatch <noreply@facultymatch.app>";
const SITE = "https://www.facultymatch.app";

export async function POST(request: Request) {
  // Validate admin session — use regular client to get the authenticated user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Use admin client to check role (bypasses RLS — no risk as we already verified session)
  const adminForCheck = createAdminClient();
  const { data: adminProfile } = await adminForCheck
    .from("user_profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!adminProfile || (adminProfile.role !== "admin" && adminProfile.role !== "super_admin")) {
    console.warn("[verify-faculty] Forbidden - user role:", adminProfile?.role, "user:", user.id);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { facultyId, action, notes, rejectionReason, infoMessage } = await request.json();
  if (!facultyId || !action) {
    return NextResponse.json({ error: "Missing facultyId or action" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Get faculty user data
  const { data: facultyProfile } = await admin
    .from("user_profiles")
    .select("full_name, email")
    .eq("id", facultyId)
    .single();

  const { data: authUser } = await admin.auth.admin.getUserById(facultyId);
  const facultyEmail = facultyProfile?.email || authUser?.user?.email;
  const facultyName =
    facultyProfile?.full_name?.split(" ")[0] ||
    authUser?.user?.user_metadata?.full_name?.split(" ")[0] ||
    authUser?.user?.email?.split("@")[0] ||
    "Docente";

  if (action === "approve") {
    // Update user_profiles
    await admin.from("user_profiles").update({
      verification_status: "approved",
      verified_at: new Date().toISOString(),
      verified_by: user.email,
      verification_notes: notes || null,
      onboarding_completed: true,
    }).eq("id", facultyId);

    // Update faculty_profiles
    await admin.from("faculty_profiles").update({
      is_verified: true,
    }).eq("user_id", facultyId);

    // Send approval email
    if (facultyEmail) {
      await resend.emails.send({
        from: FROM,
        to: [facultyEmail],
        subject: "✅ Tu perfil en FacultyMatch ha sido verificado",
        html: buildApprovalEmail(facultyName),
      }).catch(e => console.warn("[verify-faculty] approval email failed:", e));
    }

    return NextResponse.json({ success: true, action: "approved" });
  }

  if (action === "reject") {
    const reason = rejectionReason || "Perfil incompleto o datos no verificables.";

    await admin.from("user_profiles").update({
      verification_status: "rejected",
      verified_at: new Date().toISOString(),
      verified_by: user.email,
      verification_notes: notes ? `${notes}\n\nMotivo rechazo: ${reason}` : `Motivo rechazo: ${reason}`,
    }).eq("id", facultyId);

    if (facultyEmail) {
      await resend.emails.send({
        from: FROM,
        to: [facultyEmail],
        subject: "Sobre tu solicitud en FacultyMatch",
        html: buildRejectionEmail(facultyName, reason),
      }).catch(e => console.warn("[verify-faculty] rejection email failed:", e));
    }

    return NextResponse.json({ success: true, action: "rejected" });
  }

  if (action === "requires_info") {
    const message = infoMessage || "Necesitamos información adicional para verificar tu perfil.";

    await admin.from("user_profiles").update({
      verification_status: "requires_info",
      verification_notes: notes ? `${notes}\n\nInfo solicitada: ${message}` : `Info solicitada: ${message}`,
    }).eq("id", facultyId);

    if (facultyEmail) {
      await resend.emails.send({
        from: FROM,
        to: [facultyEmail],
        subject: "Necesitamos un poco más de información — FacultyMatch",
        html: buildRequiresInfoEmail(facultyName, message),
      }).catch(e => console.warn("[verify-faculty] info email failed:", e));
    }

    return NextResponse.json({ success: true, action: "requires_info" });
  }

  if (action === "reactivate") {
    await admin.from("user_profiles").update({
      verification_status: "pending",
      verified_at: null,
      verified_by: null,
      verification_notes: null,
    }).eq("id", facultyId);
    return NextResponse.json({ success: true, action: "reactivated" });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

// ─── Email Templates ────────────────────────────────────────────────────────

function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;max-width:600px;">
  <!-- Header -->
  <tr><td style="background:#0B1220;padding:28px 40px;text-align:center;">
    <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:1px;">FACULTY<span style="color:#2563EB;">MATCH</span></span>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:40px;">
    ${content}
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:12px;color:#94a3b8;">FacultyMatch · <a href="${SITE}" style="color:#94a3b8;">${SITE.replace("https://","")}</a></p>
    <p style="margin:4px 0 0;font-size:11px;color:#cbd5e1;">Grupo Global Educa SL · info@facultymatch.app</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function buildApprovalEmail(name: string) {
  return emailWrapper(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:#dcfce7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:32px;">✅</span>
      </div>
      <h1 style="margin:0;color:#0B1220;font-size:26px;font-weight:900;">¡Tu perfil ha sido verificado, ${name}!</h1>
      <p style="color:#64748b;font-size:16px;margin:12px 0 0;line-height:1.6;">
        Hemos revisado tu perfil y cumple con todos nuestros estándares de calidad.
        A partir de ahora eres parte de la <strong style="color:#0B1220;">red verificada de FacultyMatch</strong>.
      </p>
    </div>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:24px;margin-bottom:28px;">
      <p style="margin:0 0 12px;font-weight:900;color:#1d4ed8;font-size:14px;text-transform:uppercase;letter-spacing:1px;">¿Qué significa esto?</p>
      <ul style="margin:0;padding:0 0 0 20px;color:#1e40af;font-size:14px;line-height:2;">
        <li>Tu perfil ya es visible para instituciones verificadas</li>
        <li>Puedes recibir propuestas de colaboración directamente</li>
        <li>Apareces en los resultados de búsqueda de las instituciones</li>
      </ul>
    </div>
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${SITE}/app/faculty" style="display:inline-block;background:#F97316;color:#fff;padding:16px 36px;border-radius:12px;font-weight:900;font-size:16px;text-decoration:none;">
        Acceder a mi dashboard →
      </a>
    </div>
    <div style="border-top:1px solid #f1f5f9;padding-top:24px;">
      <p style="margin:0 0 16px;font-weight:900;color:#0B1220;font-size:14px;">Próximos pasos:</p>
      ${[
        ["01", "Completa tu perfil al 100% para aparecer primero"],
        ["02", "Actualiza tu disponibilidad regularmente"],
        ["03", "Responde rápido a las instituciones que te contacten"],
      ].map(([n, t]) => `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <span style="background:#0B1220;color:#fff;font-weight:900;font-size:12px;padding:4px 10px;border-radius:8px;flex-shrink:0;">${n}</span>
        <span style="color:#475569;font-size:14px;">${t}</span>
      </div>`).join("")}
    </div>
  `);
}

function buildRejectionEmail(name: string, reason: string) {
  return emailWrapper(`
    <h1 style="margin:0 0 12px;color:#0B1220;font-size:24px;font-weight:900;">Hola ${name},</h1>
    <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Gracias por registrarte en FacultyMatch. Hemos revisado tu perfil y, de momento,
      no hemos podido completar la verificación.
    </p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-weight:900;color:#dc2626;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Motivo</p>
      <p style="margin:0;color:#991b1b;font-size:14px;line-height:1.6;">${reason}</p>
    </div>
    <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 24px;">
      Esto no es definitivo. Puedes actualizar tu perfil con la información correcta
      y nuestro equipo lo revisará de nuevo.
    </p>
    <div style="text-align:center;margin-bottom:16px;">
      <a href="${SITE}/app/faculty/profile" style="display:inline-block;background:#2563EB;color:#fff;padding:14px 32px;border-radius:12px;font-weight:900;font-size:15px;text-decoration:none;">
        Mejorar mi perfil →
      </a>
    </div>
    <p style="text-align:center;color:#94a3b8;font-size:13px;">Si tienes dudas, escríbenos a <a href="mailto:info@facultymatch.app" style="color:#2563EB;">info@facultymatch.app</a></p>
  `);
}

function buildRequiresInfoEmail(name: string, message: string) {
  return emailWrapper(`
    <h1 style="margin:0 0 12px;color:#0B1220;font-size:24px;font-weight:900;">Hola ${name},</h1>
    <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Estamos revisando tu perfil y necesitamos un poco más de información para completar la verificación.
    </p>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-weight:900;color:#1d4ed8;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Información solicitada</p>
      <p style="margin:0;color:#1e40af;font-size:14px;line-height:1.6;">${message}</p>
    </div>
    <div style="text-align:center;margin-bottom:16px;">
      <a href="${SITE}/app/faculty/profile" style="display:inline-block;background:#F97316;color:#fff;padding:14px 32px;border-radius:12px;font-weight:900;font-size:15px;text-decoration:none;">
        Completar mi perfil →
      </a>
    </div>
    <p style="text-align:center;color:#94a3b8;font-size:13px;">¿Tienes dudas? <a href="mailto:info@facultymatch.app" style="color:#2563EB;">info@facultymatch.app</a></p>
  `);
}
