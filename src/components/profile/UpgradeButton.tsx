"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";

interface Props {
  plan: string;
  label?: string;
  className?: string;
}

export function UpgradeButton({ plan, label = "Upgrade Profesional", className }: Props) {
  const [href, setHref] = useState(`/login?next=/checkout?plan=${plan}`);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setHref(`/checkout?plan=${plan}`);
      }
    });
  }, [plan]);

  return (
    <a href={href} className={className}>
      {label}
    </a>
  );
}
