import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const allowedPaths = ["/login", "/api/auth/login", "/api/auth/logout"];
const sessionCookieName = "self-mgmt-session";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    allowedPaths.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  const sessionToken = process.env.APP_SESSION_TOKEN;
  const accessCode = process.env.APP_ACCESS_CODE;

  if (!sessionToken || !accessCode) {
    // 認証用の環境変数が未設定なら制限を無効化
    return NextResponse.next();
  }

  const cookie = request.cookies.get(sessionCookieName)?.value;
  if (cookie === sessionToken) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  if (pathname !== "/") {
    url.searchParams.set("redirect", pathname);
  }
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
