import { createHash } from "crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase-server";

// Devuelve true si la petición está dentro del límite. Falla abierto: si la
// función SQL aún no existe o hay un error, no bloquea a nadie.
export async function rateLimit(scope: string, limit: number, windowSeconds: number): Promise<boolean> {
  try {
    const h = await headers();
    const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
    const key = `${scope}:${createHash("sha256").update(ip).digest("hex").slice(0, 32)}`;
    const { data, error } = await createAdminClient().rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) return true;
    return data !== false;
  } catch {
    return true;
  }
}
