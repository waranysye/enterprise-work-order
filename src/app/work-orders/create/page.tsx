import { getSession } from "@/lib/session";
import { AppShell } from "@/components/shared/AppShell";
import { WorkOrderForm } from "@/components/work-order/WorkOrderForm";
import Link from "next/link";

export default async function WorkOrderCreatePage() {
  const session = await getSession();
  if (!session) return null;

  if (session.role !== "ADMIN") {
    return (
      <AppShell role={session.role} userName={session.name}>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-2xl">🔒</div>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Akses Ditolak</h1>
          <p className="mt-2 text-sm text-slate-600">Halaman ini hanya dapat diakses oleh Admin.</p>
          <Link href="/work-orders" className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
            ← Kembali ke Work Orders
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role={session.role} userName={session.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/work-orders" className="hover:text-blue-600 transition-colors">Work Orders</Link>
            <span>/</span>
            <span className="text-slate-700">Buat Baru</span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">Buat Work Order</h1>
          <p className="mt-1 text-sm text-slate-600">Isi detail work order baru untuk tim.</p>
        </div>

        {/* Form */}
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
          <WorkOrderForm />
        </div>
      </div>
    </AppShell>
  );
}
