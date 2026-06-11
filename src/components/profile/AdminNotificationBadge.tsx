"use client";

import { useState, useEffect } from "react";
import { Bell, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { formatDateTimeTZ } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  subject: string;
  body?: string | null;
  sent_at: string;
  read_at?: string | null;
}

export default function AdminNotificationBadge() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("admin_notifications")
          .select("*")
          .eq("faculty_id", user.id)
          .is("read_at", null)
          .order("sent_at", { ascending: false })
          .limit(10);

        setNotifications(data || []);
      } catch {
        // Ignore errors (table may not exist yet)
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function markAsRead(id: string) {
    try {
      const supabase = createClient();
      await supabase
        .from("admin_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);

      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // Ignore
    }
  }

  async function markAllAsRead() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || notifications.length === 0) return;

      await supabase
        .from("admin_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("faculty_id", user.id)
        .is("read_at", null);

      setNotifications([]);
    } catch {
      // Ignore
    }
  }

  if (loading) return null;
  if (notifications.length === 0) return null;

  const unread = notifications.length;

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl bg-blue-50 text-talentia-blue hover:bg-blue-100 transition-colors"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xs font-black text-navy">Notificaciones</h3>
              <button
                onClick={markAllAsRead}
                className="text-[10px] font-black text-talentia-blue hover:underline"
              >
                Marcar todas leídas
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 hover:bg-gray-50/50 transition-colors group">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-navy truncate">{n.subject}</p>
                      {n.body && (
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                      )}
                      <p className="text-[9px] text-gray-400 mt-1">
                        {formatDateTimeTZ(n.sent_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-gray-100 text-gray-400"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}