import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ companies: [] });
  }

  const companies = await prisma.company.findMany({
    where: {
      isHidden: false,
      name: { contains: q, mode: "insensitive" },
    },
    take: 8,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      businessDescription: true,
      profile: true,
      showPhone: true,
      showAddress: true,
      phone: true,
      address: true,
      postalCode: true,
      websiteUrl: true,
      industries: {
        select: { industry: { select: { id: true, name: true } } },
      },
    },
  });

  return NextResponse.json({
    companies: companies.map((company) => ({
      id: company.id,
      name: company.name,
      businessDescription: company.businessDescription,
      profile: company.profile,
      websiteUrl: company.websiteUrl,
      showPhone: company.showPhone,
      phone: company.showPhone ? company.phone : null,
      showAddress: company.showAddress,
      address: company.showAddress ? company.address : null,
      postalCode: company.showAddress ? company.postalCode : null,
      industries: company.industries.map(({ industry }) => industry),
    })),
  });
}
