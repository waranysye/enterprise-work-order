"use client";

import { useState } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MEMBER";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  initialUsers: User[];
  currentUserId: string;
}

export function UsersClient({ initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function toggleActive(user: User) {
    if (user.id === currentUserId) {
      toast.error("Anda tidak dapat menonaktifkan akun Anda sendiri");
      return;
    }
    setLoadingId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "Gagal memperbarui user");
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)));
      toast.success(`Akun ${user.name} berhasil ${!user.isActive ? "diaktifkan" : "dinonaktifkan"}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal memperbarui user");
    } finally {
      setLoadingId(null);
    }
  }

  const activeCount = users.filter((u) => u.isActive).length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Administrasi</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Manajemen User</h1>
            <p className="mt-2 text-sm text-slate-600">Kelola akun anggota tim dan status akses mereka.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              {users.length} user
            </span>
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              {activeCount} aktif
            </span>
            <span className="rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
              {adminCount} admin
            </span>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="grid gap-4 lg:grid-cols-2">
        {users.map((user) => {
          const isSelf = user.id === currentUserId;
          const isLoading = loadingId === user.id;

          return (
            <div
              key={user.id}
              className={`rounded-[1.75rem] border bg-white p-6 shadow-sm shadow-slate-900/5 transition ${
                user.isActive ? "border-slate-200" : "border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    user.role === "ADMIN" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                      {isSelf && (
                        <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                          Anda
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${
                    user.role === "ADMIN"
                      ? "bg-violet-50 text-violet-700"
                      : "bg-slate-100 text-slate-700"
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-xl bg-slate-100 px-3 py-1.5">
                    Bergabung: {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span className={`rounded-xl px-3 py-1.5 font-medium ${
                    user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {user.isActive ? "● Aktif" : "○ Nonaktif"}
                  </span>
                </div>

                {!isSelf && (
                  <button
                    onClick={() => toggleActive(user)}
                    disabled={isLoading}
                    className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      user.isActive
                        ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                        : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {isLoading ? (
                      <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : user.isActive ? (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        Nonaktifkan
                      </>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Aktifkan
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
