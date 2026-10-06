import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: unknown };
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name || name.length > 50) {
    return NextResponse.json(
      { error: "業界名は1〜50文字で入力してください。" },
      { status: 400 },
    );
  }

  const existing = await prisma.industry.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true, name: true, isActive: true },
  });

  if (existing) {
    if (!existing.isActive) {
      return NextResponse.json(
        { error: "この業界候補は現在利用できません。" },
        { status: 409 },
      );
    }
    return NextResponse.json(existing);
  }

  const industry = await prisma.industry.create({
    data: { name },
    select: { id: true, name: true },
  });

  return NextResponse.json(industry, { status: 201 });
}
