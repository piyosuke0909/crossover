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
      industries: company.industries.map(({ industry }) => industry),
    })),
  });
}
