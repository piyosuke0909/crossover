import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AppShell from "@/components/app-shell";
import BackLink from "@/components/back-link";
import { Icon } from "@/components/icons";
import { getCurrentParticipant } from "@/lib/participant-session";
import { companyEventSearchConditions } from "@/lib/company-event-search";
import MetPersonStarButton from "@/components/met-person-star-button";
import CompanyVerifiedBadge from "@/components/company-verified-badge";

export const dynamic = "force-dynamic";

export default async function CompaniesPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ q?: string; industry?: string }>;
}) {
  const { eventId } = await params;
  const participant = await getCurrentParticipant(eventId);
  if (!participant) redirect(`/events/${eventId}/login`);

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
            ? { industries: { some: { industryId } } }
            : {}),
          ...(q ? companyEventSearchConditions(q, eventId) : {}),
        },
      },
      include: {
        company: {
          include: {
            industries: { include: { industry: true } },
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

  const metPersonIds = new Set(
    participant
      ? (
          await prisma.encounter.findMany({
            where: {
              eventId,
              ownerPersonId: participant.personId,
            },
            select: { metPersonId: true },
          })
        ).map((encounter) => encounter.metPersonId)
      : [],
  );

  return (
    <AppShell eventId={event.id}>
      <main className="mx-auto w-full max-w-5xl px-4 pb-32 pt-5 sm:px-6 sm:pt-8">
        <BackLink href={`/events/${event.id}`}>イベントへ戻る</BackLink>

        <div className="mt-5">
          <p className="text-xs font-bold tracking-[0.16em] text-[#4aaed9]">
            DISCOVER
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
            参加企業を探す
          </h1>
          <p className="mt-1.5 text-sm font-medium text-[#7a8e99]">
            {rows.length}社が見つかりました
          </p>
          <p className="mt-2 break-words text-xs font-medium leading-6 text-[#607783]">
            ログインした参加者だけが企業や担当者を検索できます。
          </p>
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
              className="h-12 w-full rounded-2xl border border-[#d9eaf2] bg-[#f8fcfe] pl-12 pr-4 text-sm font-medium outline-none transition placeholder:text-[#9aadb6] focus:border-[#65bfe7] focus:bg-white focus:ring-4 focus:ring-[#dff5ff]"
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative min-w-0">
              <select
                name="industry"
                defaultValue={industryId}
                className="h-12 w-full appearance-none rounded-2xl border border-[#d9eaf2] bg-white pl-4 pr-12 text-sm font-semibold text-[#36515f] outline-none transition focus:border-[#65bfe7] focus:ring-4 focus:ring-[#dff5ff]"
              >
                <option value="">すべての業界</option>
                {industries.map((industry) => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 grid w-7 place-items-center text-[#6f8b99]">
                <Icon name="chevron-down" className="h-4 w-4" />
              </span>
            </div>

            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#4db7e5] px-6 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(55,166,214,0.25)] transition hover:bg-[#37a9da]">
              <Icon name="search" className="h-4 w-4" />
              検索する
            </button>
          </div>
        </form>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {rows.map(({ company }) => (
            <article
              key={company.id}
              className="overflow-hidden rounded-[28px] border border-[#e1eef4] bg-white shadow-[0_10px_28px_rgba(50,99,121,0.075)]"
            >
              <Link
                href={`/events/${event.id}/companies/${company.id}`}
                className="group block p-5 transition hover:bg-[#fbfdfe]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-wrap gap-1.5">
                    {company.industries.map(({ industry }, index) => (
                      <span
                        key={industry.id}
                        className={`max-w-full rounded-full px-3 py-1.5 text-[11px] font-extrabold ${
                          index % 2 === 0
                            ? "bg-[#e7f7ff] text-[#258fbd]"
                            : "bg-[#fff4bf] text-[#846d1c]"
                        }`}
                      >
                        {industry.name}
                      </span>
                    ))}
                  </div>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#f4f9fb] text-[#8ea5b0] transition group-hover:translate-x-0.5 group-hover:bg-[#e7f7ff] group-hover:text-[#279fd1]">
                    <Icon name="chevron" className="h-4 w-4" />
                  </span>
                </div>

                <h2 className="mt-4 break-words text-lg font-extrabold leading-snug">
                  {company.name}
                </h2>
                <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-[#667d88]">
                  {company.businessDescription}
                </p>
              </Link>

              {company.people.length > 0 ? (
                <div className="border-t border-[#edf3f6] px-5 pb-5 pt-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-[11px] font-bold text-[#82959f]">
                      参加担当者
                    </p>
                    <p className="text-[10px] font-bold text-[#9aabb3]">
                      ☆で「話した人」に登録
                    </p>
                  </div>

                  <div className="grid gap-2.5">
                    {company.people.map((person) => (
                      <div
                        key={person.id}
                        className="flex min-w-0 items-center gap-3 rounded-2xl bg-[#f8fbfc] p-2.5"
                      >
                        <img
                          src={person.photoUrl}
                          alt={person.name}
                          className="h-11 w-11 shrink-0 rounded-2xl object-cover"
                        />
                        <Link
                          href={`/events/${event.id}/companies/${company.id}`}
                          className="min-w-0 flex-1"
                        >
                          <span className="block truncate text-sm font-extrabold text-[#36515f]">
                            {person.name}
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] font-medium text-[#82959f]">
                            {[person.department, person.position]
                              .filter(Boolean)
                              .join(" / ") || "所属情報なし"}
                          </span>
                          {person.companyVerifiedAt ? (
                            <span className="mt-1 inline-flex"><CompanyVerifiedBadge compact /></span>
                          ) : null}
                        </Link>
                        <MetPersonStarButton
                          eventId={event.id}
                          personId={person.id}
                          initialSelected={metPersonIds.has(person.id)}
                          canEdit={Boolean(participant)}
                          isSelf={participant?.personId === person.id}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
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
