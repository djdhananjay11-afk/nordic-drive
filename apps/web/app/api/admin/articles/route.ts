import { apiData, parseJson, requireAdminPermission } from "@/lib/admin/route-helpers";
import { articleSchema } from "@/lib/admin/validators";
import { createAdminArticle, listAdminArticles } from "@/lib/admin/services";

export async function GET() {
  const authResult = await requireAdminPermission("read", "article");
  if ("error" in authResult) return authResult.error;

  return apiData(await listAdminArticles());
}

export async function POST(request: Request) {
  const authResult = await requireAdminPermission("create", "article");
  if ("error" in authResult) return authResult.error;

  const parsed = await parseJson(request, articleSchema);
  if ("error" in parsed) return parsed.error;

  return apiData(await createAdminArticle(parsed.data), { status: 201 });
}
