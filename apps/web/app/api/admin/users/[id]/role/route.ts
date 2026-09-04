import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { apiData, parseJson, requireAdminPermission } from "@/lib/admin/route-helpers";
import { userRoleSchema } from "@/lib/admin/validators";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("update", "user");
  if ("error" in authResult) return authResult.error;

  const parsed = await parseJson(request, userRoleSchema);
  if ("error" in parsed) return parsed.error;

  const role = await prisma.role.findFirst({
    where: { id: parsed.data.roleId, deletedAt: null },
  });

  if (!role) {
    return NextResponse.json({ error: { code: "ROLE_NOT_FOUND", message: "Role not found" } }, { status: 404 });
  }

  const { id } = await context.params;
  return apiData(
    await prisma.user.update({
      where: { id },
      data: { roleId: role.id },
      include: { role: true },
    }),
  );
}
