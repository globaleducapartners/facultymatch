import { Document, Page, View, Text, StyleSheet, Svg, Circle, Path } from "@react-pdf/renderer";
import { buildCredentialId, generateVerificationHash, shortenHash } from "@/lib/verification";

// ─── Colores — misma identidad de marca del resto de la web ──────────────────
const NAVY = "#0D2240";
const DARK = "#071326";
const BLUE = "#1B4FD8";
const GOLD = "#E9A030";
const GOLD_SOFT = "#F7E8C8";
const SIGNAL = "#FF6A1A";
const INK = "#0C1018";
const MUTED = "#6B7280";
const BORDER = "#E4EAF3";
const PAPER = "#FEFDFB";

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    backgroundColor: PAPER,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: INK,
  },
  outerFrame: {
    margin: 22,
    borderWidth: 1.5,
    borderColor: NAVY,
    flex: 1,
  },
  innerFrame: {
    margin: 5,
    borderWidth: 1,
    borderColor: GOLD,
    flex: 1,
    padding: 34,
  },

  // header
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandWord: { fontSize: 15, fontWeight: 800, letterSpacing: -0.3, color: NAVY },
  idTag: { textAlign: "right" },
  idTagLabel: { fontSize: 7, fontWeight: 700, letterSpacing: 1.2, color: MUTED, marginBottom: 2 },
  idTagValue: { fontSize: 9, fontWeight: 700, color: NAVY },

  // body
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 50 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  eyebrowLine: { width: 24, height: 1, backgroundColor: GOLD, opacity: 0.6 },
  eyebrow: { fontSize: 9, fontWeight: 700, letterSpacing: 2, color: GOLD, textTransform: "uppercase" },
  certifies: { fontSize: 11, color: MUTED, marginBottom: 8 },
  name: { fontSize: 32, fontWeight: 900, color: NAVY, letterSpacing: -0.5, textAlign: "center", marginBottom: 6 },
  headline: { fontSize: 12.5, fontWeight: 700, color: BLUE, marginBottom: 20, textAlign: "center" },
  lead: { fontSize: 10, lineHeight: 1.6, color: MUTED, textAlign: "center", maxWidth: 400, marginBottom: 18 },

  factsRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  fact: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#EFF4FE", borderWidth: 1, borderColor: "#C9D9F8",
    borderRadius: 12, paddingVertical: 5, paddingHorizontal: 11,
  },
  factCheck: { fontSize: 8, color: BLUE, fontWeight: 700 },
  factText: { fontSize: 9, fontWeight: 700, color: NAVY },

  // footer
  footer: {
    flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between",
    borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 16,
  },
  sigBlock: { width: 150 },
  sigBlockRight: { width: 150, alignItems: "flex-end" },
  sigLine: { width: 110, height: 1, backgroundColor: INK, opacity: 0.25, marginBottom: 5 },
  sigLabel: { fontSize: 7, fontWeight: 700, letterSpacing: 1, color: MUTED, textTransform: "uppercase", marginBottom: 2 },
  sigValue: { fontSize: 10.5, fontWeight: 700, color: NAVY },

  sealWrap: { alignItems: "center", justifyContent: "center", width: 90, height: 90 },
  sealLabel: { fontSize: 6, fontWeight: 700, color: NAVY, letterSpacing: 0.6, marginTop: 3, textTransform: "uppercase" },

  // verify strip
  verifyRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 14 },
  hashPill: {
    backgroundColor: GOLD_SOFT, borderWidth: 1, borderColor: "#E9C77A",
    borderRadius: 5, paddingVertical: 4, paddingHorizontal: 10,
  },
  hashPillText: { fontSize: 8, fontFamily: "Helvetica", color: NAVY, fontWeight: 700 },
  verifyUrl: { fontSize: 8.5, color: BLUE, fontWeight: 700 },
});

// ─── El sello — círculos concéntricos + el icono "encuentro" de marca ─────────
function Seal() {
  return (
    <View style={styles.sealWrap}>
      <Svg width={72} height={72} viewBox="0 0 72 72">
        <Circle cx={36} cy={36} r={34} stroke={GOLD} strokeWidth={1} fill="none" opacity={0.55} />
        <Circle cx={36} cy={36} r={29} stroke={NAVY} strokeWidth={1.4} fill="none" opacity={0.8} />
        <Circle cx={36} cy={36} r={24.5} stroke={NAVY} strokeWidth={0.5} fill="none" opacity={0.35} />
        {/* icono de marca, dos círculos superpuestos */}
        <Circle cx={30} cy={38} r={7} fill={NAVY} opacity={0.85} />
        <Circle cx={42} cy={36} r={10.5} fill={GOLD} opacity={0.9} />
      </Svg>
      <Text style={styles.sealLabel}>Verificado</Text>
    </View>
  );
}

// ─── Componente ────────────────────────────────────────────────────────────────

