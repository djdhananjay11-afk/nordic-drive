import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { passwordVersion, verifyPassword } from "@nordicdrive/database";
import { prisma } from "@/lib/db";
import { authConfig } from "./auth-config";
import { isOwnerEmail, ownerEmail } from "./owner-policy";

const credentialsSchema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(128) });

async function reserveLoginAttempt() {
  // One persistent owner bucket prevents distributed/serverless password guessing.
  const rows = await prisma.$queryRaw<Array<{ attempts: number }>>`
    INSERT INTO "LoginThrottle" ("key", "attempts", "resetAt")
    VALUES ('owner', 1, CURRENT_TIMESTAMP + INTERVAL '15 minutes')
    ON CONFLICT ("key") DO UPDATE SET
      "attempts" = CASE WHEN "LoginThrottle"."resetAt" <= CURRENT_TIMESTAMP THEN 1 ELSE LEAST("LoginThrottle"."attempts" + 1, 11) END,
      "resetAt" = CASE WHEN "LoginThrottle"."resetAt" <= CURRENT_TIMESTAMP THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes' ELSE "LoginThrottle"."resetAt" END
    RETURNING "attempts"`;
  return (rows[0]?.attempts ?? 11) <= 10;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Credentials({
    credentials: { email: { type: "email" }, password: { type: "password" } },
    async authorize(input) {
      const parsed = credentialsSchema.safeParse(input);
      if (!parsed.success || !(await reserveLoginAttempt())) return null;
      const user = await prisma.user.findUnique({ where: { email: ownerEmail() }, include: { role: true } });
      const validPassword = await verifyPassword(parsed.data.password, user?.passwordHash ?? null);
      if (!validPassword || !isOwnerEmail(parsed.data.email) || !user || user.deletedAt || user.role?.deletedAt || user.role?.slug !== "super_admin") return null;
      return { id: user.id, email: user.email, name: user.name };
    },
  })],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      const id = user?.id ?? token.sub;
      if (!id) return null;
      const current = await prisma.user.findUnique({ where: { id }, include: { role: true } });
      if (!current?.passwordHash || current.deletedAt || current.role?.deletedAt || current.role?.slug !== "super_admin" || !isOwnerEmail(current.email)) return null;
      const version = passwordVersion(current.passwordHash);
      if (!user && token.credentialVersion !== version) return null;
      token.sub = current.id;
      token.email = current.email;
      token.role = "super_admin";
      token.ownerAuthenticated = true;
      token.credentialVersion = version;
      return token;
    },
  },
});
