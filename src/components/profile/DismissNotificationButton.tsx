"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase-client";

export default function DismissNotificationButton({ notificationId }: { notificationId: string }) {
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDismiss() {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase
        .from("admin_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId);
      setDismissed(true);
    } catch {
      setLoading(false);
    }
  }

  if (dismissed) return null;

  return (
    <button
      onClick={handleDismiss}
      disabled={loading}
      className="p-1.5 rounded-lg hover:bg-purple-200/50 text-purple-400 hover:text-purple-700 transition-colors flex-shrink-0"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
    </button>
  );
}