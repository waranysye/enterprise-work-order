"use client";

import { useState, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import type { TaskWithRelations } from "@/types";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";

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
  TODO: { label: "To Do", bg: "bg-slate-100", text: "text-slate-700", bar: "bg-slate-400", icon: "○", ring: "ring-slate-200" },
  IN_PROGRESS: { label: "In Progress", bg: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-500", icon: "◑", ring: "ring-blue-200" },
  DONE: { label: "Selesai", bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500", icon: "●", ring: "ring-emerald-200" },
  BLOCKED: { label: "Blocked", bg: "bg-red-50", text: "text-red-700", bar: "bg-red-500", icon: "✕", ring: "ring-red-200" },
};

const ACTION_ICONS: Record<string, string> = {
  WORK_ORDER_CREATED: "📋",
  WORK_ORDER_UPDATED: "✏️",
  WORK_ORDER_DELETED: "🗑️",
  TASK_CREATED: "➕",
  TASK_UPDATED: "✏️",
  TASK_DELETED: "🗑️",
  TASK_STATUS_CHANGED: "🔄",
  TASK_ASSIGNEE_CHANGED: "👤",
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
  useSocket<{ taskId: string }>("task:deleted", handleTaskUpdate);

  const totalTasks = Object.values(stats.tasksByStatus).reduce((a, b) => a + b, 0);
  const doneCount = stats.tasksByStatus["DONE"] ?? 0;
  const completionPct = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-xl">
        {/* Background decoration */}
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Live Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Selamat datang, <span className="text-blue-400">{userName}</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-lg">
              Pantau progress tim, kelola work order, dan lihat aktivitas real-time dalam satu tampilan.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {role === "ADMIN" && (
              <Link
                href="/work-orders/create"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Buat Work Order
              </Link>
            )}
            <Link
              href="/board"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
              Buka Board
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {role === "ADMIN" && (
          <StatCard
            label="Total Work Order"
            value={stats.totalWorkOrders}
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            iconBg="bg-violet-100 text-violet-600"
            trend={null}
          />
        )}
        <StatCard
          label="In Progress"
          value={stats.tasksByStatus["IN_PROGRESS"] ?? 0}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          iconBg="bg-blue-100 text-blue-600"
          trend={null}
        />
        <StatCard
          label="Selesai"
          value={doneCount}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          iconBg="bg-emerald-100 text-emerald-600"
          trend={null}
        />
        <StatCard
          label="Overdue"
          value={stats.overdueTasksCount}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          iconBg={stats.overdueTasksCount > 0 ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"}
          highlight={stats.overdueTasksCount > 0}
          trend={null}
        />
        <StatCard
          label="Blocked"
          value={stats.tasksByStatus["BLOCKED"] ?? 0}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          }
          iconBg="bg-rose-100 text-rose-600"
          trend={null}
        />
        <StatCard
          label="To Do"
          value={stats.tasksByStatus["TODO"] ?? 0}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8h6m-6 4h4" />
            </svg>
          }
          iconBg="bg-slate-100 text-slate-600"
          trend={null}
        />
      </section>

      {/* Progress + Activity */}
      <section className="grid gap-6 xl:grid-cols-[1fr_400px]">
        {/* Progress Overview */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Progress Keseluruhan</h2>
              <p className="text-sm text-slate-500 mt-0.5">Distribusi task berdasarkan status</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900">{completionPct}%</div>
              <div className="text-xs text-slate-500">completion rate</div>
            </div>
          </div>

          {/* Stacked progress bar */}
          {totalTasks > 0 && (
            <div className="mb-6">
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                  const count = stats.tasksByStatus[status] ?? 0;
                  const pct = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
                  return pct > 0 ? (
                    <div
                      key={status}
                      className={`h-full ${cfg.bar} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                      title={`${cfg.label}: ${count}`}
                    />
                  ) : null;
                })}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
              const count = stats.tasksByStatus[status] ?? 0;
              const pct = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
              return (
                <div key={status} className="flex items-center gap-4">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${cfg.bg} ${cfg.text}`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{cfg.label}</span>
                      <span className="text-sm font-semibold text-slate-900">{count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${cfg.bar} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs text-slate-400">{Math.round(pct)}%</span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Total task</span>
            <span className="text-lg font-bold text-slate-900">{totalTasks}</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Aktivitas Terbaru</h2>
              <p className="text-sm text-slate-500 mt-0.5">Update real-time sistem</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          {stats.recentLogs.length > 0 ? (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {stats.recentLogs.map((log, i) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 transition hover:bg-slate-50"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-sm shadow-sm">
                    {ACTION_ICONS[log.actionType] ?? "📌"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-5 text-slate-700 line-clamp-2">{log.description}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {format(new Date(log.createdAt), "d MMM, HH:mm", { locale: localeId })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-center">
              <div className="text-2xl mb-2">📭</div>
              <p className="text-sm text-slate-500">Belum ada aktivitas</p>
            </div>
          )}

          {role === "ADMIN" && (
            <Link
              href="/activity-log"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Lihat semua log
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  iconBg,
  highlight,
  trend,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  highlight?: boolean;
  trend: null;
}) {
  return (
    <div className={`group rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
      highlight ? "border-orange-200 bg-orange-50/30" : "border-slate-200"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${iconBg}`}>
          {icon}
        </div>
        {highlight && (
          <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-700">
            Perhatian
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        <div className="mt-1 text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}
