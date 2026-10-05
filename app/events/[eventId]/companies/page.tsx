import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CompaniesPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ q?: string; industry?: string }>;
}) {
  const { eventId } = await params;
  const filters = await searchParams;
  const q = filters.q?.trim() ?? "";
  const industryId = filters.industry?.trim() ?? "";

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, name: true, isActive: true },
  });

  if (!event?.isActive) {
    notFound();
  }

  const [industries, rows] = await Promise.all([
    prisma.industry.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.eventCompany.findMany({
      where: {
        eventId,
        company: {
          isHidden: false,
          ...(industryId ? { industryId } : {}),
          ...(q
            ? {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  {
                    businessDescription: {
                      contains: q,
                      mode: "insensitive",
                    },
                  },
                  { profile: { contains: q, mode: "insensitive" } },
                  {
                    people: {
                      some: {
                        isHidden: false,
                        name: { contains: q, mode: "insensitive" },
                      },
                    },
                  },
                ],
              }
            : {}),
        },
      },
      include: {
        company: {
          include: {
            industry: true,
            people: {
              where: {
                isHidden: false,
                eventPeople: {
                  some: { eventId },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    }),
  ]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href={"/events/" + event.id}
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← {event.name}
      </Link>

      <div className="mt-5">
        <h1 className="text-2xl font-bold">参加企業</h1>
        <p className="mt-1 text-sm text-slate-500">{rows.length}社を表示</p>
      </div>

      <form className="mt-5 grid gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-[1fr_220px_auto]">
        <input
          name="q"
          defaultValue={q}
          placeholder="企業名・担当者・事業内容で検索"
          className="rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-slate-600"
        />
        <select
          name="industry"
          defaultValue={industryId}
          className="rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none focus:border-slate-600"
        >
          <option value="">すべての業界</option>
          {industries.map((industry) => (
            <option key={industry.id} value={industry.id}>
              {industry.name}
            </option>
          ))}
        </select>
        <button className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white">
          検索
        </button>
      </form>

      <div className="mt-5 grid gap-4">
        {rows.map(({ company }) => (
          <Link
            key={company.id}
            href={"/events/" + event.id + "/companies/" + company.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
          >
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {company.industry.name}
            </span>
            <h2 className="mt-3 text-lg font-bold">{company.name}</h2>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
              {company.businessDescription}
            </p>

            {company.people.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {company.people.map((person) => (
                  <span
                    key={person.id}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-50 py-1.5 pl-1.5 pr-3 text-sm"
                  >
                    <img
                      src={person.photoUrl}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    {person.name}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}

        {rows.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            条件に一致する企業がありません。
          </div>
        )}
      </div>
    </main>
  );
}
