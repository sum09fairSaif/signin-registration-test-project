import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicRoutes = [
    "/login",
    "/signup",
    "/verify-email",
    "/verify-login",
    "/reset-password",
  ];

  const isPublic = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublic) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

/* Apply to all routes */
export const config = {
  matcher: ["/((?!_next|favicon.ico|images).*)"],
};