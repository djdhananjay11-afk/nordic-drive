import { NextResponse, type NextRequest } from "next/server";
import { isCuratedRelease } from "@/features/catalogue/config";
import { curatedRoutePolicy } from "@/features/catalogue/route-policy";

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { isOwnerSession } from "@/lib/owner-policy";
import {
  defaultLocale,
  getLocaleFromPathname,
  localizePath,
  stripLocaleFromPathname,
} from "@/lib/i18n/config";

function publicRouting(request: NextRequest) {
  const { nextUrl } = request;
  const { pathname } = nextUrl;
  if (isCuratedRelease()) {
    const policy = curatedRoutePolicy(stripLocaleFromPathname(pathname));
    if (policy === "unavailable")
      return NextResponse.json(
        { error: "This demo endpoint is not available in the starter catalogue." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    if (policy === "redirect")
      return NextResponse.redirect(
        new URL(
          localizePath(getLocaleFromPathname(pathname) ?? defaultLocale, "/cars"),
          request.url,
        ),
      );
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(localizePath(defaultLocale, "/"), request.url));
  }

  const locale = getLocaleFromPathname(pathname);

  if (!locale) {
    return NextResponse.next();
  }

  const rewrittenUrl = nextUrl.clone();
  rewrittenUrl.pathname = stripLocaleFromPathname(pathname);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nordicdrive-locale", locale);

  // Locale homepages have a real route: rewriting them to / re-enters its redirect.
  if (rewrittenUrl.pathname === "/") {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.rewrite(rewrittenUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}

const protectedRouting = NextAuth(authConfig).auth((request) => {
  // This Auth.js beta executes custom handlers even when authorized returns false.
  if (!isOwnerSession(request.auth)) {
    const path = stripLocaleFromPathname(request.nextUrl.pathname);
    if (path.startsWith("/api/") || request.auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: request.auth ? 403 : 401, headers: { "Cache-Control": "no-store" } },
      );
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("callbackUrl", request.nextUrl.href);
    return NextResponse.redirect(login);
  }
  return publicRouting(request);
});
export default function middleware(request: NextRequest) {
  const path = stripLocaleFromPathname(request.nextUrl.pathname);
  if (/^\/(admin|api\/admin)(\/|$)/.test(path)) return protectedRouting(request, {});
  return publicRouting(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)", "/api/admin/:path*"],
};
