import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-fm-surface p-6 text-center">
      <div className="w-full max-w-xl rounded-3xl border border-fm-border bg-white p-10 shadow-[0_8px_40px_rgba(13,34,64,0.06)] md:p-16">
        <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full bg-fm-blue/[0.08] text-fm-blue">
          <Search size={28} />
        </div>
        <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-fm-faint">Error 404</p>
        <h1 className="mb-3 text-3xl font-extrabold tracking-[-0.03em] text-fm-ink md:text-4xl">Página no encontrada</h1>
        <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-fm-muted">
          La página que buscas no existe o ha cambiado de sitio.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-fm-blue px-7 text-sm font-bold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.97] sm:w-auto"
          >
            Ir al inicio
          </Link>
          <Link
            href="/directory"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-fm-border bg-white px-7 text-sm font-bold text-fm-ink transition-all duration-150 hover:border-fm-blue active:scale-[0.97] sm:w-auto"
          >
            Ver el directorio
          </Link>
        </div>
      </div>
    </div>
  );
}
