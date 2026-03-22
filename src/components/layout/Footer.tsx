import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Phone, Mail, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "34616684214";
const WHATSAPP_MESSAGE = encodeURIComponent("Hola, me gustaría obtener más información sobre FacultyMatch.");

export function Footer() {
  return (
    <footer className="bg-navy text-white py-20 px-6 lg:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="col-span-2 space-y-6">
          <div className="flex items-center gap-3">
              <Logo variant="light" />
            </div>
          <p className="text-gray-400 max-w-sm font-medium">
            Elevando los estándares de la educación superior mediante la conexión de talento global. FacultyMatch by Grupo Global Educa SL.
          </p>
          <div className="space-y-3">
            <h5 className="font-bold text-sm uppercase tracking-widest text-tech-cyan">Contacto</h5>
            <a href="mailto:info@facultymatch.app" className="flex items-center gap-2 text-gray-400 font-medium hover:text-white transition-colors">
              <Mail size={16} className="text-tech-cyan flex-shrink-0" />
              info@facultymatch.app
            </a>
            <a href="tel:+34616684214" className="flex items-center gap-2 text-gray-400 font-medium hover:text-white transition-colors">
              <Phone size={16} className="text-tech-cyan flex-shrink-0" />
              +34 616 684 214
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors mt-1"
            >
              <MessageCircle size={18} />
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>
        <div className="space-y-6">
          <h4 className="font-bold text-lg">Plataforma</h4>
          <ul className="space-y-4 text-gray-400 font-medium">
            <li><Link href="/faculty" className="hover:text-white transition-colors">Docentes</Link></li>
            <li><Link href="/institutions" className="hover:text-white transition-colors">Instituciones</Link></li>
            <li><Link href="/resources" className="hover:text-white transition-colors">Recursos</Link></li>
          </ul>
        </div>
        <div className="space-y-6">
          <h4 className="font-bold text-lg">Legal</h4>
          <ul className="space-y-4 text-gray-400 font-medium">
            <li><Link href="/legal" className="hover:text-white transition-colors">Aviso Legal</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
            <li><Link href="/terms" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
            <li><Link href="/resources" className="hover:text-white transition-colors">Blog</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-gray-500 text-sm font-medium">
          &copy; {new Date().getFullYear()} FacultyMatch by Grupo Global Educa SL. Todos los derechos reservados.
        </p>
        <div className="flex gap-6 text-gray-500">
          <a
            href="https://linkedin.com/company/globaleducapartners"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors font-medium"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
