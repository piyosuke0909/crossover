import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdminApiAuthenticated } from "@/lib/admin-api-auth";

export async function POST(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  if (!(await isAdminApiAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId: sourceEventId } = await context.params;
  const body = (await request.json()) as {
    targetEventId?: unknown;
    personIds?: unknown;
  };

  const targetEventId =
    typeof body.targetEventId === "string" ? body.targetEventId : "";
  const personIds = Array.isArray(body.personIds)
    ? Array.from(
        new Set(
          body.personIds.filter(
            (value): value is string => typeof value === "string" && Boolean(value),
          ),
        ),
      )
    : [];

  if (!targetEventId || targetEventId === sourceEventId) {
    return NextResponse.json(
      { error: "移行先の交流会を正しく選択してください。" },
      { status: 400 },
    );
  }
  if (personIds.length === 0) {
    return NextResponse.json(
      { error: "引き継ぐ担当者を1人以上選択してください。" },
      { status: 400 },
    );
  }

  const [sourceEvent, targetEvent, participants] = await Promise.all([
    prisma.event.findFirst({
      where: { id: sourceEventId, deletedAt: null },
      select: { id: true },
    }),
    prisma.event.findFirst({
      where: { id: targetEventId, isActive: true, deletedAt: null },
      select: { id: true, name: true },
    }),
    prisma.eventPerson.findMany({
      where: {
        eventId: sourceEventId,
        personId: { in: personIds },
        person: {
          isHidden: false,
          company: { isHidden: false },
        },
      },
      select: {
        personId: true,
        person: { select: { companyId: true } },
      },
    }),
  ]);

  if (!sourceEvent || !targetEvent) {
    return NextResponse.json(
      { error: "交流会が見つからないか、移行先が非公開です。" },
      { status: 404 },
    );
  }

  if (participants.length === 0) {
    return NextResponse.json(
      { error: "引き継げる担当者が見つかりません。" },
      { status: 404 },
    );
  }

  await prisma.$transaction(async (tx) => {
    const companyIds = Array.from(
      new Set(participants.map(({ person }) => person.companyId)),
    );

    for (const companyId of companyIds) {
      await tx.eventCompany.upsert({
        where: {
          eventId_companyId: {
            eventId: targetEventId,
            companyId,
          },
        },
        update: {},
        create: {
          eventId: targetEventId,
          companyId,
        },
      });
    }

    for (const participant of participants) {
      await tx.eventPerson.upsert({
        where: {
          eventId_personId: {
            eventId: targetEventId,
            personId: participant.personId,
          },
        },
        update: {},
        create: {
          eventId: targetEventId,
          personId: participant.personId,
        },
      });
    }
  });

  return NextResponse.json({
    success: true,
    transferred: participants.length,
    targetEventName: targetEvent.name,
  });
}
