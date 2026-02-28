import Link from "next/link";
import { 
  Globe, 
  ArrowRight, 
  ShieldCheck, 
  GraduationCap, 
  Building2, 
  BookOpen, 
  CheckCircle2, 
  FileText, 
  Users, 
  Lightbulb,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recursos Académicos | FacultyMatch - Elevando el Estándar de Educación Superior",
  description: "Guías, estándares y mejores prácticas para el reclutamiento docente y el desarrollo de carrera académica en el entorno global.",
  keywords: "recursos académicos, guías docentes, reclutamiento universitario, estándares académicos, educación superior",
};

const resources = [
  { 
    title: "Cómo construir un claustro docente de alto impacto", 
    desc: "Guía práctica para instituciones sobre selección, diversificación y fidelización de talento académico global. Aprende a equilibrar perfiles investigadores con expertos profesionales.",
    icon: Building2,
    tag: "Instituciones",
    readTime: "8 min"
  },
  { 
    title: "Estándares de verificación Talentia", 
    desc: "Conoce en detalle los criterios y el proceso de auditoría que aplicamos para validar credenciales académicas, títulos de doctorado y experiencia profesional verificada.",
    icon: ShieldCheck,
    tag: "Calidad",
    readTime: "5 min"
  },
  { 
    title: "El futuro de la docencia online y microcredenciales", 
    desc: "Análisis de las tendencias pedagógicas en entornos virtuales y cómo los docentes expertos pueden posicionarse en el mercado de las microcredenciales internacionales.",
    icon: GraduationCap,
    tag: "Tendencias",
    readTime: "12 min"
  },
  { 
    title: "Guía: Optimiza tu Perfil Docente en Talentia", 
    desc: "Mejores prácticas para destacar tu trayectoria académica. Cómo estructurar tus áreas de conocimiento y subir evidencias que generen confianza en las universidades.",
    icon: FileText,
    tag: "Docentes",
    readTime: "6 min"
  },
  { 
    title: "Taxonomía Académica Global", 
    desc: "Descubre cómo clasificamos las disciplinas y sub-áreas siguiendo los estándares internacionales. Una herramienta clave para el matching preciso entre oferta y demanda.",
    icon: BookOpen,
    tag: "Estructura",
    readTime: "10 min"
  },
  { 
    title: "Estrategias de Reclutamiento en 90 días", 
    desc: "Plan de acción para directores académicos: desde la identificación de necesidades hasta la firma de la colaboración docente mediante nuestra infraestructura conectada.",
    icon: Lightbulb,
    tag: "Gestión",
    readTime: "15 min"
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24 space-y-24">
        {/* Hero */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-talentia-blue text-xs font-black uppercase tracking-widest">
            <BookOpen size={14} /> Knowledge Center
          </div>
          <h1 className="text-4xl lg:text-7xl font-black text-navy tracking-tight leading-tight">
            Recursos y <span className="text-talentia-blue">Conocimiento</span>
          </h1>
          <p className="text-xl text-gray-500 font-medium leading-relaxed">
            Nuestra misión es elevar los estándares de la educación superior mediante la difusión de mejores prácticas en gestión del talento académico.
          </p>
          <div className="relative max-w-lg mx-auto pt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar guías, artículos o estándares..." 
              className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-talentia-blue outline-none transition-all font-medium"
            />
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((res, idx) => (
            <div key={idx} className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[4rem] -z-10 transition-colors group-hover:bg-blue-50/50"></div>
              <div className="bg-white shadow-lg shadow-blue-900/5 text-talentia-blue w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-gray-50 group-hover:scale-110 transition-transform">
                <res.icon size={28} strokeWidth={1.5} />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-tech-cyan bg-blue-50 px-3 py-1 rounded-full">
                  {res.tag}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Globe size={10} /> {res.readTime} lectura
                </span>
              </div>
              <h3 className="text-2xl font-black text-navy mb-4 leading-tight group-hover:text-talentia-blue transition-colors">
                {res.title}
              </h3>
              <p className="text-gray-500 font-medium leading-relaxed mb-8 flex-1">
                {res.desc}
              </p>
              <Link href="#" className="inline-flex items-center gap-2 text-talentia-blue font-black text-xs uppercase tracking-widest hover:gap-3 transition-all">
                Explorar recurso <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        {/* Featured Content */}
        <section className="bg-white rounded-[3.5rem] p-12 lg:p-20 border border-gray-100 shadow-sm grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-black text-navy leading-tight">
              Diseñamos la infraestructura del conocimiento conectado.
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-green-50 text-green-600 p-2 rounded-lg h-fit">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-navy">Estándar Universitario</h4>
                  <p className="text-sm text-gray-500 font-medium">Contenido alineado con los requisitos de las agencias de calidad internacional.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-talentia-blue text-white p-2 rounded-lg h-fit">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-navy">Red de Colaboradores</h4>
                  <p className="text-sm text-gray-500 font-medium">Artículos escritos por decanos y directores de programa en activo.</p>
                </div>
              </div>
            </div>
            <Button className="bg-navy hover:bg-slate-800 text-white font-bold h-14 px-8 rounded-xl shadow-lg">
              Saber más sobre nosotros
            </Button>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] bg-gray-50 rounded-[2.5rem] overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop" 
                    alt="Knowledge Center" 
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-energy-orange p-8 rounded-3xl text-white shadow-xl max-w-[240px]">
                <p className="text-sm font-black uppercase tracking-widest mb-2 opacity-80">Próximo Webinar</p>
                <p className="font-bold leading-tight">Reclutamiento de perfiles Tech en Educación Superior</p>
            </div>
          </div>
        </section>

        {/* Newsletter / CTA */}
        <section className="bg-talentia-blue rounded-[4rem] p-12 lg:p-24 text-center text-white space-y-8 relative overflow-hidden shadow-2xl shadow-blue-900/20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-tech-cyan/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
          
          <div className="relative z-10 space-y-10 max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight">
              Recibe el Reporte <span className="text-tech-cyan">Talentia Monthly.</span>
            </h2>
            <p className="text-xl text-white/80 font-medium max-w-2xl mx-auto">
              Únete a más de 10,000 académicos e instituciones suscritos a las últimas tendencias en educación superior global.
            </p>
            <form className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto bg-white/10 p-2 rounded-[2.5rem] backdrop-blur-md border border-white/20">
              <input 
                type="email" 
                placeholder="tu@email-universitario.edu" 
                className="w-full px-8 py-4 rounded-[2rem] bg-transparent text-white placeholder:text-white/50 focus:outline-none font-bold"
              />
              <Button className="w-full sm:w-auto bg-white text-talentia-blue hover:bg-gray-100 font-black h-14 px-10 rounded-[2rem] text-lg transition-all shadow-xl">
                Suscribirme
              </Button>
            </form>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">
              Sin spam. Solo conocimiento de alto impacto académico.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

