import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentParticipant } from "@/lib/participant-session";

async function getTarget(eventId: string, personId: string) {
  return prisma.eventPerson.findFirst({
    where: {
      eventId,
      personId,
      person: { isHidden: false },
      event: { isActive: true, deletedAt: null },
    },
    select: { personId: true },
  });
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ eventId: string; personId: string }> },
) {
  const { eventId, personId } = await context.params;
  const participant = await getCurrentParticipant(eventId);

  if (!participant) {
    return NextResponse.json(
      { error: "話した人に登録するには再ログインしてください。" },
      { status: 401 },
    );
  }

  if (participant.personId === personId) {
    return NextResponse.json(
      { error: "自分自身は「話した人」に追加できません。" },
      { status: 400 },
    );
  }

  const target = await getTarget(eventId, personId);
  if (!target) {
    return NextResponse.json(
      { error: "この参加者は見つかりません。" },
      { status: 404 },
    );
  }

  await prisma.encounter.upsert({
    where: {
      eventId_ownerPersonId_metPersonId: {
        eventId,
        ownerPersonId: participant.personId,
        metPersonId: personId,
      },
    },
    update: {},
    create: {
      eventId,
      ownerPersonId: participant.personId,
      metPersonId: personId,
    },
  });

  return NextResponse.json({ selected: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ eventId: string; personId: string }> },
) {
  const { eventId, personId } = await context.params;
  const participant = await getCurrentParticipant(eventId);

  if (!participant) {
    return NextResponse.json(
      { error: "話した人から外すには再ログインしてください。" },
      { status: 401 },
    );
  }

  await prisma.encounter.deleteMany({
    where: {
      eventId,
      ownerPersonId: participant.personId,
      metPersonId: personId,
    },
  });

  return NextResponse.json({ selected: false });
}
