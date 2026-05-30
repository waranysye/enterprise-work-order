"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TaskWithRelations } from "@/types";

interface Props {
  task: TaskWithRelations;
  currentUser: { id: string; role: "ADMIN" | "MEMBER" };
  isDragging?: boolean;
}

const PRIORITY_DOTS: Record<string, string> = {
  LOW: "bg-emerald-400",
  MEDIUM: "bg-amber-400",
  HIGH: "bg-rose-500",
};

export function TaskCard({ task, currentUser, isDragging = false }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "DONE";
  const isOwn = currentUser.id === task.assigneeId;
  const priorityDot = PRIORITY_DOTS[task.workOrder.priority] ?? PRIORITY_DOTS.MEDIUM;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-3xl border bg-white shadow-sm transition-all ${
        isDragging || isSortableDragging
          ? "rotate-1 border-blue-300 opacity-90 shadow-lg ring-2 ring-blue-300/60"
          : "border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      }`}
    >
      {/* Drag handle area */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab px-4 pt-4 pb-1 active:cursor-grabbing"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`h-2 w-2 shrink-0 rounded-full ${priorityDot}`} title={`Priority: ${task.workOrder.priority}`} />
              <p className="text-[11px] font-medium text-slate-400 truncate">{task.workOrder.title}</p>
            </div>
            <h4 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">{task.title}</h4>
          </div>
          {isOverdue && (
            <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
              Terlambat
            </span>
          )}
        </div>

        {task.description && (
          <p className="mt-2 text-xs leading-5 text-slate-500 line-clamp-2">{task.description}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {isOwn ? "Anda" : task.assignee.name}
          </span>
          {task.deadline && (
            <span className={`rounded-full px-2.5 py-1 text-[11px] ${isOverdue ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"}`}>
              {new Date(task.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
      </div>

      {/* Clickable footer */}
      <div className="px-4 pb-3 pt-2">
        <Link
          href={`/tasks/${task.id}`}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-slate-100 bg-slate-50 py-2 text-[11px] font-medium text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}
