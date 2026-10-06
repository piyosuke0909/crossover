import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/participant-session";
import { issueReloginCode } from "@/lib/email-auth-service";

export async function POST(
  _request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await context.params;
  const participant = await getCurrentParticipant(eventId);

  if (!participant) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  try {
    const result = await issueReloginCode(participant.personId);
    return NextResponse.json({ success: true, sentTo: result.sentTo });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_REQUIRED") {
      return NextResponse.json(
        { error: "先にメールアドレスを登録してください。" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "再ログインIDをメール送信できませんでした。" },
      { status: 502 },
    );
  }
}
