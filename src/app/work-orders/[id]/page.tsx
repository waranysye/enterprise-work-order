import { getSession } from "@/lib/session";
import { encrypt } from "@/lib/session";
import { getWorkOrderById } from "@/services/workOrderService";
import { getActiveMembers } from "@/services/userService";
import { AppShell } from "@/components/shared/AppShell";
import { TaskCreateForm } from "@/components/work-order/TaskCreateForm";
import Link from "next/link";
import type { Priority, TaskStatus } from "@/types";

const PRIORITY_CONFIG = {
  LOW: { label: "Low", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  MEDIUM: { label: "Medium", color: "bg-amber-50 text-amber-700 border border-amber-200" },
  HIGH: { label: "High", color: "bg-rose-50 text-rose-700 border border-rose-200" },
};

interface WorkOrderTask {
  id: string;
  title: string;
  status: TaskStatus;
  deadline: Date | null;
  assigneeId: string;
  assignee: { id: string; name: string; email: string };
}

const STATUS_CONFIG = {
  TODO: { label: "To Do", color: "bg-slate-100 text-slate-700" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
  DONE: { label: "Selesai", color: "bg-emerald-100 text-emerald-700" },
  BLOCKED: { label: "Blocked", color: "bg-rose-100 text-rose-700" },
};

export default async function WorkOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return null;

  const { id } = await params;
  const [workOrder, members, token] = await Promise.all([
    getWorkOrderById(id),
    session.role === "ADMIN" ? getActiveMembers() : Promise.resolve([]),
    encrypt({ userId: session.userId, email: session.email, name: session.name, role: session.role, expiresAt: session.expiresAt }),
  ]);

  if (!workOrder) {
    return (
      <AppShell role={session.role} userName={session.name} token={token}>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">📋</div>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Work order tidak ditemukan</h1>
          <Link href="/work-orders" className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
            ← Kembali ke Work Orders
          </Link>
        </div>
      </AppShell>
    );
  }

  const priorityCfg = PRIORITY_CONFIG[workOrder.priority] ?? PRIORITY_CONFIG.MEDIUM;
  const isOverdue = workOrder.deadline && new Date(workOrder.deadline) < new Date();

  return (
    <AppShell role={session.role} userName={session.name} token={token}>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Link href="/work-orders" className="hover:text-blue-600 transition-colors">Work Orders</Link>
                <span>/</span>
                <span className="truncate text-slate-700">{workOrder.title}</span>
              </div>
              <h1 className="mt-3 text-2xl font-semibold text-slate-900">{workOrder.title}</h1>
              {workOrder.description && (
                <p className="mt-2 text-sm leading-6 text-slate-600">{workOrder.description}</p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityCfg.color}`}>
                  {priorityCfg.label} Priority
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {workOrder._count.tasks} task
                </span>
                {workOrder.deadline && (
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isOverdue ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"}`}>
                    {isOverdue ? "⚠ " : ""}Deadline: {new Date(workOrder.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                )}
              </div>
            </div>
            {session.role === "ADMIN" && (
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/work-orders/${workOrder.id}/edit`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Task List */}
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h2 className="text-lg font-semibold text-slate-900">Daftar Task</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {workOrder.tasks?.length ?? 0} task
              </span>
            </div>

            {workOrder.tasks && workOrder.tasks.length > 0 ? (
              <div className="space-y-3">
                {workOrder.tasks.map((task: WorkOrderTask) => {
                  const statusCfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.TODO;
                  const taskOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "DONE";
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 hover:bg-white"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                          {taskOverdue && (
                            <span className="shrink-0 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
                              Terlambat
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 font-medium text-slate-900 truncate">{task.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Assignee: {task.assignee?.name ?? "-"}
                          {task.deadline && (
                            <> · Due: {new Date(task.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</>
                          )}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                        >
                          Detail
                        </Link>
                        {(session.role === "ADMIN" || task.assigneeId === session.userId) && (
                          <Link
                            href={`/tasks/${task.id}/edit`}
                            className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                          >
                            Edit
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <p className="text-sm text-slate-500">Belum ada task pada work order ini.</p>
              </div>
            )}
          </div>

          {/* Create Task Form */}
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
            <h2 className="text-lg font-semibold text-slate-900 mb-5">Buat Task Baru</h2>
            {session.role === "ADMIN" ? (
              <TaskCreateForm workOrderId={workOrder.id} members={members} />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-lg">🔒</div>
                <p className="mt-3 text-sm text-slate-600">Hanya Admin yang dapat membuat task baru.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
