import { AdminPageHeader, AdminTable } from "@/components/admin/admin-shell";
import { ROLE_LABELS } from "@/lib/rbac";
import { listAdminUsers, listRoles } from "@/lib/admin/services";

export default async function AdminUsersPage() {
  const [users, roles] = await Promise.all([listAdminUsers(), listRoles()]);

  return (
    <>
      <AdminPageHeader
        description="Review accounts, RBAC roles, and production access levels. Role mutations are API-controlled."
        eyebrow="Access"
        title="User management"
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {roles.map((role) => (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={role.id}>
            <div className="text-lg font-semibold">
              {ROLE_LABELS[role.slug as keyof typeof ROLE_LABELS] ?? role.name}
            </div>
            <div className="mt-2 text-sm text-slate-500">{role.permissions.length} permissions</div>
          </div>
        ))}
      </div>
      <AdminTable
        columns={["User", "Email", "Role", "Locale", "Created"]}
        rows={users.map((user) => [
          <span className="font-semibold" key="user">
            {user.name ?? "Unnamed"}
          </span>,
          user.email,
          user.role?.name ?? "User",
          user.locale,
          user.createdAt.toLocaleDateString("nb-NO"),
        ])}
      />
    </>
  );
}
