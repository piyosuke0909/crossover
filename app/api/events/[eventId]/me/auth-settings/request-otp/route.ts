import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/participant-session";
import { sendParticipantOtp } from "@/lib/email-auth-service";

export async function POST(
  _request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await context.params;
  const participant = await getCurrentParticipant(eventId);

  if (!participant) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const email = participant.person.email;
  if (!email) {
    return NextResponse.json(
      { error: "先にプロフィール編集からメールアドレスを登録してください。" },
      { status: 400 },
    );
  }

  try {
    await sendParticipantOtp({
      personId: participant.personId,
      email,
      purpose: "VERIFY_EMAIL",
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
      { error: "確認メールを送信できませんでした。" },
      { status: 502 },
    );
  }
}
