import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdminApiAuthenticated } from "@/lib/admin-api-auth";
import { validateEventInput } from "@/lib/event-validation";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  if (!(await isAdminApiAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await context.params;
  const body = await request.json();

  const existing = await prisma.event.findFirst({
    where: { id: eventId, deletedAt: null },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "イベントが見つかりません。" }, { status: 404 });
  }

  if (
    Object.keys(body).length === 1 &&
    typeof body.isActive === "boolean"
  ) {
    const event = await prisma.event.update({
      where: { id: eventId },
      data: { isActive: body.isActive },
      select: { id: true, isActive: true },
    });
    return NextResponse.json(event);
  }

  const validation = validateEventInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const event = await prisma.event.update({
    where: { id: eventId },
    data: validation.data,
    select: { id: true, isActive: true },
  });

  return NextResponse.json(event);
}

export async function DELETE() {
  return NextResponse.json({ error: "常設の交流ページは削除できません。" }, { status: 405 });
}
