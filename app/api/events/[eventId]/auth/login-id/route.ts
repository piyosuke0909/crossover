import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  hashReloginCode,
  normalizeEmail,
} from "@/lib/participant-auth";
import {
  attachParticipantSessionCookie,
  createParticipantSession,
} from "@/lib/participant-session";

export async function POST(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await context.params;
  const body = (await request.json()) as {
    email?: unknown;
    reloginId?: unknown;
  };
  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  const reloginId =
    typeof body.reloginId === "string" ? body.reloginId.trim() : "";

  const credential = await prisma.personLoginCredential.findUnique({
    where: { codeHash: hashReloginCode(reloginId) },
    include: {
      person: {
        select: {
          id: true,
          email: true,
          isHidden: true,
          eventPeople: {
            where: { eventId },
            select: { id: true },
            take: 1,
          },
        },
      },
    },
  });

  if (
    !credential ||
    credential.revokedAt ||
    credential.person.isHidden ||
    !credential.person.email ||
    normalizeEmail(credential.person.email) !== email ||
    credential.person.eventPeople.length === 0
  ) {
    return NextResponse.json(
      { error: "メールアドレスまたは再ログインIDが正しくありません。" },
      { status: 401 },
    );
  }

  const event = await prisma.event.findFirst({
    where: { id: eventId, isActive: true, deletedAt: null },
    select: { id: true },
  });
  if (!event) {
    return NextResponse.json({ error: "この交流会にはログインできません。" }, { status: 404 });
  }

  const session = await createParticipantSession(eventId, credential.person.id);
  await prisma.personLoginCredential.update({
    where: { id: credential.id },
    data: { lastUsedAt: new Date() },
  });

  const response = NextResponse.json({ success: true });
  attachParticipantSessionCookie(
    response,
    eventId,
    session.rawToken,
    session.expiresAt,
  );
  return response;
}
