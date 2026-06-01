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
          {/* Top header bar */}
          <header className="shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 py-3 z-30 lg:px-6">
            <div className="flex items-center justify-between gap-4">
              {/* Left: spacer for mobile hamburger + branding */}
              <div className="flex items-center gap-3 pl-12 lg:pl-0">
                <div className="hidden lg:flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-slate-900" />
                  <span className="text-sm font-bold text-slate-900 tracking-widest uppercase">Workspace Enterprise</span>
                </div>
                <div className="lg:hidden text-sm font-bold text-slate-900 tracking-widest uppercase">
                  Workspace
                </div>
              </div>
              {/* Right: connection status */}
              <ConnectionStatus />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
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
