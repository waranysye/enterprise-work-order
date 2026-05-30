import { prisma } from "@/lib/prisma";
import type { ActionType } from "@prisma/client";

interface CreateLogParams {
  actionType: ActionType;
  description: string;
  performedBy: string;
  userId?: string;
  workOrderId?: string;
  taskId?: string;
}

export async function createLog(params: CreateLogParams): Promise<void> {
  await prisma.activityLog.create({ data: params });
}

export interface GetLogsParams {
  page?: number;
  perPage?: number;
  dateFrom?: string;
  dateTo?: string;
  actionType?: ActionType;
  userId?: string;
}

export async function getLogs(params: GetLogsParams = {}) {
  const { page = 1, perPage = 50, dateFrom, dateTo, actionType, userId } = params;
  const skip = (page - 1) * perPage;

  const where: Record<string, unknown> = {};
  if (actionType) where.actionType = actionType;
  if (userId) where.userId = userId;
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo) } : {}),
    };
  }

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: perPage,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { logs, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}
