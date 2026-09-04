import { apiData, parseJson, requireAdminPermission } from "@/lib/admin/route-helpers";
import { carSchema } from "@/lib/admin/validators";
import { createAdminCar, listAdminCars } from "@/lib/admin/services";

export async function GET() {
  const authResult = await requireAdminPermission("read", "car");
  if ("error" in authResult) return authResult.error;

  return apiData(await listAdminCars());
}

export async function POST(request: Request) {
  const authResult = await requireAdminPermission("create", "car");
  if ("error" in authResult) return authResult.error;

  const parsed = await parseJson(request, carSchema);
  if ("error" in parsed) return parsed.error;

  return apiData(await createAdminCar(parsed.data), { status: 201 });
}
