import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { 
  Search, 
  UserCircle, 
  School, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Globe,
  Briefcase,
  Cpu,
  HeartPulse,
  Scale,
  GraduationCap,
  Palette,
  Lock,
  Target,
  Star,
  BadgeCheck,
  FileSearch,
  Users2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "FacultyMatch | La Red Global de Talento Académico",
  description: "Conecta universidades y docentes a través de perfiles verificados y experiencia real. La plataforma líder en educación superior.",
  keywords: "talento académico, docentes, universidades, educación superior, red profesional académica, marketplace académico",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 lg:px-12 pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 lg:pr-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-talentia-blue text-xs font-black uppercase tracking-widest mb-4">
                  Verificación rigurosa · Estándar académico internacional
                </div>
                <h1 className="text-4xl lg:text-7xl font-black tracking-tight text-navy leading-[0.95]">
                  Convierte tu experiencia <span className="text-talentia-blue">académica en ingresos.</span>
                </h1>
                  <p className="text-xl text-gray-500 font-medium max-w-lg leading-relaxed pt-2">
                    Profesores universitarios que se unen a FacultyMatch reciben propuestas de nuevas instituciones en menos de 2 semanas. Crea tu perfil gratis y empieza a generar ingresos adicionales con tu conocimiento.
                  </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/signup/faculty" className="w-full sm:w-auto bg-energy-orange text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-100 group">
                  Crear perfil gratis
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/signup/institution" className="w-full sm:w-auto bg-white border border-gray-200 text-navy px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                  Soy institución
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-tech-cyan">
                  <CheckCircle2 size={16} />
                  Acreditación ANECA / Calidad
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-tech-cyan">
                  <ShieldCheck size={16} />
                  Perfiles verificados
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="relative bg-white p-3 rounded-2xl shadow-xl border border-gray-100 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                    <div className="aspect-[4/5] bg-gray-50 rounded-xl mb-3 overflow-hidden relative">
                      <Image
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"
                        alt="Educadora Verificada"
                        fill
                        sizes="(max-width:768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1 px-1">
                      <p className="text-sm font-bold text-navy">María González</p>
                      <p className="text-[10px] font-medium text-gray-500">PhD · Economía · Online</p>
                      <div className="flex items-center gap-1 text-[8px] font-bold text-tech-cyan uppercase bg-blue-50 px-2 py-0.5 rounded-full w-fit mt-1">
                        <CheckCircle2 size={10} /> Verificado
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="relative bg-white p-3 rounded-2xl shadow-xl border border-gray-100 transform rotate-[3deg] hover:rotate-0 transition-transform duration-500">
                    <div className="aspect-[4/5] bg-gray-50 rounded-xl mb-3 overflow-hidden relative">
                      <Image
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
                        alt="Profesor Académico"
                        fill
                        sizes="(max-width:768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1 px-1">
                      <p className="text-sm font-bold text-navy">Ricardo Sánchez</p>
                      <p className="text-[10px] font-medium text-gray-500">Strategic Management</p>
                      <div className="flex items-center gap-1 text-[8px] font-bold text-tech-cyan uppercase bg-blue-50 px-2 py-0.5 rounded-full w-fit mt-1">
                        <CheckCircle2 size={10} /> Verificado
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Motivational Banner */}
        <section className="bg-navy py-12 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { icon: Star, text: "Gana entre 30€ y 100€/hora impartiendo clases en nuevas instituciones", sub: "Comparte tu conocimiento con nuevas instituciones." },
                { icon: Globe, text: "Amplía tu red académica sin dejar tu universidad actual", sub: "Accede a universidades de Europa, América y Asia." },
                { icon: BadgeCheck, text: "Perfil verificado que genera confianza en más de 200 instituciones", sub: "Colabora con nuevas instituciones sin dejar la tuya." },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <item.icon size={24} className="text-tech-cyan" />
                  </div>
                  <p className="text-white font-bold text-lg leading-tight">{item.text}</p>
                  <p className="text-gray-400 text-sm font-medium">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-24 px-6 lg:px-12 bg-white">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl lg:text-4xl font-black text-navy uppercase tracking-tighter">Cómo funciona FacultyMatch</h2>
              <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto italic">Estandarizando el talento académico para la educación del futuro.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Perfil Académico", desc: "Registro estructurado por áreas UNESCO y micro-especialidades.", icon: UserCircle, color: "text-talentia-blue", bg: "bg-blue-50" },
                { step: "02", title: "Verificación", desc: "Validación documental de títulos, experiencia y publicaciones.", icon: ShieldCheck, color: "text-tech-cyan", bg: "bg-cyan-50" },
                { step: "03", title: "Matching IA", desc: "Conexión directa entre necesidades institucionales y expertos.", icon: Target, color: "text-energy-orange", bg: "bg-orange-50" },
                { step: "04", title: "Colaboración", desc: "Gestión de contratos, evaluaciones y ratings académicos.", icon: Globe, color: "text-navy", bg: "bg-gray-50" }
              ].map((item, idx) => (
                <div key={idx} className="relative p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-8xl font-black">{item.step}</span>
                  </div>
                  <div className={`${item.bg} ${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <item.icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Verification Methodology */}
        <section className="py-24 px-6 lg:px-12 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-[3rem] p-12 lg:p-16 border border-gray-100 shadow-sm">
              <div className="max-w-3xl mx-auto text-center space-y-6 mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-xs font-black uppercase tracking-widest">
                  <BadgeCheck size={14} /> Metodología de Verificación
                </div>
                <h2 className="text-3xl lg:text-4xl font-black text-navy">
                  Solo trabajamos con docentes reales y acreditados
                </h2>
                <p className="text-lg text-gray-500 font-medium">
                  Cada perfil pasa por un proceso de verificación riguroso antes de ser visible para las instituciones. Nuestra credibilidad depende de la tuya.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { icon: FileSearch, title: "Verificación de Títulos", desc: "Validamos diplomas, doctorados y certificaciones académicas con fuentes oficiales.", color: "text-talentia-blue", bg: "bg-blue-50" },
                  { icon: Users2, title: "Referencias Institucionales", desc: "Confirmamos experiencia docente previa con las universidades e instituciones declaradas.", color: "text-tech-cyan", bg: "bg-cyan-50" },
                  { icon: BadgeCheck, title: "Acreditación ANECA", desc: "Identificamos y destacamos los perfiles con acreditaciones oficiales de calidad.", color: "text-green-600", bg: "bg-green-50" },
                  { icon: ShieldCheck, title: "Revisión Editorial", desc: "Nuestro equipo revisa manualmente cada perfil antes de publicación.", color: "text-energy-orange", bg: "bg-orange-50" },
                ].map((item, i) => (
                  <div key={i} className="text-center space-y-4">
                    <div className={`${item.bg} ${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto`}>
                      <item.icon size={28} />
                    </div>
                    <h3 className="font-bold text-navy">{item.title}</h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features for Educators */}
        <section className="py-24 px-6 lg:px-12 bg-white">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-talentia-blue text-xs font-black uppercase tracking-widest">
                <UserCircle size={14} /> Para Docentes
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-navy leading-tight">
                Comparte tu conocimiento con instituciones de todo el mundo
              </h2>
              <p className="text-lg text-gray-500 font-medium">
                FacultyMatch permite a profesores, expertos y profesionales ampliar su actividad docente, colaborar con universidades internacionales y ampliar su CV y sus ingresos.
              </p>
              <ul className="space-y-4">
                {[
                  "Perfil profesional verificado",
                  "Visibilidad internacional",
                  "Red de confianza académica",
                  "Control de privacidad avanzado"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-navy font-bold">
                    <CheckCircle2 className="text-tech-cyan" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/faculty">
                <Button className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-14 px-8 rounded-xl shadow-lg shadow-blue-100 transition-all mt-4">
                  Saber más sobre Docentes
                </Button>
              </Link>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 relative h-[480px] group overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&q=80&w=1200"
                alt="Docente impartiendo clase"
                fill
                sizes="(max-width:768px) 100vw, 50vw"
                className="rounded-3xl object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent rounded-3xl"></div>
            </div>
          </div>
        </section>

        {/* Features for Institutions */}
        <section className="py-24 px-6 lg:px-12 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 relative h-[480px] group overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200"
                alt="Campus universitario moderno"
                fill
                sizes="(max-width:768px) 100vw, 50vw"
                className="rounded-3xl object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent rounded-3xl"></div>
            </div>
            <div className="order-1 lg:order-2 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-energy-orange text-xs font-black uppercase tracking-widest">
                <School size={14} /> Para Instituciones
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-navy leading-tight">
                Encuentra el profesorado adecuado para tus programas
              </h2>
              <p className="text-lg text-gray-500 font-medium">
                Accede a un repositorio estructurado de talento académico filtrado por disciplina, experiencia, idioma y disponibilidad.
              </p>
              <ul className="space-y-4">
                {[
                  "Perfiles verificados",
                  "Búsqueda académica avanzada",
                  "Construcción de claustros",
                  "Reducción de tiempos de selección"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-navy font-bold">
                    <CheckCircle2 className="text-energy-orange" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/institutions">
                <Button className="bg-energy-orange hover:bg-orange-600 text-white font-bold h-14 px-8 rounded-xl shadow-lg shadow-orange-100 transition-all mt-4">
                  Saber más sobre Instituciones
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Differential Section */}
        <section className="py-24 px-6 lg:px-12 bg-navy text-white">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-tech-cyan text-xs font-black uppercase tracking-widest">
              <Target size={14} /> Diferencial
            </div>
            <h2 className="text-4xl lg:text-5xl font-black leading-tight">
              Diseñado específicamente para educación superior
            </h2>
            <p className="text-xl text-gray-400 font-medium">
              A diferencia de redes profesionales genéricas, FacultyMatch está estructurado en torno a disciplinas académicas, experiencia docente y requisitos institucionales.
            </p>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="py-24 px-6 lg:px-12 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-8">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-talentia-blue mb-4">
              <Lock size={40} />
            </div>
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-4xl font-black text-navy">Tu perfil, bajo tu control</h2>
              <p className="text-xl text-gray-500 font-medium">
                Los docentes deciden qué instituciones pueden ver su perfil, garantizando privacidad y seguridad profesional total.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section — elegant with image */}
        <section className="py-24 px-6 lg:px-12 bg-[#F8FAFC]">
          <div className="max-w-6xl mx-auto">
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-900/20 min-h-[420px] flex items-center">
              {/* Background image */}
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1800"
                  alt="Docentes colaborando"
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-navy/80"></div>
              </div>
              {/* Content */}
              <div className="relative z-10 w-full px-10 py-16 lg:px-20 flex flex-col lg:flex-row items-center justify-between gap-10">
                <div className="space-y-4 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-tech-cyan text-xs font-black uppercase tracking-widest">
                    <GraduationCap size={14} /> Únete a FacultyMatch
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                    Tu próxima oportunidad académica te está esperando.
                  </h2>
                  <p className="text-lg text-white/70 font-medium">
                    Crea tu perfil en minutos y empieza a recibir ofertas de universidades de todo el mundo.
                  </p>
                </div>
                <div className="flex flex-col gap-4 min-w-[240px]">
                  <Link href="/signup/faculty">
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
