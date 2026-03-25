import Link from 'next/link';
export default function ControlSettingsPage() {
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-black text-navy mb-2">Configuración</h1>
      <p className="text-gray-500 mb-8">Ajustes del panel de administración.</p>
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-bold text-navy mb-1">Panel de administración</h2>
          <p className="text-sm text-gray-500">Versión 1.0 · FacultyMatch</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-bold text-navy mb-3">Accesos directos</h2>
          <div className="space-y-2">
            <Link href="/control" className="block text-sm text-talentia-blue hover:underline">
              → Volver al panel de verificación
            </Link>
            <Link href="/" className="block text-sm text-talentia-blue hover:underline">
              → Ver la web pública
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
