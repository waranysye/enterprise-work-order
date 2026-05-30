import { getSession } from "@/lib/session";
import { encrypt } from "@/lib/session";
import { AppShell } from "@/components/shared/AppShell";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  WORK_ORDER_CREATED: { label: "Work Order Dibuat", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "📋" },
  WORK_ORDER_UPDATED: { label: "Work Order Diperbarui", color: "bg-blue-50 text-blue-700 border-blue-200", icon: "✏️" },
  WORK_ORDER_DELETED: { label: "Work Order Dihapus", color: "bg-rose-50 text-rose-700 border-rose-200", icon: "🗑️" },
  TASK_CREATED: { label: "Task Dibuat", color: "bg-violet-50 text-violet-700 border-violet-200", icon: "➕" },
  TASK_UPDATED: { label: "Task Diperbarui", color: "bg-blue-50 text-blue-700 border-blue-200", icon: "✏️" },
  TASK_DELETED: { label: "Task Dihapus", color: "bg-rose-50 text-rose-700 border-rose-200", icon: "🗑️" },
  TASK_STATUS_CHANGED: { label: "Status Berubah", color: "bg-amber-50 text-amber-700 border-amber-200", icon: "🔄" },
  TASK_ASSIGNEE_CHANGED: { label: "Assignee Berubah", color: "bg-cyan-50 text-cyan-700 border-cyan-200", icon: "👤" },
};

export default async function ActivityLogPage() {
  const session = await getSession();
  if (!session) return null;

  if (session.role !== "ADMIN") {
    return (
      <AppShell role={session.role} userName={session.name} token={await encrypt({ userId: session.userId, email: session.email, name: session.name, role: session.role, expiresAt: session.expiresAt })}>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-2xl">🔒</div>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Akses Ditolak</h1>
          <p className="mt-2 text-sm text-slate-600">Halaman ini hanya dapat diakses oleh Administrator.</p>
        </div>
      </AppShell>
    );
  }

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const token = await encrypt({ userId: session.userId, email: session.email, name: session.name, role: session.role, expiresAt: session.expiresAt });

  // Group by date
  const grouped: Record<string, typeof logs> = {};
  for (const log of logs) {
    const dateKey = format(new Date(log.createdAt), "d MMMM yyyy", { locale: localeId });
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(log);
  }

  return (
    <AppShell role={session.role} userName={session.name} token={token}>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Audit</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Activity Log</h1>
              <p className="mt-2 text-sm text-slate-600">Riwayat semua event dan perubahan sistem.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                {logs.length} entri
              </span>
              <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                Live audit
              </span>
            </div>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">📋</div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Belum ada aktivitas</h2>
            <p className="mt-2 text-sm text-slate-500">Log akan muncul setelah ada perubahan di sistem.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, dateLogs]) => (
              <div key={date}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white">
                    {date}
                  </span>
                  <span className="text-xs text-slate-400">{dateLogs.length} aktivitas</span>
                </div>
                <div className="space-y-2">
                  {dateLogs.map((log) => {
                    const cfg = ACTION_CONFIG[log.actionType] ?? {
                      label: log.actionType,
                      color: "bg-slate-50 text-slate-700 border-slate-200",
                      icon: "📌",
                    };
                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-900/3 transition hover:border-slate-200"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-base">
                          {cfg.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            <span className="text-xs text-slate-400">
                              {format(new Date(log.createdAt), "HH:mm", { locale: localeId })}
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm text-slate-700">{log.description}</p>
                          <p className="mt-1 text-xs text-slate-400">oleh {log.performedBy}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
