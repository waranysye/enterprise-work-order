"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";
import type { TaskWithRelations } from "@/types";

interface Props {
  id: string;
  label: string;
  color: string;
  tasks: TaskWithRelations[];
  currentUser: { id: string; role: "ADMIN" | "MEMBER" };
}

const HEADER_COLORS: Record<string, string> = {
  TODO: "text-slate-900 border-slate-200",
  IN_PROGRESS: "text-blue-900 border-blue-200",
  DONE: "text-emerald-900 border-emerald-200",
  BLOCKED: "text-rose-900 border-rose-200",
};

export function KanbanColumn({ id, label, color, tasks, currentUser }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition ${
        isOver ? "ring-2 ring-blue-300 shadow-lg" : ""
      } min-h-[520px] flex flex-col`}
    >
      <div className={`px-5 py-4 border-b ${color} ${HEADER_COLORS[id] ?? "text-slate-900 border-slate-200"}`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em]">{label}</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {tasks.length} task
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 space-y-3">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} currentUser={currentUser} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex h-28 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 text-sm">
            Tidak ada task
          </div>
        )}
      </div>
    </div>
  );
}
