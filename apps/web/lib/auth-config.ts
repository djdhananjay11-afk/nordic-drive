import type { NextAuthConfig } from "next-auth";
import { isOwnerEmail } from "./owner-policy";

// Keep Node crypto and Prisma out of the Next.js 15 edge middleware bundle.
export const authConfig = {
  secret: process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim(),
  providers: [],
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role ?? "user";
        session.user.ownerAuthenticated = token.ownerAuthenticated === true && isOwnerEmail(token.email);
        session.user.permissions = session.user.ownerAuthenticated ? ["manage:all"] : [];
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
