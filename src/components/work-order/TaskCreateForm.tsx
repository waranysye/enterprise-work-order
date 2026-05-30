"use client";

import { useState } from "react";

interface Member {
  id: string;
  name: string;
  email: string;
}

interface Props {
  workOrderId: string;
  members: Member[];
}

export function TaskCreateForm({ workOrderId, members }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (typeof value === "string") data[key] = value;
    });
    if (data.deadline === "") {
      delete data.deadline;
    }

    try {
      const res = await fetch(`/api/work-orders/${workOrderId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "Gagal membuat task");
      window.location.reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal membuat task");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="task-title" className="block text-sm font-medium text-slate-700 mb-2">
          Judul Task <span className="text-rose-500">*</span>
        </label>
        <input
          id="task-title"
          name="title"
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
          rows={3}
          placeholder="Deskripsi singkat task..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
        />
      </div>

      <div>
        <label htmlFor="task-assignee" className="block text-sm font-medium text-slate-700 mb-2">
          Assignee <span className="text-rose-500">*</span>
        </label>
        {members.length > 0 ? (
          <select
            id="task-assignee"
            name="assigneeId"
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Pilih anggota tim...</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.email}
              </option>
            ))}
          </select>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Tidak ada anggota aktif. Tambahkan member terlebih dahulu.
          </div>
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
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving || members.length === 0}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {saving ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Menyimpan...
          </>
        ) : "Buat Task"}
      </button>
    </form>
  );
}
