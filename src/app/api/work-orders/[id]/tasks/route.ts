import { NextRequest } from "next/server";
import { requireAuth, requireAdmin, isResponse, ok, validationErr, err, serialize, emitEvent } from "@/lib/api-helpers";
import { CreateTaskSchema } from "@/lib/validations/task";
import { createTask, getTasksByWorkOrder } from "@/services/taskService";
import type { TaskStatus } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (isResponse(session)) return session;

  const { id } = await params;
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status") as TaskStatus | null;
  const assigneeId = searchParams.get("assigneeId");

  const tasks = await getTasksByWorkOrder(id, {
    status: status ?? undefined,
    assigneeId: assigneeId ?? undefined,
  });
  return ok(serialize(tasks));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (isResponse(session)) return session;

  const { id: workOrderId } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return err("BAD_REQUEST", "Body tidak valid", 400);

  const parsed = CreateTaskSchema.safeParse(body);
  if (!parsed.success) {
    const fields = Object.entries(parsed.error.flatten().fieldErrors).map(
      ([field, messages]) => ({ field, message: messages?.[0] ?? "Invalid" })
    );
    return validationErr(fields);
  }

  try {
    const task = await createTask({
      ...parsed.data,
      workOrderId,
      performedBy: session.name,
      userId: session.userId,
    });
    const serialized = serialize(task);
    emitEvent("task:created", serialized);
    return ok(serialized, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Gagal membuat task";
    return err("BAD_REQUEST", msg, 400);
  }
}
