// Traduce el estado de visibilidad de un perfil docente a algo legible en
// /control, distinguiendo POR QUÉ está en privado:
//   - 'faculty' : el propio docente lo eligió en /app/faculty/privacy
//   - 'admin'   : un admin lo ocultó desde /control (hideFaculty)
//   - null      : sin registro — viene del sistema antiguo o nunca se tocó
//                 desde que existe este rastro (migración 20260910000002)

export interface VisibilityRow {
  visibility?: string | null;
  visibility_source?: string | null;
  visibility_updated_at?: string | null;
}

export interface VisibilityInfo {
  hidden: boolean;
  /** etiqueta corta para un badge */
  label: string;
  /** frase de contexto para la ficha (fecha, origen), o null */
  detail: string | null;
  /** 'neutral' | 'faculty' | 'admin' | 'legacy' — para colorear si se quiere */
  kind: "visible" | "faculty" | "admin" | "legacy";
}

function fmt(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

export function describeVisibility(fp: VisibilityRow): VisibilityInfo {
  const isPrivate = (fp.visibility || "public") === "private";
  if (!isPrivate) {
    return { hidden: false, label: "Visible", detail: null, kind: "visible" };
  }

  const when = fmt(fp.visibility_updated_at);

  if (fp.visibility_source === "faculty") {
    return {
      hidden: true,
      label: "Privado · lo eligió el docente",
      detail: when ? `El docente lo puso en privado el ${when}.` : "Decisión del propio docente.",
      kind: "faculty",
    };
  }
  if (fp.visibility_source === "admin") {
    return {
      hidden: true,
      label: "Oculto por un admin",
      detail: when ? `Ocultado desde el panel el ${when}.` : "Ocultado por un administrador.",
      kind: "admin",
    };
  }
  return {
    hidden: true,
    label: "Privado · por defecto",
    detail: "Sin registro — herencia del sistema antiguo. Nadie lo decidió explícitamente.",
    kind: "legacy",
  };
}
