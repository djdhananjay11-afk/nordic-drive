"use server";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export async function loginOwner(_state: { error: string }, form: FormData) {
  try {
    await signIn("credentials", { email: form.get("email"), password: form.get("password"), redirectTo: "/admin/cars" });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Unable to sign in. Check your credentials, or wait 15 minutes if you have tried repeatedly." };
    throw error;
  }
  return { error: "" };
}
