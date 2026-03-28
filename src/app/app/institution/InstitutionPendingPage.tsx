import { Clock, Building2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function InstitutionPendingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <Logo />
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full text-center space-y-8">
          {/* Icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="w-24 h-24 rounded-3xl bg-amber-50 border-2 border-amber-100 flex items-center justify-center">
              <Clock size={40} className="text-amber-500" />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-navy">Cuenta en revisión</h1>
            <p className="text-gray-500 font-medium leading-relaxed">
              Hemos recibido tu solicitud de registro institucional. Nuestro equipo está revisando los datos y activará tu cuenta en un plazo de{" "}
              <strong className="text-navy">24-48 horas hábiles</strong>.
            </p>
          </div>

          {/* Steps */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left space-y-4">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">¿Qué pasa ahora?</h2>
            {[
              { icon: CheckCircle2, text: "Hemos recibido tu solicitud", done: true },
              { icon: Clock, text: "El equipo de FacultyMatch revisa tus datos", done: false },
              { icon: Building2, text: "Tu cuenta se activa y puedes empezar a buscar docentes", done: false },
            ].map(({ icon: Icon, text, done }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${done ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                  <Icon size={16} />
                </div>
                <span className={`text-sm font-medium ${done ? "text-navy" : "text-gray-400"}`}>{text}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-400 font-medium">
            ¿Tienes preguntas?{" "}
            <Link href="mailto:soporte@facultymatch.app" className="text-talentia-blue font-bold hover:underline">
              Contacta con nosotros
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
