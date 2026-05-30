import { NextRequest } from "next/server";
import { requireAdmin, isResponse, okPaginated, err, serialize } from "@/lib/api-helpers";
import { getLogs } from "@/services/activityLogService";
import type { ActionType } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (isResponse(session)) return session;

  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;
  const actionType = searchParams.get("actionType") as ActionType | null;
  const userId = searchParams.get("userId") ?? undefined;

  if (isNaN(page) || page < 1) {
    return err("BAD_REQUEST", "Parameter page tidak valid", 400);
  }

  const result = await getLogs({
    page,
    perPage: 50,
    dateFrom,
    dateTo,
    actionType: actionType ?? undefined,
    userId,
  });

  return okPaginated(serialize(result.logs), {
    page: result.page,
    perPage: result.perPage,
    total: result.total,
    totalPages: result.totalPages,
  });
}
