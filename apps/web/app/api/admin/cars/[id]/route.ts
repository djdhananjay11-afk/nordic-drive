import { apiData, apiDeleted, parseJson, requireAdminPermission } from "@/lib/admin/route-helpers";
import { deleteAdminCar, updateAdminCar } from "@/lib/admin/services";
import { carSchema } from "@/lib/admin/validators";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("update", "car");
  if ("error" in authResult) return authResult.error;

  const parsed = await parseJson(request, carSchema.partial());
  if ("error" in parsed) return parsed.error;

  const { id } = await context.params;
  return apiData(await updateAdminCar(id, parsed.data));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("delete", "car");
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  await deleteAdminCar(id);

  return apiDeleted();
}
