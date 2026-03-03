import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-12 md:p-20 rounded-[3rem] shadow-xl shadow-talentia-blue/5 border border-gray-100 max-w-2xl w-full space-y-8 animate-in zoom-in duration-500">
        <div className="relative inline-block">
          <div className="bg-talentia-blue/10 p-8 rounded-full text-talentia-blue animate-pulse">
            <Search size={64} />
          </div>
          <div className="absolute -top-2 -right-2 bg-energy-orange text-white p-2 rounded-full shadow-lg">
            <span className="text-sm font-black px-2">404</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-navy tracking-tight">
            Página no encontrada
          </h1>
          <p className="text-gray-500 text-lg font-medium max-w-md mx-auto leading-relaxed">
            Parece que te has perdido en el ecosistema. No te preocupes, siempre hay un camino de vuelta.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button asChild size="lg" className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-14 rounded-2xl px-8 w-full sm:w-auto shadow-lg shadow-talentia-blue/20">
            <Link href="/" className="flex items-center gap-2">
              <Home size={20} />
              Ir al inicio
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-2 border-gray-200 hover:border-talentia-blue hover:bg-talentia-blue/5 text-navy font-bold h-14 rounded-2xl px-8 w-full sm:w-auto transition-all">
            <Link href="/app/faculty" className="flex items-center gap-2">
              <ArrowLeft size={20} />
              Volver a mi panel
            </Link>
          </Button>
        </div>
        
        <div className="pt-8 border-t border-gray-50 flex items-center justify-center gap-8 opacity-40">
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">FacultyMatch</span>
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">by Talentia</span>
        </div>
      </div>
    </div>
  );
}
