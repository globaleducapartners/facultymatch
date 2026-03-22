import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { Building2, Search, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const params = await searchParams;
  const area = params.area;

  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "institution") {
      redirect("/app/institution");
    }

    if (profile?.role === "faculty") {
      return (
        <>
          <Navbar />
          <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
            <div className="max-w-md text-center space-y-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
                <Search size={28} className="text-talentia-blue" />
              </div>
              <h1 className="text-2xl font-black text-navy">
                El directorio es exclusivo para instituciones
              </h1>
              <p className="text-gray-500 font-medium">
                Como docente, accede a tu perfil para gestionar tu visibilidad.
              </p>
              <Link
                href="/app/faculty"
                className="inline-flex items-center gap-2 bg-talentia-blue text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                Mi perfil <ArrowRight size={18} />
              </Link>
            </div>
          </main>
        </>
      );
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6 py-20">
        <div className="max-w-lg text-center space-y-8">
          <div className="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center mx-auto">
            <Building2 size={28} className="text-white" />
          </div>
          {area && (
            <span className="inline-block px-4 py-2 bg-blue-50 text-talentia-blue text-sm font-bold rounded-full border border-blue-100">
              Área: {decodeURIComponent(area).replace(/-/g, " & ")}
            </span>
          )}
          <h1 className="text-3xl font-black text-navy leading-tight">
            Directorio de Docentes Verificados
          </h1>
          <p className="text-gray-500 font-medium text-lg leading-relaxed">
            Accede con tu cuenta institucional para explorar perfiles verificados
            y encontrar el profesorado adecuado para tus programas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup?role=institution"
              className="flex items-center justify-center gap-2 bg-navy text-white px-8 py-4 rounded-xl font-bold hover:bg-navy/90 transition-all"
            >
              Registrar mi institución <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 border-2 border-gray-200 text-navy px-8 py-4 rounded-xl font-bold hover:border-navy transition-all"
            >
              Ya tengo cuenta
            </Link>
          </div>
          <p className="text-sm text-gray-400">
            ¿Eres docente?{" "}
            <Link href="/apply" className="text-talentia-blue font-bold hover:underline">
              Crea tu perfil aquí
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
