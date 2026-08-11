import { NextResponse } from "next/server";

const COOKIE_NAME = process.env.NEXT_PUBLIC_SESSION_COOKIE || "loothat_session";

const PROTECTED_PREFIXES = [
  "/home",
  "/live-offers",
  "/offer-detail",
  "/report",
  "/detailed-report",
  "/wallet",
  "/my-profile",
  "/chat",
  "/custom-domains",
  "/admin",
  "/emp",
];

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected) {
    const hasSession = request.cookies.has(COOKIE_NAME);
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/live-offers/:path*",
    "/offer-detail/:path*",
    "/report/:path*",
    "/detailed-report/:path*",
    "/wallet/:path*",
    "/my-profile/:path*",
    "/chat/:path*",
    "/custom-domains/:path*",
    "/admin/:path*",
    "/emp/:path*",
  ],
};
