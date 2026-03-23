import Link from "next/link";
import Image from "next/image";
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
  title: "Talento Docente | FacultyMatch - La Red Global de Educación Superior",
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
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full opacity-40 blur-3xl -z-10" />
                <p className="text-xl text-gray-500 font-medium max-w-lg leading-relaxed">
                  Conecta con instituciones que buscan perfiles acreditados ANECA, investigadores con ORCID y expertos en educación superior.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/apply">
                    <Button className="w-full sm:w-auto bg-talentia-blue hover:bg-blue-700 text-white font-bold h-14 px-10 rounded-xl shadow-xl shadow-blue-100 transition-all text-lg">
                      Crear perfil gratis
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-tech-cyan">
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> Perfil Profesional</span>
                  <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Privacidad Avanzada</span>
                </div>

                <div className="flex flex-wrap gap-8 pt-4">
                  {[
                    { num: "500+", label: "Docentes registrados" },
                    { num: "40+", label: "Países representados" },
                    { num: "98%", label: "Tasa de satisfacción" },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-2xl font-black text-navy">{s.num}</p>
                      <p className="text-xs font-bold text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>

            </div>
              <div className="relative">
              <div className="rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-900/10 border-8 border-white relative aspect-[4/3]">
                <Image 
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200" 
                  alt="Docente impartiendo clase"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
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
              <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">Más que un CV online, FacultyMatch es tu centro de operaciones para gestionar tu presencia institucional.</p>
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
                    <div className="mb-6">
                      <p className="text-4xl font-black text-navy">29€ <span className="text-lg text-gray-400 font-bold">/ año</span></p>
                      <p className="text-xs font-bold text-energy-orange mt-1 uppercase tracking-widest">Acceso completo · Sin permanencia</p>
                    </div>
                    <ul className="space-y-4 mb-8">
                      <li className="flex items-center gap-2 font-bold text-navy"><CheckCircle2 className="text-talentia-blue" size={18} /> Todo lo del plan Basic</li>
                      <li className="flex items-center gap-2 font-bold text-navy"><CheckCircle2 className="text-talentia-blue" size={18} /> Bloqueo de instituciones específicas</li>
                      <li className="flex items-center gap-2 font-bold text-navy"><CheckCircle2 className="text-talentia-blue" size={18} /> Oculto para tu centro actual</li>
                      <li className="flex items-center gap-2 font-bold text-navy"><CheckCircle2 className="text-talentia-blue" size={18} /> Posicionamiento prioritario</li>
                    </ul>
                    <Link href="/checkout?plan=faculty-pro">
                      <Button className="w-full bg-talentia-blue hover:bg-blue-700 text-white h-14 rounded-xl font-bold shadow-lg shadow-blue-100 hover:scale-105 transition-transform duration-200">Upgrade Profesional</Button>
                    </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Social Proof */}
          <section className="py-16 px-6 bg-white border-t border-gray-100">
            <div className="max-w-5xl mx-auto">
              <p className="text-center text-xs font-black uppercase tracking-widest text-gray-400 mb-10">
                Por qué los docentes eligen FacultyMatch
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    quote: "En 3 semanas conseguí dos colaboraciones nuevas con universidades que nunca habría conocido de otra forma.",
                    name: "Dra. Carmen R.",
                    role: "Profesora de Marketing Digital",
                    avatar: "CR"
                  },
                  {
                    quote: "Lo que más valoro es el control de privacidad. Puedo decidir exactamente quién ve mi perfil.",
                    name: "Prof. Javier M.",
                    role: "Doctor en Economía",
                    avatar: "JM"
                  },
                  {
                    quote: "FacultyMatch entiende el mundo académico. No es LinkedIn. Es una herramienta específica para nosotros.",
                    name: "Dra. Laura S.",
                    role: "Investigadora y Docente",
                    avatar: "LS"
                  }
                ].map((t, i) => (
                  <div key={i} className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-6 space-y-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <span key={j} className="text-energy-orange text-sm">★</span>
                      ))}
                    </div>
                    <p className="text-gray-600 font-medium text-sm leading-relaxed">
                      "{t.quote}"
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="w-9 h-9 rounded-full bg-talentia-blue text-white text-xs font-black flex items-center justify-center">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-black text-navy">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-24 px-6 lg:px-12 bg-[#F8FAFC]">
            <div className="max-w-6xl mx-auto">
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-900/20 min-h-[420px] flex items-center">
                <div className="absolute inset-0">
                  <Image
                    src="https://images.unsplash.com/photo-1544531585-9847b68c8c86?auto=format&fit=crop&q=80&w=1800"
                    alt="Docentes colaborando globalmente"
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-talentia-blue/85"></div>
                </div>
                <div className="relative z-10 w-full px-10 py-16 lg:px-20 flex flex-col lg:flex-row items-center justify-between gap-10">
                  <div className="space-y-4 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-tech-cyan text-xs font-black uppercase tracking-widest">
                      <GraduationCap size={14} /> Tu siguiente paso académico
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                      Empieza a generar ingresos con tu conocimiento.
                    </h2>
                    <p className="text-lg text-white/70 font-medium">
                      Miles de instituciones buscan docentes como tú. Crea tu perfil y empieza a recibir propuestas académicas hoy mismo.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 min-w-[240px]">
                    <Link href="/apply">
                      <Button className="w-full bg-energy-orange hover:bg-orange-500 text-white font-black h-16 px-10 rounded-2xl text-lg shadow-xl shadow-orange-900/30 transition-all hover:scale-105">
                        Crear mi perfil gratis
                        <ArrowRight size={20} className="ml-2" />
                      </Button>
                    </Link>
                    <Link href="/login" className="text-center text-white/60 font-bold hover:text-white transition-colors text-sm py-2">
                      Ya tengo cuenta →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

