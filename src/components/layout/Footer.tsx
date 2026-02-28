import Link from "next/link";
import { Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy text-white py-20 px-6 lg:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg text-navy">
              <Globe size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight">Talentia</span>
          </div>
          <p className="text-gray-400 max-w-sm font-medium">
            Elevando los estándares de la educación superior mediante la conexión de talento global.
          </p>
          <div className="space-y-2">
            <h5 className="font-bold text-sm uppercase tracking-widest text-tech-cyan">Contacto</h5>
            <p className="text-gray-400 font-medium">info@facultymatch.app</p>
            <p className="text-gray-400 font-medium">+34 900 000 000</p>
          </div>
        </div>
        <div className="space-y-6">
          <h4 className="font-bold text-lg">Plataforma</h4>
          <ul className="space-y-4 text-gray-400 font-medium">
            <li><Link href="/faculty" className="hover:text-white transition-colors">Docentes</Link></li>
            <li><Link href="/institutions" className="hover:text-white transition-colors">Instituciones</Link></li>
            <li><Link href="/directory" className="hover:text-white transition-colors">Directorio</Link></li>
            <li><Link href="/resources" className="hover:text-white transition-colors">Recursos</Link></li>
          </ul>
        </div>
        <div className="space-y-6">
          <h4 className="font-bold text-lg">Compañía</h4>
          <ul className="space-y-4 text-gray-400 font-medium">
            <li><Link href="#" className="hover:text-white transition-colors">Sobre nosotros</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Contacto</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Términos</Link></li>
            <li><Link href="/resources" className="hover:text-white transition-colors">Blog</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-gray-500 text-sm font-medium">
          &copy; {new Date().getFullYear()} Talentia. Todos los derechos reservados.
        </p>
        <div className="flex gap-6 text-gray-500">
          <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
          <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
        </div>
      </div>
    </footer>
  );
}
