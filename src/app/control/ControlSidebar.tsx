"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Home, Clock, CheckCircle2, XCircle, Building2, Settings, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminLogoutButton } from "./AdminLogoutButton";
import { useState } from "react";

interface Props {
  pendingCount: number;
  adminName: string;
}

export default function ControlSidebar({ pendingCount, adminName }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/control", icon: Home },
    { label: "Docentes pendientes", href: "/control", icon: Clock, badge: pendingCount > 0 ? pendingCount : null },
    { label: "Aprobados", href: "/control/approved", icon: CheckCircle2 },
    { label: "Rechazados", href: "/control/rejected", icon: XCircle },
    { label: "Instituciones", href: "/control/institutions", icon: Building2 },
    { label: "Configuración", href: "/control/settings", icon: Settings },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/control" onClick={() => setMobileOpen(false)}>
          <Logo variant="light" />
        </Link>
        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-2">
          Panel de Administración
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/control" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              )}
            >
              <item.icon size={18} className={isActive ? "text-tech-cyan" : "text-white/40"} />
              <span className="flex-1">{item.label}</span>
              {item.badge != null && (
                <span className="bg-energy-orange text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 font-black text-xs flex-shrink-0">
            {adminName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{adminName}</p>
            <p className="text-[10px] text-white/30 font-medium">Super Admin</p>
          </div>
        </div>
        <AdminLogoutButton />
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-navy flex items-center justify-between px-4 h-14 border-b border-white/10">
        <Link href="/control">
          <Logo variant="light" />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={cn(
        "lg:hidden fixed top-14 left-0 bottom-0 z-40 w-72 bg-navy flex flex-col transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-navy min-h-screen sticky top-0 h-screen">
        <SidebarContent />
      </aside>
    </>
  );
}
