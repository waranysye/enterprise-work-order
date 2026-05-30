import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Sidebar } from "@/components/shared/Sidebar";
import { ConnectionStatus } from "@/components/shared/ConnectionStatus";
import { SocketProvider } from "@/providers/SocketProvider";
import { encrypt } from "@/lib/session";

export default async function BoardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const token = await encrypt({
    userId: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
    expiresAt: session.expiresAt,
  });

  return (
    <SocketProvider token={token}>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <div className="flex min-h-screen overflow-hidden">
          <Sidebar role={session.role} userName={session.name} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="border-b border-slate-200 bg-white/95 px-6 py-4 shadow-sm shadow-slate-900/5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-slate-500">Board real-time dan manajemen task</div>
                <ConnectionStatus />
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
              <div className="mx-auto w-full max-w-[1700px]">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </SocketProvider>
  );
}
