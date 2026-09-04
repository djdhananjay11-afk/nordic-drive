import Link from "next/link";
import type { Route } from "next";
import type * as React from "react";
import {
  BarChart3,
  BookOpenText,
  Boxes,
  CarFront,
  Image,
  LayoutDashboard,
  Megaphone,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { auth, signOut } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/rbac";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/cars", label: "Cars", icon: CarFront },
  { href: "/admin/brands", label: "Brands", icon: Boxes },
  { href: "/admin/media", label: "Media & 3D", icon: Image },
  { href: "/admin/launches", label: "Launches", icon: Megaphone },
  { href: "/admin/articles", label: "Articles", icon: BookOpenText },
  { href: "/admin/users", label: "Users", icon: UsersRound },
] as const;

export async function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const role = session?.user?.role ?? "user";

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white/78 p-4 backdrop-blur-2xl lg:block">
        <Link className="flex h-12 items-center gap-3 rounded-md px-3 font-semibold tracking-[0.16em]" href="/">
          NordicDrive
        </Link>
        <nav className="mt-8 grid gap-1">
          {navItems.map((item) => (
            <Link
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              href={item.href as Route}
              key={item.href}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/70 backdrop-blur-2xl">
          <div className="flex min-h-16 items-center justify-between gap-4 px-5 lg:px-8">
            <div>
              <div className="text-sm font-semibold">Admin Dashboard</div>
              <div className="text-xs text-slate-500">Production control center</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 sm:flex">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                {ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? "User"}
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button className="bg-slate-950 text-white hover:bg-slate-800" size="sm">
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </header>
        <main className={cn("px-5 py-8 lg:px-8")}>{children}</main>
      </div>
    </div>
  );
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-normal">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function AdminStatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className="grid size-9 place-items-center rounded-md bg-slate-950 text-white">
          <Icon className="size-4" />
        </div>
      </div>
      <div className="mt-6 text-3xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{detail}</div>
    </div>
  );
}

export function AdminTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Array<Array<React.ReactNode>>;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-[0.14em] text-slate-500">
              {columns.map((column) => (
                <th className="px-4 py-3 font-semibold" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr className="border-b border-slate-100 last:border-0" key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td className="px-4 py-4 align-middle" key={cellIndex}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminSearchBar({ placeholder = "Search" }: { placeholder?: string }) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:flex-row">
      <input
        className="h-10 flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
        placeholder={placeholder}
      />
      <select className="h-10 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none">
        <option>All statuses</option>
        <option>Published</option>
        <option>Draft</option>
      </select>
    </div>
  );
}

export function AdminBarChart({ values }: { values: Array<{ label: string; value: number }> }) {
  const max = Math.max(...values.map((item) => item.value), 1);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Comparison activity</h2>
          <p className="text-sm text-slate-500">Last 7 days</p>
        </div>
        <BarChart3 className="size-5 text-slate-400" />
      </div>
      <div className="flex h-52 items-end gap-3">
        {values.map((item) => (
          <div className="flex flex-1 flex-col items-center gap-2" key={item.label}>
            <div
              className="w-full rounded-t-md bg-slate-950"
              style={{ height: `${Math.max(12, (item.value / max) * 100)}%` }}
            />
            <div className="text-xs text-slate-500">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
