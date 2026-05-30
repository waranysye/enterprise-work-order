import { NextRequest } from "next/server";
import { LoginSchema } from "@/lib/validations/auth";
import { verifyCredentials } from "@/services/userService";
import { createSession } from "@/lib/session";
import { err, validationErr } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return err("BAD_REQUEST", "Body tidak valid", 400);

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    const fields = Object.entries(parsed.error.flatten().fieldErrors).map(
      ([field, messages]) => ({ field, message: messages?.[0] ?? "Invalid" })
    );
    return validationErr(fields);
  }

  const { email, password } = parsed.data;
  const result = await verifyCredentials(email, password);

  if (!result) {
    return err("INVALID_CREDENTIALS", "Email atau password salah", 401);
  }

  if ("error" in result && result.error === "inactive") {
    return err("ACCOUNT_DISABLED", "Akun Anda telah dinonaktifkan", 403);
  }

  if ("id" in result) {
    await createSession({
      userId: result.id,
      email: result.email,
      name: result.name,
      role: result.role,
    });

    return Response.json({
      data: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
      },
    });
  }

  return err("INTERNAL_ERROR", "Terjadi kesalahan", 500);
}
