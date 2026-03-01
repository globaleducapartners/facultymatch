import Link from "next/link";
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
  Target
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
            <div className="space-y-8">
              <div className="space-y-4">
                  <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-navy leading-[1.1]">
                    La red global de <span className="text-talentia-blue">talento académico.</span>
                  </h1>
                  <p className="text-xl text-gray-500 font-medium max-w-lg leading-relaxed">
                    Conecta universidades y docentes a través de perfiles verificados y experiencia real. **Construye tus titulaciones en pocos minutos** y asegura la máxima calidad institucional.
                  </p>
                </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link href="/signup?role=faculty" className="w-full sm:w-auto bg-energy-orange text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-100 group">
                      Eleva tu carrera académica
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="/signup?role=institution" className="w-full sm:w-auto bg-white border border-gray-200 text-navy px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                      Registrar mi centro
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-tech-cyan">
                      <CheckCircle2 size={16} />
                      Acreditación ANECA / Calidad
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-tech-cyan">
                      <ShieldCheck size={16} />
                      Perfiles verificados
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-tech-cyan">
                      <Globe size={16} />
                      Investigación & ORCID
                    </div>
                  </div>


            </div>

            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 transform rotate-[-2deg]">
                    <div className="aspect-[4/5] bg-gray-50 rounded-xl mb-3 overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" alt="Educador Verificado" className="w-full h-full object-cover block" />
                    </div>
                    <div className="space-y-1 px-1">
                      <p className="text-sm font-bold text-navy">Maria González</p>
                      <p className="text-[10px] font-medium text-gray-500">PhD · Economía · Online</p>
                      <div className="flex items-center gap-1 text-[8px] font-bold text-tech-cyan uppercase bg-blue-50 px-2 py-0.5 rounded-full w-fit mt-1">
                        <CheckCircle2 size={10} /> Verificado
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 transform rotate-[3deg]">
                    <div className="aspect-[4/5] bg-gray-50 rounded-xl mb-3 overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800" alt="Profesor Académico" className="w-full h-full object-cover block" />
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

          {/* Institutional Trust Section */}
          <section className="py-24 px-6 lg:px-12 bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-black text-navy uppercase tracking-tighter">Confianza de Grado Universitario</h2>
                <p className="text-lg text-gray-500 font-medium max-w-2xl">FacultyMatch cumple con los estándares internacionales de verificación académica.</p>
              </div>
              <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
                <div className="flex items-center gap-2">
                  <School size={32} />
                  <span className="text-xl font-bold">QS Top Universities</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap size={32} />
                  <span className="text-xl font-bold">Academic Ranking</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={32} />
                  <span className="text-xl font-bold">Verified Institution</span>
                </div>
              </div>
            </div>
          </section>

          {/* Categories Section */}
        <section className="bg-white py-24 px-6 lg:px-12 border-y border-gray-50">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl lg:text-4xl font-black text-navy">Explora por Áreas de Conocimiento</h2>
              <div className="w-24 h-1.5 bg-talentia-blue mx-auto rounded-full opacity-20"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {[
                { name: "Business & Management", icon: Briefcase, color: "bg-navy" },
                { name: "Ingeniería & Tech", icon: Cpu, color: "bg-tech-cyan" },
                { name: "Salud & Ciencias", icon: HeartPulse, color: "bg-talentia-blue" },
                { name: "Derecho & Política", icon: Scale, color: "bg-energy-orange" },
                { name: "Educación", icon: GraduationCap, color: "bg-navy" },
                { name: "Artes & Humanidades", icon: Palette, color: "bg-energy-orange" },
              ].map((cat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.05] transition-all group cursor-pointer">
                  <div className={`${cat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                    <cat.icon size={24} />
                  </div>
                  <h3 className="font-bold text-navy leading-tight">{cat.name}</h3>
                  <div className="mt-4 flex items-center text-talentia-blue group-hover:translate-x-2 transition-transform">
                    <ArrowRight size={18} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

          {/* Process / Infographic Section */}
          <section className="py-24 px-6 lg:px-12 bg-white">
            <div className="max-w-7xl mx-auto space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-3xl lg:text-4xl font-black text-navy uppercase tracking-tighter">Cómo funciona FacultyMatch</h2>
                <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto italic">Estandarizando el talento académico para la educación del futuro.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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

          {/* Features for Educators */}

        <section className="py-24 px-6 lg:px-12 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-talentia-blue text-xs font-black uppercase tracking-widest">
                <UserCircle size={14} /> Para Docentes
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-navy leading-tight">
                Comparte tu conocimiento con instituciones de todo el mundo
              </h2>
              <p className="text-lg text-gray-500 font-medium">
                FacultyMatch permite a profesores, expertos y profesionales ampliar su actividad docente, colaborar con universidades internacionales y generar nuevas oportunidades académicas.
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
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 bg-gray-50">
              <img src="https://images.unsplash.com/photo-1544717297-fa95b33979d7?auto=format&fit=crop&q=80&w=1200" alt="Docente impartiendo clase" className="rounded-3xl w-full h-auto object-cover block" />
            </div>
          </div>
        </section>

        {/* Features for Institutions */}
        <section className="py-24 px-6 lg:px-12 bg-white">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 bg-gray-50">
              <img src="https://images.unsplash.com/photo-1541339907198-e08756eaa589?auto=format&fit=crop&q=80&w=1200" alt="Campus universitario moderno" className="rounded-3xl w-full h-auto object-cover block" />
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

        {/* CTA Section */}
        <section className="py-24 px-6 lg:px-12 bg-[#F8FAFC]">
          <div className="max-w-5xl mx-auto bg-talentia-blue rounded-[3rem] p-12 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-tech-cyan/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
            
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl lg:text-6xl font-black tracking-tight">
                Únete a la red global de profesorado.
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup?role=faculty">
                  <Button className="bg-white text-talentia-blue hover:bg-gray-50 font-black h-16 px-10 rounded-2xl text-lg shadow-xl">
                    Empezar ahora
                  </Button>
                </Link>
                <Link href="/login" className="text-white/80 font-bold hover:text-white transition-colors px-6 py-4">
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

