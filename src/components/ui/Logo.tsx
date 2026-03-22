import Link from "next/link";
import { GraduationCap } from "lucide-react";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
}

export function Logo({ className = "", variant = "dark" }: LogoProps) {
  const titleColor = variant === "light" ? "text-white" : "text-navy";
  const subtitleColor = variant === "light" ? "text-white/40" : "text-gray-400";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="bg-talentia-blue p-2 rounded-xl text-white">
        <GraduationCap size={24} />
      </div>
      <div className="flex flex-col">
        <span className={`text-xl font-black tracking-tighter leading-none ${titleColor}`}>
          FACULTY <span className="text-talentia-blue">MATCH</span>
        </span>
        <span className={`text-[8px] font-bold uppercase tracking-[0.2em] leading-none mt-1 ${subtitleColor}`}>
          Conectando Talento Académico
        </span>
      </div>
    </div>
  );
}
