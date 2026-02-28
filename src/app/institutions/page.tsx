import Link from "next/link";
import type { Metadata } from "next";
import { 
  Building2, 
  Globe, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  Zap, 
  Building, 
  Sparkles,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Soluciones para Instituciones | FacultyMatch - La Red Global de Educación Superior",
  description: "Encuentra y conecta con el mejor talento docente global. Perfiles verificados, búsqueda avanzada y gestión de claustros.",
  keywords: "reclutamiento docente, universidades, educación superior, talento académico, búsqueda de profesores",
};

const pricingPlans = [
    {
      name: "Essential",
      price: "0",
      period: "/ mes",
      desc: "Inicia la transformación digital de tu búsqueda de talento.",
      features: [
        "Búsqueda con filtros básicos",
        "Visualización de perfiles",
        "Hasta 3 contactos mensuales",
        "Shortlist (1 lista)",
        "Soporte por email"
      ],
      buttonText: "Registrar mi centro",
      highlight: false
    },

  {
    name: "Professional",
    price: "199",
    period: "/ mes",
    desc: "Para facultades y centros que buscan la máxima agilidad.",
    features: [
      "Filtros avanzados (Doctorado, Idioma, Disponibilidad)",
      "Contactos ilimitados",
      "Shortlists ilimitadas",
      "Perfiles verificados destacados",
      "Gestión de equipo (hasta 3 usuarios)",
      "Soporte prioritario"
    ],
    buttonText: "Elegir Profesional",
    highlight: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "Soluciones a medida para redes universitarias globales.",
    features: [
      "Todo lo de Professional",
      "API de integración con HRIS",
      "Dedicated Account Manager",
      "Personalización de búsqueda IA",
      "Múltiples campus / centros",
      "SLA garantizado"
    ],
    buttonText: "Contactar Ventas",
    highlight: false
  }
];

