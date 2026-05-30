import { Sidebar } from "@/components/shared/Sidebar";
import { ConnectionStatus } from "@/components/shared/ConnectionStatus";

interface AppShellProps {
  role: "ADMIN" | "MEMBER";
  userName: string;
  children: React.ReactNode;
}

export function AppShell({ role, userName, children }: AppShellProps) {
  return (
    <div className="min-h-screen text-slate-900">
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar role={role} userName={userName} />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="h-[2px] w-full bg-slate-900" />
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
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
}
