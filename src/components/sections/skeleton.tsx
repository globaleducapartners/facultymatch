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

// ─── Pasos: tres tarjetas centradas, cada una con una viñeta del producto ──
export type StepVisual = "publish" | "search" | "decide" | "register" | "filters" | "contact";

const Line = ({ w, dark }: { w: string; dark?: boolean }) => (
  <span className={`block h-1.5 rounded ${dark ? "bg-[#C9D5EC]" : "bg-[#E4E9F3]"}`} style={{ width: w }} />
);
const Dot = () => <span className="h-5 w-5 shrink-0 rounded-full bg-fm-blue" />;
const MiniBtn = ({ children, solid = true }: { children: React.ReactNode; solid?: boolean }) => (
  <span className={`inline-flex h-6 items-center rounded-md px-2.5 text-[10px] font-bold ${solid ? "bg-fm-blue text-white" : "border border-[#E1E7F5] text-[#4B5A7A]"}`}>{children}</span>
);

function StepVisualArt({ kind }: { kind: StepVisual }) {
  const card = "w-full max-w-[236px] rounded-xl border border-[#E1E7F5] bg-white p-3 text-left shadow-[0_14px_28px_-18px_rgba(13,34,64,0.35)]";
  switch (kind) {
    case "publish":
      return (
        <div className={card}>
          <div className="mb-2.5 flex items-center gap-2.5">
            <Dot />
            <div className="flex-1 space-y-1.5"><Line w="70%" dark /><Line w="45%" /></div>
            <span className="rounded-[5px] bg-fm-gold/15 px-1.5 py-0.5 text-[9px] font-bold text-[#B77A1B]">Verificado</span>
          </div>
          {["Titulación", "Trayectoria"].map((t) => (
            <div key={t} className="mb-1.5 flex items-center gap-2 text-[10.5px] font-semibold text-fm-ink">
              <CheckIcon size={12} /> {t}
            </div>
          ))}
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#EEF1F8]"><i className="block h-full w-[88%] rounded-full bg-fm-blue" /></div>
        </div>
      );
    case "search":
      return (
        <div className={card}>
          <div className="mb-2 flex h-7 items-center gap-1.5 rounded-lg border border-[#E1E7F5] bg-[#F7F9FD] px-2 text-[10px] text-[#5E6F8E]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" /></svg>
            Marketing estratégico…
          </div>
          <div className="mb-2.5 flex gap-1.5">
            {["Área", "Idioma", "Disponible"].map((c) => (
              <span key={c} className="rounded-md border border-[#E1E7F5] px-1.5 py-0.5 text-[9.5px] font-semibold text-[#4B5A7A]">{c}</span>
            ))}
          </div>
          <div className="flex items-center gap-2.5 rounded-lg border border-[#E1E7F5] p-2">
            <Dot />
            <div className="flex-1 space-y-1.5"><Line w="65%" dark /><Line w="40%" /></div>
            <span className="flex items-center gap-1 text-[9.5px] font-bold text-[#1F9D5A]"><i className="h-1.5 w-1.5 rounded-full bg-[#1F9D5A]" />Disponible</span>
          </div>
        </div>
      );
    case "decide":
      return (
        <div className={card}>
          <div className="mb-2 flex items-center gap-2">
            <Dot /><span className="text-[10.5px] font-bold text-fm-ink">Nueva propuesta</span>
          </div>
          <div className="mb-3 space-y-1.5"><Line w="100%" /><Line w="82%" /><Line w="55%" /></div>
          <div className="flex gap-2"><MiniBtn>Aceptar</MiniBtn><MiniBtn solid={false}>Rechazar</MiniBtn></div>
        </div>
      );
    case "register":
      return (
        <div className={card}>
          {["Institución", "Correo corporativo"].map((f) => (
            <div key={f} className="mb-2 h-7 rounded-lg border border-[#E1E7F5] bg-[#F7F9FD] px-2 text-[10px] leading-7 text-[#8A97B1]">{f}</div>
          ))}
          <div className="mt-1 flex h-7 items-center justify-center rounded-lg bg-fm-blue text-[10px] font-bold text-white">Acceder al directorio</div>
        </div>
      );
    case "filters":
      return (
        <div className={card}>
          {["Área de conocimiento", "Acreditación", "Idioma"].map((f, i) => (
            <div key={f} className="mb-1.5 flex items-center gap-2 text-[10.5px] font-semibold text-fm-ink">
              <span className={`flex h-3.5 w-3.5 items-center justify-center rounded ${i < 2 ? "bg-fm-blue" : "border border-[#C9D5EC]"}`}>
                {i < 2 && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
              </span>
              {f}
            </div>
          ))}
          <div className="mt-2.5 border-t border-[#EEF1F8] pt-2 text-[10px] font-bold text-fm-blue">Docentes que encajan con tu programa</div>
        </div>
      );
    case "contact":
      return (
        <div className={card}>
          <div className="mb-2.5 flex items-center gap-2.5">
            <Dot />
            <div className="flex-1 space-y-1.5"><Line w="60%" dark /><Line w="38%" /></div>
          </div>
          <div className="mb-2.5 space-y-1.5"><Line w="100%" /><Line w="70%" /></div>
          <div className="flex items-center justify-between"><MiniBtn>Enviar solicitud</MiniBtn><span className="text-[9.5px] font-semibold text-[#5E6F8E]">Sin comisiones</span></div>
        </div>
      );
  }
}

export function SectionSteps({
  title, subtitle, steps,
}: {
  title: string;
  subtitle?: string;
  steps: { title: string; body: string; visual?: StepVisual }[];
}) {
  return (
    <section className="bg-white px-6 pb-14 pt-16 md:px-8 md:pb-16 md:pt-[104px]">
      <div className="mx-auto max-w-[1180px]">
        <div className="mx-auto mb-12 max-w-[640px] text-center md:mb-14">
          <h2 className="mb-3.5 text-balance text-[1.7rem] font-extrabold leading-[1.15] tracking-[-0.035em] text-fm-ink md:text-[clamp(1.7rem,3.4vw,2.5rem)]">
            {title}
          </h2>
          {subtitle && <p className="text-base text-[#5B6B85]">{subtitle}</p>}
        </div>

        <ol className="mx-auto grid max-w-[1040px] gap-5 md:grid-cols-3 md:gap-7">
          {steps.map((s, i) => (
            <li key={s.title} className="relative flex flex-col items-center rounded-[20px] border border-fm-border bg-white px-6 pb-8 pt-6 text-center shadow-[0_18px_40px_-28px_rgba(13,34,64,0.25)]">
              {s.visual && (
                <div aria-hidden className="mb-6 flex h-[172px] w-full items-center justify-center rounded-[14px] bg-[#DCE8FB] px-4">
                  <StepVisualArt kind={s.visual} />
                </div>
              )}
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-fm-blue text-xl font-extrabold leading-none text-white [font-variant-numeric:tabular-nums]">
                {i + 1}
              </span>
              <h3 className="mb-2 text-xl font-bold tracking-[-0.02em] text-fm-ink">{s.title}</h3>
              <p className="max-w-[34ch] text-[15px] leading-[1.7] text-[#5B6B85]">{s.body}</p>
              {i < steps.length - 1 && (
                <span aria-hidden className="absolute -right-[22px] top-[104px] z-10 hidden h-9 w-9 items-center justify-center rounded-full border border-fm-border bg-white shadow-sm md:flex">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>
                </span>
              )}
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
