import type { Metadata } from "next";
import FacultyClient from "./FacultyClient";

export const metadata: Metadata = {
  title: "Para docentes y expertos | FacultyMatch",
  description:
    "Publica tu perfil en el directorio de FacultyMatch. Las instituciones educativas te encuentran cuando buscan tu área. Tú decides si respondes.",
  keywords:
    "perfil docente, experto universitario, dar clases universidad, docencia, investigador",
};

export default function FacultyPage() {
  return <FacultyClient />;
}
