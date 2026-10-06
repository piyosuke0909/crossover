import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdminApiAuthenticated } from "@/lib/admin-api-auth";
import { validateEventInput } from "@/lib/event-validation";

export async function POST(request: Request) {
  if (!(await isAdminApiAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validation = validateEventInput(body);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      ...validation.data,
      slug: `event-${Date.now()}-${randomUUID().slice(0, 8)}`,
    },
    select: { id: true },
  });

  return NextResponse.json(event, { status: 201 });
}
