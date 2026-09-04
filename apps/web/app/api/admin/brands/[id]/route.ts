import { apiData, apiDeleted, parseJson, requireAdminPermission } from "@/lib/admin/route-helpers";
import { brandSchema } from "@/lib/admin/validators";
import { deleteAdminBrand, updateAdminBrand } from "@/lib/admin/services";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("update", "brand");
  if ("error" in authResult) return authResult.error;

  const parsed = await parseJson(request, brandSchema.partial());
  if ("error" in parsed) return parsed.error;

  const { id } = await context.params;
  return apiData(await updateAdminBrand(id, parsed.data));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("delete", "brand");
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  await deleteAdminBrand(id);

  return apiDeleted();
}
