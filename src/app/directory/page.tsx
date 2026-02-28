import Link from "next/link";
import type { Metadata } from "next";
import { Globe, ArrowRight, Book, Briefcase, Cpu, HeartPulse, Scale, GraduationCap, Palette } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Directorio Académico | FacultyMatch",
  description: "Explora nuestra red global de talento docente por áreas de conocimiento y especialidades.",
};

const categories = [
  { 
    name: "Business & Management", 
    icon: Briefcase, 
    subareas: ["Marketing", "Finanzas", "RRHH", "Estrategia", "Emprendimiento"],
    color: "bg-navy"
  },
  { 
    name: "Ingeniería & Tech", 
    icon: Cpu, 
    subareas: ["IA & Data Science", "Software", "Ciberseguridad", "Robótica", "Energía"],
    color: "bg-tech-cyan"
  },
  { 
    name: "Salud & Ciencias", 
    icon: HeartPulse, 
    subareas: ["Medicina", "Enfermería", "Biotecnología", "Psicología", "Farmacia"],
    color: "bg-talentia-blue"
  },
  { 
    name: "Derecho & Política", 
    icon: Scale, 
    subareas: ["Derecho Digital", "Relaciones Internacionales", "Derecho Civil", "Administración Pública"],
    color: "bg-energy-orange"
  },
  { 
    name: "Educación", 
    icon: GraduationCap, 
    subareas: ["Innovación Educativa", "E-learning", "Pedagogía", "Gestión Académica"],
    color: "bg-navy"
  },
  { 
    name: "Artes & Humanidades", 
    icon: Palette, 
    subareas: ["Diseño", "Historia", "Filosofía", "Literatura", "Comunicación"],
    color: "bg-energy-orange"
  },
];

export default function DirectoryPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy text-tech-cyan text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <GraduationCap size={14} /> Categoría Universitario
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-navy tracking-tight">Directorio de Talento Académico</h1>
          <p className="text-xl text-gray-500 font-medium leading-relaxed">
            Explora nuestra infraestructura de conocimiento conectada globalmente con estándares de educación superior.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <Card key={idx} category={cat} />
          ))}
        </div>

        {/* SEO Content Section */}
        <section className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-sm space-y-8">
          <h2 className="text-3xl font-black text-navy">¿Por qué usar el directorio de Talentia?</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-talentia-blue">Acceso a perfiles verificados</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                A diferencia de otras plataformas, Talentia verifica la identidad y las credenciales académicas de cada docente, asegurando la máxima calidad para las instituciones.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-talentia-blue">Estructura académica real</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Nuestra taxonomía está diseñada siguiendo los estándares internacionales de educación superior, facilitando el matching entre necesidades curriculares y expertos.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


function Card({ category }: { category: any }) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group">
      <div className={`${category.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform shadow-lg`}>
        <category.icon size={28} />
      </div>
      <h3 className="text-2xl font-black text-navy mb-6 leading-tight">{category.name}</h3>
      <ul className="space-y-3 mb-8">
        {category.subareas.map((sub: string, i: number) => (
          <li key={i} className="flex items-center gap-3 text-gray-500 font-medium text-sm group/item cursor-pointer hover:text-talentia-blue transition-colors">
            <div className="w-1 h-1 rounded-full bg-gray-200 group-hover/item:bg-talentia-blue group-hover/item:scale-150 transition-all" />
            {sub}
          </li>
        ))}
      </ul>
      <Link href="#" className="inline-flex items-center gap-2 text-talentia-blue font-black text-xs uppercase tracking-widest hover:gap-3 transition-all">
        Explorar área <ArrowRight size={16} />
      </Link>
    </div>
  );
}
