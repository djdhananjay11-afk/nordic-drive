import { apiData, apiDeleted, parseJson, requireAdminPermission } from "@/lib/admin/route-helpers";
import { articleSchema } from "@/lib/admin/validators";
import { deleteAdminArticle, updateAdminArticle } from "@/lib/admin/services";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("update", "article");
  if ("error" in authResult) return authResult.error;

  const parsed = await parseJson(request, articleSchema.partial());
  if ("error" in parsed) return parsed.error;

  const { id } = await context.params;
  return apiData(await updateAdminArticle(id, parsed.data));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("delete", "article");
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  await deleteAdminArticle(id);

  return apiDeleted();
}
