import { createAdminClient } from "@/lib/supabase-server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EmailHistoryTable } from "@/components/control/EmailHistoryTable";

export default async function EmailHistoryPage() {
  const admin = createAdminClient();

  const { data: logs } = await admin
    .from("email_logs")
    .select("*")
    .order("sent_at", { ascending: false })
    .limit(500);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            href="/control/notifications"
            className="text-xs font-black text-gray-400 hover:text-navy transition-colors flex items-center gap-1 mb-2"
          >
            <ArrowLeft size={12} />
            Volver a notificaciones
          </Link>
          <h1 className="text-3xl font-black text-navy tracking-tight">Historial de emails</h1>
          <p className="text-gray-500 font-medium mt-1">
            {logs?.length ?? 0} emails enviados desde el panel de administración.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <EmailHistoryTable logs={logs || []} />
      </div>
    </div>
  );
}