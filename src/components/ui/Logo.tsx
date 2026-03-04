import Link from "next/link";
import { GraduationCap } from "lucide-react";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="bg-talentia-blue p-2 rounded-xl text-white">
        <GraduationCap size={24} />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-black tracking-tighter text-navy leading-none">
          FACULTY <span className="text-talentia-blue">MATCH</span>
        </span>
        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400 leading-none mt-1">
          Conectando Talento Académico
        </span>
      </div>
    </div>
  );
}
