// Marco del onboarding: panel azul marino con los pasos (numerales de la web)
// y zona de contenido clara. Se pinta a pantalla completa por encima del menú
// de la app, que no aporta nada hasta terminar el onboarding.
import { Logo } from "@/components/ui/Logo";

export function OnboardingShell({
  labels,
  current,
  children,
}: {
  labels: string[];
  /** -1 = antes de empezar; 0-4 = paso actual; >= labels.length = todo hecho */
  current: number;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-fm-surface font-sans md:flex-row">
      {/* Panel de pasos (escritorio) */}
      <aside className="hidden shrink-0 flex-col bg-fm-navy px-8 py-8 text-white md:sticky md:top-0 md:flex md:h-screen md:w-[300px]">
        <div className="pb-9">
          <Logo variant="light" />
        </div>
        <p className="mb-1.5 text-xl font-extrabold leading-tight tracking-[-0.03em]">Crea tu perfil.</p>
        <p className="mb-8 text-sm text-white/65">Unos minutos. Podrás editarlo después.</p>

        <ol>
          {labels.map((label, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li key={label} className="grid grid-cols-[44px_1fr] gap-x-3.5">
                <span
                  className={`text-[34px] font-extrabold leading-none tracking-[-0.04em] [font-variant-numeric:tabular-nums] ${
                    active ? "text-[#9DB8FF]" : done ? "text-white" : "text-white/35"
                  }`}
                >
                  {i + 1}
                </span>
                <span className={`pt-2 text-sm ${active ? "font-bold text-white" : "font-medium text-white/60"}`}>{label}</span>
                {i < labels.length - 1 && (
                  <span
                    aria-hidden
                    className={`ml-2 h-[26px] border-l-2 border-dotted ${done ? "border-[#9DB8FF]" : "border-white/25"}`}
                  />
                )}
              </li>
            );
          })}
        </ol>

        <p className="mt-auto text-xs text-white/55">Tu CV solo se usa para rellenar tu perfil.</p>
      </aside>

      {/* Cabecera compacta (móvil) */}
      <header className="flex items-center justify-between gap-3 border-b border-fm-border bg-white px-5 py-3.5 md:hidden">
        <Logo />
      </header>

      <main className="min-w-0 flex-1 px-5 py-8 md:px-12 md:py-12">
        <div className="mx-auto max-w-[760px]">{children}</div>
      </main>
    </div>
  );
}
