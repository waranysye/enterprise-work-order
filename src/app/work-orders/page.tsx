import { getSession } from "@/lib/session";
import { encrypt } from "@/lib/session";
import { getWorkOrders } from "@/services/workOrderService";
import { AppShell } from "@/components/shared/AppShell";
import { WorkOrdersClient } from "./WorkOrdersClient";

export default async function WorkOrdersPage() {
  const session = await getSession();
  if (!session) return null;

  const [workOrders, token] = await Promise.all([
    getWorkOrders({}),
    encrypt({ userId: session.userId, email: session.email, name: session.name, role: session.role, expiresAt: session.expiresAt }),
  ]);

  return (
    <AppShell role={session.role} userName={session.name} token={token}>
      <WorkOrdersClient workOrders={workOrders as Parameters<typeof WorkOrdersClient>[0]["workOrders"]} role={session.role} />
    </AppShell>
  );
}
