import { ComingSoon } from "@/components/ComingSoon";

export default function ShortlistsPage() {
  return (
    <div className="space-y-8 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-fm-navy">Shortlists</h1>
        <p className="text-gray-500 font-medium">Gestiona tus listas de docentes seleccionados.</p>
      </div>
      <ComingSoon 
        title="Shortlists en camino" 
        backHref="/app/institution" 
        backLabel="Volver al buscador" 
      />
    </div>
  );
}
