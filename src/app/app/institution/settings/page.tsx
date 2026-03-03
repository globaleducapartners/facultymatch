import { ComingSoon } from "@/components/ComingSoon";

export default function InstitutionSettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-navy">Ajustes</h1>
        <p className="text-gray-500 font-medium">Configuración general de tu cuenta institucional.</p>
      </div>
      <ComingSoon 
        title="Ajustes en desarrollo" 
        backHref="/app/institution" 
        backLabel="Volver al panel" 
      />
    </div>
  );
}
