import { NextRequest } from "next/server";
import { requireAuth, requireAdmin, isResponse, ok, validationErr, err, serialize, emitEvent } from "@/lib/api-helpers";
import { UpdateWorkOrderSchema } from "@/lib/validations/work-order";
import { getWorkOrderById, updateWorkOrder, deleteWorkOrder } from "@/services/workOrderService";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (isResponse(session)) return session;

  const { id } = await params;
  const workOrder = await getWorkOrderById(id);
  if (!workOrder) return err("NOT_FOUND", "Work order tidak ditemukan", 404);

  return ok(serialize(workOrder));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (isResponse(session)) return session;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return err("BAD_REQUEST", "Body tidak valid", 400);

  const parsed = UpdateWorkOrderSchema.safeParse(body);
  if (!parsed.success) {
    const fields = Object.entries(parsed.error.flatten().fieldErrors).map(
      ([field, messages]) => ({ field, message: messages?.[0] ?? "Invalid" })
    );
    return validationErr(fields);
  }

  try {
    const workOrder = await updateWorkOrder(id, {
      ...parsed.data,
      performedBy: session.name,
      userId: session.userId,
    });
    const serialized = serialize(workOrder);
    emitEvent("workorder:updated", serialized);
    return ok(serialized);
  } catch {
    return err("NOT_FOUND", "Work order tidak ditemukan", 404);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (isResponse(session)) return session;

  const { id } = await params;
  const result = await deleteWorkOrder(id, session.name, session.userId);
  if (!result) return err("NOT_FOUND", "Work order tidak ditemukan", 404);

  emitEvent("workorder:deleted", { workOrderId: id });
  return ok({ success: true });
}
