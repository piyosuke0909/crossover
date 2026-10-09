import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdminApiAuthenticated } from "@/lib/admin-api-auth";
import { validateCompanyFields } from "@/lib/profile-validation";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ companyId: string }> },
) {
  if (!(await isAdminApiAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { companyId } = await context.params;
  const body = await request.json();

  if (typeof body.isHidden === "boolean" && Object.keys(body).length === 1) {
    await prisma.company.update({
      where: { id: companyId },
      data: { isHidden: body.isHidden },
    });
    return NextResponse.json({ success: true });
  }

  const validation = validateCompanyFields(body.company);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const company = validation.data;
  const industries = await prisma.industry.findMany({
    where: { id: { in: company.industryIds }, isActive: true },
    select: { id: true },
  });

  if (industries.length !== company.industryIds.length) {
    return NextResponse.json({ error: "選択された業界が不正です。" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.company.update({
      where: { id: companyId },
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
    await tx.companyIndustry.deleteMany({ where: { companyId } });
    await tx.companyIndustry.createMany({
      data: company.industryIds.map((industryId) => ({ companyId, industryId })),
    });
  });

  return NextResponse.json({ success: true });
}
