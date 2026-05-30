import { requireAuth, isResponse, ok } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAuth();
  if (isResponse(session)) return session;

  const isAdmin = session.role === "ADMIN";
  const now = new Date();

  // Task filter: admin sees all, member sees only their tasks
  const taskWhere = isAdmin ? {} : { assigneeId: session.userId };

  const [totalWorkOrders, tasksByStatus, overdueCount] = await Promise.all([
    // Total active work orders (admin only)
    isAdmin
      ? prisma.workOrder.count()
      : Promise.resolve(0),

    // Tasks grouped by status
    prisma.task.groupBy({
      by: ["status"],
      where: taskWhere,
      _count: { status: true },
    }),

    // Overdue tasks (deadline passed, not DONE)
    prisma.task.count({
      where: {
        ...taskWhere,
        deadline: { lt: now },
        status: { not: "DONE" },
      },
    }),
  ]);

  const statusMap: Record<string, number> = {
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
    BLOCKED: 0,
  };
  for (const row of tasksByStatus) {
    statusMap[row.status] = row._count.status;
  }

  return ok({
    totalWorkOrders,
    tasksByStatus: statusMap,
    overdueTasksCount: overdueCount,
  });
}
