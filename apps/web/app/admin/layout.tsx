import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await auth();

  if (!isAdminRole(session?.user?.role)) {
    redirect("/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
