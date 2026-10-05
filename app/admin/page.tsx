import Link from "next/link";
import prisma from "@/lib/prisma";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [eventCount, companyCount, personCount, events] = await Promise.all([
    prisma.event.count(),
    prisma.company.count({ where: { isHidden: false } }),
    prisma.person.count({ where: { isHidden: false } }),
    prisma.event.findMany({
      orderBy: { eventDate: "desc" },
      take: 8,
      include: {
        _count: {
          select: { eventCompanies: true, eventPeople: true },
        },
      },
    }),
  ]);

  const stats = [
    {
      label: "イベント",
      value: eventCount,
      icon: "calendar" as const,
      className: "bg-[#e5f7ff] text-[#249ed1]",
    },
    {
      label: "登録企業",
      value: companyCount,
      icon: "building" as const,
      className: "bg-[#fff3b8] text-[#8a6f1a]",
    },
    {
      label: "担当者",
      value: personCount,
      icon: "users" as const,
      className: "bg-[#edf9f1] text-[#4b9a68]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5fbfe] text-[#173042]">
      <header className="border-b border-[#e1eef4] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#4db7e5] font-extrabold text-white">
              C
            </span>
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.16em] text-[#6faac2]">
                CROSSOVER
              </p>
              <p className="text-sm font-extrabold">管理者ポータル</p>
            </div>
          </div>

          <form action="/api/admin/logout" method="post">
            <button className="inline-flex items-center gap-2 rounded-2xl bg-[#f3f8fa] px-3 py-2 text-xs font-extrabold text-[#607783] hover:bg-[#eaf4f8]">
              <Icon name="logout" className="h-4 w-4" />
              ログアウト
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-extrabold tracking-[0.16em] text-[#4aaed9]">
              DASHBOARD
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
              運営状況
            </h1>
            <p className="mt-2 text-sm text-[#728792]">
              イベントと参加プロフィールの状況を確認できます。
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-[#378cab] shadow-sm ring-1 ring-[#dfeef4]"
          >
            公開サイトを見る
          </Link>
        </div>

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[26px] border border-[#e1eef4] bg-white p-5 shadow-[0_9px_26px_rgba(50,99,121,0.065)]"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`grid h-11 w-11 place-items-center rounded-[18px] ${stat.className}`}
                >
                  <Icon name={stat.icon} className="h-5 w-5" />
                </span>
                <span className="text-3xl font-extrabold">
                  {stat.value}
                </span>
              </div>
              <p className="mt-4 text-xs font-extrabold text-[#788c96]">
                {stat.label}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-[28px] border border-[#e1eef4] bg-white p-5 shadow-[0_10px_28px_rgba(50,99,121,0.065)] sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold tracking-[0.14em] text-[#4aaed9]">
                EVENTS
              </p>
              <h2 className="mt-1 text-lg font-extrabold">
                イベント一覧
              </h2>
            </div>

            <span className="rounded-full bg-[#fff4bf] px-3 py-1.5 text-[11px] font-extrabold text-[#7f681d]">
              最新8件
            </span>
          </div>

          <div className="mt-5 divide-y divide-[#edf3f6]">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-extrabold">
                      {event.name}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                        event.isActive
                          ? "bg-[#e8f8ee] text-[#47865d]"
                          : "bg-[#f2f4f5] text-[#7c8a91]"
                      }`}
                    >
                      {event.isActive ? "公開中" : "非公開"}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs font-medium text-[#80939d]">
                    {new Intl.DateTimeFormat("ja-JP", {
                      dateStyle: "long",
                    }).format(event.eventDate)}
                    {event.venue ? ` ・ ${event.venue}` : ""}
                  </p>

                  <p className="mt-1 text-xs font-bold text-[#607783]">
                    {event._count.eventCompanies}社 /{" "}
                    {event._count.eventPeople}名
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/events/${event.id}/qr`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#e6f7ff] px-3 py-2 text-xs font-extrabold text-[#258fbd]"
                  >
                    <Icon name="qr" className="h-3.5 w-3.5" />
                    会場QR
                  </Link>
                  <Link
                    href={`/events/${event.id}`}
                    className="rounded-xl bg-[#f3f8fa] px-3 py-2 text-xs font-extrabold text-[#607783]"
                  >
                    公開画面
                  </Link>
                  <Link
                    href={`/events/${event.id}/companies`}
                    className="rounded-xl bg-[#fff5c9] px-3 py-2 text-xs font-extrabold text-[#76641f]"
                  >
                    参加企業
                  </Link>
                </div>
              </div>
            ))}

            {events.length === 0 ? (
              <p className="py-7 text-center text-sm text-[#7e919b]">
                イベントがまだありません。
              </p>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
