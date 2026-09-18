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

    const [{ data: profile }, { data: facultyProfile }] =
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
      ]);

    if (!facultyProfile) {
      return NextResponse.json(
        { error: "Perfil docente no encontrado" },
        { status: 404 }
      );
    }

    // El certificado solo puede generarse para el propio perfil (no hay
    // parámetro de id en este endpoint, así que ya no es posible pedir el
    // de otro docente) y solo si está verificado — evita que la URL,
    // compartida o adivinada, sirva un "certificado verificado" para un
    // perfil que no lo está.
    if (facultyProfile.estado_perfil !== "verificado") {
      return NextResponse.json(
        { error: "Tu perfil todavía no está verificado" },
        { status: 403 }
      );
    }

    // El certificado necesita una fecha de verificación real y estable
    // (ver src/lib/verification.ts) — sin ella el código de verificación
    // no tendría nada fijo que representar.
    if (!facultyProfile.verificado_en) {
      return NextResponse.json(
        { error: "Falta la fecha de verificación del perfil" },
        { status: 500 }
      );
    }

    const pdfBuffer = await renderToBuffer(
      <VerifiedProfilePdf
        fullName={profile?.full_name || user.email?.split("@")[0] || "Docente"}
        headline={facultyProfile.headline}
        currentInstitution={facultyProfile.current_institution}
        academicLevel={facultyProfile.academic_level}
        yearsExperience={facultyProfile.years_experience}
        isPhd={facultyProfile.is_phd}
        anecaAccreditation={facultyProfile.aneca_accreditation}
        orcidId={facultyProfile.orcid_id}
        profileSlug={facultyProfile.profile_slug}
        verifiedAt={facultyProfile.verificado_en}
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