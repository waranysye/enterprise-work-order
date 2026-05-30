import { Sidebar } from "@/components/shared/Sidebar";
import { ConnectionStatus } from "@/components/shared/ConnectionStatus";
import { SocketProvider } from "@/providers/SocketProvider";

interface AppShellProps {
  role: "ADMIN" | "MEMBER";
  userName: string;
  children: React.ReactNode;
  token?: string;
}

export function AppShell({ role, userName, children, token }: AppShellProps) {
  const shell = (
    <div className="h-screen overflow-hidden bg-slate-100 text-slate-900">
      <div className="flex h-full">
        <Sidebar role={role} userName={userName} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="h-[2px] w-full shrink-0 bg-slate-900" />
          <header className="shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 z-30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-slate-900"></span>
                <div className="text-sm font-semibold text-slate-900 tracking-wide uppercase">Workspace Enterprise</div>
              </div>
              <ConnectionStatus />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="mx-auto w-full max-w-[1700px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );

  if (token) {
    return <SocketProvider token={token}>{shell}</SocketProvider>;
  }

  return shell;
}
