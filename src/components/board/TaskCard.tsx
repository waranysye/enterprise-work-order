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

const PRIORITY_CONFIG: Record<string, { dot: string; label: string; bg: string; text: string }> = {
  LOW: { dot: "bg-emerald-400", label: "Low", bg: "bg-emerald-50", text: "text-emerald-700" },
  MEDIUM: { dot: "bg-amber-400", label: "Med", bg: "bg-amber-50", text: "text-amber-700" },
  HIGH: { dot: "bg-rose-500", label: "High", bg: "bg-rose-50", text: "text-rose-700" },
};

export function TaskCard({ task, currentUser, isDragging = false }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "DONE";
  const isOwn = currentUser.id === task.assigneeId;
  const priority = PRIORITY_CONFIG[task.workOrder.priority] ?? PRIORITY_CONFIG.MEDIUM;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-2xl border bg-white shadow-sm transition-all duration-200 ${
        isDragging || isSortableDragging
          ? "rotate-2 border-blue-300 opacity-95 shadow-xl ring-2 ring-blue-300/50 scale-105"
          : "border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab px-4 pt-4 pb-3 active:cursor-grabbing"
      >
        {/* Priority + WO title */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`h-2 w-2 shrink-0 rounded-full ${priority.dot}`} />
            <p className="text-[11px] font-medium text-slate-400 truncate">{task.workOrder.title}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${priority.bg} ${priority.text}`}>
            {priority.label}
          </span>
        </div>

        {/* Task title */}
        <h4 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 mb-2">
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-xs leading-5 text-slate-500 line-clamp-2 mb-3">{task.description}</p>
        )}

        {/* Meta chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Assignee */}
          <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
            isOwn ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
          }`}>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {isOwn ? "Anda" : task.assignee.name}
          </span>

          {/* Deadline */}
          {task.deadline && (
            <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
              isOverdue ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"
            }`}>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(task.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
            </span>
          )}

          {/* Overdue badge */}
          {isOverdue && (
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-700 uppercase tracking-wide">
              Terlambat
            </span>
          )}
        </div>
      </div>

      {/* Footer link */}
      <div className="border-t border-slate-100 px-4 py-2.5">
        <Link
          href={`/tasks/${task.id}`}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl py-1.5 text-[11px] font-semibold text-slate-400 transition hover:text-blue-600"
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
