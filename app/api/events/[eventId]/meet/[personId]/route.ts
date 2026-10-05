import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentParticipant } from "@/lib/participant-session";

export async function POST(
  _request: Request,
  context: { params: Promise<{ eventId: string; personId: string }> },
) {
  const { eventId, personId } = await context.params;
  const participant = await getCurrentParticipant(eventId);

  if (!participant) {
    return NextResponse.json(
      { error: "プロフィール登録が必要です。" },
      { status: 401 },
    );
  }

  if (participant.personId === personId) {
    return NextResponse.json(
      { error: "自分自身は「話した人」に追加できません。" },
      { status: 400 },
    );
  }

  const target = await prisma.eventPerson.findUnique({
    where: {
      eventId_personId: {
        eventId,
        personId,
      },
    },
    select: {
      person: {
        select: { id: true, isHidden: true },
      },
      event: {
        select: { isActive: true },
      },
    },
  });

  if (!target?.event.isActive || target.person.isHidden) {
    return NextResponse.json(
      { error: "この参加者は見つかりません。" },
      { status: 404 },
    );
  }

  const existing = await prisma.encounter.findUnique({
    where: {
      eventId_ownerPersonId_metPersonId: {
        eventId,
        ownerPersonId: participant.personId,
        metPersonId: personId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ created: false });
  }

  await prisma.encounter.create({
    data: {
      eventId,
      ownerPersonId: participant.personId,
      metPersonId: personId,
    },
  });

  return NextResponse.json({ created: true }, { status: 201 });
}
