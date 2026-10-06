import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentParticipant } from "@/lib/participant-session";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await context.params;
  const participant = await getCurrentParticipant(eventId);

  if (!participant) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const body = (await request.json()) as { emailOtpEnabled?: unknown };
  if (body.emailOtpEnabled !== false) {
    return NextResponse.json(
      { error: "OTPを有効にする場合はメール確認が必要です。" },
      { status: 400 },
    );
  }

  await prisma.person.update({
    where: { id: participant.personId },
    data: { emailOtpEnabled: false },
  });

  return NextResponse.json({ success: true });
}
