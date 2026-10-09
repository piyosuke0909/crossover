import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Registration-only lookup. Never expose the private company directory here. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 200);
  if (q.length < 2) return NextResponse.json({ companies: [] });

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
      industries: {
        select: { industry: { select: { id: true, name: true } } },
      },
    },
  });

  return NextResponse.json({
    companies: companies.map((company) => ({
      id: company.id,
      name: company.name,
      industries: company.industries.map(({ industry }) => industry),
    })),
  }, { headers: { "Cache-Control": "no-store" } });
}
