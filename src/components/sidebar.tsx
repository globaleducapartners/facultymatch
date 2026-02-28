"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  User, 
  Award, 
  ShieldCheck, 
  Mail, 
  CheckCircle2, 
  Settings,
  HelpCircle,
  Menu,
  X,
  Search,
  Star,
  Building2,
  CreditCard,
  LayoutDashboard,
  Users,
  FileCheck,
  Tags
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const educatorItems = [
  { label: "Inicio", href: "/app/faculty", icon: Home },
  { label: "Mi perfil", href: "/app/faculty/profile", icon: User },
  { label: "Especialidades", href: "/app/faculty/specialties", icon: Award },
  { label: "Visibilidad & Privacidad", href: "/app/faculty/privacy", icon: ShieldCheck },
  { label: "Solicitudes", href: "/app/faculty/requests", icon: Mail },
  { label: "Verificación", href: "/app/faculty/verification", icon: CheckCircle2 },
  { label: "Ajustes", href: "/app/faculty/settings", icon: Settings },
];

const institutionItems = [
  { label: "Buscar docentes", href: "/app/institution", icon: Search },
  { label: "Shortlists", href: "/app/institution/shortlists", icon: Star },
  { label: "Contactos", href: "/app/institution/contacts", icon: Mail },
  { label: "Mi institución", href: "/app/institution/profile", icon: Building2 },
  { label: "Plan & facturación", href: "/app/institution/billing", icon: CreditCard },
];

const adminItems = [
  { label: "Dashboard", href: "/app/admin", icon: LayoutDashboard },
  { label: "Verificaciones", href: "/app/admin/verifications", icon: FileCheck },
  { label: "Docentes", href: "/app/admin/educators", icon: Users },
  { label: "Instituciones", href: "/app/admin/institutions", icon: Building2 },
  { label: "Taxonomía", href: "/app/admin/taxonomy", icon: Tags },
  { label: "Ajustes", href: "/app/admin/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Determine which menu to show based on URL
  let navItems = educatorItems;
  if (pathname?.startsWith("/app/institution")) {
    navItems = institutionItems;
  } else if (pathname?.startsWith("/app/admin")) {
    navItems = adminItems;
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-talentia-blue text-white p-3 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 transform",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-talentia-blue/10 text-talentia-blue" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon size={20} className={isActive ? "text-talentia-blue" : "text-gray-400"} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <Link
            href="/help"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <HelpCircle size={20} className="text-gray-400" />
            Centro de ayuda
          </Link>
        </div>
      </aside>
    </>
  );
}
