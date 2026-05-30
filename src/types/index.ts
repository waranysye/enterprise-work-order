import type { Role, Priority, TaskStatus, ActionType } from "@prisma/client";

// Re-export Prisma enums for convenience
export type { Role, Priority, TaskStatus, ActionType };

// Serialized types (dates as ISO strings for JSON transport)
export interface SerializedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedWorkOrder {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
}

export interface TaskWithRelations {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  workOrderId: string;
  workOrder: {
    id: string;
    title: string;
    priority: Priority;
  };
  assigneeId: string;
  assignee: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SerializedActivityLog {
  id: string;
  actionType: ActionType;
  description: string;
  performedBy: string;
  userId: string | null;
  workOrderId: string | null;
  taskId: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalWorkOrders: number;
  tasksByStatus: Record<TaskStatus, number>;
  overdueTasksCount: number;
}

// API response wrappers
export interface ApiSuccess<T> {
  data: T;
}

export interface ApiSuccessPaginated<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    fields?: { field: string; message: string }[];
  };
}

// Socket.io event payloads
export type SocketEvents = {
  "task:created": TaskWithRelations;
  "task:updated": TaskWithRelations;
  "task:deleted": { taskId: string; workOrderId: string };
  "workorder:created": SerializedWorkOrder;
  "workorder:updated": SerializedWorkOrder;
  "workorder:deleted": { workOrderId: string };
};

export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";
