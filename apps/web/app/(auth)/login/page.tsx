import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { isOwnerSession } from "@/lib/owner-policy";
import { OwnerLoginForm } from "./login-form";

export const metadata: Metadata = { title: "Owner sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function LoginPage() {
  if (isOwnerSession(await auth())) redirect("/admin/cars");
  return <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-6 py-16 text-slate-950">
    <ShieldCheck aria-hidden="true" className="mb-5 size-9 text-sky-800" />
    <p className="text-sm text-slate-500">NordicDrive</p>
    <h1 className="mt-2 text-3xl font-semibold">Owner sign in</h1>
    <p className="mt-3 text-sm text-slate-600">Private catalogue administration. Access is restricted to the site owner.</p>
    <OwnerLoginForm />
  </main>;
}
