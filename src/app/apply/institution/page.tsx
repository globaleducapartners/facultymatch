import { redirect } from "next/navigation";

// Legacy lead-capture form — now redirects to the proper auth-based signup flow
export default function ApplyInstitutionRedirect() {
  redirect("/signup?intent=institution");
}
