import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { notifyAdminClientError } from "@/lib/admin-alerts";

// Recibe el error que capturan src/app/error.tsx y src/app/global-error.tsx
// cuando algo revienta en el navegador de un usuario ya autenticado y le deja
// una pantalla en blanco. Sin esto, ese fallo no dejaba ningún rastro en
// ningún sitio — ver notifyAdminClientError().
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message.slice(0, 1000) : "Error desconocido";
    const digest = typeof body?.digest === "string" ? body.digest.slice(0, 200) : undefined;
    const url = typeof body?.url === "string" ? body.url.slice(0, 500) : undefined;

    let userId: string | undefined;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    } catch {
      // Sin sesión o fallo al leerla — se registra igual, sin usuario
    }

    console.error("[log-client-error]", { message, digest, url, userId });
    await notifyAdminClientError({ message, digest, url, userId });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[log-client-error] failed to process report:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
