import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeEmail } from "@/lib/participant-auth";
import { sendParticipantOtp } from "@/lib/email-auth-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await context.params;
  const body = (await request.json()) as { email?: unknown };
  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";

  const event = await prisma.event.findFirst({
    where: { id: eventId, isActive: true, deletedAt: null },
    select: { id: true },
  });
  if (!event) {
    return NextResponse.json({ error: "この交流会にはログインできません。" }, { status: 404 });
  }

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
    return NextResponse.json(
      { error: "メールOTPが有効な参加者が見つかりません。再ログインIDをお試しください。" },
      { status: 404 },
    );
  }

  try {
    await sendParticipantOtp({
      personId: person.id,
      email: person.email,
      eventId,
      purpose: "LOGIN",
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "OTP_COOLDOWN") {
      return NextResponse.json(
        { error: "OTPは1分後に再送できます。" },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: "メールを送信できませんでした。" },
      { status: 502 },
    );
  }
}