interface VerifiedProfilePdfProps {
  fullName: string;
  headline?: string | null;
  currentInstitution?: string | null;
  academicLevel?: string | null;
  yearsExperience?: number;
  isPhd?: boolean;
  anecaAccreditation?: string | null;
  orcidId?: string | null;
  profileSlug?: string | null;
  /** faculty_profiles.verificado_en — NUNCA "ahora": ver src/lib/verification.ts */
  verifiedAt: string;
}

export function VerifiedProfilePdf({
  fullName,
  headline,
  currentInstitution,
  academicLevel,
  yearsExperience,
  isPhd,
  anecaAccreditation,
  orcidId,
  profileSlug,
  verifiedAt,
}: VerifiedProfilePdfProps) {
  const issuedDate = new Date(verifiedAt).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hash = generateVerificationHash(fullName, verifiedAt, profileSlug);
  const credentialId = buildCredentialId(fullName, verifiedAt, profileSlug);
  const verifyUrl = profileSlug
    ? `facultymatch.app/verificar/${profileSlug}`
    : "facultymatch.app";

  const facts: string[] = [];
  if (academicLevel) facts.push(`Nivel académico: ${academicLevel}`);
  if (isPhd) facts.push("Doctorado confirmado");
  if (orcidId) facts.push("ORCID vinculado");
  if (anecaAccreditation) facts.push(`Acreditación ${anecaAccreditation}`);
  if (currentInstitution) facts.push(`Institución actual: ${currentInstitution}`);
  if (yearsExperience && yearsExperience > 0) facts.push(`${yearsExperience}+ años de experiencia`);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.outerFrame}>
          <View style={styles.innerFrame}>

            {/* ── cabecera ── */}
            <View style={styles.head}>
              <View style={styles.brandRow}>
                <Svg width={20} height={20} viewBox="0 0 120 120">
                  <Circle cx={60} cy={60} r={55} fill="none" stroke={NAVY} strokeWidth={3.5} />
                  <Path d="M61.1 75.2 L58.9 75.2 L18.9 61.6 L16.7 60.5 L14.7 58.1 L14.0 56.3 L14.0 53.4 L15.1 50.8 L17.1 48.8 L19.3 47.7 L32.1 43.7 L33.2 42.9 L58.2 34.5 L62.2 34.5 L64.4 35.6 L101.8 48.1 L104.0 49.5 L105.3 51.2 L106.0 53.0 L106.0 56.3 L104.9 58.9 L103.3 60.5 L101.1 61.6 L100.0 61.6 L97.0 59.8 L93.0 58.7 L88.6 58.7 L84.6 59.8 L81.3 61.6 L77.4 65.5 L75.6 68.4 L75.0 70.4 Z" fill={NAVY} />
                  <Circle cx={90.8} cy={75.3} r={10.2} fill={SIGNAL} />
                </Svg>
                <Text style={styles.brandWord}>facultymatch</Text>
              </View>
              <View style={styles.idTag}>
                <Text style={styles.idTagLabel}>ID DE CREDENCIAL</Text>
                <Text style={styles.idTagValue}>{credentialId}</Text>
              </View>
            </View>

            {/* ── cuerpo ── */}
            <View style={styles.body}>
              <View style={styles.eyebrowRow}>
                <View style={styles.eyebrowLine} />
                <Text style={styles.eyebrow}>Certificado de verificación</Text>
                <View style={styles.eyebrowLine} />
              </View>

              <Text style={styles.certifies}>Este certificado acredita que</Text>
              <Text style={styles.name}>{fullName}</Text>
              {headline && <Text style={styles.headline}>{headline}</Text>}

              <Text style={styles.lead}>
                Ha completado y verificado su perfil académico en FacultyMatch. La información
                aquí recogida ha sido comprobada por nuestro equipo mediante fuentes públicas
                —incluyendo ORCID— y la documentación aportada por el propio docente.
              </Text>

              {facts.length > 0 && (
                <View style={styles.factsRow}>
                  {facts.map((f, i) => (
                    <View key={i} style={styles.fact}>
                      <Text style={styles.factCheck}>✓</Text>
                      <Text style={styles.factText}>{f}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* ── firma / sello ── */}
            <View style={styles.footer}>
              <View style={styles.sigBlock}>
                <View style={styles.sigLine} />
                <Text style={styles.sigLabel}>Fecha de emisión</Text>
                <Text style={styles.sigValue}>{issuedDate}</Text>
              </View>

              <Seal />

              <View style={styles.sigBlockRight}>
                <View style={styles.sigLine} />
                <Text style={styles.sigLabel}>Verificado por</Text>
                <Text style={styles.sigValue}>Equipo FacultyMatch</Text>
              </View>
            </View>

            {/* ── código de verificación ── */}
            <View style={styles.verifyRow}>
              <View style={styles.hashPill}>
                <Text style={styles.hashPillText}>{shortenHash(hash)}</Text>
              </View>
              <Text style={styles.verifyUrl}>{verifyUrl}</Text>
            </View>

          </View>
        </View>
      </Page>
    </Document>
  );
}
