// src/app/signup/institution/page.tsx  ← reemplaza el archivo completo
import { redirect } from "next/navigation";

export default function SignupInstitutionRedirect() {
  redirect("/signup?intent=institution");
}
