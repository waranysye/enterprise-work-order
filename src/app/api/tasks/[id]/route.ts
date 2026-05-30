import { NextRequest } from "next/server";
import { requireAuth, isResponse, ok, validationErr, err, serialize, emitEvent } from "@/lib/api-helpers";
import { UpdateTaskSchema } from "@/lib/validations/task";
import { updateTask, deleteTask } from "@/services/taskService";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (isResponse(session)) return session;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return err("BAD_REQUEST", "Body tidak valid", 400);

  const parsed = UpdateTaskSchema.safeParse(body);
  if (!parsed.success) {
    const fields = Object.entries(parsed.error.flatten().fieldErrors).map(
      ([field, messages]) => ({ field, message: messages?.[0] ?? "Invalid" })
    );
    return validationErr(fields);
  }

  try {
    const task = await updateTask(id, {
      ...parsed.data,
      performedBy: session.name,
      userId: session.userId,
      requestorId: session.userId,
      requestorRole: session.role,
    });
    if (!task) return err("NOT_FOUND", "Task tidak ditemukan", 404);

    const serialized = serialize(task);
    emitEvent("task:updated", serialized);
    return ok(serialized);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Gagal memperbarui task";
    const status = msg.includes("izin") ? 403 : 400;
    return err("BAD_REQUEST", msg, status);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (isResponse(session)) return session;

  if (session.role !== "ADMIN") {
    return err("FORBIDDEN", "Hanya Admin yang dapat menghapus task", 403);
  }

  const { id } = await params;
  const task = await deleteTask(id, session.name, session.userId);
  if (!task) return err("NOT_FOUND", "Task tidak ditemukan", 404);

  emitEvent("task:deleted", { taskId: id, workOrderId: task.workOrderId });
  return ok({ success: true });
}
