import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  hashParticipantToken,
  newParticipantToken,
  participantCookieName,
  participantSessionExpiry,
} from "@/lib/participant-session";
import {
  companyAccessCookieName,
  hashCompanyAccessCode,
  newCompanyAccessCode,
  verifyCompanyAccess,
} from "@/lib/company-access";
import { validateRegistrationBody } from "@/lib/profile-validation";

export async function POST(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await context.params;
  const body = await request.json();
  const validation = validateRegistrationBody(body);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, isActive: true, deletedAt: true },
  });

  if (!event?.isActive || event.deletedAt) {
    return NextResponse.json(
      { error: "この交流会には登録できません。" },
      { status: 404 },
    );
  }

  const rawToken = newParticipantToken();
  const tokenHash = hashParticipantToken(rawToken);
  const expiresAt = participantSessionExpiry();

  let companyId = "";
  let companyAccessCode = "";

  if (validation.data.mode === "existing") {
    const allowed = await verifyCompanyAccess(
      validation.data.companyId,
      validation.data.companyAccessCode,
    );

    if (!allowed) {
      return NextResponse.json(
        { error: "企業参加コードが正しくありません。" },
        { status: 403 },
      );
    }

    const company = await prisma.company.findFirst({
      where: { id: validation.data.companyId, isHidden: false },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "選択した企業が見つかりません。" },
        { status: 404 },
      );
    }

    companyId = company.id;
    companyAccessCode = validation.data.companyAccessCode.trim().toUpperCase();
  } else {
    const industryIds = validation.data.company.industryIds;
    const industries = await prisma.industry.findMany({
      where: { id: { in: industryIds }, isActive: true },
      select: { id: true },
    });

    if (industries.length !== industryIds.length) {
      return NextResponse.json(
        { error: "選択された業界の一部が利用できません。" },
        { status: 400 },
      );
    }

    companyAccessCode = newCompanyAccessCode();
  }

  const person = validation.data.person;

  const result = await prisma.$transaction(async (tx) => {
    let resolvedCompanyId = companyId;

    if (validation.data.mode === "new") {
      const company = validation.data.company;
      const createdCompany = await tx.company.create({
        data: {
          name: company.name,
          phone: company.phone,
          showPhone: company.showPhone,
          showAddress: company.showAddress,
          postalCode: company.postalCode,
          address: company.address,
          websiteUrl: company.websiteUrl,
          businessDescription: company.businessDescription,
          profile: company.profile,
          industries: {
            create: company.industryIds.map((industryId) => ({ industryId })),
          },
          eventCompanies: { create: { eventId } },
          accessKeys: {
            create: { keyHash: hashCompanyAccessCode(companyAccessCode) },
          },
        },
      });
      resolvedCompanyId = createdCompany.id;
    } else {
      await tx.eventCompany.upsert({
        where: {
          eventId_companyId: {
            eventId,
            companyId: resolvedCompanyId,
          },
        },
        update: {},
        create: {
          eventId,
          companyId: resolvedCompanyId,
        },
      });
    }

    const createdPerson = await tx.person.create({
      data: {
        companyId: resolvedCompanyId,
        name: person.name,
        photoUrl: person.photoUrl,
        email: person.email,
        department: person.department,
        position: person.position,
        phone: person.phone,
        showPhone: person.showPhone,
        responsibility: person.responsibility,
        profile: person.profile,
        eventPeople: { create: { eventId } },
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
      companyId: resolvedCompanyId,
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
  response.cookies.set(
    companyAccessCookieName(result.companyId),
    companyAccessCode,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    },
  );

  return response;
}
