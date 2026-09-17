import { apiData, requireAdminPermission } from "@/lib/admin/route-helpers";
import { carSaveSchema } from "@/lib/admin/car-schema";
import { getCarInventory, saveAdminCar } from "@/lib/admin/car-service";
import { adminError, readEditorJson } from "@/lib/admin/http";
import { z } from "zod";

export const runtime = "nodejs";
export async function GET(request: Request) {
  const result = await requireAdminPermission("read", "car");
  if ("error" in result) return result.error;
  try {
    const url = new URL(request.url);
    const query = z.string().max(120).parse(url.searchParams.get("q") ?? "");
    const page = z.coerce.number().int().min(1).max(10000).parse(url.searchParams.get("page") ?? 1);
    return apiData(await getCarInventory(query, page), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return adminError(error); }
}
export async function POST(request: Request) {
  const result = await requireAdminPermission("create", "car");
  if ("error" in result) return result.error;
  try {
    const input = carSaveSchema.parse(await readEditorJson(request));
    return apiData(await saveAdminCar(input), { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return adminError(error); }
}
