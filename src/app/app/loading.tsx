// Esqueleto que se ve al instante al cambiar de pantalla dentro de /app: el
// menú y la barra no se mueven y el contenido muestra la forma de lo que viene
// (cabecera, tarjeta de estado, cifras y listas) en lugar de una rueda de carga.
export default function Loading() {
  const bar = "rounded-md bg-[#E6ECF7] motion-safe:animate-pulse";
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="space-y-3">
        <div className={`${bar} h-8 w-56`} />
        <div className={`${bar} h-4 w-80 max-w-full`} />
      </div>

      <div className="space-y-4 rounded-xl border border-fm-border bg-white p-6">
        <div className={`${bar} h-4 w-2/5`} />
        <div className={`${bar} h-3 w-4/5`} />
        <div className={`${bar} h-1.5 w-full`} />
      </div>

      <div className="grid grid-cols-1 divide-y divide-fm-border rounded-xl border border-fm-border bg-white min-[480px]:grid-cols-3 min-[480px]:divide-x min-[480px]:divide-y-0">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3 px-6 py-5">
            <div className={`${bar} h-7 w-14`} />
            <div className={`${bar} h-3 w-24`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-4 rounded-xl border border-fm-border bg-white p-6">
          <div className={`${bar} h-4 w-1/3`} />
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2 border-t border-fm-border pt-4">
              <div className={`${bar} h-3 w-1/2`} />
              <div className={`${bar} h-3 w-4/5`} />
            </div>
          ))}
        </div>
        <div className="space-y-3 rounded-xl border border-fm-border bg-white p-6">
          <div className={`${bar} h-4 w-1/2`} />
          <div className={`${bar} h-3 w-full`} />
          <div className={`${bar} h-3 w-3/4`} />
        </div>
      </div>
    </div>
  );
}
