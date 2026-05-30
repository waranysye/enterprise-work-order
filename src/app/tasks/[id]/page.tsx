import { getSession } from "@/lib/session";
import { encrypt } from "@/lib/session";
import { getTaskById } from "@/services/taskService";
import { AppShell } from "@/components/shared/AppShell";
import Link from "next/link";

const STATUS_CONFIG = {
  TODO: { label: "To Do", color: "bg-slate-100 text-slate-700", icon: "📝" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700", icon: "⚙️" },
  DONE: { label: "Selesai", color: "bg-emerald-100 text-emerald-700", icon: "✅" },
  BLOCKED: { label: "Blocked", color: "bg-rose-100 text-rose-700", icon: "🚫" },
};

const PRIORITY_CONFIG = {
  LOW: { label: "Low", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  MEDIUM: { label: "Medium", color: "bg-amber-50 text-amber-700 border border-amber-200" },
  HIGH: { label: "High", color: "bg-rose-50 text-rose-700 border border-rose-200" },
};

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return null;

  const { id } = await params;
  const [task, token] = await Promise.all([
    getTaskById(id),
    encrypt({ userId: session.userId, email: session.email, name: session.name, role: session.role, expiresAt: session.expiresAt }),
  ]);

  if (!task) {
    return (
      <AppShell role={session.role} userName={session.name} token={token}>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">📋</div>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Task tidak ditemukan</h1>
          <Link href="/board" className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
            ← Kembali ke Board
          </Link>
        </div>
      </AppShell>
    );
  }

  const statusCfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.TODO;
  const priorityCfg = PRIORITY_CONFIG[task.workOrder.priority] ?? PRIORITY_CONFIG.MEDIUM;
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "DONE";
  const canEdit = session.role === "ADMIN" || task.assigneeId === session.userId;

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
                <Link href={`/work-orders/${task.workOrder.id}`} className="hover:text-blue-600 transition-colors truncate max-w-[160px]">
                  {task.workOrder.title}
                </Link>
                <span>/</span>
                <span className="text-slate-700 truncate">{task.title}</span>
              </div>
              <h1 className="mt-3 text-2xl font-semibold text-slate-900">{task.title}</h1>
              {task.description && (
                <p className="mt-2 text-sm leading-6 text-slate-600">{task.description}</p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusCfg.color}`}>
                  {statusCfg.icon} {statusCfg.label}
                </span>
                {isOverdue && (
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                    ⚠ Terlambat
                  </span>
                )}
              </div>
            </div>
            {canEdit && (
              <Link
                href={`/tasks/${task.id}/edit`}
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Task
              </Link>
            )}
          </div>
        </div>

        {/* Detail Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Assignee */}
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Assignee</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                {task.assignee.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{task.assignee.name}</p>
                <p className="text-xs text-slate-500">{task.assignee.email}</p>
              </div>
            </div>
            {task.assigneeId === session.userId && (
              <span className="mt-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Anda sebagai assignee
              </span>
            )}
          </div>

          {/* Work Order */}
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Work Order</p>
            <p className="mt-3 font-semibold text-slate-900">{task.workOrder.title}</p>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${priorityCfg.color}`}>
              {priorityCfg.label} Priority
            </span>
            <div className="mt-3">
              <Link
                href={`/work-orders/${task.workOrder.id}`}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Lihat Work Order →
              </Link>
            </div>
          </div>

          {/* Deadline */}
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Deadline</p>
            {task.deadline ? (
              <>
                <p className={`mt-3 text-lg font-semibold ${isOverdue ? "text-rose-700" : "text-slate-900"}`}>
                  {new Date(task.deadline).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(task.deadline).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                </p>
                {isOverdue && (
                  <span className="mt-2 inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                    Sudah lewat deadline
                  </span>
                )}
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Tidak ada deadline</p>
            )}
          </div>
        </div>

        {/* Timestamps */}
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-3">Riwayat</p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span>
              Dibuat:{" "}
              <span className="font-medium text-slate-900">
                {new Date(task.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </span>
            <span>
              Diperbarui:{" "}
              <span className="font-medium text-slate-900">
                {new Date(task.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
