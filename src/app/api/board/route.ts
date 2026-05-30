import { NextRequest } from "next/server";
import { requireAuth, isResponse, ok, serialize } from "@/lib/api-helpers";
import { getBoardTasks } from "@/services/taskService";

export async function GET(request: NextRequest) {
  const session = await requireAuth();
  if (isResponse(session)) return session;

  const { searchParams } = request.nextUrl;
  const workOrderId = searchParams.get("workOrderId");
  const assigneeId = searchParams.get("assigneeId");

  const tasks = await getBoardTasks({
    workOrderId: workOrderId ?? undefined,
    assigneeId: assigneeId ?? undefined,
  });

  return ok(serialize(tasks));
}
