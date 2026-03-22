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
    price: "9,99€",
    period: "/ año (primer año)",
    promo: "Promoción primer año · Después 99€/año",
    features: [
      "Todo lo del plan Basic",
      "Bloqueo de instituciones específicas",
      "Oculto para tu centro actual",
      "Posicionamiento prioritario en búsquedas",
      "Estadísticas de visitas a tu perfil",
    ],
    backHref: "/faculty",
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
