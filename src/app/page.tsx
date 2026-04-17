// src/app/page.tsx  ← reemplaza el archivo completo
import type { Metadata } from "next";
import LandingClient from "./LandingClient";

export const metadata: Metadata = {
  title: "FacultyMatch | Directorio de talento para la educación superior",
  description:
    "El directorio de docentes, investigadores y expertos para instituciones educativas. Perfiles revisados. Contacto directo. Sin intermediarios.",
  keywords:
    "directorio docentes, talento académico, educación superior, expertos universidad, docentes verificados",
  openGraph: {
    title: "FacultyMatch | Directorio de talento para la educación superior",
    description:
      "Docentes, investigadores y expertos conectados con instituciones que saben lo que buscan.",
    images: ["/icon-512.png"],
  },
};

export default function HomePage() {
  return <LandingClient />;
}
