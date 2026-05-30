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
          {/* Subtle top indicator bar based on role */}
          <div className={`h-1 w-full ${role === "ADMIN" ? "bg-gradient-to-r from-blue-600 to-indigo-600" : "bg-gradient-to-r from-teal-500 to-emerald-500"}`} />
          <header className={`sticky top-0 z-30 glass-panel border-b-0 px-6 py-4 shadow-sm ${role === "ADMIN" ? "shadow-blue-900/5" : "shadow-teal-900/5"}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className={`flex h-2 w-2 rounded-full ${role === "ADMIN" ? "bg-blue-500" : "bg-teal-500"}`}></span>
                <div className="text-sm font-medium text-slate-500 tracking-wide uppercase">Workspace Enterprise</div>
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
