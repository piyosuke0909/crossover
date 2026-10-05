import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RegistrationBody = {
  company?: {
    name?: string;
    phone?: string;
    postalCode?: string;
    address?: string;
    websiteUrl?: string;
    industryId?: string;
    businessDescription?: string;
    profile?: string;
  };
  person?: {
    name?: string;
    photoUrl?: string;
    department?: string;
    position?: string;
    phone?: string;
    responsibility?: string;
    profile?: string;
  };
};

function optional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await context.params;
  const body = (await request.json()) as RegistrationBody;

  const company = body.company;
  const person = body.person;

  if (
    !company?.name?.trim() ||
    !company.industryId?.trim() ||
    !company.businessDescription?.trim() ||
    !person?.name?.trim() ||
    !person.photoUrl?.trim()
  ) {
    return NextResponse.json(
      { error: "必須項目が入力されていません。" },
      { status: 400 },
    );
  }

  const [event, industry] = await Promise.all([
    prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, isActive: true },
    }),
    prisma.industry.findUnique({
      where: { id: company.industryId },
      select: { id: true, isActive: true },
    }),
  ]);

  if (!event?.isActive) {
    return NextResponse.json(
      { error: "この交流会には登録できません。" },
      { status: 404 },
    );
  }

  if (!industry?.isActive) {
    return NextResponse.json(
      { error: "選択された業界が利用できません。" },
      { status: 400 },
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const createdCompany = await tx.company.create({
      data: {
        name: company.name!.trim(),
        phone: optional(company.phone),
        postalCode: optional(company.postalCode),
        address: optional(company.address),
        websiteUrl: optional(company.websiteUrl),
        industryId: company.industryId!.trim(),
        businessDescription: company.businessDescription!.trim(),
        profile: optional(company.profile),
        eventCompanies: {
          create: {
            eventId,
          },
        },
      },
    });

    const createdPerson = await tx.person.create({
      data: {
        companyId: createdCompany.id,
        name: person.name!.trim(),
        photoUrl: person.photoUrl!.trim(),
        department: optional(person.department),
        position: optional(person.position),
        phone: optional(person.phone),
        responsibility: optional(person.responsibility),
        profile: optional(person.profile),
        eventPeople: {
          create: {
            eventId,
          },
        },
      },
    });

    return {
      companyId: createdCompany.id,
      personId: createdPerson.id,
    };
  });

  return NextResponse.json(result, { status: 201 });
}
