"use server";

import { createAdminClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function approveInstitution(formData: FormData) {
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  if (!id) return;
  await admin.from("institutions").update({ status: "active" }).eq("id", id);
  revalidatePath("/control/institutions");
  redirect("/control/institutions");
}

export async function rejectInstitution(formData: FormData) {
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  if (!id) return;
  await admin.from("institutions").update({ status: "blocked" }).eq("id", id);
  revalidatePath("/control/institutions");
  redirect("/control/institutions");
}
