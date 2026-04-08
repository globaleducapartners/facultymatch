import { createClient, createAdminClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import ReferralsClient from "./ReferralsClient";

export interface Referral {
  id: string;
  invitee_email: string;
  code: string;
  status: string;
  created_at: string;
}

export interface ReferralStats {
  invitations_sent: number;
  successful_referrals: number;
}

export default async function ReferralsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const [referralsResult, fpResult] = await Promise.all([
    admin
      .from("referrals")
      .select("id, invitee_email, code, status, created_at")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    admin
      .from("faculty_profiles")
      .select("referral_stats")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const referrals: Referral[] = (referralsResult.data as Referral[]) || [];
  const rawStats = (fpResult.data?.referral_stats as Record<string, number>) || {};
  const successfulCount = referrals.filter(r => r.status === "successful").length;

  const stats: ReferralStats = {
    invitations_sent:
      typeof rawStats.invitations_sent === "number"
        ? rawStats.invitations_sent
        : referrals.length,
    successful_referrals:
      typeof rawStats.successful_referrals === "number"
        ? rawStats.successful_referrals
        : successfulCount,
  };

  return <ReferralsClient userId={user.id} referrals={referrals} stats={stats} />;
}
