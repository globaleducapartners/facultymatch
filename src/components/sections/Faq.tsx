// Preguntas frecuentes: texto visible + datos estructurados FAQPage. Sin
// estado, así que sirve tanto en páginas de servidor como de cliente.
import { faqJsonLd, type FaqItem } from "@/lib/seo";

export function Faq({ title, items }: { title: string; items: FaqItem[] }) {
  return (
    <section className="bg-fm-surface px-6 py-16 md:px-8 md:py-[88px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(items)) }} />
      <div className="mx-auto max-w-[760px]">
        <h2 className="mb-10 text-balance text-center text-[1.7rem] font-extrabold leading-[1.15] tracking-[-0.035em] text-fm-ink md:text-[clamp(1.7rem,3.4vw,2.3rem)]">
          {title}
        </h2>
        <div className="divide-y divide-fm-border border-y border-fm-border">
          {items.map((it) => (
            <details key={it.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[16px] font-bold tracking-[-0.01em] text-fm-ink [&::-webkit-details-marker]:hidden">
                {it.q}
                <span aria-hidden className="text-xl font-medium text-fm-blue transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-[62ch] text-[15px] leading-[1.7] text-[#5B6B85]">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
