import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { isOwnerSession } from "@/lib/owner-policy";
import { OwnerLoginForm } from "./login-form";

export const metadata: Metadata = { title: "Owner sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function LoginPage() {
  const configured = Boolean(process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim()) && Boolean(process.env.DATABASE_URL);
  let session = null;
  let unavailable = !configured;
  if (configured) {
    try {
      session = await auth();
    } catch {
      // Never expose database details or session tokens on the public login page.
      unavailable = true;
      console.error("Owner sign-in session lookup failed.");
    }
  }
  if (isOwnerSession(session)) redirect("/admin/cars");
  return <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-6 py-16 text-slate-950">
    <ShieldCheck aria-hidden="true" className="mb-5 size-9 text-sky-800" />
    <p className="text-sm text-slate-500">NordicDrive</p>
    <h1 className="mt-2 text-3xl font-semibold">Owner sign in</h1>
    <p className="mt-3 text-sm text-slate-600">Private catalogue administration. Access is restricted to the site owner.</p>
    {unavailable ? <p role="status" className="mt-8 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">Owner sign-in is temporarily unavailable. You can still browse and compare cars. Please try again later.</p> : <OwnerLoginForm />}
  </main>;
}
