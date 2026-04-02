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
    <a
      href={href}
      className={className ?? "inline-flex items-center justify-center gap-2 bg-[#1d4ed8] hover:bg-blue-700 text-white font-black px-8 py-3 rounded-xl text-sm transition-colors w-full text-center"}
    >
      {label}
    </a>
  );
}
