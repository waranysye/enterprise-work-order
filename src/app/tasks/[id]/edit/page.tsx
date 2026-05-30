import { getSession } from "@/lib/session";
import { encrypt } from "@/lib/session";
import { AppShell } from "@/components/shared/AppShell";
import { getTaskById } from "@/services/taskService";
import { getActiveMembers } from "@/services/userService";
import { TaskForm } from "@/components/task/TaskForm";
import type { TaskWithRelations } from "@/types";
import { serialize } from "@/lib/api-helpers";
import Link from "next/link";

export default async function TaskEditPage({ params }: { params: Promise<{ id: string }> }) {
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

  if (session.role === "MEMBER" && task.assigneeId !== session.userId) {
    return (
      <AppShell role={session.role} userName={session.name} token={token}>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-2xl">🔒</div>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Akses Ditolak</h1>
          <p className="mt-2 text-sm text-slate-600">Hanya pemilik task atau admin yang dapat mengedit task ini.</p>
          <Link href={`/tasks/${task.id}`} className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
            ← Kembali ke Detail Task
          </Link>
        </div>
      </AppShell>
    );
  }

  const members = session.role === "ADMIN" ? await getActiveMembers() : [];
  const serializedTask = JSON.parse(JSON.stringify(task)) as TaskWithRelations;

  return (
    <AppShell role={session.role} userName={session.name} token={token}>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/work-orders" className="hover:text-blue-600 transition-colors">Work Orders</Link>
            <span>/</span>
            <Link href={`/work-orders/${task.workOrder.id}`} className="hover:text-blue-600 transition-colors truncate max-w-[160px]">
              {task.workOrder.title}
            </Link>
            <span>/</span>
            <Link href={`/tasks/${task.id}`} className="hover:text-blue-600 transition-colors truncate max-w-[160px]">
              {task.title}
            </Link>
            <span>/</span>
            <span className="text-slate-700">Edit</span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">Edit Task</h1>
          <p className="mt-1 text-sm text-slate-600">
            {session.role === "MEMBER"
              ? "Anda hanya dapat mengubah status task yang ditugaskan kepada Anda."
              : "Perbarui detail task sesuai kebutuhan."}
          </p>
        </div>

        {/* Form */}
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
          <TaskForm initial={serializedTask} role={session.role} members={members} />
        </div>
      </div>
    </AppShell>
  );
}
