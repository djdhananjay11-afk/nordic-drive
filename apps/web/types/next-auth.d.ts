import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      permissions: string[];
      ownerAuthenticated: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    permissions?: string[];
    providerRefreshToken?: string;
    ownerAuthenticated?: boolean;
    credentialVersion?: string;
  }
}
