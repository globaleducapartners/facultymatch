import { createAdminClient } from "@/lib/supabase-server";
import { sendReferralRewardEmail } from "@/lib/emails/service";

type AdminClient = ReturnType<typeof createAdminClient>;

const REWARD_GOAL = 10;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Llamar justo después de crear la cuenta de un docente que llegó con un
// enlace de invitación (?ref=). El código puede ser el user_id del que
// invita (enlace personal, compartido desde /app/faculty/referrals) o un
// código INVITE-XXXXXXXX (invitación por email, tabla `referrals`).
export async function attributeReferral(admin: AdminClient, newUserId: string, code: string) {
  let referredBy: string | null = null;

  if (UUID_REGEX.test(code)) {
    referredBy = code;
  } else {
    const { data: referralRow } = await admin
      .from("referrals")
      .select("referrer_id")
      .eq("code", code)
      .maybeSingle();
    referredBy = referralRow?.referrer_id || null;

    if (referralRow) {
      await admin.from("referrals").update({ status: "registered" }).eq("code", code);
    }
  }

  if (!referredBy) return;

  // Solo si aún no se había fijado — evita que una llamada duplicada
  // sobrescriba la atribución original.
  await admin
    .from("faculty_profiles")
    .update({ referral_code_redeemed: code, referred_by: referredBy })
    .eq("user_id", newUserId)
    .is("referral_code_redeemed", null);
}

// Llamar cuando un perfil docente pasa a estado_perfil = 'verificado'
// (acción "approve" del panel de control). Si ese docente llegó por
// referido, cuenta como referido exitoso: marca la invitación (si la
// hay), suma el contador del que invitó, y le entrega 1 año Professional
// gratis la primera vez que llega a 10.
export async function processReferralSuccess(admin: AdminClient, verifiedFacultyId: string) {
  const { data: verifiedProfile } = await admin
    .from("faculty_profiles")
    .select("referred_by, referral_code_redeemed, referral_reward_counted")
    .eq("user_id", verifiedFacultyId)
    .maybeSingle();

  if (!verifiedProfile?.referred_by || verifiedProfile.referral_reward_counted) return;

  const referrerId: string = verifiedProfile.referred_by;
  const code: string | null = verifiedProfile.referral_code_redeemed;

  // Guarda primero el "ya contado" — si algo falla después, preferimos no
  // volver a intentarlo (y por tanto no contar dos veces) antes que
  // arriesgarnos a duplicar el conteo en un reintento.
  const { error: markError } = await admin
    .from("faculty_profiles")
    .update({ referral_reward_counted: true })
    .eq("user_id", verifiedFacultyId)
    .eq("referral_reward_counted", false);
  if (markError) {
    console.error("[processReferralSuccess] mark counted failed:", markError);
    return;
  }

  if (code && !UUID_REGEX.test(code)) {
    await admin.from("referrals").update({ status: "successful" }).eq("code", code);
  }

  const { data: referrerProfile } = await admin
    .from("faculty_profiles")
    .select("referral_stats, referral_reward_granted_at")
    .eq("user_id", referrerId)
    .maybeSingle();

  if (!referrerProfile) return;

  const stats = (referrerProfile.referral_stats as Record<string, number>) || {};
  const newSuccessful = (typeof stats.successful_referrals === "number" ? stats.successful_referrals : 0) + 1;
  const newStats = { ...stats, successful_referrals: newSuccessful };

  await admin.from("faculty_profiles").update({ referral_stats: newStats }).eq("user_id", referrerId);

  if (newSuccessful >= REWARD_GOAL && !referrerProfile.referral_reward_granted_at) {
    await grantReferralReward(admin, referrerId);
  }
}

async function grantReferralReward(admin: AdminClient, referrerId: string) {
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  const { error } = await admin
    .from("faculty_profiles")
    .update({ referral_reward_granted_at: new Date().toISOString() })
    .eq("user_id", referrerId)
    .is("referral_reward_granted_at", null);
  if (error) {
    console.error("[grantReferralReward] mark granted failed:", error);
    return;
  }

  const { error: planError } = await admin
    .from("user_profiles")
    .update({
      plan: "faculty-pro",
      subscription_status: "active",
      subscription_current_period_end: oneYearFromNow.toISOString(),
      plan_source: "referral",
    })
    .eq("id", referrerId);

  if (planError) {
    console.error("[grantReferralReward] plan update failed:", planError);
    return;
  }

  const { data: referrerAuth } = await admin.auth.admin.getUserById(referrerId);
  const { data: referrerUserProfile } = await admin
    .from("user_profiles")
    .select("full_name, email")
    .eq("id", referrerId)
    .maybeSingle();

  const email = referrerUserProfile?.email || referrerAuth?.user?.email;
  const name = referrerUserProfile?.full_name?.split(" ")[0] || "Docente";
  if (email) {
    await sendReferralRewardEmail(email, name).catch(e =>
      console.warn("[grantReferralReward] reward email failed:", e)
    );
  }
}
