import Link from "next/link";
import type { Metadata } from "next";
import { 
  CheckCircle2, 
  Globe, 
  ShieldCheck, 
  Zap, 
  Briefcase, 
  Search, 
  Users,
  ArrowRight,
  GraduationCap,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Talento Docente | Talentia - La Red Global de Educación Superior",
    description: "Crea tu perfil docente profesional, verifica tus credenciales y conecta con universidades e instituciones de todo el mundo. Potencia tu carrera académica.",

  keywords: "perfil docente, carrera académica, educación superior, red de profesores, talento académico",
};

export default function FacultyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 lg:px-12 py-20 lg:py-32 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/30 rounded-l-[100px] -z-10"></div>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-talentia-blue text-xs font-black uppercase tracking-widest">
                <GraduationCap size={14} /> Red para Docentes
              </div>
                <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-navy leading-tight">
                  Tu carrera académica <br /> <span className="text-talentia-blue">global y acreditada.</span>
                </h1>
                <p className="text-xl text-gray-500 font-medium max-w-lg leading-relaxed">
                  Conecta con instituciones que buscan perfiles acreditados ANECA, investigadores con ORCID y expertos en educación superior.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/signup?role=faculty">
                    <Button className="w-full sm:w-auto bg-talentia-blue hover:bg-blue-700 text-white font-bold h-14 px-10 rounded-xl shadow-xl shadow-blue-100 transition-all text-lg">
                      Empezar ahora
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-tech-cyan">
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> Perfil Profesional</span>
                  <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Privacidad Avanzada</span>
                </div>

            </div>
            <div className="relative">
              <div className="rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-900/10 border-8 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop" 
                  alt="Docente trabajando" 
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 max-w-[240px] animate-bounce-slow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                    <Sparkles size={20} />
                  </div>
                  <p className="text-xs font-black text-navy uppercase tracking-widest">Oportunidad</p>
                </div>
                <p className="text-sm font-medium text-gray-500 italic">"Una universidad en Madrid ha visto tu perfil hoy"</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 px-6 lg:px-12 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-4xl lg:text-5xl font-black text-navy tracking-tight">Diseñado para el académico moderno</h2>
              <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">Más que un CV online, Talentia es tu centro de operaciones para gestionar tu presencia institucional.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Visibilidad Selectiva",
                  desc: "Tú decides quién ve tu perfil. Bloquea instituciones específicas o mantén tu perfil oculto hasta que tú decidas.",
                  icon: ShieldCheck,
                  color: "text-talentia-blue"
                },
                {
                  title: "Dossier Académico",
                  desc: "Estructura tu experiencia por áreas, subáreas, idiomas y disponibilidad. Un perfil pensado por y para la universidad.",
                  icon: Briefcase,
                  color: "text-tech-cyan"
                },
                {
                  title: "Networking Global",
                  desc: "Conecta con directores de programa de universidades líderes en todo el mundo sin intermediarios.",
                  icon: Globe,
                  color: "text-energy-orange"
                }
              ].map((benefit, idx) => (
                <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className={`${benefit.color} mb-8 group-hover:scale-110 transition-transform`}>
                    <benefit.icon size={48} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-black text-navy mb-4 leading-tight">{benefit.title}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 px-6 lg:px-12 bg-white">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-square bg-blue-50 rounded-[4rem] flex items-center justify-center">
                <div className="space-y-6 w-full max-w-sm px-8">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transform hover:-translate-y-1 transition-all">
                      <div className="bg-talentia-blue text-white w-8 h-8 rounded-lg flex items-center justify-center font-black">{step}</div>
                      <div className="h-2 bg-gray-100 rounded-full flex-1">
                        <div className={`h-full bg-tech-cyan rounded-full w-[${step * 25}%]`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-12">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-black text-navy leading-tight">Tu perfil verificado en 3 pasos</h2>
                <p className="text-lg text-gray-500 font-medium">Elevamos tu perfil al estándar de calidad que las universidades exigen.</p>
              </div>
              <div className="space-y-8">
                {[
                  { title: "Registro y Datos Base", desc: "Crea tu cuenta y define tu área principal de conocimiento." },
                  { title: "Especialización y CV", desc: "Añade tus subáreas detalladas y sube tu documentación académica." },
                  { title: "Verificación y Lanzamiento", desc: "Nuestro equipo valida tus credenciales y tu perfil entra en la red global." }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-navy text-white rounded-2xl flex items-center justify-center font-black text-xl">
                      {idx + 1}
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold text-navy">{step.title}</h4>
                      <p className="text-gray-500 font-medium">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

          {/* Membership Section */}
          <section className="py-24 px-6 lg:px-12 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center space-y-4 mb-20">
                <h2 className="text-4xl lg:text-5xl font-black text-navy tracking-tight">Eleva tu presencia académica</h2>
                <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">Toma el control total de tu carrera y visibilidad profesional.</p>
              </div>
  
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-[#F8FAFC] p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <h3 className="text-2xl font-black text-navy mb-4">Plan Basic</h3>
                  <p className="text-4xl font-black text-navy mb-6">0€ <span className="text-lg text-gray-400 font-bold">/ siempre</span></p>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-2 font-bold text-navy"><CheckCircle2 className="text-talentia-blue" size={18} /> Perfil verificado</li>
                    <li className="flex items-center gap-2 font-bold text-navy"><CheckCircle2 className="text-talentia-blue" size={18} /> Visibilidad en el directorio</li>
                    <li className="flex items-center gap-2 font-bold text-navy"><CheckCircle2 className="text-talentia-blue" size={18} /> Recepción de ofertas</li>
                  </ul>
                  <Button className="w-full bg-white border-2 border-gray-200 text-navy hover:bg-gray-50 h-14 rounded-xl font-bold">Plan por defecto</Button>
                </div>
  
                <div className="bg-white p-10 rounded-[2.5rem] border-4 border-talentia-blue shadow-2xl relative overflow-hidden">
                  <div className="absolute top-4 right-4 bg-talentia-blue text-white text-[10px] font-black px-3 py-1 rounded-full">RECOMENDADO</div>
                  <h3 className="text-2xl font-black text-navy mb-4">Plan Professional</h3>
                  <p className="text-4xl font-black text-navy mb-6">9,99€ <span className="text-lg text-gray-400 font-bold">/ mes</span></p>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-2 font-bold text-navy"><CheckCircle2 className="text-talentia-blue" size={18} /> Todo lo del plan Basic</li>
                    <li className="flex items-center gap-2 font-bold text-navy"><CheckCircle2 className="text-talentia-blue" size={18} /> Bloqueo de instituciones específicas</li>
                    <li className="flex items-center gap-2 font-bold text-navy"><CheckCircle2 className="text-talentia-blue" size={18} /> Oculto para tu centro actual</li>
                    <li className="flex items-center gap-2 font-bold text-navy"><CheckCircle2 className="text-talentia-blue" size={18} /> Posicionamiento prioritario</li>
                  </ul>
                  <Link href="/signup?role=faculty">
                    <Button className="w-full bg-talentia-blue hover:bg-blue-700 text-white h-14 rounded-xl font-bold shadow-lg shadow-blue-100">Upgrade Profesional</Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-24 px-6 lg:px-12 bg-[#F8FAFC]">
          <div className="max-w-5xl mx-auto bg-navy rounded-[3.5rem] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-talentia-blue/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight">
                El futuro de la docencia <br /> es <span className="text-tech-cyan">global y verificado.</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/signup?role=faculty">
                  <Button className="bg-white text-navy hover:bg-gray-100 font-black h-16 px-12 rounded-2xl text-lg shadow-xl hover:scale-105 transition-all">
                    Registrarme ahora
                  </Button>
                </Link>
                <Link href="/login" className="text-gray-400 font-bold hover:text-white transition-colors">
                  Ya tengo cuenta
                </Link>
              </div>
            </div>
          </div>
          </section>
        </main>
      </div>
    );
  }

