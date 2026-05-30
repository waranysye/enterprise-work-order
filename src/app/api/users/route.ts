import { NextRequest } from "next/server";
import { requireAdmin, isResponse, ok, validationErr, err } from "@/lib/api-helpers";
import { CreateUserSchema } from "@/lib/validations/user";
import { createUser, getAllUsers } from "@/services/userService";

export async function GET() {
  const session = await requireAdmin();
  if (isResponse(session)) return session;

  const users = await getAllUsers();
  return ok(users);
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (isResponse(session)) return session;

  const body = await request.json().catch(() => null);
  if (!body) return err("BAD_REQUEST", "Body tidak valid", 400);

  const parsed = CreateUserSchema.safeParse(body);
  if (!parsed.success) {
    const fields = Object.entries(parsed.error.flatten().fieldErrors).map(
      ([field, messages]) => ({ field, message: messages?.[0] ?? "Invalid" })
    );
    return validationErr(fields);
  }

  try {
    const user = await createUser(parsed.data);
    return ok(user, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Gagal membuat user";
    return err("CONFLICT", msg, 409);
  }
}
