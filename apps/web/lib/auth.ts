import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/db";
import { stripLocaleFromPathname } from "@/lib/i18n/config";
import { isAdminRole, ROLE_PERMISSIONS } from "@/lib/rbac";

const configuredAuthSecret =
  process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim() || undefined;

const authSecret =
  configuredAuthSecret ??
  (process.env.NODE_ENV !== "production"
    ? "nordicdrive-local-development-secret-change-before-production"
    : undefined);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...(authSecret ? { secret: authSecret } : {}),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
    updateAge: 60 * 15,
  },
  providers: [
    GitHub({
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      const email = user?.email ?? token.email;

      if (email) {
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true, role: { select: { slug: true } } },
        });

        if (dbUser?.id) {
          token.sub = dbUser.id;
        }
        token.role = dbUser?.role?.slug ?? "user";
        token.permissions =
          ROLE_PERMISSIONS[token.role as keyof typeof ROLE_PERMISSIONS] ?? ROLE_PERMISSIONS.user;
      }

      if (account?.refresh_token) {
        token.providerRefreshToken = account.refresh_token;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string | undefined) ?? "user";
        session.user.permissions =
          (token.permissions as string[] | undefined) ?? ROLE_PERMISSIONS.user;
      }

      return session;
    },
    authorized({ auth, request }) {
      const pathname = stripLocaleFromPathname(request.nextUrl.pathname);

      if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        return isAdminRole(auth?.user?.role);
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
});
