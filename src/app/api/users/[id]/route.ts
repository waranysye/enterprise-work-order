import { NextRequest } from "next/server";
import { requireAdmin, isResponse, ok, validationErr, err } from "@/lib/api-helpers";
import { UpdateUserSchema } from "@/lib/validations/user";
import { updateUser } from "@/services/userService";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (isResponse(session)) return session;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return err("BAD_REQUEST", "Body tidak valid", 400);

  const parsed = UpdateUserSchema.safeParse(body);
  if (!parsed.success) {
    const fields = Object.entries(parsed.error.flatten().fieldErrors).map(
      ([field, messages]) => ({ field, message: messages?.[0] ?? "Invalid" })
    );
    return validationErr(fields);
  }

  try {
    const user = await updateUser(id, parsed.data);
    return ok(user);
  } catch {
    return err("NOT_FOUND", "User tidak ditemukan", 404);
  }
}
