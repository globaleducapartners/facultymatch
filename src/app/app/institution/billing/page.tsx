import { ComingSoon } from "@/components/ComingSoon";

export default function BillingPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-navy">Plan & Facturación</h1>
        <p className="text-gray-500 font-medium">Gestiona tu suscripción y métodos de pago.</p>
      </div>
      <ComingSoon 
        title="Sección de pagos en camino" 
        backHref="/app/institution" 
        backLabel="Volver al panel" 
      />
    </div>
  );
}
