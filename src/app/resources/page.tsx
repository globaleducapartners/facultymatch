import Link from "next/link";
import Image from "next/image";
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
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { NewsletterForm } from "@/components/NewsletterForm";
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
    readTime: "8 min",
    href: "/resources/claustro-docente"
  },
  { 
    title: "Estándares de verificación FacultyMatch", 
    desc: "Conoce en detalle los criterios y el proceso de auditoría que aplicamos para validar credenciales académicas, títulos de doctorado y experiencia profesional verificada.",
    icon: ShieldCheck,
    tag: "Calidad",
    readTime: "5 min",
    href: "/resources/estandares-verificacion"
  },
  { 
    title: "El futuro de la docencia online y microcredenciales", 
    desc: "Análisis de las tendencias pedagógicas en entornos virtuales y cómo los docentes expertos pueden posicionarse en el mercado de las microcredenciales internacionales.",
    icon: GraduationCap,
    tag: "Tendencias",
    readTime: "12 min",
    href: "/resources/docencia-online-microcredenciales"
  },
  { 
    title: "Guía: Optimiza tu Perfil Docente en FacultyMatch", 
    desc: "Mejores prácticas para destacar tu trayectoria académica. Cómo estructurar tus áreas de conocimiento y subir evidencias que generen confianza en las universidades.",
    icon: FileText,
    tag: "Docentes",
    readTime: "6 min",
    href: "/resources/optimiza-perfil-docente"
  },
  { 
    title: "Taxonomía Académica Global", 
    desc: "Descubre cómo clasificamos las disciplinas y sub-áreas siguiendo los estándares internacionales. Una herramienta clave para el matching preciso entre oferta y demanda.",
    icon: BookOpen,
    tag: "Estructura",
    readTime: "10 min",
    href: "/resources/taxonomia-academica"
  },
  { 
    title: "Estrategias de Reclutamiento en 90 días", 
    desc: "Plan de acción para directores académicos: desde la identificación de necesidades hasta la firma de la colaboración docente mediante nuestra infraestructura conectada.",
    icon: Lightbulb,
    tag: "Gestión",
    readTime: "15 min",
    href: "/resources/reclutamiento-90-dias"
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
              <Link key={idx} href={res.href} className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col relative overflow-hidden cursor-pointer">
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
                <span className="inline-flex items-center gap-2 text-talentia-blue font-black text-xs uppercase tracking-widest hover:gap-3 transition-all">
                  Leer artículo <ArrowRight size={16} />
                </span>
              </Link>
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
            <Button asChild className="bg-navy hover:bg-slate-800 text-white font-bold h-14 px-8 rounded-xl shadow-lg">
              <a href="mailto:support@facultymatch.app">Contacta con nosotros</a>
            </Button>
          </div>
              <div className="relative">
                <div className="aspect-[4/3] bg-gray-50 rounded-[2.5rem] overflow-hidden relative">
                    <Image
                        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop"
                        alt="Knowledge Center"
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                    />
                </div>

            <div className="absolute -bottom-6 -right-6 bg-energy-orange p-8 rounded-3xl text-white shadow-xl max-w-[240px]">
                <p className="text-sm font-black uppercase tracking-widest mb-2 opacity-80">Próximo Webinar</p>
                <p className="font-bold leading-tight">Reclutamiento de perfiles Tech en Educación Superior</p>
            </div>
          </div>
        </section>

        {/* Newsletter / CTA */}
        <section className="relative rounded-[4rem] overflow-hidden shadow-2xl shadow-blue-900/20 min-h-[500px] flex items-center">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1800"
              alt="Biblioteca universitaria"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-navy/88"></div>
          </div>
          <div className="relative z-10 w-full px-10 py-20 lg:px-24 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-tech-cyan text-xs font-black uppercase tracking-widest">
                <BookOpen size={14} /> FacultyMatch Monthly
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                El reporte mensual de la educación superior global.
              </h2>
              <p className="text-lg text-white/70 font-medium leading-relaxed">
                Tendencias de reclutamiento, cambios regulatorios, nuevas oportunidades docentes y análisis del mercado académico internacional. Directo a tu correo, una vez al mes.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-black uppercase tracking-widest text-white/50">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Cero spam</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Cancelable siempre</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Solo lo relevante</span>
              </div>
            </div>
            <div className="space-y-4">
              <NewsletterForm />
              <p className="text-center text-xs font-bold text-white/30 uppercase tracking-widest">Más de 8.000 académicos ya suscritos</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

