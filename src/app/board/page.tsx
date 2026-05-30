import { getSession } from "@/lib/session";
import { getBoardTasks } from "@/services/taskService";
import { getWorkOrders } from "@/services/workOrderService";
import { getActiveMembers } from "@/services/userService";
import { KanbanBoard } from "@/components/board/KanbanBoard";

export default async function BoardPage() {
  const session = await getSession();
  if (!session) return null;

  const [tasks, workOrders, members] = await Promise.all([
    getBoardTasks({}),
    getWorkOrders({}),
    session.role === "ADMIN" ? getActiveMembers() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Kanban Board</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Geser task antar status untuk menyelesaikan pekerjaan. Semua perubahan langsung tersinkronkan secara real-time.
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {workOrders.length} Work Orders • {tasks.length} Tasks
          </div>
        </div>
      </section>

      <KanbanBoard
        initialTasks={JSON.parse(JSON.stringify(tasks))}
        workOrders={JSON.parse(JSON.stringify(workOrders))}
        members={members}
        currentUser={{ id: session.userId, role: session.role }}
      />
    </div>
  );
}
