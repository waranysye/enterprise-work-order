import { NextRequest } from "next/server";
import { requireAuth, requireAdmin, isResponse, ok, validationErr, err, serialize, emitEvent } from "@/lib/api-helpers";
import { CreateWorkOrderSchema } from "@/lib/validations/work-order";
import { createWorkOrder, getWorkOrders } from "@/services/workOrderService";
import type { Priority } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await requireAuth();
  if (isResponse(session)) return session;

  const { searchParams } = request.nextUrl;
  const priority = searchParams.get("priority") as Priority | null;
  const sortBy = (searchParams.get("sortBy") as "createdAt" | "deadline") ?? "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc";

  const workOrders = await getWorkOrders({ priority: priority ?? undefined, sortBy, sortOrder });
  return ok(serialize(workOrders));
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (isResponse(session)) return session;

  const body = await request.json().catch(() => null);
  if (!body) return err("BAD_REQUEST", "Body tidak valid", 400);

  const parsed = CreateWorkOrderSchema.safeParse(body);
  if (!parsed.success) {
    const fields = Object.entries(parsed.error.flatten().fieldErrors).map(
      ([field, messages]) => ({ field, message: messages?.[0] ?? "Invalid" })
    );
    return validationErr(fields);
  }

  const workOrder = await createWorkOrder(undefined, {
    ...parsed.data,
    performedBy: session.name,
    userId: session.userId,
  });

  const serialized = serialize(workOrder);
  emitEvent("workorder:created", serialized);
  return ok(serialized, 201);
}
