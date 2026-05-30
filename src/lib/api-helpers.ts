import "server-only";
import { getSession } from "./session";
import type { SessionPayload } from "./session";

export function ok<T>(data: T, status = 200): Response {
  return Response.json({ data }, { status });
}

export function okPaginated<T>(
  data: T[],
  meta: { page: number; perPage: number; total: number; totalPages: number }
): Response {
  return Response.json({ data, meta });
}

export function err(code: string, message: string, status: number): Response {
  return Response.json({ error: { code, message } }, { status });
}

export function validationErr(
  fields: { field: string; message: string }[]
): Response {
  return Response.json(
    {
      error: {
        code: "VALIDATION_ERROR",
        message: "Data yang dikirim tidak valid",
        fields,
      },
    },
    { status: 422 }
  );
}

export async function requireAuth(): Promise<SessionPayload | Response> {
  const session = await getSession();
  if (!session) {
    return err("UNAUTHORIZED", "Autentikasi diperlukan", 401);
  }
  return session;
}

export async function requireAdmin(): Promise<SessionPayload | Response> {
  const session = await getSession();
  if (!session) {
    return err("UNAUTHORIZED", "Autentikasi diperlukan", 401);
  }
  if (session.role !== "ADMIN") {
    return err("FORBIDDEN", "Akses ditolak: hanya Admin yang diizinkan", 403);
  }
  return session;
}

export function isResponse(val: unknown): val is Response {
  return val instanceof Response;
}

/** Serialize a Prisma object (convert Date → ISO string) */
export function serialize<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** Emit a Socket.io event if io is available */
export function emitEvent(event: string, payload: unknown): void {
  const io = (global as Record<string, unknown>).io as
    | { emit: (e: string, p: unknown) => void }
    | undefined;
  if (io) {
    io.emit(event, payload);
  }
}
