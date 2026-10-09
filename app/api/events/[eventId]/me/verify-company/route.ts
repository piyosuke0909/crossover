import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { companyAccessCookieName, verifyCompanyAccess } from "@/lib/company-access";
import { getCurrentParticipant } from "@/lib/participant-session";

/**
 * A participant can join without a code. A valid code later verifies their
 * company affiliation and enables a visible "company code verified" badge.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await context.params;
  const participant = await getCurrentParticipant(eventId);
  if (!participant || participant.person.isHidden || participant.person.company.isHidden) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const event = await prisma.event.findFirst({
    where: { id: eventId, isActive: true, deletedAt: null },
    select: { id: true },
  });
  if (!event) {
    return NextResponse.json({ error: "交流会が見つかりません。" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "コードを入力してください。" }, { status: 400 });
  }
  const code =
    body && typeof body === "object" && "code" in body && typeof body.code === "string"
      ? body.code.trim().toUpperCase()
      : "";

  if (!code || code.length > 20) {
    return NextResponse.json({ error: "正しい形式の企業参加コードを入力してください。" }, { status: 400 });
  }

  // Only codes valid for the participant's current company count.
  const verified = await verifyCompanyAccess(participant.person.companyId, code);
  if (!verified) {
    return NextResponse.json(
      { error: "企業参加コードが正しくありません。確認して再度入力してください。" },
      { status: 403 },
    );
  }

  await prisma.person.update({
    where: { id: participant.personId },
    data: { companyVerifiedAt: new Date() },
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set(
    companyAccessCookieName(participant.person.companyId),
    code,
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    },
  );
  return response;
}
