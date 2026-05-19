"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function updateStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("contacts").update({ status }).eq("id", id);
  revalidatePath("/app/faculty/requests");
}
