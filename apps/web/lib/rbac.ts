import type { PermissionAction, PermissionSubject, UserRole } from "@nordicdrive/types";

export type Permission = `${PermissionAction}:${PermissionSubject}`;

export const ADMIN_ROLES: UserRole[] = ["super_admin", "editor", "content_manager"];

export const ROLE_LABELS = {
  super_admin: "Super Admin",
  editor: "Editor",
  content_manager: "Content Manager",
  user: "User",
} satisfies Record<UserRole, string>;

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: ["manage:all"],
  editor: [
    "read:admin",
    "read:analytics",
    "read:brand",
    "read:car",
    "create:car",
    "update:car",
    "read:launch",
    "create:launch",
    "update:launch",
    "read:article",
    "create:article",
    "update:article",
    "read:media",
    "create:media",
  ],
  content_manager: [
    "read:admin",
    "read:analytics",
    "read:brand",
    "update:brand",
    "read:car",
    "create:car",
    "update:car",
    "delete:car",
    "read:launch",
    "create:launch",
    "update:launch",
    "delete:launch",
    "read:article",
    "create:article",
    "update:article",
    "delete:article",
    "read:media",
    "create:media",
    "delete:media",
    "read:user",
  ],
  user: ["read:car", "read:article", "create:wishlist", "create:savedComparison"],
};

export function isAdminRole(role?: string | null): role is (typeof ADMIN_ROLES)[number] {
  return ADMIN_ROLES.includes(role as UserRole);
}

export function hasPermission(
  role: string | null | undefined,
  action: PermissionAction,
  subject: PermissionSubject,
) {
  const permissions: Permission[] = ROLE_PERMISSIONS[(role ?? "user") as UserRole] ?? ROLE_PERMISSIONS.user;

  return (
    permissions.includes("manage:all") ||
    permissions.includes(`manage:${subject}` as Permission) ||
    permissions.includes(`${action}:${subject}` as Permission)
  );
}

export function assertPermission(
  role: string | null | undefined,
  action: PermissionAction,
  subject: PermissionSubject,
) {
  if (!hasPermission(role, action, subject)) {
    throw new Error("FORBIDDEN");
  }
}
