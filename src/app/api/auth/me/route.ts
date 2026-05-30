import { getSession } from "@/lib/session";
import { err } from "@/lib/api-helpers";

export async function GET() {
  const session = await getSession();
  if (!session) return err("UNAUTHORIZED", "Tidak terautentikasi", 401);

  return Response.json({
    data: {
      userId: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
    },
  });
}
