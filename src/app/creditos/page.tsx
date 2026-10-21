import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { IMAGES } from "@/lib/images";

export const metadata: Metadata = {
  title: "Créditos de las imágenes | FacultyMatch",
  description:
    "Autoría y licencia de las fotografías que ilustran FacultyMatch, el directorio de docentes y expertos verificados para educación.",
  alternates: { canonical: "/creditos" },
};

export default function CreditosPage() {
  const items = Object.values(IMAGES);
  return (
    <div className="bg-white font-sans">
      <Navbar />
      <main className="mx-auto max-w-[1000px] px-6 py-16 md:px-8 md:py-24">
        <h1 className="mb-3 text-balance text-[1.9rem] font-extrabold leading-[1.1] tracking-[-0.035em] text-fm-ink md:text-4xl">
          Créditos de las imágenes
        </h1>
        <p className="mb-12 max-w-[60ch] text-base leading-[1.7] text-[#5B6B85]">
          Las fotografías de FacultyMatch pertenecen a sus autores y se usan bajo las licencias de Pexels, Unsplash y
          Pixabay. Gracias a quienes las hacen posibles.
        </p>
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
          {items.map((img) => (
            <li key={img.src}>
              <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-fm-surface">
                <Image
                  src={img.src}
                  alt={img.alt}
                  title={img.title}
                  fill
                  sizes="(min-width: 768px) 300px, (min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
              <p className="text-sm font-bold text-fm-ink">{img.author}</p>
              <p className="text-[13px] text-[#5B6B85]">
                <a href={img.url} target="_blank" rel="noopener noreferrer" className="hover:text-fm-blue hover:underline">
                  {img.source} · {img.license}
                </a>
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-14 text-sm text-[#5B6B85]">
          ¿Eres autor/a de alguna imagen y quieres que modifiquemos el crédito? Escribe a{" "}
          <a href="mailto:support@facultymatch.app" className="font-semibold text-fm-blue hover:underline">
            support@facultymatch.app
          </a>
          . <Link href="/" className="font-semibold text-fm-blue hover:underline">Volver al inicio</Link>
        </p>
      </main>
    </div>
  );
}
