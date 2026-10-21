import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let API proxy, Next internals, and static assets pass through
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const hasAccessToken = request.cookies.has("dt_access");
  const hasRefreshToken = request.cookies.has("dt_refresh");
  const isAuthenticated = hasAccessToken || hasRefreshToken;

  if (pathname === "/login") {
    if (isAuthenticated) {
      const nextUrl = request.nextUrl.searchParams.get("next") || "/dashboard";
      return NextResponse.redirect(new URL(nextUrl, request.url));
    }
    return NextResponse.next();
  }

  // Protected pages: redirect to login if no auth token is present
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
