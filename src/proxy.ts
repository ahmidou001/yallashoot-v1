import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // 1. Canonical Host Redirect: yallahsoot.com -> www.yallahsoot.com
  if (host === "yallahsoot.com") {
    const redirectUrl = new URL(`https://www.yallahsoot.com${pathname}${search}`);
    return NextResponse.redirect(redirectUrl, 301);
  }

  // 2. Legacy URLs 301 Permanent Redirects (/ar/football/*)
  if (pathname.startsWith("/ar/football")) {
    if (pathname.startsWith("/ar/football/league")) {
      const redirectUrl = new URL(`https://www.yallahsoot.com/standings${search}`);
      return NextResponse.redirect(redirectUrl, 301);
    }

    if (pathname.startsWith("/ar/football/player") || pathname.startsWith("/ar/football")) {
      const redirectUrl = new URL(`https://www.yallahsoot.com/${search}`);
      return NextResponse.redirect(redirectUrl, 301);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, sw.js, static files
     */
    "/((?!api|_next/static|_next/image|fav-icon.svg|manifest.json|sw.js).*)",
  ],
};
