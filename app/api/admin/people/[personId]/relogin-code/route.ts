import { NextResponse } from "next/server";
import { isAdminApiAuthenticated } from "@/lib/admin-api-auth";
import { issueReloginCode } from "@/lib/email-auth-service";

export async function POST(
  _request: Request,
  context: { params: Promise<{ personId: string }> },
) {
  if (!(await isAdminApiAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { personId } = await context.params;

  try {
    const result = await issueReloginCode(personId);
    return NextResponse.json({ success: true, sentTo: result.sentTo });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_REQUIRED") {
      return NextResponse.json(
        { error: "この担当者にはメールアドレスが登録されていません。" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "再ログインIDをメール送信できませんでした。" },
      { status: 502 },
    );
  }
}
