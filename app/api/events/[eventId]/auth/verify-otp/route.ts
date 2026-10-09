import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeEmail } from "@/lib/participant-auth";
import { verifyParticipantOtp } from "@/lib/email-auth-service";
import {
  attachParticipantSessionCookie,
  createParticipantSession,
} from "@/lib/participant-session";

export async function POST(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await context.params;
  const body = (await request.json()) as { email?: unknown; code?: unknown };
  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";

  const person = await prisma.person.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
      isHidden: false,
      emailOtpEnabled: true,
      emailVerifiedAt: { not: null },
      eventPeople: { some: { eventId } },
    },
    select: { id: true, email: true },
  });

  if (!person?.email) {
    return NextResponse.json({ error: "認証情報が正しくありません。" }, { status: 401 });
  }

  const valid = await verifyParticipantOtp({
    personId: person.id,
    email: person.email,
    eventId,
    purpose: "LOGIN",
    code,
  });

  if (!valid) {
    return NextResponse.json({ error: "OTPが正しくないか、有効期限が切れています。" }, { status: 401 });
  }

  const session = await createParticipantSession(eventId, person.id);
  const response = NextResponse.json({ success: true });
  attachParticipantSessionCookie(
    response,
    eventId,
    session.rawToken,
    session.expiresAt,
  );
  return response;
}
