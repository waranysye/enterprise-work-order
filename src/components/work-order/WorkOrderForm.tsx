"use client";

import { useState } from "react";
import type { SerializedWorkOrder } from "@/types";

const PRIORITY_CONFIG = {
  LOW: { label: "Low", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  MEDIUM: { label: "Medium", color: "bg-amber-50 text-amber-700 border-amber-200" },
  HIGH: { label: "High", color: "bg-rose-50 text-rose-700 border-rose-200" },
};

export function WorkOrderForm({ initial }: { initial?: Partial<SerializedWorkOrder> }) {
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
      const method = initial?.id ? "PATCH" : "POST";
      const url = initial?.id ? `/api/work-orders/${initial.id}` : `/api/work-orders`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "Gagal menyimpan work order");
      window.location.href = `/work-orders/${json.data?.id ?? initial?.id}`;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan work order");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="wo-title" className="block text-sm font-medium text-slate-700 mb-2">
          Judul <span className="text-rose-500">*</span>
        </label>
        <input
          id="wo-title"
          name="title"
          defaultValue={initial?.title ?? ""}
          required
          maxLength={200}
          placeholder="Nama work order..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label htmlFor="wo-description" className="block text-sm font-medium text-slate-700 mb-2">
          Deskripsi
        </label>
        <textarea
          id="wo-description"
          name="description"
          defaultValue={initial?.description ?? ""}
          rows={4}
          placeholder="Deskripsi singkat tentang work order ini..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="wo-priority" className="block text-sm font-medium text-slate-700 mb-2">
            Prioritas
          </label>
          <select
            id="wo-priority"
            name="priority"
            defaultValue={initial?.priority ?? "MEDIUM"}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {Object.entries(PRIORITY_CONFIG).map(([value, cfg]) => (
              <option key={value} value={value}>{cfg.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="wo-deadline" className="block text-sm font-medium text-slate-700 mb-2">
            Deadline
          </label>
          <input
            id="wo-deadline"
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
          ) : initial?.id ? "Simpan Perubahan" : "Buat Work Order"}
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
