"use client";

import { useState, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import type { TaskWithRelations } from "@/types";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface Stats {
  totalWorkOrders: number;
  tasksByStatus: Record<string, number>;
  overdueTasksCount: number;
  recentLogs: Array<{ id: string; description: string; createdAt: string; actionType: string }>;
}

interface Props {
  stats: Stats;
  role: "ADMIN" | "MEMBER";
  userName: string;
}

const STATUS_CONFIG = {
  TODO: { label: "To Do", color: "bg-slate-100 text-slate-700", accent: "bg-slate-300" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700", accent: "bg-blue-300" },
  DONE: { label: "Selesai", color: "bg-emerald-100 text-emerald-700", accent: "bg-emerald-300" },
  BLOCKED: { label: "Blocked", color: "bg-red-100 text-red-700", accent: "bg-red-300" },
};

export function DashboardClient({ stats: initialStats, role, userName }: Props) {
  const [stats, setStats] = useState(initialStats);

  const handleTaskUpdate = useCallback(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setStats((prev) => ({ ...prev, ...json.data }));
      });
  }, []);

  useSocket<TaskWithRelations>("task:created", handleTaskUpdate);
  useSocket<TaskWithRelations>("task:updated", handleTaskUpdate);
  useSocket<{ taskId: string }>("task:deleted", handleTaskUpdate as never);

  const totalTasks = Object.values(stats.tasksByStatus).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Selamat datang, {userName}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Pantau pekerjaan tim, pantau progress task, dan lihat aktivitas real-time dalam satu tampilan yang rapi.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Realtime updates aktif
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {role === "ADMIN" && (
            <StatCard
              label="Total Work Order"
              value={stats.totalWorkOrders}
              icon="📋"
              color="bg-violet-50 text-violet-700"
            />
          )}
          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
            <StatCard
              key={status}
              label={cfg.label}
              value={stats.tasksByStatus[status] ?? 0}
              icon={status === "TODO" ? "📝" : status === "IN_PROGRESS" ? "⚙️" : status === "DONE" ? "✅" : "🚫"}
              color={cfg.color}
            />
          ))}
          <StatCard
            label="Overdue"
            value={stats.overdueTasksCount}
            icon="⚠️"
            color={stats.overdueTasksCount > 0 ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-700"}
            highlight={stats.overdueTasksCount > 0}
          />
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Ringkasan Saat Ini</h2>
              <p className="mt-1 text-sm text-slate-500">
                Total task: <span className="font-semibold text-slate-900">{totalTasks}</span>
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
              {role}
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
              <div key={status} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-sm text-slate-700">{cfg.label}</div>
                <div className="text-base font-semibold text-slate-900">{stats.tasksByStatus[status] ?? 0}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {totalTasks > 0 && (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Progress Keseluruhan</h2>
              <p className="text-sm text-slate-500">Distribusi task berdasarkan status saat ini.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
              {totalTasks} task
            </span>
          </div>
          <div className="space-y-3">
            {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
              const count = stats.tasksByStatus[status] ?? 0;
              const pct = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-700">
                    <span>{cfg.label}</span>
                    <span>{count} task</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${cfg.accent}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {role === "ADMIN" && stats.recentLogs.length > 0 && (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Aktivitas Terbaru</h2>
              <p className="text-sm text-slate-500">Log aktivitas administrator dan task terbaru.</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
              Live audit
            </span>
          </div>
          <ul className="space-y-4">
            {stats.recentLogs.map((log) => (
              <li key={log.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">{log.description}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {format(new Date(log.createdAt), "d MMM yyyy, HH:mm", { locale: localeId })}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color, highlight }: { label: string; value: number; icon: string; color: string; highlight?: boolean }) {
  return (
    <div className={`rounded-[1.75rem] border border-slate-200 p-5 shadow-sm shadow-slate-900/5 ${color} ${highlight ? "ring-2 ring-orange-300" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="rounded-2xl bg-white/80 px-3 py-2 text-lg">{icon}</div>
        {highlight && <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">Butuh perhatian</span>}
      </div>
      <div className="mt-5 text-3xl font-semibold text-slate-900">{value}</div>
      <div className="mt-2 text-sm text-slate-600">{label}</div>
    </div>
  );
}
