"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const PRIORITY_CONFIG = {
  LOW: { label: "Low", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  MEDIUM: { label: "Medium", color: "bg-amber-50 text-amber-700 border border-amber-200" },
  HIGH: { label: "High", color: "bg-rose-50 text-rose-700 border border-rose-200" },
};

interface WorkOrder {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  deadline: Date | null;
  createdAt: Date;
  _count: { tasks: number };
}

interface Props {
  workOrders: WorkOrder[];
  role: "ADMIN" | "MEMBER";
}

export function WorkOrdersClient({ workOrders, role }: Props) {
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const filtered = useMemo(() => {
    return workOrders.filter((wo) => {
      const matchSearch =
        !search ||
        wo.title.toLowerCase().includes(search.toLowerCase()) ||
        (wo.description ?? "").toLowerCase().includes(search.toLowerCase());
      const matchPriority = !filterPriority || wo.priority === filterPriority;
      return matchSearch && matchPriority;
    });
  }, [workOrders, search, filterPriority]);

  const overdueCount = workOrders.filter(
    (wo) => wo.deadline && new Date(wo.deadline) < new Date()
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Manajemen</p>
            <h1 className="mt-1.5 text-3xl font-bold text-slate-900">Work Orders</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Kelola dan pantau semua work order tim.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              {workOrders.length} total
            </span>
            {overdueCount > 0 && (
              <span className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
                {overdueCount} terlambat
              </span>
            )}
            {role === "ADMIN" && (
              <Link
                href="/work-orders/create"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Buat Work Order
              </Link>
            )}
          </div>
        </div>

        {/* Search + Filter */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari work order..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Semua Prioritas</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          {(search || filterPriority) && (
            <button
              onClick={() => { setSearch(""); setFilterPriority(""); }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results info */}
      {(search || filterPriority) && (
        <p className="text-sm text-slate-500 px-1">
          Menampilkan <span className="font-semibold text-slate-900">{filtered.length}</span> dari {workOrders.length} work order
        </p>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
            {search || filterPriority ? "🔍" : "📋"}
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            {search || filterPriority ? "Tidak ada hasil" : "Belum ada work order"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {search || filterPriority
              ? "Coba ubah kata kunci atau filter pencarian."
              : role === "ADMIN"
              ? "Mulai dengan membuat work order pertama."
              : "Belum ada work order yang tersedia."}
          </p>
          {role === "ADMIN" && !search && !filterPriority && (
            <Link
              href="/work-orders/create"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Buat Work Order
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((wo) => {
            const priorityCfg = PRIORITY_CONFIG[wo.priority] ?? PRIORITY_CONFIG.MEDIUM;
            const isOverdue = wo.deadline && new Date(wo.deadline) < new Date();
            const daysLeft = wo.deadline
              ? Math.ceil((new Date(wo.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <Link
                key={wo.id}
                href={`/work-orders/${wo.id}`}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {wo.title}
                    </h2>
                    {wo.description && (
                      <p className="mt-1.5 text-sm leading-6 text-slate-500 line-clamp-2">
                        {wo.description}
                      </p>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${priorityCfg.color}`}>
                    {priorityCfg.label}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                  {/* Task count */}
                  <span className="flex items-center gap-1.5 rounded-2xl bg-slate-100 px-3 py-1.5 text-slate-600">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {wo._count.tasks} task
                  </span>

                  {/* Deadline */}
                  <span className={`flex items-center gap-1.5 rounded-2xl px-3 py-1.5 ${
                    isOverdue ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"
                  }`}>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {wo.deadline
                      ? new Date(wo.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                      : "Tanpa deadline"}
                  </span>

                  {/* Days left / overdue */}
                  {daysLeft !== null && !isOverdue && daysLeft <= 7 && (
                    <span className="rounded-2xl bg-amber-50 px-3 py-1.5 font-semibold text-amber-700">
                      {daysLeft === 0 ? "Hari ini" : `${daysLeft} hari lagi`}
                    </span>
                  )}
                  {isOverdue && (
                    <span className="rounded-2xl bg-rose-100 px-3 py-1.5 font-semibold text-rose-700">
                      Terlambat
                    </span>
                  )}
                </div>

                {/* Arrow indicator */}
                <div className="mt-4 flex items-center justify-end">
                  <span className="text-xs font-medium text-slate-400 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                    Lihat detail
                    <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
