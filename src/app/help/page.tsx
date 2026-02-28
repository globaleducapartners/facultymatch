import Link from "next/link";
import { Globe, ArrowLeft, Mail, MessageCircle, HelpCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="flex items-center justify-between px-6 lg:px-12 py-6 bg-white border-b border-gray-100 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-talentia-blue p-2 rounded-xl text-white shadow-lg shadow-blue-100">
            <Globe size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-navy leading-none">Talentia</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Centro de ayuda</span>
          </div>
        </Link>
        <Link href="/dashboard/educator" className="text-sm font-bold text-talentia-blue flex items-center gap-2">
          <ArrowLeft size={16} /> Volver al dashboard
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto py-16 px-6 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-navy tracking-tight">¿Cómo podemos ayudarte?</h1>
          <p className="text-lg text-gray-500 font-medium max-w-lg mx-auto">
            Encuentra respuestas a tus dudas académicas y técnicas sobre la red Talentia.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: "Gestión de Perfil", desc: "Cómo completar tu perfil para maximizar tu visibilidad.", icon: HelpCircle },
            { title: "Proceso de Verificación", desc: "Documentos necesarios y tiempos de revisión.", icon: HelpCircle },
            { title: "Privacidad & Bloqueos", desc: "Cómo controlar quién ve tu información académica.", icon: HelpCircle },
            { title: "Contacto Institucional", desc: "Cómo responder a las solicitudes de las universidades.", icon: HelpCircle },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer">
              <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-talentia-blue mb-6 group-hover:scale-110 transition-transform">
                <item.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed mb-4">{item.desc}</p>
              <div className="flex items-center text-talentia-blue text-xs font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                Leer más <ChevronRight size={14} className="ml-1" />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-navy rounded-[2rem] p-12 text-center text-white space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-tech-cyan/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative space-y-4">
            <h2 className="text-2xl font-black">¿No encuentras lo que buscas?</h2>
            <p className="text-gray-400 font-medium max-w-sm mx-auto">Nuestro equipo de soporte académico está disponible para ayudarte personalmente.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
            <Button className="w-full sm:w-auto bg-tech-cyan hover:bg-cyan-500 text-navy font-black rounded-xl h-14 px-8 flex items-center gap-2">
              <MessageCircle size={20} /> Chat en vivo
            </Button>
            <Button className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl h-14 px-8 border border-white/10 flex items-center gap-2">
              <Mail size={20} /> soporte@talentia.edu
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
