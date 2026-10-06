import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentParticipant } from "@/lib/participant-session";
import { validateProfileEditBody } from "@/lib/profile-validation";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await context.params;
  const participant = await getCurrentParticipant(eventId);

  if (!participant) {
    return NextResponse.json({ error: "プロフィール登録が必要です。" }, { status: 401 });
  }

  const body = await request.json();
  const validation = validateProfileEditBody(body);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { company, person } = validation.data;
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

  const photoUrl = person.photoUrl || participant.person.photoUrl;
  const previousEmail = participant.person.email?.trim().toLowerCase() ?? "";
  const nextEmail = person.email?.trim().toLowerCase() ?? "";
  const emailChanged = previousEmail !== nextEmail;

  await prisma.$transaction(async (tx) => {
    await tx.company.update({
      where: { id: participant.person.companyId },
      data: {
        name: company.name,
        phone: company.phone,
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

    await tx.person.update({
      where: { id: participant.personId },
      data: {
        name: person.name,
        photoUrl,
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
        responsibility: person.responsibility,
        profile: person.profile,
      },
    });
  });

  return NextResponse.json({ success: true });
}
