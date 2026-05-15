"use client";

const AVAIL: Record<string, string> = {
  open:          "Disponible ahora",
  next_semester: "Próximo semestre",
  occasional:    "Asignaturas puntuales",
  weekends:      "Fines de semana",
  by_project:    "Por proyectos",
  not_available: "No disponible",
};

const LEVEL_LABEL: Record<string, string> = {
  grado:         "Grado",
  master:        "Máster",
  doctorado:     "Doctorado",
  fp_superior:   "FP Superior",
  mba:           "MBA",
  executive:     "Executive",
};

export function PrintProfileClient({
  profile,
  faculty,
  expertise,
  userEmail,
}: {
  profile: any;
  faculty: any;
  expertise: any[];
  userEmail: string;
}) {
  const name = profile?.full_name || "Docente";
  const headline = faculty?.headline || "";
  const bio = faculty?.bio || "";
  const location = faculty?.location || faculty?.country || "";
  const avail = AVAIL[faculty?.availability] || faculty?.availability || "";
  const isPhd = faculty?.is_phd;
  const aneca = faculty?.aneca_accreditation || "";
  const langs: any[] = faculty?.languages || [];
  const degrees: any[] = faculty?.degrees || [];
  const history: any[] = faculty?.institutions_taught || [];
  const years = faculty?.years_experience || 0;
  const currentInst = faculty?.current_institution || "";
  const linkedin = faculty?.linkedin_url || "";
  const website = faculty?.website || "";
  const phone = faculty?.phone || "";
  const research = faculty?.research_publications || "";
  const orcid = faculty?.orcid_id || "";
  const scholar = faculty?.google_scholar_id || "";
  const today = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });

  const initials = name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      {/* Print + screen CSS */}
      <style>{`
        @media print {
          header, aside, nav, .no-print { display: none !important; }
          main { padding: 0 !important; overflow: visible !important; }
          .print-root { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          @page { size: A4; margin: 16mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        @media screen {
          .print-root { max-width: 780px; margin: 0 auto; }
        }
      `}</style>

      {/* Screen: print action bar */}
      <div className="no-print mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0D2240]">Vista previa del CV</h1>
          <p className="text-sm text-gray-500 mt-0.5">Así se verá tu perfil impreso. Usa el botón para descargar en PDF.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.history.back()}
            style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #D8E2EF", background: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", color: "#374151" }}
          >
            ← Volver al perfil
          </button>
          <button
            onClick={() => window.print()}
            style={{ padding: "10px 22px", borderRadius: 8, border: "none", background: "#1B4FD8", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            ⬇ Descargar PDF
          </button>
        </div>
      </div>

      {/* Print document */}
      <div className="print-root" style={{ background: "#fff", borderRadius: 12, border: "1px solid #D8E2EF", overflow: "hidden", fontFamily: "'Inter', system-ui, sans-serif" }}>

        {/* ── Header band ── */}
        <div style={{ background: "linear-gradient(135deg, #0D2240 0%, #1B4FD8 55%, #4F7FE8 100%)", padding: "32px 40px 24px", display: "flex", gap: 24, alignItems: "flex-end" }}>
          {/* Avatar */}
          <div style={{ width: 80, height: 80, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{initials}</span>
            }
          </div>
          {/* Name block */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em" }}>{name}</h1>
              {isPhd && <span style={{ fontSize: 11, fontWeight: 800, background: "#E9A030", color: "#fff", padding: "2px 8px", borderRadius: 20, letterSpacing: "0.05em" }}>PhD</span>}
              {aneca && <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.2)", color: "#fff", padding: "2px 8px", borderRadius: 20 }}>ANECA</span>}
            </div>
            {headline && <p style={{ margin: "6px 0 0", fontSize: 15, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{headline}</p>}
            <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
              {location && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", gap: 4 }}>📍 {location}</span>}
              {avail && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>🕐 {avail}</span>}
              {currentInst && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>🏛 {currentInst}</span>}
            </div>
          </div>
          {/* FM badge top-right */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: "#0D2240" }}>FM</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>FacultyMatch</span>
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{today}</span>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "28px 40px", display: "grid", gridTemplateColumns: "1fr 200px", gap: 28 }}>

          {/* LEFT column */}
          <div>

            {/* Bio */}
            {bio && (
              <Section title="Sobre mí">
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "#374151" }}>{bio}</p>
              </Section>
            )}

            {/* Experience / History */}
            {(years > 0 || history.length > 0) && (
              <Section title="Experiencia docente">
                {years > 0 && <p style={{ margin: "0 0 10px", fontSize: 13, color: "#374151" }}><strong>{years} años</strong> de experiencia docente</p>}
                {history.map((h: any, i: number) => (
                  <div key={i} style={{ marginBottom: 10, paddingLeft: 12, borderLeft: "2px solid #1B4FD8" }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0C1018" }}>{h.institution || h.name || "Institución"}</p>
                    {(h.role || h.subject) && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280" }}>{[h.role, h.subject].filter(Boolean).join(" · ")}</p>}
                    {(h.start || h.year) && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9CA3AF" }}>{h.start || h.year}{h.end ? ` – ${h.end}` : ""}</p>}
                  </div>
                ))}
              </Section>
            )}

            {/* Formación */}
            {degrees.length > 0 && (
              <Section title="Formación académica">
                {degrees.map((d: any, i: number) => (
                  <div key={i} style={{ marginBottom: 10, paddingLeft: 12, borderLeft: "2px solid #E9A030" }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0C1018" }}>{d.title || d.degree || "Titulación"}</p>
                    {d.institution && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280" }}>{d.institution}</p>}
                    {d.year && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9CA3AF" }}>{d.year}</p>}
                  </div>
                ))}
              </Section>
            )}

            {/* Research */}
            {(aneca || research || orcid || scholar) && (
              <Section title="Investigación y acreditaciones">
                {aneca && <p style={{ margin: "0 0 6px", fontSize: 13, color: "#374151" }}><strong>Acreditación ANECA:</strong> {aneca}</p>}
                {orcid && <p style={{ margin: "0 0 4px", fontSize: 12, color: "#6B7280" }}>ORCID: {orcid}</p>}
                {scholar && <p style={{ margin: "0 0 4px", fontSize: 12, color: "#6B7280" }}>Google Scholar ID: {scholar}</p>}
                {research && <p style={{ margin: "8px 0 0", fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{research}</p>}
              </Section>
            )}
          </div>

          {/* RIGHT column */}
          <div>

            {/* Contact */}
            <Section title="Contacto">
              {userEmail && <ContactItem icon="✉" text={userEmail} />}
              {phone && <ContactItem icon="📞" text={phone} />}
              {linkedin && <ContactItem icon="🔗" text={linkedin.replace("https://", "")} />}
              {website && <ContactItem icon="🌐" text={website.replace("https://", "")} />}
            </Section>

            {/* Idiomas */}
            {langs.length > 0 && (
              <Section title="Idiomas">
                {langs.map((l: any, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#0C1018" }}>{l.language || l.name}</span>
                    {l.level && <span style={{ fontSize: 11, color: "#6B7280", background: "#F2F6FC", padding: "1px 6px", borderRadius: 4 }}>{l.level}</span>}
                  </div>
                ))}
              </Section>
            )}

            {/* Especialidades */}
            {expertise.length > 0 && (
              <Section title="Especialidades">
                {expertise.map((e: any, i: number) => (
                  <div key={i} style={{ marginBottom: 6 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#0C1018" }}>{e.area}</p>
                    {e.level && <p style={{ margin: "1px 0 0", fontSize: 11, color: "#6B7280" }}>{LEVEL_LABEL[e.level] || e.level}</p>}
                  </div>
                ))}
              </Section>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ borderTop: "1px solid #E2E8F0", padding: "12px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F9FAFB" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, background: "#0D2240", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 8, fontWeight: 900, color: "#fff" }}>FM</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280" }}>FacultyMatch — facultymatch.app</span>
          </div>
          <span style={{ fontSize: 10, color: "#9CA3AF" }}>Generado el {today}</span>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h3 style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#1B4FD8", borderBottom: "1px solid #E2E8F0", paddingBottom: 4 }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function ContactItem({ icon, text }: { icon: string; text: string }) {
  return (
    <p style={{ margin: "0 0 5px", fontSize: 11, color: "#374151", wordBreak: "break-all", display: "flex", gap: 5 }}>
      <span>{icon}</span> {text}
    </p>
  );
}
