import { redirect } from "next/navigation";

// Página duplicada del formulario de /app/institution (ya con su propia
// lógica de re-revisión al editar y aviso de cuenta bloqueada) — esta
// versión se había quedado desactualizada. Se mantiene como redirect por
// si hay enlaces guardados apuntando aquí.
export default function InstitutionProfileRedirect() {
  redirect("/app/institution");
}
