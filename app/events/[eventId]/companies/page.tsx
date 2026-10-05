import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import AppShell from "@/components/app-shell";
import { Icon } from "@/components/icons";

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

  if (!event?.isActive) notFound();

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
          ...(industryId
            ? {
                industries: {
                  some: { industryId },
                },
              }
            : {}),
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
            industries: {
              include: { industry: true },
            },
            people: {
              where: {
                isHidden: false,
                eventPeople: { some: { eventId } },
              },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    }),
  ]);

  return (
    <AppShell eventId={event.id}>
      <main className="mx-auto w-full max-w-5xl px-4 pb-32 pt-5 sm:px-6 sm:pt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-[#4aaed9]">
              DISCOVER
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
              参加企業を探す
            </h1>
            <p className="mt-1.5 text-sm font-medium text-[#7a8e99]">
              {rows.length}社が見つかりました
            </p>
          </div>
          <Link
            href={`/events/${event.id}`}
            className="rounded-full bg-[#e6f7ff] px-3 py-2 text-xs font-bold text-[#279fd1]"
          >
            イベント
          </Link>
        </div>

        <form className="mt-5 rounded-[26px] border border-[#e1eef4] bg-white p-4 shadow-[0_10px_28px_rgba(50,99,121,0.08)]">
          <div className="relative">
            <Icon
              name="search"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6bbfe3]"
            />
            <input
              name="q"
              defaultValue={q}
              placeholder="企業名・担当者・事業内容で検索"
              className="w-full rounded-2xl border border-[#d9eaf2] bg-[#f8fcfe] py-3.5 pl-12 pr-4 text-sm font-medium outline-none transition placeholder:text-[#9aadb6] focus:border-[#65bfe7] focus:bg-white focus:ring-4 focus:ring-[#dff5ff]"
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
            <select
              name="industry"
              defaultValue={industryId}
              className="w-full rounded-2xl border border-[#d9eaf2] bg-white px-4 py-3.5 text-sm font-semibold outline-none focus:border-[#65bfe7] focus:ring-4 focus:ring-[#dff5ff]"
            >
              <option value="">すべての業界</option>
              {industries.map((industry) => (
                <option key={industry.id} value={industry.id}>
                  {industry.name}
                </option>
              ))}
            </select>

            <button className="rounded-2xl bg-[#4db7e5] px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(55,166,214,0.25)] transition hover:bg-[#37a9da]">
              検索する
            </button>
          </div>
        </form>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {rows.map(({ company }) => (
            <Link
              key={company.id}
              href={`/events/${event.id}/companies/${company.id}`}
              className="group overflow-hidden rounded-[28px] border border-[#e1eef4] bg-white p-5 shadow-[0_10px_28px_rgba(50,99,121,0.075)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(50,99,121,0.12)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {company.industries.map(({ industry }, index) => (
                    <span
                      key={industry.id}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold ${
                        index % 2 === 0
                          ? "bg-[#e7f7ff] text-[#258fbd]"
                          : "bg-[#fff4bf] text-[#846d1c]"
                      }`}
                    >
                      {industry.name}
                    </span>
                  ))}
                </div>
                <Icon
                  name="chevron"
                  className="h-5 w-5 shrink-0 text-[#a7b8c0] transition group-hover:translate-x-1"
                />
              </div>

              <h2 className="mt-4 text-lg font-extrabold leading-snug">
                {company.name}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#667d88]">
                {company.businessDescription}
              </p>

              {company.people.length > 0 ? (
                <div className="mt-5 border-t border-[#edf3f6] pt-4">
                  <p className="mb-3 text-[11px] font-bold text-[#82959f]">
                    参加担当者
                  </p>
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      {company.people.slice(0, 4).map((person) => (
                        <img
                          key={person.id}
                          src={person.photoUrl}
                          alt={person.name}
                          className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
                        />
                      ))}
                    </div>
                    <div className="ml-3 min-w-0 text-sm font-bold text-[#4e6673]">
                      {company.people[0]?.name}
                      {company.people.length > 1
                        ? ` ほか${company.people.length - 1}名`
                        : ""}
                    </div>
                  </div>
                </div>
              ) : null}
            </Link>
          ))}

          {rows.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[#cfe3ec] bg-white p-9 text-center sm:col-span-2">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-[20px] bg-[#e8f8ff] text-[#279fd1]">
                <Icon name="search" className="h-7 w-7" />
              </span>
              <p className="mt-4 font-extrabold">
                条件に一致する企業がありません
              </p>
              <p className="mt-2 text-sm text-[#7b8f99]">
                検索条件を変えてもう一度探してみてください。
              </p>
            </div>
          ) : null}
        </div>
      </main>
    </AppShell>
  );
}
