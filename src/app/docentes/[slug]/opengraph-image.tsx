import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase-server";

// Tarjeta que se ve al compartir el enlace del perfil (LinkedIn, WhatsApp,
// Twitter...). Misma condición de visibilidad que la página: solo perfiles
// verificados, activos y públicos; en cualquier otro caso, tarjeta genérica
// de marca sin ningún dato personal.
export const alt = "Perfil verificado en FacultyMatch";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: fp } = await admin
    .from("faculty_profiles")
    .select("id, headline, current_institution")
    .eq("profile_slug", slug)
    .eq("visibility", "public")
    .eq("is_active", true)
    .eq("estado_perfil", "verificado")
    .maybeSingle();

  let name = "";
  let avatar: string | null = null;
  if (fp) {
    const { data: up } = await admin
      .from("user_profiles")
      .select("full_name, avatar_url")
      .eq("id", fp.id)
      .maybeSingle();
    name = up?.full_name || "";
    avatar = up?.avatar_url && /^https:\/\//.test(up.avatar_url) ? up.avatar_url : null;
  }

  const initials = name
    ? name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0D2240 0%, #14357A 100%)",
          padding: "64px 72px",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: "#FF6A1A", display: "flex" }} />
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1, display: "flex" }}>facultymatch</div>
        </div>

        {fp && name ? (
          <div style={{ display: "flex", alignItems: "center", gap: 56 }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignSelf: "flex-start",
                  padding: "8px 20px",
                  borderRadius: 999,
                  background: "rgba(233,160,48,0.18)",
                  border: "2px solid rgba(233,160,48,0.6)",
                  color: "#F5C26B",
                  fontSize: 24,
                  fontWeight: 700,
                  marginBottom: 28,
                }}
              >
                Perfil verificado
              </div>
              <div style={{ fontSize: 68, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, display: "flex" }}>{name}</div>
              {fp.headline ? (
                <div style={{ fontSize: 32, color: "rgba(255,255,255,0.78)", marginTop: 20, lineHeight: 1.3, display: "flex" }}>
                  {fp.headline.length > 90 ? fp.headline.slice(0, 87) + "…" : fp.headline}
                </div>
              ) : null}
              {fp.current_institution ? (
                <div style={{ fontSize: 26, color: "rgba(255,255,255,0.6)", marginTop: 14, display: "flex" }}>
                  {fp.current_institution}
                </div>
              ) : null}
            </div>
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} width={260} height={260} style={{ borderRadius: 32, objectFit: "cover" }} alt="" />
            ) : (
              <div
                style={{
                  width: 260, height: 260, borderRadius: 32, background: "#1B4FD8",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 96, fontWeight: 800,
                }}
              >
                {initials}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -2, lineHeight: 1.1, display: "flex" }}>
              El directorio de talento docente verificado.
            </div>
            <div style={{ fontSize: 30, color: "rgba(255,255,255,0.7)", marginTop: 20, display: "flex" }}>
              Perfiles revisados por una persona. Sin intermediarios.
            </div>
          </div>
        )}

        <div style={{ fontSize: 26, color: "rgba(255,255,255,0.55)", display: "flex" }}>facultymatch.app</div>
      </div>
    ),
    { ...size }
  );
}
