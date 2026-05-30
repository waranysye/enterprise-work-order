import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./DashboardClient";

async function getStats(userId: string, isAdmin: boolean) {
  const now = new Date();
  const taskWhere = isAdmin ? {} : { assigneeId: userId };

  const [totalWorkOrders, tasksByStatus, overdueCount, recentLogs] = await Promise.all([
    isAdmin ? prisma.workOrder.count() : Promise.resolve(0),
    prisma.task.groupBy({
      by: ["status"],
      where: taskWhere,
      _count: { status: true },
    }),
    prisma.task.count({
      where: { ...taskWhere, deadline: { lt: now }, status: { not: "DONE" } },
    }),
    isAdmin
      ? prisma.activityLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
        })
      : Promise.resolve([]),
  ]);

  const statusMap: Record<string, number> = { TODO: 0, IN_PROGRESS: 0, DONE: 0, BLOCKED: 0 };
  for (const row of tasksByStatus) statusMap[row.status] = row._count.status;

  return {
    totalWorkOrders,
    tasksByStatus: statusMap,
    overdueTasksCount: overdueCount,
    recentLogs: JSON.parse(JSON.stringify(recentLogs)),
  };
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const stats = await getStats(session.userId, session.role === "ADMIN");

  return (
    <DashboardClient
      stats={stats}
      role={session.role}
      userName={session.name}
    />
  );
}
