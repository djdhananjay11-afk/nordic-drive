import { apiData, parseJson, requireAdminPermission } from "@/lib/admin/route-helpers";
import { brandSchema } from "@/lib/admin/validators";
import { createAdminBrand, listAdminBrands } from "@/lib/admin/services";

export async function GET() {
  const authResult = await requireAdminPermission("read", "brand");
  if ("error" in authResult) return authResult.error;

  return apiData(await listAdminBrands());
}

export async function POST(request: Request) {
  const authResult = await requireAdminPermission("create", "brand");
  if ("error" in authResult) return authResult.error;

  const parsed = await parseJson(request, brandSchema);
  if ("error" in parsed) return parsed.error;

  return apiData(await createAdminBrand(parsed.data), { status: 201 });
}
