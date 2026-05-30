import { prisma } from "@/lib/prisma";
import { createLog } from "./activityLogService";
import type { TaskStatus } from "@prisma/client";

const TASK_INCLUDE = {
  assignee: { select: { id: true, name: true, email: true } },
  workOrder: { select: { id: true, title: true, priority: true } },
} as const;

interface CreateTaskParams {
  title: string;
  description?: string;
  assigneeId: string;
  deadline?: string | null;
  workOrderId: string;
  performedBy: string;
  userId: string;
}

interface UpdateTaskParams {
  title?: string;
  description?: string;
  assigneeId?: string;
  deadline?: string | null;
  status?: TaskStatus;
  performedBy: string;
  userId: string;
  requestorId: string;
  requestorRole: "ADMIN" | "MEMBER";
}

export async function createTask(params: CreateTaskParams) {
  const { performedBy, userId, workOrderId, deadline, ...data } = params;

  // Verify assignee is active
  const assignee = await prisma.user.findUnique({ where: { id: data.assigneeId } });
  if (!assignee || !assignee.isActive) {
    throw new Error("Pengguna tidak aktif tidak dapat ditugaskan");
  }

  const task = await prisma.task.create({
    data: {
      ...data,
      workOrderId,
      deadline: deadline ? new Date(deadline) : null,
    },
    include: TASK_INCLUDE,
  });

  await createLog({
    actionType: "TASK_CREATED",
    description: `${performedBy} membuat task '${task.title}' dan menugaskan ke ${task.assignee.name}`,
    performedBy,
    userId,
    workOrderId,
    taskId: task.id,
  });

  return task;
}

export async function updateTask(id: string, params: UpdateTaskParams) {
  const { performedBy, userId, requestorId, requestorRole, deadline, ...data } = params;

  const existing = await prisma.task.findUnique({
    where: { id },
    include: { assignee: { select: { id: true, name: true } } },
  });
  if (!existing) return null;

  // Permission check: MEMBER can only update status of their own tasks
  if (requestorRole === "MEMBER") {
    if (existing.assigneeId !== requestorId) {
      throw new Error("Anda tidak memiliki izin untuk mengubah task ini");
    }
    // Members can only change status
    const allowedKeys = ["status", "performedBy", "userId", "requestorId", "requestorRole"];
    const attemptedKeys = Object.keys(params);
    const forbidden = attemptedKeys.filter(
      (k) => !allowedKeys.includes(k) && params[k as keyof typeof params] !== undefined
    );
    if (forbidden.length > 0) {
      throw new Error("Member hanya dapat mengubah status task");
    }
  }

  // Validate new assignee if changing
  if (data.assigneeId && data.assigneeId !== existing.assigneeId) {
    const newAssignee = await prisma.user.findUnique({ where: { id: data.assigneeId } });
    if (!newAssignee || !newAssignee.isActive) {
      throw new Error("Pengguna tidak aktif tidak dapat ditugaskan");
    }
  }

  const updateData: Record<string, unknown> = { ...data };
  if (deadline !== undefined) {
    updateData.deadline = deadline ? new Date(deadline) : null;
  }

  const task = await prisma.task.update({
    where: { id },
    data: updateData,
    include: TASK_INCLUDE,
  });

  // Log specific change types
  if (data.status && data.status !== existing.status) {
    await createLog({
      actionType: "TASK_STATUS_CHANGED",
      description: `${performedBy} mengubah status task '${task.title}' dari ${existing.status} ke ${data.status}`,
      performedBy,
      userId,
      workOrderId: task.workOrderId,
      taskId: task.id,
    });
  } else if (data.assigneeId && data.assigneeId !== existing.assigneeId) {
    const newAssignee = await prisma.user.findUnique({
      where: { id: data.assigneeId },
      select: { name: true },
    });
    await createLog({
      actionType: "TASK_ASSIGNEE_CHANGED",
      description: `${performedBy} mengubah assignee task '${task.title}' dari ${existing.assignee.name} ke ${newAssignee?.name}`,
      performedBy,
      userId,
      workOrderId: task.workOrderId,
      taskId: task.id,
    });
  } else {
    await createLog({
      actionType: "TASK_UPDATED",
      description: `${performedBy} memperbarui task '${task.title}'`,
      performedBy,
      userId,
      workOrderId: task.workOrderId,
      taskId: task.id,
    });
  }

  return task;
}

export async function deleteTask(id: string, performedBy: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: { workOrder: { select: { id: true, title: true } } },
  });
  if (!task) return null;

  await createLog({
    actionType: "TASK_DELETED",
    description: `${performedBy} menghapus task '${task.title}' dari work order '${task.workOrder.title}'`,
    performedBy,
    userId,
    workOrderId: task.workOrderId,
    taskId: id,
  });

  await prisma.task.delete({ where: { id } });
  return task;
}

export async function getTasksByWorkOrder(
  workOrderId: string,
  filters: { status?: TaskStatus; assigneeId?: string }
) {
  return prisma.task.findMany({
    where: {
      workOrderId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.assigneeId ? { assigneeId: filters.assigneeId } : {}),
    },
    include: TASK_INCLUDE,
    orderBy: { createdAt: "asc" },
  });
}

export async function getBoardTasks(filters: {
  workOrderId?: string;
  assigneeId?: string;
}) {
  return prisma.task.findMany({
    where: {
      ...(filters.workOrderId ? { workOrderId: filters.workOrderId } : {}),
      ...(filters.assigneeId ? { assigneeId: filters.assigneeId } : {}),
    },
    include: TASK_INCLUDE,
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
  });
}

export async function getTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: TASK_INCLUDE,
  });
}
