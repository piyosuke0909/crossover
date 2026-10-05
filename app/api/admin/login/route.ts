import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  getAdminSessionToken,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: NextRequest) {
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return NextResponse.redirect(
      new URL("/admin/login?error=config", request.url),
      { status: 303 },
    );
  }

  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  if (!safeEqual(password, expectedPassword)) {
    return NextResponse.redirect(
      new URL("/admin/login?error=invalid", request.url),
      { status: 303 },
    );
  }

  const sessionToken = await getAdminSessionToken();

  if (!sessionToken) {
    return NextResponse.redirect(
      new URL("/admin/login?error=config", request.url),
      { status: 303 },
    );
  }

  const response = NextResponse.redirect(new URL("/admin", request.url), {
    status: 303,
  });

  response.cookies.set(ADMIN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
