import type { Metadata } from "next";
import InstitutionsClient from "./InstitutionsClient";

export const metadata: Metadata = {
  title: "Para instituciones educativas | FacultyMatch",
  description:
    "Directorio de docentes, investigadores y expertos para instituciones educativas. Búsqueda por área, idioma y disponibilidad. Contacto directo. Sin comisiones.",
  keywords:
    "buscar docentes, directorio profesores, reclutamiento académico, profesorado universidad, expertos educación superior",
};

export default function InstitutionsPage() {
  return <InstitutionsClient />;
}
