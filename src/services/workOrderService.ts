import { prisma } from "@/lib/prisma";
import { createLog } from "./activityLogService";
import type { Priority } from "@prisma/client";

interface CreateWorkOrderParams {
  title: string;
  description?: string;
  priority?: Priority;
  deadline?: string | null;
  performedBy: string;
  userId: string;
}

interface UpdateWorkOrderParams {
  title?: string;
  description?: string;
  priority?: Priority;
  deadline?: string | null;
  performedBy: string;
  userId: string;
}

export async function createWorkOrder(params: CreateWorkOrderParams) {
  const { performedBy, userId, deadline, ...data } = params;

  const workOrder = await prisma.workOrder.create({
    data: {
      ...data,
      deadline: deadline ? new Date(deadline) : null,
    },
    include: { _count: { select: { tasks: true } } },
  });

  await createLog({
    actionType: "WORK_ORDER_CREATED",
    description: `${performedBy} membuat work order '${workOrder.title}'`,
    performedBy,
    userId,
    workOrderId: workOrder.id,
  });

  return workOrder;
}

export async function updateWorkOrder(
  id: string,
  params: UpdateWorkOrderParams
) {
  const { performedBy, userId, deadline, ...data } = params;

  const workOrder = await prisma.workOrder.update({
    where: { id },
    data: {
      ...data,
      ...(deadline !== undefined ? { deadline: deadline ? new Date(deadline) : null } : {}),
    },
    include: { _count: { select: { tasks: true } } },
  });

  await createLog({
    actionType: "WORK_ORDER_UPDATED",
    description: `${performedBy} memperbarui work order '${workOrder.title}'`,
    performedBy,
    userId,
    workOrderId: workOrder.id,
  });

  return workOrder;
}

export async function deleteWorkOrder(
  id: string,
  performedBy: string,
  userId: string
) {
  const workOrder = await prisma.workOrder.findUnique({
    where: { id },
    include: { _count: { select: { tasks: true } } },
  });
  if (!workOrder) return null;

  await createLog({
    actionType: "WORK_ORDER_DELETED",
    description: `${performedBy} menghapus work order '${workOrder.title}' beserta ${workOrder._count.tasks} task`,
    performedBy,
    userId,
    workOrderId: id,
  });

  await prisma.workOrder.delete({ where: { id } });
  return workOrder;
}

export async function getWorkOrders(params: {
  priority?: Priority;
  sortBy?: "createdAt" | "deadline";
  sortOrder?: "asc" | "desc";
}) {
  const { priority, sortBy = "createdAt", sortOrder = "desc" } = params;

  return prisma.workOrder.findMany({
    where: priority ? { priority } : undefined,
    orderBy: { [sortBy]: sortOrder },
    include: { _count: { select: { tasks: true } } },
  });
}

export async function getWorkOrderById(id: string) {
  return prisma.workOrder.findUnique({
    where: { id },
    include: {
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { tasks: true } },
    },
  });
}
