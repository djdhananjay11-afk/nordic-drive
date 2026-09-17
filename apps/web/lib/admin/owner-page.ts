import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isOwnerSession } from "@/lib/owner-policy";

export async function requireOwnerPage() {
  if (!isOwnerSession(await auth())) redirect("/login");
}
