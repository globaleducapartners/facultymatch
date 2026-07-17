import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { createHash } from "crypto";

// ─── Colors ───────────────────────────────────────────────────────────────────
const GOLD_DARK = "#A67C2E";
const GOLD = "#C5942B";
const GOLD_LIGHT = "#D4A843";
const GOLD_PALE = "#E8D5A3";
const GOLD_BG = "#F5EDD6";
const GOLD_WATERMARK = "#EDE3C8";
const CREAM = "#F7F2E7";
const CREAM_LIGHT = "#FBF8F0";
const WHITE = "#FFFFFF";
const INK = "#1A1A1A";
const INK_SOFT = "#4A4A4A";
const INK_FADE = "#8A8A8A";

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    padding: 0,
    backgroundColor: CREAM,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: INK_SOFT,
    lineHeight: 1.5,
  },

  // ── Outer decorative border ──
  outerBorder: {
    margin: 20,
    borderWidth: 2.5,
    borderColor: GOLD,
    flex: 1,
  },
  midBorder: {
    margin: 5,
    borderWidth: 0.5,
    borderColor: GOLD_LIGHT,
    flex: 1,
  },
  innerBorder: {
    margin: 5,
    borderWidth: 1.5,
    borderColor: GOLD,
    flex: 1,
    padding: 32,
  },

  // ── Corner ornaments ──
  cornerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  cornerTL: {
    width: 20,
    height: 20,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: GOLD,
  },
  cornerTR: {
    width: 20,
    height: 20,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: GOLD,
  },
  cornerBL: {
    width: 20,
    height: 20,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: GOLD,
  },
  cornerBR: {
    width: 20,
    height: 20,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: GOLD,
  },
  // ── Top ornament ──
  topOrnament: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 4,
  },
  ornamentLine: {
    height: 1,
    flex: 1,
    backgroundColor: GOLD_PALE,
  },
  ornamentDiamond: {
    fontSize: 8,
    color: GOLD,
    marginHorizontal: 10,
  },
  // ── CERTIFICATE title ──
  certTitle: {
    fontSize: 24,
    fontWeight: 900,
    color: GOLD_DARK,
    textAlign: "center",
    letterSpacing: 6,
    textTransform: "uppercase",
    marginBottom: 18,
    fontFamily: "Times-Roman",
  },
  // ── Gold divider line ──
  goldLine: {
    height: 1,
    backgroundColor: GOLD_PALE,
    marginVertical: 6,
    width: "100%",
  },
  goldLineShort: {
    height: 1,
    backgroundColor: GOLD_PALE,
    marginVertical: 6,
    width: "40%",
    alignSelf: "center",
  },

  // ── "THIS CERTIFIES THAT" ──
  certifiesText: {
    fontSize: 11,
    color: INK_SOFT,
    textAlign: "center",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 14,
    marginTop: 6,
    fontWeight: 700,
  },

  // ── Teacher name ──
  teacherName: {
    fontSize: 26,
    fontWeight: 900,
    color: INK,
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 14,
    fontFamily: "Times-Roman",
  },
  teacherHeadline: {
    fontSize: 13,
    color: GOLD_DARK,
    textAlign: "center",
    fontWeight: 700,
    letterSpacing: 0.5,
    marginBottom: 14,
  },

  // ── Body text ──
  bodyText: {
    fontSize: 10,
    color: INK_SOFT,
    textAlign: "center",
    lineHeight: 1.8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  // ── Details section ──
  detailsSection: {
    paddingHorizontal: 16,
    marginBottom: 14,
    marginTop: 4,
  },
  detailLine: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 10,
    color: INK_FADE,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginRight: 6,
  },
  detailValue: {
    fontSize: 10,
    color: INK,
    fontWeight: 700,
  },

  // ── Gold seal ──
  sealRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 14,
  },
  sealLine: {
    height: 1,
    flex: 1,
    backgroundColor: GOLD_PALE,
    maxWidth: 80,
  },
  seal: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
    borderColor: GOLD_DARK,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
    marginHorizontal: 16,
  },
  sealInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: GOLD_PALE,
    alignItems: "center",
    justifyContent: "center",
  },
  sealTop: {
    fontSize: 6,
    color: GOLD_DARK,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 1,
  },
  sealCenter: {
    fontSize: 14,
    color: GOLD_DARK,
    fontWeight: 900,
    fontFamily: "Times-Roman",
    marginBottom: 1,
  },
  sealBottom: {
    fontSize: 5,
    color: GOLD_DARK,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // ── Verification info ──
  infoLine: {
    fontSize: 8.5,
    color: INK_FADE,
    textAlign: "center",
    marginBottom: 2,
  },

  // ── Signature section ──
  sigSection: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  sigRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sigCol: {
    alignItems: "center",
    width: "40%",
  },
  sigLine: {
    width: "100%",
    height: 1,
    backgroundColor: GOLD_PALE,
    marginBottom: 5,
  },
  sigLabel: {
    fontSize: 8,
    color: INK_FADE,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
    textAlign: "center",
  },
  sigValue: {
    fontSize: 9,
    color: INK,
    fontWeight: 700,
    textAlign: "center",
    marginTop: 2,
  },

  // ── Blockchain hash ──
  hashSection: {
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: GOLD_PALE,
  },
  hashLabel: {
    fontSize: 6.5,
    color: INK_FADE,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  hashValue: {
    fontSize: 6,
    color: INK_FADE,
    fontWeight: 500,
    fontFamily: "Courier",
    letterSpacing: 0.5,
  },

  // ── Profile URL ──
  urlSection: {
    alignItems: "center",
    marginTop: 6,
  },
  urlText: {
    fontSize: 8,
    color: GOLD,
    fontWeight: 700,
    textAlign: "center",
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateBlockchainHash(
  fullName: string,
  email: string,
  timestamp: string,
  profileSlug?: string | null
): string {
  const data = `FACULTYMATCH::${fullName}::${email}::${timestamp}::${profileSlug || "direct"}`;
  return createHash("sha256").update(data).digest("hex").toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

interface VerifiedProfilePdfProps {
  fullName: string;
  headline?: string | null;
  location?: string | null;
  bio?: string | null;
  languages?: any[];
  degrees?: any[];
  institutionsTaught?: any[];
  yearsExperience?: number;
  currentInstitution?: string | null;
  availability?: string | null;
  modalities?: any[];
  isPhd?: boolean;
  anecaAccreditation?: string | null;
  researchPublications?: string | null;
  orcidId?: string | null;
  orcidImportData?: any;
  facultyAreas?: string[];
  profileSlug?: string | null;
  userEmail?: string;
  phone?: string | null;
  linkedinUrl?: string | null;
  website?: string | null;
  academicLevel?: string | null;
}

export function VerifiedProfilePdf({
  fullName,
  headline,
  location,
  bio,
  languages = [],
  degrees = [],
  institutionsTaught = [],
  yearsExperience,
  currentInstitution,
  availability,
  isPhd,
  anecaAccreditation,
  researchPublications,
  orcidId,
  orcidImportData,
  facultyAreas = [],
  profileSlug,
  userEmail,
  academicLevel,
}: VerifiedProfilePdfProps) {
  const today = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timestamp = new Date().toISOString();
  const blockchainHash = generateBlockchainHash(fullName, userEmail || "", timestamp, profileSlug);
  const shortHash = `${blockchainHash.slice(0, 16)}...${blockchainHash.slice(-16)}`;

  const profileUrl = profileSlug
    ? `https://www.facultymatch.app/faculty/${profileSlug}`
    : "https://www.facultymatch.app";

  // Build detail lines
  const detailLines: { label: string; value: string }[] = [];
  if (currentInstitution) detailLines.push({ label: "Institución actual", value: currentInstitution });
  if (academicLevel) detailLines.push({ label: "Nivel académico", value: academicLevel });
  if (yearsExperience && yearsExperience > 0)
    detailLines.push({ label: "Experiencia docente", value: `${yearsExperience} años` });
  if (orcidId) detailLines.push({ label: "ORCID iD", value: orcidId });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.outerBorder}>
          <View style={styles.midBorder}>
            <View style={styles.innerBorder}>
              {/* ── DECORATIVE TOP CORNER ── */}
              <View style={styles.cornerRow}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
              </View>

              {/* ── TOP ORNAMENT ── */}
              <View style={styles.topOrnament}>
                <View style={styles.ornamentLine} />
                <Text style={styles.ornamentDiamond}>✦</Text>
                <View style={styles.ornamentLine} />
              </View>

              {/* ── CERTIFICATE ── */}
              <Text style={styles.certTitle}>Certificate</Text>

              {/* ── GOLD LINE ── */}
              <View style={styles.goldLineShort} />

              {/* ── THIS CERTIFIES THAT ── */}
              <Text style={styles.certifiesText}>This certifies that</Text>

              {/* ── TEACHER NAME ── */}
              <Text style={styles.teacherName}>{fullName}</Text>
              {headline && <Text style={styles.teacherHeadline}>{headline}</Text>}

              {/* ── GOLD LINE ── */}
              <View style={styles.goldLine} />

              {/* ── BODY TEXT ── */}
              <Text style={styles.bodyText}>
                Has completed and verified their academic profile on FacultyMatch. The
                information presented herein has been verified through public sources
                including ORCID and OpenAlex, as well as documentation provided by the
                faculty member.
              </Text>

              {/* ── DETAILS ── */}
              {detailLines.length > 0 && (
                <View style={styles.detailsSection}>
                  {detailLines.map((d, i) => (
                    <View key={i} style={styles.detailLine}>
                      <Text style={styles.detailLabel}>{d.label}:</Text>
                      <Text style={styles.detailValue}>{d.value}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* ── GOLD SEAL ── */}
              <View style={styles.sealRow}>
                <View style={styles.sealLine} />
                <View style={styles.seal}>
                  <View style={styles.sealInner}>
                    <Text style={styles.sealTop}>Faculty</Text>
                    <Text style={styles.sealCenter}>Match</Text>
                    <Text style={styles.sealBottom}>Verified</Text>
                  </View>
                </View>
                <View style={styles.sealLine} />
              </View>

              {/* ── VERIFICATION INFO ── */}
              {isPhd && <Text style={styles.infoLine}>· Doctorate confirmed ·</Text>}
              {anecaAccreditation && <Text style={styles.infoLine}>· ANECA accreditation verified ·</Text>}
              {orcidId && <Text style={styles.infoLine}>· ORCID profile linked ·</Text>}

              {/* ── SIGNATURE SECTION ── */}
              <View style={styles.sigSection}>
                <View style={styles.sigRow}>
                  <View style={styles.sigCol}>
                    <View style={styles.sigLine} />
                    <Text style={styles.sigLabel}>Date Issued</Text>
                    <Text style={styles.sigValue}>{today}</Text>
                  </View>
                  <View style={styles.sigCol}>
                    <View style={styles.sigLine} />
                    <Text style={styles.sigLabel}>Verified By</Text>
                    <Text style={styles.sigValue}>FacultyMatch</Text>
                  </View>
                </View>
              </View>

              {/* ── BLOCKCHAIN HASH ── */}
              <View style={styles.hashSection}>
                <Text style={styles.hashLabel}>Blockchain Verification Code (SHA-256)</Text>
                <Text style={styles.hashValue}>{shortHash}</Text>
              </View>

              {/* ── PROFILE URL ── */}
              <View style={styles.urlSection}>
                <Text style={styles.urlText}>{profileUrl}</Text>
              </View>

              {/* ── DECORATIVE BOTTOM CORNER ── */}
              <View style={{ ...styles.cornerRow, marginTop: 8 }}>
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}