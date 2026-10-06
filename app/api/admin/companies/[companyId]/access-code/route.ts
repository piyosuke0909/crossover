import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdminApiAuthenticated } from "@/lib/admin-api-auth";
import { hashCompanyAccessCode, newCompanyAccessCode } from "@/lib/company-access";

export async function POST(
  _request: Request,
  context: { params: Promise<{ companyId: string }> },
) {
  if (!(await isAdminApiAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { companyId } = await context.params;
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });

  if (!company) {
    return NextResponse.json({ error: "企業が見つかりません。" }, { status: 404 });
  }

  const code = newCompanyAccessCode();
  await prisma.$transaction([
    prisma.companyAccessKey.updateMany({
      where: { companyId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    prisma.companyAccessKey.create({
      data: { companyId, keyHash: hashCompanyAccessCode(code) },
    }),
  ]);

  return NextResponse.json({ code });
}
