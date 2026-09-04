import { apiData, parseJson, requireAdminPermission } from "@/lib/admin/route-helpers";
import { createAdminLaunch, listAdminLaunches } from "@/lib/admin/services";
import { launchSchema } from "@/lib/admin/validators";

export async function GET() {
  const authResult = await requireAdminPermission("read", "launch");
  if ("error" in authResult) return authResult.error;

  return apiData(await listAdminLaunches());
}

export async function POST(request: Request) {
  const authResult = await requireAdminPermission("create", "launch");
  if ("error" in authResult) return authResult.error;

  const parsed = await parseJson(request, launchSchema);
  if ("error" in parsed) return parsed.error;

  return apiData(await createAdminLaunch(parsed.data), { status: 201 });
}
