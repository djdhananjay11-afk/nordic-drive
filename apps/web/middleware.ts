import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  defaultLocale,
  getLocaleFromPathname,
  localizePath,
  stripLocaleFromPathname,
} from "@/lib/i18n/config";

export default auth((request) => {
  const { nextUrl } = request;
  const { pathname } = nextUrl;

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

  return NextResponse.rewrite(rewrittenUrl, {
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)", "/api/admin/:path*"],
};
