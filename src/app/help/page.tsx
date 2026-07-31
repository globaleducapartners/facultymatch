import Link from "next/link";
import { ArrowLeft, Mail, HelpCircle, ChevronRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-fm-surface">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-fm-border bg-white px-6 py-5 lg:px-12">
        <Logo />
        <Link href="/app/faculty" className="flex items-center gap-2 text-sm font-bold text-fm-blue">
          <ArrowLeft size={16} /> Volver al dashboard
        </Link>
      </nav>

      <main className="mx-auto max-w-4xl space-y-12 px-6 py-16">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-black tracking-tight text-fm-navy">¿Cómo podemos ayudarte?</h1>
          <p className="mx-auto max-w-lg text-lg font-medium text-[#5B6B85]">
            Encuentra respuestas a tus dudas académicas y técnicas sobre FacultyMatch.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[
            { title: "Gestión de perfil", desc: "Cómo completar tu perfil para maximizar tu visibilidad.", icon: HelpCircle },
            { title: "Proceso de verificación", desc: "Documentos necesarios y tiempos de revisión.", icon: HelpCircle },
            { title: "Privacidad y bloqueos", desc: "Cómo controlar quién ve tu información académica.", icon: HelpCircle },
            { title: "Contacto institucional", desc: "Cómo responder a las solicitudes de las universidades.", icon: HelpCircle },
          ].map((item, idx) => (
            <div key={idx} className="group cursor-pointer rounded-2xl border border-fm-border bg-white p-8 shadow-sm transition-all hover:shadow-xl">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-fm-blue/10 text-fm-blue transition-transform group-hover:scale-110">
                <item.icon size={24} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-fm-navy">{item.title}</h3>
              <p className="mb-4 text-sm font-medium leading-relaxed text-[#5B6B85]">{item.desc}</p>
              <div className="flex items-center text-xs font-black uppercase tracking-widest text-fm-blue transition-transform group-hover:translate-x-2">
                Leer más <ChevronRight size={14} className="ml-1" />
              </div>
            </div>
          ))}
        </div>

        <div className="relative space-y-8 overflow-hidden rounded-[2rem] bg-fm-navy p-12 text-center text-white">
          <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-fm-blue/20 blur-3xl" />
          <div className="relative space-y-4">
            <h2 className="text-2xl font-black">¿No encuentras lo que buscas?</h2>
            <p className="mx-auto max-w-sm font-medium text-white/60">Nuestro equipo de soporte académico está disponible para ayudarte personalmente.</p>
          </div>
          <div className="relative flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="mailto:support@facultymatch.app"
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-8 font-bold text-white hover:bg-white/20 sm:w-auto"
            >
              <Mail size={20} /> support@facultymatch.app
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
