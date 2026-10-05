import {
  hashParticipantToken,
  newParticipantToken,
  participantCookieName,
  participantSessionExpiry,
} from "@/lib/participant-session";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RegistrationBody = {
  company?: {
    name?: string;
    phone?: string;
    postalCode?: string;
    address?: string;
    websiteUrl?: string;
    industryIds?: string[];
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
  const industryIds = Array.from(
    new Set(
      (company?.industryIds ?? [])
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  );

  if (
    !company?.name?.trim() ||
    industryIds.length === 0 ||
    !company.businessDescription?.trim() ||
    !person?.name?.trim() ||
    !person.photoUrl?.trim()
  ) {
    return NextResponse.json(
      { error: "必須項目が入力されていません。" },
      { status: 400 },
    );
  }

  const [event, industries] = await Promise.all([
    prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, isActive: true },
    }),
    prisma.industry.findMany({
      where: {
        id: { in: industryIds },
        isActive: true,
      },
      select: { id: true },
    }),
  ]);

  if (!event?.isActive) {
    return NextResponse.json(
      { error: "この交流会には登録できません。" },
      { status: 404 },
    );
  }

  if (industries.length !== industryIds.length) {
    return NextResponse.json(
      { error: "選択された業界の一部が利用できません。" },
      { status: 400 },
    );
  }

  const rawToken = newParticipantToken();
  const tokenHash = hashParticipantToken(rawToken);
  const expiresAt = participantSessionExpiry();

  const result = await prisma.$transaction(async (tx) => {
    const createdCompany = await tx.company.create({
      data: {
        name: company.name!.trim(),
        phone: optional(company.phone),
        postalCode: optional(company.postalCode),
        address: optional(company.address),
        websiteUrl: optional(company.websiteUrl),
        businessDescription: company.businessDescription!.trim(),
        profile: optional(company.profile),
        industries: {
          create: industryIds.map((industryId) => ({
            industryId,
          })),
        },
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

    await tx.participantSession.create({
      data: {
        eventId,
        personId: createdPerson.id,
        tokenHash,
        expiresAt,
      },
    });

    return {
      companyId: createdCompany.id,
      personId: createdPerson.id,
    };
  });

  const response = NextResponse.json(result, { status: 201 });
  response.cookies.set(participantCookieName(eventId), rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return response;
}
