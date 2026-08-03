export type PlanConfig = {
  name: string;
  badge: string;
  description: string;
  price: string;
  period: string;
  promo?: string;
  features: string[];
  backHref: string;
};

export const PLANS: Record<string, PlanConfig> = {
  "faculty-pro": {
    name: "Plan Professional Docente",
    badge: "Para Docentes · Recomendado",
    description: "Visibilidad prioritaria, control de privacidad avanzado y acceso a todas las oportunidades.",
    price: "29€",
    period: "/ año",
    features: [
      "Todo lo del plan Basic (incluye bloqueo de instituciones)",
      "Posicionamiento prioritario en búsquedas",
      "Estadísticas avanzadas de visitas a tu perfil",
      "Visibilidad preferente ante instituciones objetivo",
      "Soporte por email prioritario",
    ],
    backHref: "/faculty",
  },
  "institution-growth": {
    name: "Plan Growth Institución",
    badge: "Para Instituciones · Más popular",
    description: "Búsquedas y contactos ampliados, filtros avanzados y favoritos.",
    price: "35€",
    period: "/ mes",
    features: [
      "20 búsquedas al mes",
      "20 contactos al mes",
      "Filtros avanzados",
      "Favoritos",
      "Soporte por email",
    ],
    backHref: "/institutions",
  },
  "institution-pro": {
    name: "Plan Professional Institución",
    badge: "Para Instituciones",
    description: "Búsquedas ilimitadas, acceso completo al directorio y soporte dedicado.",
    price: "99€",
    period: "/ mes",
    features: [
      "Búsquedas ilimitadas de docentes",
      "Filtros avanzados por área y credenciales",
      "Contacto directo con docentes verificados",
      "Acceso a informes de mercado",
      "Soporte prioritario",
    ],
    backHref: "/institutions",
  },
};
