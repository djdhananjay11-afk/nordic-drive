import { apiData, requireAdminPermission } from "@/lib/admin/route-helpers";
import { adminError, readEditorJson } from "@/lib/admin/http";
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

  try {
    const input = brandSchema.strict().parse(await readEditorJson(request));
    return apiData(await createAdminBrand(input), { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return adminError(error); }
}
