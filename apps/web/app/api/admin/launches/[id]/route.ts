import { apiData, apiDeleted, parseJson, requireAdminPermission } from "@/lib/admin/route-helpers";
import { deleteAdminLaunch, updateAdminLaunch } from "@/lib/admin/services";
import { launchSchema } from "@/lib/admin/validators";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("update", "launch");
  if ("error" in authResult) return authResult.error;

  const parsed = await parseJson(request, launchSchema.partial());
  if ("error" in parsed) return parsed.error;

  const { id } = await context.params;
  return apiData(await updateAdminLaunch(id, parsed.data));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("delete", "launch");
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  await deleteAdminLaunch(id);

  return apiDeleted();
}
