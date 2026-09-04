import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";

import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import type { PermissionAction, PermissionSubject } from "@nordicdrive/types";

type JsonResponseInit = Parameters<typeof NextResponse.json>[1];

export async function requireAdminPermission(action: PermissionAction, subject: PermissionSubject) {
  const session = await auth();

  if (!session?.user) {
    return { error: NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 }) };
  }

  if (!hasPermission(session.user.role, action, subject)) {
    return { error: NextResponse.json({ error: { code: "FORBIDDEN", message: "Insufficient permissions" } }, { status: 403 }) };
  }

  return { session };
}

export async function parseJson<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<{ data: T } | { error: NextResponse }> {
  try {
    return { data: schema.parse(await request.json()) };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        error: NextResponse.json(
          { error: { code: "VALIDATION_ERROR", message: "Invalid request payload", details: error.flatten() } },
          { status: 422 },
        ),
      };
    }

    return {
      error: NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON body" } }, { status: 400 }),
    };
  }
}

export function apiData<T>(data: T, init?: JsonResponseInit) {
  return NextResponse.json({ data }, init);
}

export function apiDeleted() {
  return NextResponse.json({ data: { deleted: true } });
}
