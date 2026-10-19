// Esqueleto común de las páginas públicas (home, instituciones, docentes,
// recursos): pasos con numerales, filas alternas con panel pastel y franja
// oscura. Sin etiquetas ni píldoras; la identidad (tokens fm-*) no cambia.
import Link from "next/link";

export function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// ─── Pasos con numerales grandes ───────────────────────────────────────────
export function SectionSteps({
  title, subtitle, steps,
}: {
  title: string;
  subtitle?: string;
  steps: { title: string; body: string }[];
}) {
  return (
    <section className="bg-white px-6 pb-14 pt-16 md:px-8 md:pb-16 md:pt-[104px]">
      <div className="mx-auto max-w-[1180px]">
        <div className="mx-auto mb-12 max-w-[640px] text-center md:mb-16">
          <h2 className="mb-3.5 text-balance text-[1.7rem] font-extrabold leading-[1.15] tracking-[-0.035em] text-fm-ink md:text-[clamp(1.7rem,3.4vw,2.5rem)]">
            {title}
          </h2>
          {subtitle && <p className="text-base text-[#5B6B85]">{subtitle}</p>}
        </div>

        <ol className="grid gap-10 md:grid-cols-3 md:gap-14">
          {steps.map((s, i) => (
            <li key={s.title}>
              <div className="flex items-center gap-[18px]">
                <span className="text-[76px] font-extrabold leading-[0.85] tracking-[-0.05em] text-fm-blue [font-variant-numeric:tabular-nums] md:text-[104px]">
                  {i + 1}
                </span>
                {i < steps.length - 1 && (
                  <span aria-hidden className="hidden h-0 flex-1 border-t-2 border-dotted border-[#9DB8FF] md:block" />
                )}
              </div>
              <h3 className="mb-2 mt-5 text-xl font-bold tracking-[-0.02em] text-fm-ink">{s.title}</h3>
              <p className="max-w-[34ch] text-[15px] leading-[1.7] text-[#5B6B85]">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ─── Fila: texto + panel pastel ────────────────────────────────────────────
export function Row({
  flip, title, body, bullets, href, cta, children,
}: {
  flip?: boolean;
  title: string;
  body?: React.ReactNode;
  bullets?: React.ReactNode[];
  href?: string;
  cta?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-8 md:grid-cols-2 md:gap-20">
      <div>
        <h2 className="mb-4 text-balance text-[1.6rem] font-extrabold leading-[1.12] tracking-[-0.035em] text-fm-ink md:text-[clamp(1.6rem,3vw,2.3rem)]">
          {title}
        </h2>
        {body && <div className="max-w-[46ch] text-base leading-[1.7] text-[#5B6B85]">{body}</div>}
        {bullets && (
          <ul className="mt-6 grid gap-3">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-3 text-[15px] font-medium text-fm-ink">
                <span className="mt-[3px]"><CheckIcon /></span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
        {href && cta && (
          <Link href={href} className="mt-7 inline-block text-sm font-bold text-fm-blue hover:underline">
            {cta}
          </Link>
        )}
      </div>
      <div className={`min-w-0 rounded-[20px] bg-[#DCE8FB] p-4 sm:p-8 ${flip ? "md:order-first" : ""}`}>{children}</div>
    </div>
  );
}

export function SectionRows({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-fm-surface px-6 py-16 md:px-8 md:py-[104px]">
      <div className="mx-auto grid max-w-[1180px] gap-[72px] md:gap-28">{children}</div>
    </section>
  );
}

// ─── Franja oscura con tarjeta clara y círculos decorativos ────────────────
export function DarkBand({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-fm-navy px-6 py-16 md:px-8 md:py-24">
      <span aria-hidden className="absolute -left-12 top-12 hidden h-[190px] w-[190px] rounded-full border-[3px] border-white/35 sm:block" />
      <span aria-hidden className="absolute -bottom-[70px] left-8 hidden h-[190px] w-[190px] rounded-full bg-[#FF6A1A] sm:block" />
      <span aria-hidden className="absolute -right-8 -top-10 hidden h-[150px] w-[150px] rounded-full border-[3px] border-white/35 sm:block" />
      <span aria-hidden className="absolute -bottom-[60px] right-14 hidden h-[150px] w-[150px] rounded-full bg-[#9DB8FF] sm:block" />
      <div className="relative mx-auto max-w-[900px] rounded-[20px] bg-[#EEF2F9] px-5 py-10 text-center md:px-12 md:py-14">
        {children}
      </div>
    </section>
  );
}
