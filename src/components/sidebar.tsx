"use client";
// src/components/sidebar.tsx — FacultyMatch v2

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, User, Award, ShieldCheck, Mail,
  CheckCircle2, Settings, HelpCircle, Menu, X,
  Search, Star, Building2, CreditCard, Users,
  FileCheck, Gift, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const educatorItems = [
  { label: "Inicio",               href: "/app/faculty",              icon: Home },
  { label: "Mi perfil",            href: "/app/faculty/profile",      icon: User },
  { label: "Especialidades",       href: "/app/faculty/specialties",  icon: Award },
  { label: "Directorio",           href: "/app/faculty/directory",    icon: Search },
  { label: "Visibilidad",          href: "/app/faculty/privacy",      icon: ShieldCheck },
  { label: "Solicitudes",          href: "/app/faculty/requests",     icon: Mail },
  { label: "Invita y Gana",        href: "/app/faculty/referrals",    icon: Gift },
  { label: "Verificación",         href: "/app/faculty/verification", icon: CheckCircle2 },
  { label: "Ajustes",              href: "/app/faculty/settings",     icon: Settings },
];

const facultyBottomNavItems = [
  { label: "Inicio",       href: "/app/faculty",             icon: Home },
  { label: "Perfil",       href: "/app/faculty/profile",     icon: User },
  { label: "Directorio",   href: "/app/faculty/directory",   icon: Search },
  { label: "Especialidades",href: "/app/faculty/specialties",icon: Award },
  { label: "Ajustes",      href: "/app/faculty/settings",    icon: Settings },
];

const institutionItems = [
  { label: "Mi institución",    href: "/app/institution",          icon: Building2 },
  { label: "Buscar docentes",   href: "/app/institution/search",   icon: Search },
  { label: "Shortlists",        href: "/app/institution/favorites",icon: Star },
  { label: "Contactos",         href: "/app/institution/contacts", icon: Mail },
  { label: "Plan & facturación",href: "/app/institution/billing",  icon: CreditCard },
];

const adminItems = [
  { label: "Verificaciones pendientes", href: "/control",              icon: FileCheck },
  { label: "Aprobados",                 href: "/control/approved",     icon: Users },
  { label: "Rechazados",                href: "/control/rejected",     icon: X },
  { label: "Instituciones",             href: "/control/institutions", icon: Building2 },
  { label: "Ajustes",                   href: "/control/settings",     icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  let navItems = educatorItems;
  if (pathname?.startsWith("/app/institution")) {
    navItems = institutionItems;
  } else if (pathname?.startsWith("/app/admin") || pathname?.startsWith("/control")) {
    navItems = adminItems;
  }

  const isFaculty = pathname?.startsWith("/app/faculty");

  return (
    <>
      {/* Mobile bottom nav — faculty only */}
      {isFaculty && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] flex justify-around py-2 z-50 md:hidden">
          {facultyBottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 min-w-0 rounded-lg transition-colors",
                  isActive ? "text-[#0D2240]" : "text-gray-400"
                )}
              >
                <item.icon size={20} />
                <span className="text-[9px] font-bold leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Tablet hamburger */}
      <button
        className="hidden md:flex lg:hidden fixed bottom-6 right-6 z-50 bg-[#0D2240] text-white p-3 rounded-full shadow-lg items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#E2E8F0] flex-col transition-transform duration-300 transform",
        "hidden md:flex",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = item.href === "/app/institution"
                ? pathname === "/app/institution"
                : pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150",
                    isActive
                      ? "bg-[#EEF4FF] text-[#1B4FD8]"
                      : "text-[#4B5A7A] hover:bg-[#F2F6FC] hover:text-[#0D2240]"
                  )}
                >
                  <item.icon
                    size={18}
                    className={cn(
                      "flex-shrink-0",
                      isActive ? "text-[#E9A030]" : "text-gray-400"
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="text-[#1B4FD8] opacity-50" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: help */}
        <div className="p-3 border-t border-[#E2E8F0]">
          <a
            href="mailto:support@facultymatch.app"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#4B5A7A] hover:bg-[#F2F6FC] hover:text-[#0D2240] transition-all duration-150"
          >
            <HelpCircle size={18} className="text-gray-400 flex-shrink-0" />
            <span>Centro de ayuda</span>
          </a>
        </div>
      </aside>
    </>
  );
}
