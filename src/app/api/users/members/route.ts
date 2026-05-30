import { requireAuth, isResponse, ok } from "@/lib/api-helpers";
import { getActiveMembers } from "@/services/userService";

export async function GET() {
  const session = await requireAuth();
  if (isResponse(session)) return session;

  const members = await getActiveMembers();
  return ok(members);
}
