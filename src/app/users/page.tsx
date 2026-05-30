import { getSession } from "@/lib/session";
import { encrypt } from "@/lib/session";
import { getAllUsers } from "@/services/userService";
import { AppShell } from "@/components/shared/AppShell";
import { UsersClient } from "./UsersClient";

export default async function UsersPage() {
  const session = await getSession();
  if (!session) return null;

  const token = await encrypt({ userId: session.userId, email: session.email, name: session.name, role: session.role, expiresAt: session.expiresAt });

  if (session.role !== "ADMIN") {
    return (
      <AppShell role={session.role} userName={session.name} token={token}>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-2xl">🔒</div>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Akses Ditolak</h1>
          <p className="mt-2 text-sm text-slate-600">Halaman ini hanya dapat diakses oleh Administrator.</p>
        </div>
      </AppShell>
    );
  }

  const rawUsers = await getAllUsers();
  // Serialize Date objects to strings for client component
  const users = rawUsers.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }));

  return (
    <AppShell role={session.role} userName={session.name} token={token}>
      <UsersClient initialUsers={users} currentUserId={session.userId} />
    </AppShell>
  );
}
