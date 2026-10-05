import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  isValidAdminSession,
} from "@/lib/admin-auth";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const authenticated = await isValidAdminSession(session);

  if (pathname === "/admin/login") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && !authenticated) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
