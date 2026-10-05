import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import AppShell from "@/components/app-shell";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ eventId: string; companyId: string }>;
}) {
  const { eventId, companyId } = await params;
  const participation = await prisma.eventCompany.findUnique({
    where: { eventId_companyId: { eventId, companyId } },
    include: {
      event: { select: { id: true, name: true, isActive: true } },
      company: {
        include: {
          industry: true,
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

  if (!participation?.event.isActive || participation.company.isHidden) notFound();
  const { company, event } = participation;

  return (
    <AppShell eventId={event.id}>
      <main className="mx-auto w-full max-w-5xl px-4 pb-32 pt-5 sm:px-6 sm:pt-8">
        <Link href={`/events/${event.id}/companies`} className="inline-flex items-center gap-1 text-sm font-bold text-[#6092a8]">
          <span aria-hidden="true">←</span> 参加企業一覧
        </Link>

        <section className="mt-4 overflow-hidden rounded-[30px] border border-[#e1eef4] bg-white shadow-[0_12px_32px_rgba(50,99,121,0.08)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#e5f7ff] to-[#f6fcff] px-6 py-7 sm:px-8">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#fff0a8]" />
            <div className="relative">
              <span className="inline-flex rounded-full bg-white/90 px-3 py-1.5 text-xs font-extrabold text-[#278fb9] shadow-sm">
                {company.industry.name}
              </span>
              <h1 className="mt-4 max-w-3xl text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                {company.name}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#59737f]">{company.businessDescription}</p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {company.phone ? (
                  <a href={`tel:${company.phone}`} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-[#3e6d82] shadow-sm">
                    <Icon name="phone" className="h-4 w-4 text-[#4db7e5]" />
                    電話する
                  </a>
                ) : null}
                {company.websiteUrl ? (
                  <a href={company.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-[#4db7e5] px-4 py-3 text-sm font-extrabold text-white shadow-sm">
                    <Icon name="globe" className="h-4 w-4" />
                    Webサイト
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_0.8fr]">
            <div>
              {company.profile ? (
                <section>
                  <p className="text-xs font-bold tracking-[0.14em] text-[#54afd4]">PROFILE</p>
                  <h2 className="mt-1 text-lg font-extrabold">企業プロフィール</h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#617985]">{company.profile}</p>
                </section>
              ) : (
                <section>
                  <p className="text-xs font-bold tracking-[0.14em] text-[#54afd4]">ABOUT</p>
                  <h2 className="mt-1 text-lg font-extrabold">事業内容</h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#617985]">{company.businessDescription}</p>
                </section>
              )}
            </div>

            <dl className="rounded-[24px] bg-[#f7fbfd] p-5 text-sm">
              <div><dt className="text-xs font-bold text-[#8497a1]">会社情報</dt></div>
              {company.phone ? (
                <div className="mt-4 border-t border-[#e7f0f4] pt-4">
                  <dt className="text-xs font-bold text-[#8497a1]">電話番号</dt>
                  <dd className="mt-1.5 font-bold">{company.phone}</dd>
                </div>
              ) : null}
              {company.address ? (
                <div className="mt-4 border-t border-[#e7f0f4] pt-4">
                  <dt className="text-xs font-bold text-[#8497a1]">住所</dt>
                  <dd className="mt-1.5 leading-6 font-bold">
                    {company.postalCode ? `〒${company.postalCode} ` : ""}{company.address}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[#4aaed9]">MEMBERS</p>
              <h2 className="mt-1 text-xl font-extrabold">今回の参加担当者</h2>
            </div>
            <span className="text-xs font-bold text-[#7b8f99]">{company.people.length}名</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {company.people.map((person) => (
              <article key={person.id} className="overflow-hidden rounded-[28px] border border-[#e1eef4] bg-white shadow-[0_10px_28px_rgba(50,99,121,0.075)]">
                <div className="relative bg-[#eef9fe] p-3 pb-0">
                  <img src={person.photoUrl} alt={person.name} className="h-56 w-full rounded-[22px] object-cover object-center" />
                  <span className="absolute bottom-3 left-6 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-extrabold text-[#2c90ba] shadow-sm">
                    {person.position || person.department || "参加担当者"}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-extrabold">{person.name}</h3>
                  <p className="mt-1 text-xs font-semibold text-[#7d919b]">
                    {[person.department, person.position].filter(Boolean).join(" / ") || "所属情報なし"}
                  </p>
                  {person.responsibility ? (
                    <p className="mt-4 rounded-2xl bg-[#fff8d8] px-3.5 py-3 text-sm font-bold leading-6 text-[#675a2e]">
                      {person.responsibility}
                    </p>
                  ) : null}
                  {person.profile ? <p className="mt-3 text-sm leading-6 text-[#667d88]">{person.profile}</p> : null}
                  {person.phone ? (
                    <a href={`tel:${person.phone}`} className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#299fce]">
                      <Icon name="phone" className="h-4 w-4" />
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
