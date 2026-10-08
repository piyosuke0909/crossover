import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import AppShell from "@/components/app-shell";
import BackLink from "@/components/back-link";
import { Icon } from "@/components/icons";
import CompanyVerifiedBadge from "@/components/company-verified-badge";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ eventId: string; companyId: string }>;
}) {
  const { eventId, companyId } = await params;

  const participation = await prisma.eventCompany.findUnique({
    where: {
      eventId_companyId: { eventId, companyId },
    },
    include: {
      event: {
        select: { id: true, name: true, isActive: true },
      },
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
  });

  if (!participation?.event.isActive || participation.company.isHidden) {
    notFound();
  }

  const { company, event } = participation;

  return (
    <AppShell eventId={event.id}>
      <main className="mx-auto w-full max-w-5xl px-4 pb-32 pt-5 sm:px-6 sm:pt-8">
        <BackLink href={`/events/${event.id}/companies`}>
          参加企業一覧へ戻る
        </BackLink>

        <section className="mt-5 overflow-hidden rounded-[30px] border border-[#e1eef4] bg-white shadow-[0_12px_32px_rgba(50,99,121,0.08)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#e5f7ff] to-[#f6fcff] px-6 py-7 sm:px-8">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#fff0a8]" />

            <div className="relative">
              <div className="flex flex-wrap gap-2">
                {company.industries.map(({ industry }) => (
                  <span
                    key={industry.id}
                    className="inline-flex max-w-full rounded-full bg-white/90 px-3 py-1.5 text-xs font-extrabold text-[#278fb9] shadow-sm"
                  >
                    {industry.name}
                  </span>
                ))}
              </div>

              <h1 className="mt-4 max-w-3xl break-words text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                {company.name}
              </h1>
              <p className="mt-3 max-w-3xl break-words text-sm leading-7 text-[#59737f]">
                {company.businessDescription}
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                {company.showPhone && company.phone ? (
                  <a
                    href={`tel:${company.phone}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[#d7eaf2] bg-white px-4 py-3 text-sm font-extrabold text-[#3e6d82] shadow-sm"
                  >
                    <Icon
                      name="phone"
                      className="h-4 w-4 text-[#4db7e5]"
                    />
                    電話する
                  </a>
                ) : null}

                {company.websiteUrl ? (
                  <a
                    href={company.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#4db7e5] px-4 py-3 text-sm font-extrabold text-white shadow-sm"
                  >
                    <Icon name="globe" className="h-4 w-4" />
                    Webサイト
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
            <div className="min-w-0">
              {company.profile ? (
                <section>
                  <p className="text-xs font-bold tracking-[0.14em] text-[#54afd4]">
                    PROFILE
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold">
                    企業プロフィール
                  </h2>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#617985]">
                    {company.profile}
                  </p>
                </section>
              ) : (
                <section>
                  <p className="text-xs font-bold tracking-[0.14em] text-[#54afd4]">
                    ABOUT
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold">事業内容</h2>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#617985]">
                    {company.businessDescription}
                  </p>
                </section>
              )}
            </div>

            <dl className="min-w-0 rounded-[24px] bg-[#f7fbfd] p-5 text-sm">
              <div>
                <dt className="text-xs font-bold text-[#8497a1]">会社情報</dt>
              </div>
              {company.showPhone && company.phone ? (
                <div className="mt-4 border-t border-[#e7f0f4] pt-4">
                  <dt className="text-xs font-bold text-[#8497a1]">
                    電話番号
                  </dt>
                  <dd className="mt-1.5 break-all font-bold">{company.phone}</dd>
                </div>
              ) : null}
              {company.showAddress && company.address ? (
                <div className="mt-4 border-t border-[#e7f0f4] pt-4">
                  <dt className="text-xs font-bold text-[#8497a1]">住所</dt>
                  <dd className="mt-1.5 break-words font-bold leading-6">
                    {company.postalCode ? `〒${company.postalCode} ` : ""}
                    {company.address}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[#4aaed9]">
                MEMBERS
              </p>
              <h2 className="mt-1 text-xl font-extrabold">
                今回の参加担当者
              </h2>
            </div>
            <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#7b8f99] ring-1 ring-[#e1eef4]">
              {company.people.length}名
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {company.people.map((person) => (
              <article
                key={person.id}
                className="min-w-0 overflow-hidden rounded-[28px] border border-[#e1eef4] bg-white shadow-[0_10px_28px_rgba(50,99,121,0.075)]"
              >
                <div className="relative bg-[#eef9fe] p-3 pb-0">
                  <img
                    src={person.photoUrl}
                    alt={person.name}
                    className="h-56 w-full rounded-[22px] object-cover object-center"
                  />
                  <span className="absolute bottom-3 left-6 max-w-[calc(100%-3rem)] truncate rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-extrabold text-[#2c90ba] shadow-sm">
                    {person.position ||
                      person.department ||
                      "参加担当者"}
                  </span>
                </div>

                <div className="min-w-0 p-5">
                  <h3 className="break-words text-lg font-extrabold">
                    {person.name}
                  </h3>
                  {person.companyVerifiedAt ? (
                    <div className="mt-2"><CompanyVerifiedBadge compact /></div>
                  ) : null}
                  <p className="mt-1 break-words text-xs font-semibold text-[#7d919b]">
                    {[person.department, person.position]
                      .filter(Boolean)
                      .join(" / ") || "所属情報なし"}
                  </p>

                  {person.responsibility ? (
                    <p className="mt-4 break-words rounded-2xl bg-[#fff8d8] px-3.5 py-3 text-sm font-bold leading-6 text-[#675a2e]">
                      {person.responsibility}
                    </p>
                  ) : null}

                  {person.profile ? (
                    <p className="mt-3 break-words text-sm leading-6 text-[#667d88]">
                      {person.profile}
                    </p>
                  ) : null}

                  {person.showPhone && person.phone ? (
                    <a
                      href={`tel:${person.phone}`}
                      className="mt-4 inline-flex max-w-full items-center gap-2 break-all text-sm font-extrabold text-[#299fce]"
                    >
                      <Icon name="phone" className="h-4 w-4 shrink-0" />
                      {person.phone}
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
