import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { auth } from "@/lib/auth";
import { isOwnerSession } from "@/lib/owner-policy";

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

  if (!isOwnerSession(session)) {
    redirect("/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
