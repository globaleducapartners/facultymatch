import { createClient, createAdminClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SpecialtyForm } from "./SpecialtyForm";
import { ChevronRight, X, Lightbulb, BookOpen } from "lucide-react";

const SANS = `'Inter', system-ui, -apple-system, sans-serif`;
const D = {
  blue:    "#1B4FD8",
  navy:    "#0D2240",
  gold:    "#E9A030",
  surf:    "#F2F6FC",
  white:   "#FFFFFF",
  ink:     "#0C1018",
  muted:   "#6B7280",
  faint:   "#9CA3AF",
  border:  "#D8E2EF",
};

export default async function SpecialtiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: facultyProfile } = await supabase
    .from("faculty_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: expertise } = facultyProfile?.id
    ? await supabase
        .from("faculty_expertise")
        .select("*")
        .eq("faculty_id", facultyProfile.id)
    : { data: [] };

  const specialties = expertise || [];

  async function addSpecialty(formData: FormData) {
    "use server";
    const area    = formData.get("area") as string;
    const subarea = formData.get("subarea") as string;
    const topicsStr = formData.get("topics") as string;
    const topics = topicsStr ? topicsStr.split(",").map((s) => s.trim()).filter(Boolean) : [];
    if (!area) return;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const admin = createAdminClient();
    const { data: faculty } = await admin
      .from("faculty_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!faculty?.id) return;

    await admin.from("faculty_expertise").insert({ faculty_id: faculty.id, area, subarea: subarea || null, topics });
    revalidatePath("/app/faculty/specialties");
  }

  async function removeExpertise(id: string) {
    "use server";
    const admin = createAdminClient();
    await admin.from("faculty_expertise").delete().eq("id", id);
    revalidatePath("/app/faculty/specialties");
  }

  return (
    <div style={{ fontFamily: SANS }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: SANS, fontSize: 24, fontWeight: 900, color: D.ink, letterSpacing: "-0.04em", margin: "0 0 4px" }}>
          Especialidades
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 14, color: D.muted, margin: 0 }}>
          Define tus áreas de conocimiento y temas de investigación para aparecer en las búsquedas.
        </p>
      </div>

      {/* Two-column layout — responsive: 1 col mobile, 2 cols lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 items-start">

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Active specialties */}
          <div style={{
            background: D.white, border: `1px solid ${D.border}`,
            borderRadius: 16, overflow: "hidden",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "14px 16px", borderBottom: `1px solid ${D.border}`,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8, background: "#EFF6FF",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <BookOpen size={16} color={D.blue} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: D.ink, letterSpacing: "-0.02em" }}>
                  Tus áreas de conocimiento
                </div>
                <div style={{ fontFamily: SANS, fontSize: 11, color: D.muted, marginTop: 1 }}>
                  Las instituciones te encontrarán principalmente por estos temas
                </div>
              </div>
              {specialties.length > 0 && (
                <span style={{
                  fontFamily: SANS, fontSize: 10, fontWeight: 700,
                  color: D.blue, background: "#EFF6FF",
                  padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0,
                }}>
                  {specialties.length} activas
                </span>
              )}
            </div>

            <div style={{ padding: "14px 16px" }}>
              {specialties.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {specialties.map((item: { id: string; area: string; subarea?: string; topics?: string[] }) => (
                    <div key={item.id} style={{
                      display: "flex", alignItems: "flex-start", gap: 14,
                      padding: "14px 16px", borderRadius: 12,
                      background: D.surf, border: `1px solid ${D.border}`,
                    }}>
                      {/* Area + subarea */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
                          <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: D.ink }}>
                            {item.area}
                          </span>
                          {item.subarea && (
                            <>
                              <ChevronRight size={13} color={D.faint} />
                              <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: D.muted }}>
                                {item.subarea}
                              </span>
                            </>
                          )}
                        </div>
                        {item.topics && item.topics.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, marginTop: 8 }}>
                            {item.topics.map((topic: string, i: number) => (
                              <span key={i} style={{
                                fontFamily: SANS, fontSize: 11, fontWeight: 600,
                                color: D.blue, background: "#EFF6FF",
                                border: "1px solid #BFDBFE",
                                padding: "2px 8px", borderRadius: 999,
                              }}>{topic}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Remove button */}
                      <form action={async () => {
                        "use server";
                        await removeExpertise(item.id);
                      }}>
                        <button type="submit" style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: 36, height: 36, borderRadius: 10,
                          background: D.white, border: `1px solid ${D.border}`,
                          color: D.faint, cursor: "pointer",
                          transition: "all 0.15s",
                        }}>
                          <X size={15} />
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: "40px 0", textAlign: "center" as const,
                  border: `2px dashed ${D.border}`, borderRadius: 12,
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: D.surf, display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 14px",
                  }}>
                    <BookOpen size={24} color={D.faint} />
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: D.ink, marginBottom: 6 }}>
                    Sin especialidades aún
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: D.muted, margin: 0 }}>
                    Añade al menos una para aparecer en las búsquedas.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Add new specialty */}
          <div style={{
            background: D.white, border: `1px solid ${D.border}`,
            borderRadius: 16, overflow: "hidden",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "14px 16px", borderBottom: `1px solid ${D.border}`,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8, background: "#EFF6FF",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
              </div>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: D.ink, letterSpacing: "-0.02em" }}>
                  Añadir nueva especialidad
                </div>
                <div style={{ fontFamily: SANS, fontSize: 11, color: D.muted, marginTop: 1 }}>
                  Selecciona el área UNESCO y añade temas específicos
                </div>
              </div>
            </div>
            <div style={{ padding: "16px" }}>
              <SpecialtyForm action={addSpecialty} />
            </div>
          </div>
        </div>

        {/* Right sidebar — sticky only on lg+ */}
        <div className="lg:sticky lg:top-6">
          <div style={{
            background: D.navy, borderRadius: 16, padding: "22px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Lightbulb size={16} color={D.gold} />
              <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: D.gold, letterSpacing: "-0.01em" }}>
                Consejo Académico
              </span>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, margin: "0 0 16px" }}>
              Las instituciones buscan perfiles con al menos <strong style={{ color: "#fff" }}>3–5 especialidades</strong> bien definidas.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, margin: 0 }}>
              Sé específico: en lugar de &ldquo;Derecho&rdquo;, usa &ldquo;Derecho Administrativo&rdquo; o &ldquo;Derecho Digital&rdquo;.
            </p>
          </div>

          {specialties.length > 0 && (
            <div style={{
              background: D.white, border: `1px solid ${D.border}`,
              borderRadius: 16, padding: "20px", marginTop: 12,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: D.ink, marginBottom: 14 }}>
                Tus áreas activas
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {specialties.slice(0, 5).map((item: { id: string; area: string; subarea?: string }) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: D.blue, flexShrink: 0 }} />
                    <span style={{ fontFamily: SANS, fontSize: 13, color: D.ink, fontWeight: 600 }}>
                      {item.area}{item.subarea ? ` — ${item.subarea}` : ""}
                    </span>
                  </div>
                ))}
                {specialties.length > 5 && (
                  <span style={{ fontFamily: SANS, fontSize: 12, color: D.faint, marginTop: 4 }}>
                    +{specialties.length - 5} más
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
