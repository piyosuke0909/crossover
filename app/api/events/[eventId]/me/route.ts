import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentParticipant } from "@/lib/participant-session";
import {
  validateCompanyFields,
  validatePersonFields,
} from "@/lib/profile-validation";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await context.params;
  const participant = await getCurrentParticipant(eventId);

  if (!participant || participant.person.isHidden || participant.person.company.isHidden) {
    return NextResponse.json({ error: "プロフィール登録が必要です。" }, { status: 401 });
  }

  const event = await prisma.event.findFirst({
    where: { id: eventId, isActive: true, deletedAt: null },
    select: { id: true },
  });
  if (!event) return NextResponse.json({ error: "交流会が見つかりません。" }, { status: 404 });

  let body: {
    company?: unknown;
    person?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "入力内容が正しくありません。" }, { status: 400 });
  }

  const personValidation = validatePersonFields(
    body?.person as Parameters<typeof validatePersonFields>[0],
  );
  if (!personValidation.ok) {
    return NextResponse.json({ error: personValidation.error }, { status: 400 });
  }

  const person = personValidation.data;
  const canEditCompany = Boolean(participant.person.companyVerifiedAt);
  let company: Extract<ReturnType<typeof validateCompanyFields>, { ok: true }>["data"] | null = null;

  if (canEditCompany) {
    const companyValidation = validateCompanyFields(
      body?.company as Parameters<typeof validateCompanyFields>[0],
    );
    if (!companyValidation.ok) {
      return NextResponse.json({ error: companyValidation.error }, { status: 400 });
    }
    company = companyValidation.data;

    const industries = await prisma.industry.findMany({
      where: { id: { in: company.industryIds }, isActive: true },
      select: { id: true },
    });
    if (industries.length !== company.industryIds.length) {
      return NextResponse.json(
        { error: "選択された業界の一部が利用できません。" },
        { status: 400 },
      );
    }
  }

  const previousEmail = participant.person.email?.trim().toLowerCase() ?? "";
  const nextEmail = person.email?.trim().toLowerCase() ?? "";
  const emailChanged = previousEmail !== nextEmail;

  await prisma.$transaction(async (tx) => {
    if (company) {
      await tx.company.update({
        where: { id: participant.person.companyId },
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
        },
      });

      await tx.companyIndustry.deleteMany({
        where: { companyId: participant.person.companyId },
      });
      await tx.companyIndustry.createMany({
        data: company.industryIds.map((industryId) => ({
          companyId: participant.person.companyId,
          industryId,
        })),
      });
    }

    await tx.person.update({
      where: { id: participant.personId },
      data: {
        name: person.name,
        email: person.email,
        ...(emailChanged
          ? {
              emailVerifiedAt: null,
              emailOtpEnabled: false,
            }
          : {}),
        department: person.department,
        position: person.position,
        phone: person.phone,
        showPhone: person.showPhone,
        responsibility: person.responsibility,
        profile: person.profile,
      },
    });
  });

  return NextResponse.json({ success: true });
}
