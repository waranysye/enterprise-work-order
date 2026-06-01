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

const COLUMN_STYLES: Record<string, { header: string; dot: string; badge: string; empty: string }> = {
  TODO: {
    header: "from-slate-50 to-slate-100/50 border-slate-200",
    dot: "bg-slate-400",
    badge: "bg-slate-200 text-slate-700",
    empty: "border-slate-200 text-slate-400",
  },
  IN_PROGRESS: {
    header: "from-blue-50 to-blue-100/50 border-blue-200",
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700",
    empty: "border-blue-200 text-blue-400",
  },
  DONE: {
    header: "from-emerald-50 to-emerald-100/50 border-emerald-200",
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
    empty: "border-emerald-200 text-emerald-400",
  },
  BLOCKED: {
    header: "from-rose-50 to-rose-100/50 border-rose-200",
    dot: "bg-rose-500",
    badge: "bg-rose-100 text-rose-700",
    empty: "border-rose-200 text-rose-400",
  },
};

const COLUMN_ICONS: Record<string, React.ReactNode> = {
  TODO: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  IN_PROGRESS: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  DONE: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  BLOCKED: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
};

export function KanbanColumn({ id, label, color, tasks, currentUser }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const styles = COLUMN_STYLES[id] ?? COLUMN_STYLES.TODO;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-3xl border bg-white shadow-sm transition-all duration-200 ${
        isOver
          ? "ring-2 ring-blue-400 ring-offset-2 shadow-lg scale-[1.01]"
          : "border-slate-200"
      } min-h-[560px]`}
    >
      {/* Column Header */}
      <div className={`rounded-t-3xl bg-gradient-to-b px-5 py-4 border-b ${styles.header}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-7 w-7 items-center justify-center rounded-xl ${styles.badge}`}>
              {COLUMN_ICONS[id]}
            </div>
            <h3 className="text-sm font-bold text-slate-800 tracking-wide">{label}</h3>
          </div>
          <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${styles.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
            {tasks.length}
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 space-y-3 p-4">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} currentUser={currentUser} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className={`flex h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed ${styles.empty}`}>
            <svg className="h-6 w-6 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs font-medium opacity-60">Drop task di sini</span>
          </div>
        )}
      </div>
    </div>
  );
}
