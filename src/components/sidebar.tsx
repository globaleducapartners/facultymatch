"use client";
// src/components/sidebar.tsx — FacultyMatch v2

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, User, Award, ShieldCheck, Mail,
  CheckCircle2, Settings, HelpCircle, Menu, X,
  Search, Star, Building2, CreditCard, Users,
  FileCheck, Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";

const educatorItems = [
  { label: "Inicio",         href: "/app/faculty",              icon: Home,         group: "principal" },
  { label: "Mi perfil",      href: "/app/faculty/profile",      icon: User,         group: "perfil" },
  { label: "Especialidades", href: "/app/faculty/specialties",  icon: Award,        group: "perfil" },
  { label: "Visibilidad",    href: "/app/faculty/privacy",      icon: ShieldCheck,  group: "perfil" },
  { label: "Directorio",     href: "/app/faculty/directory",    icon: Search,       group: "actividad" },
  { label: "Solicitudes",    href: "/app/faculty/requests",     icon: Mail,         group: "actividad" },
  { label: "Verificación",   href: "/app/faculty/verification", icon: CheckCircle2, group: "actividad" },
  { label: "Invita y Gana",  href: "/app/faculty/referrals",    icon: Gift,         group: "mas" },
  { label: "Ajustes",        href: "/app/faculty/settings",     icon: Settings,     group: "mas" },
];

const GROUP_LABELS: Record<string, string> = {
  principal: "",
  perfil: "Mi perfil",
  actividad: "Actividad",
  mas: "Más",
};

const facultyBottomNavItems = [
  { label: "Inicio",       href: "/app/faculty",             icon: Home },
  { label: "Perfil",       href: "/app/faculty/profile",     icon: User },
  { label: "Directorio",   href: "/app/faculty/directory",   icon: Search },
  { label: "Especialidades",href: "/app/faculty/specialties",icon: Award },
  { label: "Ajustes",      href: "/app/faculty/settings",    icon: Settings },
];

const institutionBottomNavItems = [
  { label: "Inicio",    href: "/app/institution/home",     icon: Home },
  { label: "Buscar",    href: "/app/institution/search",   icon: Search },
  { label: "Favoritos", href: "/app/institution/favorites",icon: Star },
  { label: "Contactos", href: "/app/institution/contacts", icon: Mail },
  { label: "Perfil",    href: "/app/institution",          icon: Building2 },
];

const institutionItems = [
  { label: "Inicio",            href: "/app/institution/home",     icon: Home },
  { label: "Mi institución",    href: "/app/institution",          icon: Building2 },
  { label: "Buscar docentes",   href: "/app/institution/search",   icon: Search },
  { label: "Favoritos",         href: "/app/institution/favorites",icon: Star },
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

  let navItems: { label: string; href: string; icon: any; group?: string }[] = educatorItems;
  if (pathname?.startsWith("/app/institution")) {
    navItems = institutionItems;
  } else if (pathname?.startsWith("/control")) {
    navItems = adminItems;
  }

  const isFaculty     = pathname?.startsWith("/app/faculty");
  const isInstitution = pathname?.startsWith("/app/institution");

  return (
    <>
      {/* Mobile bottom nav — faculty */}
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
                  isActive ? "text-[#1B4FD8]" : "text-gray-400"
                )}
              >
                <item.icon size={20} />
                <span className="text-[9px] font-bold leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Mobile bottom nav — institution */}
      {isInstitution && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] flex justify-around py-2 z-50 md:hidden">
          {institutionBottomNavItems.map((item) => {
            const isActive = item.href === "/app/institution"
              ? pathname === "/app/institution"
              : pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 min-w-0 rounded-lg transition-colors",
                  isActive ? "text-[#1B4FD8]" : "text-gray-400"
                )}
              >
                <item.icon size={20} />
                <span className="text-[9px] font-bold leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Mobile/tablet hamburger — shows on mobile for non-bottom-nav access, tablet for all */}
      <button
        className={cn(
          "fixed bottom-6 right-6 z-50 bg-[#0D2240] text-white p-3 rounded-full shadow-lg items-center justify-center lg:hidden",
          // On mobile: only show for non-faculty/institution (e.g. admin), or always show
          // For faculty/institution we have bottom nav, but hamburger gives full sidebar access
          isFaculty || isInstitution ? "hidden md:flex" : "flex"
        )}
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
        "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#0D2240] border-r border-white/10 flex flex-col transition-transform duration-300 transform",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo at top */}
        <div className="p-4 pb-2 border-b border-white/10">
          <Logo variant="light" />
        </div>
        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-3 px-3 pb-20 lg:pb-3">
          <nav className="space-y-0.5">
            {navItems.map((item, idx) => {
              const isActive = item.href === "/app/institution"
                ? pathname === "/app/institution"
                : pathname === item.href || pathname?.startsWith(item.href + "/");
              const prevItem = (navItems as typeof educatorItems)[idx - 1];
              const showGroupLabel =
                "group" in item &&
                GROUP_LABELS[item.group as string] &&
                (!prevItem || (prevItem as typeof item).group !== item.group);
              return (
                <div key={item.href}>
                  {showGroupLabel && (
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#F7F5F0]/40 px-3 pt-4 pb-1.5 select-none">
                      {GROUP_LABELS[(item as typeof educatorItems[0]).group]}
                    </p>
                  )}
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 relative",
                      isActive
                        ? "bg-white text-[#0D2240]"
                        : "text-[#F7F5F0]/70 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon
                      size={18}
                      className={cn(
                        "flex-shrink-0 ml-0.5",
                        isActive ? "text-[#0D2240]" : "text-[#F7F5F0]/50"
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom: help */}
        <div className="p-3 border-t border-white/10">
          <a
            href="mailto:support@facultymatch.app"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#F7F5F0]/70 hover:bg-white/5 hover:text-white transition-all duration-150"
          >
            <HelpCircle size={18} className="text-[#F7F5F0]/50 flex-shrink-0" />
            <span>Centro de ayuda</span>
          </a>
        </div>
      </aside>
    </>
  );
}
