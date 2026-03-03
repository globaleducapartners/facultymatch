import { ComingSoon } from "@/components/ComingSoon";

export default function InstitutionProfilePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-navy">Perfil de Institución</h1>
        <p className="text-gray-500 font-medium">Gestiona la información de tu institución.</p>
      </div>
      <ComingSoon 
        title="Perfil institucional en desarrollo" 
        backHref="/app/institution" 
        backLabel="Volver al panel" 
      />
    </div>
  );
}
