"use client";

import { useState } from "react";
import type { TaskWithRelations } from "@/types";

interface Member {
  id: string;
  name: string;
  email: string;
}

const STATUS_OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Selesai" },
  { value: "BLOCKED", label: "Blocked" },
];

export function TaskForm({
  initial,
  role,
  members = [],
}: {
  initial?: Partial<TaskWithRelations>;
  role: "ADMIN" | "MEMBER";
  members?: Member[];
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const rawData: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (typeof value === "string") rawData[key] = value;
    });

    const data: Record<string, unknown> = {};
    if (role === "MEMBER") {
      data.status = rawData.status;
    } else {
      data.title = rawData.title;
      data.description = rawData.description;
      data.assigneeId = rawData.assigneeId;
      data.status = rawData.status;
      if (rawData.deadline && rawData.deadline !== "") {
        data.deadline = new Date(rawData.deadline).toISOString();
      }
    }

    try {
      const method = initial?.id ? "PATCH" : "POST";
      const url = initial?.id ? `/api/tasks/${initial.id}` : `/api/work-orders/${initial?.workOrderId}/tasks`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "Gagal menyimpan task");
      window.location.href = initial?.id ? `/tasks/${initial.id}` : `/work-orders/${initial?.workOrderId}`;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan task");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {role === "ADMIN" && (
        <>
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-slate-700 mb-2">
              Judul <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title"
              name="title"
              defaultValue={initial?.title ?? ""}
              required
              maxLength={200}
              placeholder="Nama task..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="task-description" className="block text-sm font-medium text-slate-700 mb-2">
              Deskripsi
            </label>
            <textarea
              id="task-description"
              name="description"
              defaultValue={initial?.description ?? ""}
              rows={4}
              placeholder="Deskripsi task..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-assignee" className="block text-sm font-medium text-slate-700 mb-2">
                Assignee <span className="text-rose-500">*</span>
              </label>
              {members.length > 0 ? (
                <select
                  id="task-assignee"
                  name="assigneeId"
                  defaultValue={initial?.assigneeId ?? ""}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Pilih anggota...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="task-assignee"
                  name="assigneeId"
                  defaultValue={initial?.assigneeId ?? ""}
                  required
                  placeholder="User ID assignee..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              )}
            </div>

            <div>
              <label htmlFor="task-deadline" className="block text-sm font-medium text-slate-700 mb-2">
                Deadline
              </label>
              <input
                id="task-deadline"
                name="deadline"
                type="datetime-local"
                defaultValue={
                  initial?.deadline
                    ? new Date(initial.deadline).toISOString().slice(0, 16)
                    : ""
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </>
      )}

      <div>
        <label htmlFor="task-status" className="block text-sm font-medium text-slate-700 mb-2">
          Status
        </label>
        <select
          id="task-status"
          name="status"
          defaultValue={initial?.status ?? "TODO"}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {saving ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Menyimpan...
            </>
          ) : initial?.id ? "Simpan Perubahan" : "Buat Task"}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
