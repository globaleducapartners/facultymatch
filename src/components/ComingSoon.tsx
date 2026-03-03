import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Hammer } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
  backHref: string;
  backLabel: string;
}

export function ComingSoon({ 
  title, 
  description = "Estamos trabajando en esta sección para ofrecerte la mejor experiencia.", 
  backHref, 
  backLabel 
}: ComingSoonProps) {
  return (
    <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center text-center animate-in fade-in duration-500">
      <div className="bg-talentia-blue/10 p-6 rounded-full text-talentia-blue mb-6">
        <Hammer size={48} />
      </div>
      <h3 className="text-3xl font-bold text-navy mb-4">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto font-medium mb-8">
        {description}
      </p>
      <Button asChild className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 rounded-xl px-8 shadow-lg shadow-talentia-blue/20">
        <Link href={backHref}>{backLabel}</Link>
      </Button>
    </div>
  );
}
