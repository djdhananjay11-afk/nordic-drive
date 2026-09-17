"use client";
import { useActionState } from "react";
import { LockKeyhole, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginOwner } from "./actions";

export function OwnerLoginForm() {
  const [state, action, pending] = useActionState(loginOwner, { error: "" });
  return <form action={action} className="mt-8 grid gap-5">
    <label className="grid gap-2 text-sm font-medium" htmlFor="owner-email">Email
      <input id="owner-email" name="email" type="email" autoComplete="username" required maxLength={254} className="h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-950 focus:outline-2 focus:outline-offset-2 focus:outline-sky-700" />
    </label>
    <label className="grid gap-2 text-sm font-medium" htmlFor="owner-password">Password
      <input id="owner-password" name="password" type="password" autoComplete="current-password" required maxLength={128} className="h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-950 focus:outline-2 focus:outline-offset-2 focus:outline-sky-700" />
    </label>
    {state.error && <p role="alert" className="text-sm leading-6 text-red-700">{state.error}</p>}
    <Button type="submit" disabled={pending} className="h-12 bg-slate-950 text-white">{pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <LockKeyhole className="mr-2 size-4" />}{pending ? "Signing in..." : "Sign in"}</Button>
  </form>;
}
