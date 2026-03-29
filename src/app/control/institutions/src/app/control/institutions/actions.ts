"use server";

import { createAdminClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function approveInstitution(formData: FormData) {
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  if (!id) return;
  const { error } = await admin
    .from("institutions")
    .update({ status: "active" })
    .eq("id", id);
  if (error) {
    console.error("[approveInstitution] error:", error.message);
    return;
  }
  revalidatePath("/control/institutions");
  redirect("/control/institutions");
}

export async function rejectInstitution(formData: FormData) {
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  if (!id) return;
  const { error } = await admin
    .from("institutions")
    .update({ status: "blocked" })
    .eq("id", id);
  if (error) {
    console.error("[rejectInstitution] error:", error.message);
    return;
  }
  revalidatePath("/control/institutions");
  redirect("/control/institutions");
}