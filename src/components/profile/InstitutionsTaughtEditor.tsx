"use client";

import { useState } from "react";
import { UniversityAutocomplete } from "@/components/ui/UniversityAutocomplete";

interface Props {
  initialInstitutions: string[];
}

export function InstitutionsTaughtEditor({ initialInstitutions }: Props) {
  // Normalize: JSONB may return objects instead of plain strings
  const normalize = (arr: string[]) =>
    (arr ?? [])
      .map((i: any) => (typeof i === "string" ? i : i?.name || i?.university || i?.label || ""))
      .filter(Boolean);
  const [institutions, setInstitutions] = useState<string[]>(normalize(initialInstitutions));

  return (
    <div>
      <input type="hidden" name="institutionsTaught" value={JSON.stringify(institutions)} />
      <UniversityAutocomplete
        value={institutions}
        onChange={setInstitutions}
        placeholder="Busca universidades donde has impartido clases..."
      />
    </div>
  );
}