export default function InstitutionsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 lg:px-12 py-20 lg:py-32 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-orange-50/20 rounded-r-[100px] -z-10"></div>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-energy-orange text-xs font-black uppercase tracking-widest">
                <Building2 size={14} /> Red para Instituciones
              </div>
                <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-navy leading-tight">
                  Construye tu <span className="text-energy-orange">titulación en minutos.</span>
                </h1>
                <p className="text-xl text-gray-500 font-medium max-w-lg leading-relaxed">
                  Completa tus memorias de calidad universitaria y acreditaciones ANECA con el profesorado más cualificado de Europa.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/signup?role=institution">
                    <Button className="w-full sm:w-auto bg-energy-orange hover:bg-orange-600 text-white font-bold h-14 px-10 rounded-xl shadow-xl shadow-orange-100 transition-all text-lg">
                      Registrar mi centro
                    </Button>
                  </Link>
                </div>

              <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-tech-cyan">
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Verificación Real</span>
                <span className="flex items-center gap-1.5"><Search size={14} /> Búsqueda Académica</span>
                <span className="flex items-center gap-1.5"><Zap size={14} /> Contacto Directo</span>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-[3rem] overflow-hidden shadow-2xl shadow-orange-900/10 border-8 border-white bg-gray-100">
                  <img 
                    src="https://images.unsplash.com/photo-1541339907198-e08756eaa589?q=80&w=1200&auto=format&fit=crop" 
                    alt="Infraestructura Universitaria" 
                    className="w-full h-auto object-cover aspect-[4/3] block"
                  />
              </div>
              <div className="absolute -bottom-10 -right-6 bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 max-w-[280px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-100 text-energy-orange p-2.5 rounded-xl">
                    <Award size={24} />
                  </div>
                  <p className="text-sm font-black text-navy leading-tight">Excelencia <br /> Garantizada</p>
                </div>
                <div className="space-y-2">
                  <div className="h-1.5 bg-gray-100 rounded-full w-full overflow-hidden">
                    <div className="h-full bg-energy-orange w-[92%] rounded-full"></div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Satisfacción Institucional</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search First Approach Section */}
        <section className="py-24 px-6 lg:px-12 bg-navy text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-talentia-blue/10 rounded-full blur-3xl"></div>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-8">
              <h2 className="text-4xl lg:text-5xl font-black leading-tight">
                No pierdas tiempo <br /> <span className="text-tech-cyan">buscando a ciegas.</span>
              </h2>
              <p className="text-xl text-gray-400 font-medium">
                Nuestra taxonomía propia categoriza el talento por micro-especialidades, permitiéndote encontrar perfiles en minutos.
              </p>
              <ul className="space-y-4">
                {[
                  "Filtros por idioma y nivel de doctorado",
                  "Disponibilidad horaria y modalidad (Presencial/Online)",
                  "Validación documental de credenciales",
                  "Histórico de colaboraciones y ratings"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 font-bold text-gray-300">
                    <CheckCircle2 size={20} className="text-tech-cyan" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-14 px-8 rounded-xl mt-4">
                <Link href="/directory" className="flex items-center gap-2">Explorar Directorio <ArrowRight size={18} /></Link>
              </Button>
            </div>
            <div className="lg:col-span-7 bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-[3rem] shadow-2xl">
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="flex-1 bg-white/5 rounded-2xl h-14 flex items-center px-6 text-gray-500 border border-white/5">
                            <Search size={20} className="mr-3" /> Buscar: "IA en Educación Superior"
                        </div>
                        <div className="w-32 bg-energy-orange rounded-2xl h-14"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5 animate-pulse">
                                <div className="w-12 h-12 rounded-full bg-white/10 mb-3"></div>
                                <div className="h-4 bg-white/10 rounded w-2/3 mb-2"></div>
                                <div className="h-3 bg-white/5 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 px-6 lg:px-12 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-4xl lg:text-5xl font-black text-navy tracking-tight">Planes diseñados para crecer</h2>
              <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">Desde centros especializados hasta redes universitarias globales.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-start">
              {pricingPlans.map((plan, idx) => (
                <div 
                  key={idx} 
                  className={`bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm transition-all relative ${
                    plan.highlight ? 'ring-4 ring-energy-orange/20 shadow-2xl scale-105 z-10' : 'hover:shadow-xl'
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-energy-orange text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg">
                      Más Popular
                    </div>
                  )}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-navy tracking-tight">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-navy">
                          {plan.price !== 'Custom' && plan.price !== 'Trial' && '$'}
                          {plan.price}
                        </span>
                        <span className="text-gray-400 font-bold">{plan.period}</span>
                      </div>

                    <p className="text-gray-500 font-medium">{plan.desc}</p>
                    <div className="h-px bg-gray-100 w-full"></div>
                    <ul className="space-y-4 pb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm font-bold text-navy">
                          <CheckCircle2 size={18} className="text-tech-cyan flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                        className={`w-full h-14 rounded-2xl font-black text-lg shadow-xl transition-all ${
                            plan.highlight 
                            ? 'bg-energy-orange hover:bg-orange-600 text-white' 
                            : 'bg-white border-2 border-gray-200 text-navy hover:bg-gray-50'
                        }`}
                    >
                      {plan.buttonText}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 lg:px-12 bg-white">
          <div className="max-w-5xl mx-auto bg-talentia-blue rounded-[3.5rem] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight">
                Empieza hoy tu transformación <br /> <span className="text-tech-cyan">hacia el talento global.</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/signup?role=institution">
                  <Button className="bg-white text-talentia-blue hover:bg-gray-50 font-black h-16 px-12 rounded-2xl text-lg shadow-xl hover:scale-105 transition-all">
                    Registrar mi centro
                  </Button>
                </Link>
                <Link href="#" className="text-white/80 font-bold hover:text-white transition-colors">
                  Hablar con un asesor
                </Link>
              </div>
            </div>
          </div>
          </section>
        </main>
      </div>
    );
  }

