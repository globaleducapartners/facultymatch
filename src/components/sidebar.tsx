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
  Users,
  FileCheck
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

const facultyBottomNavItems = [
  { label: "Inicio", href: "/app/faculty", icon: Home },
  { label: "Perfil", href: "/app/faculty/profile", icon: User },
  { label: "Especialidades", href: "/app/faculty/specialties", icon: Award },
  { label: "Privacidad", href: "/app/faculty/privacy", icon: ShieldCheck },
  { label: "Ajustes", href: "/app/faculty/settings", icon: Settings },
];

const institutionItems = [
  { label: "Mi institución", href: "/app/institution", icon: Building2 },
  { label: "Buscar docentes", href: "/app/institution/search", icon: Search },
  { label: "Shortlists", href: "/app/institution/favorites", icon: Star },
  { label: "Contactos", href: "/app/institution/contacts", icon: Mail },
  { label: "Plan & facturación", href: "/app/institution/billing", icon: CreditCard },
];

const adminItems = [
  { label: "Verificaciones pendientes", href: "/control", icon: FileCheck },
  { label: "Aprobados", href: "/control/approved", icon: Users },
  { label: "Rechazados", href: "/control/rejected", icon: X },
  { label: "Instituciones", href: "/control/institutions", icon: Building2 },
  { label: "Ajustes", href: "/control/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Determine which menu to show based on URL
  let navItems = educatorItems;
  if (pathname?.startsWith("/app/institution")) {
    navItems = institutionItems;
  } else if (pathname?.startsWith("/app/admin") || pathname?.startsWith("/control")) {
    navItems = adminItems;
  }

  const isFaculty = pathname?.startsWith("/app/faculty");

  return (
    <>
      {/* Mobile bottom navigation bar — faculty only, visible below md */}
      {isFaculty && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] flex justify-around py-2 z-50 md:hidden">
          {facultyBottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 min-w-0",
                  isActive ? "text-talentia-blue" : "text-gray-400"
                )}
              >
                <item.icon size={22} />
                <span className="text-[10px] font-bold leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Tablet hamburger button — visible only on md (not mobile, not desktop) */}
      <button
        className="hidden md:flex lg:hidden fixed bottom-6 right-6 z-50 bg-talentia-blue text-white p-3 rounded-full shadow-lg items-center justify-center"
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

      {/* Sidebar Content — hidden on mobile, collapsible on tablet, static on desktop */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex-col transition-transform duration-300 transform",
        "hidden md:flex",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              // For institution main page, only active when exactly on /app/institution
              // For search, active when on /app/institution/search or its sub-routes
              const isActive = item.href === "/app/institution"
                ? pathname === "/app/institution"
                : pathname === item.href || pathname?.startsWith(item.href + "/");
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
          <a
            href="mailto:support@facultymatch.app"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <HelpCircle size={20} className="text-gray-400" />
            Centro de ayuda
          </a>
        </div>
      </aside>
    </>
  );
}
