"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { useSocket } from "@/hooks/useSocket";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import type { TaskWithRelations } from "@/types";

const COLUMNS: { id: string; label: string; color: string }[] = [
  { id: "TODO", label: "To Do", color: "bg-slate-100" },
  { id: "IN_PROGRESS", label: "In Progress", color: "bg-blue-50" },
  { id: "DONE", label: "Selesai", color: "bg-emerald-50" },
  { id: "BLOCKED", label: "Blocked", color: "bg-rose-50" },
];

interface Props {
  initialTasks: TaskWithRelations[];
  workOrders: Array<{ id: string; title: string }>;
  members: Array<{ id: string; name: string }>;
  currentUser: { id: string; role: "ADMIN" | "MEMBER" };
}

export function KanbanBoard({ initialTasks, workOrders, members, currentUser }: Props) {
  const [tasks, setTasks] = useState<TaskWithRelations[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null);
  const [filterWorkOrder, setFilterWorkOrder] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleTaskCreated = useCallback((task: TaskWithRelations) => {
    setTasks((prev) => {
      if (prev.find((t) => t.id === task.id)) return prev;
      toast.success(`Task baru ditambahkan: ${task.title}`);
      return [...prev, task];
    });
  }, []);

  const handleTaskUpdated = useCallback((task: TaskWithRelations) => {
    setTasks((prev) => {
      const existing = prev.find((t) => t.id === task.id);
      if (existing && existing.status !== task.status) {
        toast.info(`Task "${task.title}" dipindahkan ke status baru.`);
      } else if (existing && existing.updatedAt !== task.updatedAt) {
        // Optional: toast if other fields changed, but might be noisy.
      }
      return prev.map((t) => (t.id === task.id ? task : t));
    });
  }, []);

  const handleTaskDeleted = useCallback(({ taskId }: { taskId: string }) => {
    setTasks((prev) => {
      const existing = prev.find((t) => t.id === taskId);
      if (existing) toast.info(`Task dihapus: ${existing.title}`);
      return prev.filter((t) => t.id !== taskId);
    });
  }, []);

  useSocket<TaskWithRelations>("task:created", handleTaskCreated);
  useSocket<TaskWithRelations>("task:updated", handleTaskUpdated);
  useSocket<{ taskId: string }>("task:deleted", handleTaskDeleted);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterWorkOrder && t.workOrderId !== filterWorkOrder) return false;
      if (filterAssignee && t.assigneeId !== filterAssignee) return false;
      return true;
    });
  }, [tasks, filterWorkOrder, filterAssignee]);

  const tasksByStatus = useMemo(() => {
    const map: Record<string, TaskWithRelations[]> = {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
      BLOCKED: [],
    };
    for (const task of filteredTasks) {
      map[task.status]?.push(task);
    }
    return map;
  }, [filteredTasks]);

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    if (currentUser.role === "MEMBER" && task.assigneeId !== currentUser.id) {
      toast.error("Anda tidak memiliki izin untuk mengubah task ini");
      return;
    }

    const previousTasks = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as TaskWithRelations["status"] } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message ?? "Gagal memperbarui status");
      }
    } catch (e: unknown) {
      setTasks(previousTasks);
      toast.error(e instanceof Error ? e.message : "Gagal memperbarui status task");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Filter dan Tampilan Board</h2>
            <p className="mt-2 text-sm text-slate-600">Pilih work order atau assignee untuk fokus pada pekerjaan tertentu.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm shadow-slate-900/5">
              {filteredTasks.length} task ditampilkan
            </div>
            <button
              type="button"
              onClick={() => { setFilterWorkOrder(""); setFilterAssignee(""); }}
              className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              Reset filter
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <select
            value={filterWorkOrder}
            onChange={(e) => setFilterWorkOrder(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Semua Work Order</option>
            {workOrders.map((wo) => (
              <option key={wo.id} value={wo.id}>{wo.title}</option>
            ))}
          </select>

          {currentUser.role === "ADMIN" && (
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Semua Assignee</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          )}
        </div>
      </section>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              label={col.label}
              color={col.color}
              tasks={tasksByStatus[col.id] ?? []}
              currentUser={currentUser}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-2 opacity-90">
              <TaskCard task={activeTask} currentUser={currentUser} isDragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
