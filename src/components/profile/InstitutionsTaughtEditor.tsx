"use client";

import { useState } from "react";
import { UniversityAutocomplete } from "@/components/ui/UniversityAutocomplete";

interface Props {
  initialInstitutions: string[];
}

export function InstitutionsTaughtEditor({ initialInstitutions }: Props) {
  const [institutions, setInstitutions] = useState<string[]>(initialInstitutions ?? []);

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
