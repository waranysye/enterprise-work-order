import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Work Order Dashboard | GMF",
  description: "Internal Work Order & Task Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full antialiased selection:bg-blue-500/30">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "rounded-2xl border border-slate-200 shadow-lg shadow-slate-900/10 font-medium text-sm",
              success: "bg-emerald-50 text-emerald-900 border-emerald-200",
              error: "bg-rose-50 text-rose-900 border-rose-200",
            },
          }}
        />
      </body>
    </html>
  );
}
