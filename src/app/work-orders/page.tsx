import { getSession } from "@/lib/session";
import { getWorkOrders } from "@/services/workOrderService";
import { AppShell } from "@/components/shared/AppShell";
import Link from "next/link";

const PRIORITY_CONFIG = {
  LOW: { label: "Low", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  MEDIUM: { label: "Medium", color: "bg-amber-50 text-amber-700 border border-amber-200" },
  HIGH: { label: "High", color: "bg-rose-50 text-rose-700 border border-rose-200" },
};

export default async function WorkOrdersPage() {
  const session = await getSession();
  if (!session) return null;

  const workOrders = await getWorkOrders({});

  return (
    <AppShell role={session.role} userName={session.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Manajemen</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Work Orders</h1>
              <p className="mt-2 text-sm text-slate-600">
                Daftar work order beserta status task terkait.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                {workOrders.length} work order
              </span>
              {session.role === "ADMIN" && (
                <Link
                  href="/work-orders/create"
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Buat Work Order
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* List */}
        {workOrders.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              📋
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Belum ada work order</h2>
            <p className="mt-2 text-sm text-slate-500">
              {session.role === "ADMIN"
                ? "Mulai dengan membuat work order pertama."
                : "Belum ada work order yang tersedia."}
            </p>
            {session.role === "ADMIN" && (
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
            {workOrders.map((wo) => {
              const priorityCfg = PRIORITY_CONFIG[wo.priority] ?? PRIORITY_CONFIG.MEDIUM;
              const isOverdue = wo.deadline && new Date(wo.deadline) < new Date();
              return (
                <Link
                  key={wo.id}
                  href={`/work-orders/${wo.id}`}
                  className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
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

                  <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 rounded-2xl bg-slate-100 px-3 py-1.5">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {wo._count.tasks} task
                    </span>
                    <span className={`flex items-center gap-1.5 rounded-2xl px-3 py-1.5 ${isOverdue ? "bg-rose-50 text-rose-600" : "bg-slate-100"}`}>
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {wo.deadline
                        ? new Date(wo.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                        : "Tanpa deadline"}
                    </span>
                    {isOverdue && (
                      <span className="rounded-2xl bg-rose-100 px-3 py-1.5 font-semibold text-rose-700">
                        Terlambat
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
