import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase-server";
import { renderToBuffer } from "@react-pdf/renderer";
import { VerifiedProfilePdf } from "@/components/pdf/VerifiedProfilePdf";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const admin = createAdminClient();

    const [{ data: profile }, { data: facultyProfile }, { data: expertise }] =
      await Promise.all([
        supabase
          .from("user_profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .single(),
        admin
          .from("faculty_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("faculty_expertise")
          .select("area, subarea, topics")
          .eq("faculty_id", user.id),
      ]);

    if (!facultyProfile) {
      return NextResponse.json(
        { error: "Perfil docente no encontrado" },
        { status: 404 }
      );
    }

    const areas = [
      ...(facultyProfile.faculty_areas || []),
      ...(expertise || []).map((e: any) => e.area),
    ].filter(Boolean);

    const pdfBuffer = await renderToBuffer(
      <VerifiedProfilePdf
        fullName={profile?.full_name || user.email?.split("@")[0] || "Docente"}
        headline={facultyProfile.headline}
        location={facultyProfile.location}
        bio={facultyProfile.bio}
        languages={facultyProfile.languages || []}
        degrees={facultyProfile.degrees || []}
        institutionsTaught={facultyProfile.institutions_taught || []}
        yearsExperience={facultyProfile.years_experience}
        currentInstitution={facultyProfile.current_institution}
        availability={facultyProfile.availability}
        modalities={facultyProfile.modalities || []}
        isPhd={facultyProfile.is_phd}
        anecaAccreditation={facultyProfile.aneca_accreditation}
        researchPublications={facultyProfile.research_publications}
        orcidId={facultyProfile.orcid_id}
        orcidImportData={facultyProfile.orcid_import_data}
        facultyAreas={areas}
        profileSlug={facultyProfile.profile_slug}
        userEmail={user.email!}
        phone={facultyProfile.phone}
        linkedinUrl={facultyProfile.linkedin_url}
        website={facultyProfile.website}
        academicLevel={facultyProfile.academic_level}
      />
    );

    const fileName = `perfil-verificado-facultymatch-${
      profile?.full_name
        ? profile.full_name.toLowerCase().replace(/\s+/g, "-")
        : "docente"
    }.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("[perfil-pdf]", error);
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}