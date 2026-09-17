import { z } from "zod";
import { apiData, apiDeleted, requireAdminPermission } from "@/lib/admin/route-helpers";
import { carSaveSchema } from "@/lib/admin/car-schema";
import { archiveAdminCar, CarWriteError, getCarEditor, saveAdminCar } from "@/lib/admin/car-service";
import { adminError, readEditorJson } from "@/lib/admin/http";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  const result = await requireAdminPermission("read", "car");
  if ("error" in result) return result.error;
  try {
    const record = await getCarEditor(z.string().uuid().parse((await context.params).id));
    if (!record) throw new CarWriteError(404, "Car not found.");
    return apiData(record, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return adminError(error); }
}
export async function PATCH(request: Request, context: Context) {
  const result = await requireAdminPermission("update", "car");
  if ("error" in result) return result.error;
  try {
    const id = z.string().uuid().parse((await context.params).id);
    return apiData(await saveAdminCar(carSaveSchema.parse(await readEditorJson(request)), id), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return adminError(error); }
}
export async function DELETE(request: Request, context: Context) {
  const result = await requireAdminPermission("delete", "car");
  if ("error" in result) return result.error;
  try {
    const id = z.string().uuid().parse((await context.params).id);
    const input = z.object({ updatedAt: z.string().datetime() }).strict().parse(await readEditorJson(request));
    await archiveAdminCar(id, input.updatedAt);
    return apiDeleted();
  } catch (error) { return adminError(error); }
}
