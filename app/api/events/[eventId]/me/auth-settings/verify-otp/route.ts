import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentParticipant } from "@/lib/participant-session";
import { verifyParticipantOtp } from "@/lib/email-auth-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await context.params;
  const participant = await getCurrentParticipant(eventId);

  if (!participant) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const email = participant.person.email;
  if (!email) {
    return NextResponse.json({ error: "メールアドレスがありません。" }, { status: 400 });
  }

  const body = (await request.json()) as { code?: unknown };
  const code = typeof body.code === "string" ? body.code.trim() : "";

  const valid = await verifyParticipantOtp({
    personId: participant.personId,
    email,
    purpose: "VERIFY_EMAIL",
    code,
  });

  if (!valid) {
    return NextResponse.json(
      { error: "OTPが正しくないか、有効期限が切れています。" },
      { status: 401 },
    );
  }

  await prisma.person.update({
    where: { id: participant.personId },
    data: {
      emailVerifiedAt: new Date(),
      emailOtpEnabled: true,
    },
  });

  return NextResponse.json({ success: true });
}
