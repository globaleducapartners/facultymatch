"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Building2,
  MessageSquare,
  CheckCheck,
  GraduationCap,
  Megaphone,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, switchActiveMode } from "@/app/auth/actions";
import { createBrowserClient } from "@supabase/ssr";
import { timeAgoTZ } from "@/lib/utils";

interface TopbarProps {
  user: {
    id: string;
    email?: string;
  };
  profile: {
    full_name?: string;
    avatar_url?: string;
    role?: string;
    aneca_accreditation?: string;
    can_switch_role?: boolean;
    active_mode?: string | null;
  } | null;
}

interface Notification {
  id: string;
  type: "contact" | "admin";
  title: string;
  body: string;
  created_at: string;
}

export function Topbar({ user, profile }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [notifLoaded, setNotifLoaded] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const dashboardHref =
    profile?.role === "faculty"      ? "/app/faculty" :
    profile?.role === "institution"  ? "/app/institution/home" :
    profile?.role === "admin" || profile?.role === "super_admin" ? "/control" :
    "/app/faculty";

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (notifLoaded) return;
    setLoadingNotifs(true);
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const notifs: Notification[] = [];

      // ── 1. Admin notifications (in-app notifications from /control) ──
      const { data: adminNotifs } = await supabase
        .from("admin_notifications")
        .select("id, subject, body, sent_at")
        .eq("faculty_id", user.id)
        .is("read_at", null)
        .order("sent_at", { ascending: false })
        .limit(5);

      if (adminNotifs) {
        for (const n of adminNotifs) {
          notifs.push({
            id: n.id,
            type: "admin",
            title: n.subject,
            body: n.body || "",
            created_at: n.sent_at,
          });
        }
      }

      // ── 2. Pending contact requests (faculty role) ──
      const { data: fp } = await supabase
        .from("faculty_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fp?.id) {
        const { data: contacts } = await supabase
          .from("contacts")
          .select("id, created_at, institution:institutions(name)")
          .eq("faculty_id", fp.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(5);

        if (contacts) {
          for (const c of contacts) {
            const instName = (c.institution as any)?.name || "Una institución";
            notifs.push({
              id: c.id,
              type: "contact",
              title: "Nueva solicitud de contacto",
              body: `${instName} quiere contactar contigo.`,
              created_at: c.created_at,
            });
          }
        }
      }

      // Sort newest first and cap at 10
      notifs.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setNotifications(notifs.slice(0, 10));
    } catch {
      // graceful fail — show empty state
    } finally {
      setLoadingNotifs(false);
      setNotifLoaded(true);
    }
  };

  const handleBellClick = () => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next) fetchNotifications();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <Link href={dashboardHref} className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 100 100" className="flex-shrink-0" style={{ filter: "drop-shadow(0 0 6px rgba(255,106,26,0.4))" }}>
            <circle cx="30" cy="52" r="22" fill="#0D2240" />
            <circle cx="66" cy="50" r="34" fill="#FF6A1A" />
          </svg>
          <span className="text-[17px] font-bold tracking-tight text-[#080F1E]">facultymatch</span>
        </Link>
      </div>

      {/* ── Role switcher (dual-role) — desktop ── */}
      {profile?.can_switch_role && (
        <div className="hidden md:flex items-center bg-[#F2F6FC] border border-[#D8E2EF] rounded-xl p-1 gap-0.5">
          <form action={switchActiveMode}>
            <input type="hidden" name="mode" value="faculty" />
            <button
              type="submit"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                profile.active_mode === "faculty"
                  ? "bg-white text-[#0D2240] shadow-sm border border-[#D8E2EF]"
                  : "text-[#4B5A7A] hover:text-[#080F1E]"
              }`}
            >
              <GraduationCap size={13} />
              Modo docente
            </button>
          </form>
          <form action={switchActiveMode}>
            <input type="hidden" name="mode" value="institution" />
            <button
              type="submit"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                profile.active_mode === "institution"
                  ? "bg-white text-[#0D2240] shadow-sm border border-[#D8E2EF]"
                  : "text-[#4B5A7A] hover:text-[#080F1E]"
              }`}
            >
              <Building2 size={13} />
              Modo institución
            </button>
          </form>
        </div>
      )}

      {/* ── Role switcher — mobile (icon-only) ── */}
      {profile?.can_switch_role && (
        <div className="flex md:hidden items-center bg-[#F2F6FC] border border-[#D8E2EF] rounded-xl p-0.5 gap-0.5">
          <form action={switchActiveMode}>
            <input type="hidden" name="mode" value="faculty" />
            <button
              type="submit"
              title="Modo docente"
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                profile.active_mode === "faculty"
                  ? "bg-white text-[#0D2240] shadow-sm border border-[#D8E2EF]"
                  : "text-[#4B5A7A]"
              }`}
            >
              <GraduationCap size={15} />
            </button>
          </form>
          <form action={switchActiveMode}>
            <input type="hidden" name="mode" value="institution" />
            <button
              type="submit"
              title="Modo institución"
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                profile.active_mode === "institution"
                  ? "bg-white text-[#0D2240] shadow-sm border border-[#D8E2EF]"
                  : "text-[#4B5A7A]"
              }`}
            >
              <Building2 size={15} />
            </button>
          </form>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {/* ── Notification bell ── */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={handleBellClick}
              className="p-2 text-gray-400 hover:text-gray-900 transition-colors relative"
              aria-label="Notificaciones"
            >
              <Bell size={22} />
              {notifLoaded && notifications.length > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-sm">{notifications.length}</span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#D8E2EF] z-50 overflow-hidden" style={{ boxShadow: "0 8px 40px rgba(7,19,38,0.14)" }}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
                  <span className="text-sm font-black text-[#080F1E]">Notificaciones</span>
                  {notifications.length > 0 && (
                    <span className="text-[10px] font-black text-white bg-[#1B4FD8] px-2 py-0.5 rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </div>

                {/* Body */}
                {loadingNotifs ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-400 font-medium">
                    Cargando…
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 flex flex-col items-center gap-3 text-center">
                    <CheckCheck size={28} className="text-gray-200" />
                    <p className="text-sm font-bold text-gray-400">
                      No hay notificaciones pendientes
                    </p>
                    <p className="text-xs text-gray-300 font-medium">
                      Te avisaremos cuando una institución quiera contactarte.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              n.type === "contact"
                                ? "bg-[#0D2240]/10 text-[#0D2240]"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {n.type === "contact" ? (
                              <Building2 size={15} />
                            ) : (
                              <Megaphone size={15} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-navy">{n.title}</p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5 line-clamp-2">
                              {n.body}
                            </p>
                            <p className="text-[10px] text-gray-300 font-medium mt-1">
                              {timeAgoTZ(n.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="border-t border-[#E2E8F0] px-4 py-3">
                  <Link
                    href="/app/faculty/requests"
                    className="text-xs font-bold text-[#1B4FD8] hover:text-[#0D2240] transition-colors"
                    onClick={() => setShowNotifications(false)}
                  >
                    Ver todas las solicitudes →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── User dropdown ── */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-50 transition-all focus:outline-none">
              <Avatar className="h-9 w-9 border-2 border-[#E2E8F0]">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-[#EEF4FF] text-[#1B4FD8] font-bold text-sm">
                  {profile?.full_name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start mr-1">
                <span className="text-sm font-bold text-[#080F1E] leading-none mb-0.5">
                  {profile?.full_name}
                </span>
                <span className="text-xs text-[#4B5A7A] font-medium capitalize">
                  {profile?.active_mode === "institution" || profile?.role === "institution"
                    ? "Institución"
                    : profile?.role === "faculty"
                    ? "Docente"
                    : profile?.role === "admin" || profile?.role === "super_admin"
                    ? "Admin"
                    : "Usuario"}
                </span>
              </div>
              <ChevronDown size={16} className="text-gray-400 hidden md:block" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
              <DropdownMenuItem className="rounded-lg p-2.5">
                <Link
                  href={`/app/${
                    profile?.role === "faculty"
                      ? "faculty"
                      : profile?.role === "institution"
                      ? "institution"
                      : "admin"
                  }/settings`}
                  className="flex items-center gap-2 w-full"
                >
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem className="rounded-lg p-2.5 text-red-600 focus:text-red-600 focus:bg-red-50">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full text-left"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
