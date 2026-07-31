"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

const VALID_STATUSES = ["sent", "pending", "replied", "archived"] as const;
type ContactStatus = (typeof VALID_STATUSES)[number];

export async function updateStatus(id: string, status: ContactStatus) {
  if (!VALID_STATUSES.includes(status)) return;
  const supabase = await createClient();
  await supabase.from("contacts").update({ status }).eq("id", id);
  revalidatePath("/app/faculty/requests");
}
