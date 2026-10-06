import {
  hashParticipantToken,
  newParticipantToken,
  participantCookieName,
  participantSessionExpiry,
} from "@/lib/participant-session";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRegistrationBody } from "@/lib/profile-validation";

export async function POST(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await context.params;
  const body = await request.json();
  const validation = validateRegistrationBody(body);

  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 },
    );
  }

  const { company, person } = validation.data;
  const industryIds = company.industryIds;

  const [event, industries] = await Promise.all([
    prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        isActive: true,
        deletedAt: true,
      },
    }),
    prisma.industry.findMany({
      where: {
        id: { in: industryIds },
        isActive: true,
      },
      select: { id: true },
    }),
  ]);

  if (!event?.isActive || event.deletedAt) {
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
        name: company.name,
        phone: company.phone,
        postalCode: company.postalCode,
        address: company.address,
        websiteUrl: company.websiteUrl,
        businessDescription: company.businessDescription,
        profile: company.profile,
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
        name: person.name,
        photoUrl: person.photoUrl,
        department: person.department,
        position: person.position,
        phone: person.phone,
        responsibility: person.responsibility,
        profile: person.profile,
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
