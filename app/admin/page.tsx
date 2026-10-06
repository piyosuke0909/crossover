import Link from "next/link";
import prisma from "@/lib/prisma";
import { Icon } from "@/components/icons";
import AdminEventActions from "@/components/admin-event-actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [eventCount, companyCount, personCount, events] = await Promise.all([
    prisma.event.count({ where: { deletedAt: null } }),
    prisma.company.count({ where: { isHidden: false } }),
    prisma.person.count({ where: { isHidden: false } }),
    prisma.event.findMany({
      where: { deletedAt: null },
      orderBy: { eventDate: "desc" },
      take: 20,
      include: {
        _count: {
          select: { eventCompanies: true, eventPeople: true },
        },
      },
    }),
  ]);

  const stats = [
    { label: "イベント", value: eventCount, icon: "calendar" as const, className: "bg-[#e5f7ff] text-[#249ed1]" },
    { label: "登録企業", value: companyCount, icon: "building" as const, className: "bg-[#fff3b8] text-[#8a6f1a]" },
    { label: "担当者", value: personCount, icon: "users" as const, className: "bg-[#edf9f1] text-[#4b9a68]" },
  ];

  return (
    <div className="min-h-screen bg-[#f5fbfe] text-[#173042]">
      <header className="border-b border-[#e1eef4] bg-white">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#4db7e5] font-extrabold text-white">C</span>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold tracking-[0.16em] text-[#6faac2]">CROSSOVER</p>
              <p className="truncate text-sm font-extrabold">管理者ポータル</p>
            </div>
          </div>

          <form action="/api/admin/logout" method="post">
            <button className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-[#e2edf2] bg-[#f8fbfc] px-3 py-2 text-xs font-extrabold text-[#607783]">
              <Icon name="logout" className="h-4 w-4" />
              <span className="hidden sm:inline">ログアウト</span>
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-extrabold tracking-[0.16em] text-[#4aaed9]">DASHBOARD</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">運営状況</h1>
            <p className="mt-2 text-sm text-[#728792]">
              イベント・企業・担当者管理とCSV出力をここから行えます。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Link href="/" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#dfeef4] bg-white px-4 py-3 text-sm font-extrabold text-[#378cab] shadow-sm">
              <Icon name="eye" className="h-4 w-4" />
              公開サイト
            </Link>
            <Link href="/admin/events/new" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#4db7e5] px-4 py-3 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(55,166,214,0.22)]">
              <Icon name="plus" className="h-4 w-4" />
              イベント作成
            </Link>
          </div>
        </div>

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[26px] border border-[#e1eef4] bg-white p-5 shadow-[0_9px_26px_rgba(50,99,121,0.065)]">
              <div className="flex items-center justify-between">
                <span className={`grid h-11 w-11 place-items-center rounded-[18px] ${stat.className}`}>
                  <Icon name={stat.icon} className="h-5 w-5" />
                </span>
                <span className="text-3xl font-extrabold">{stat.value}</span>
              </div>
              <p className="mt-4 text-xs font-extrabold text-[#788c96]">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/admin/companies" className="group flex items-center gap-4 rounded-[24px] border border-[#e1eef4] bg-white p-5 shadow-[0_9px_26px_rgba(50,99,121,0.06)]">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-[#e6f7ff] text-[#249ed1]">
              <Icon name="building" className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-extrabold">企業管理</span>
              <span className="mt-1 block text-xs text-[#7c909b]">検索・編集・非表示・参加コード発行</span>
            </span>
            <Icon name="chevron" className="h-5 w-5 text-[#9aadb6]" />
          </Link>

          <Link href="/admin/people" className="group flex items-center gap-4 rounded-[24px] border border-[#e1eef4] bg-white p-5 shadow-[0_9px_26px_rgba(50,99,121,0.06)]">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-[#fff4bf] text-[#8a6f1a]">
              <Icon name="users" className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-extrabold">担当者管理</span>
              <span className="mt-1 block text-xs text-[#7c909b]">検索・詳細・編集・非表示</span>
            </span>
            <Icon name="chevron" className="h-5 w-5 text-[#9aadb6]" />
          </Link>
        </section>

        <section className="mt-8 rounded-[28px] border border-[#e1eef4] bg-white p-5 shadow-[0_10px_28px_rgba(50,99,121,0.065)] sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold tracking-[0.14em] text-[#4aaed9]">EVENTS</p>
              <h2 className="mt-1 text-lg font-extrabold">イベント一覧</h2>
            </div>
            <span className="shrink-0 rounded-full bg-[#fff4bf] px-3 py-1.5 text-[11px] font-extrabold text-[#7f681d]">{events.length}件</span>
          </div>

          <div className="mt-5 grid gap-4">
            {events.map((event) => (
              <article key={event.id} className="overflow-hidden rounded-[24px] border border-[#e7f0f4] bg-[#fbfdfe]">
                <div className="p-4 sm:p-5">
                  <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="break-words font-extrabold">{event.name}</p>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${event.isActive ? "bg-[#e8f8ee] text-[#47865d]" : "bg-[#f2f4f5] text-[#7c8a91]"}`}>
                          {event.isActive ? "公開中" : "非公開"}
                        </span>
                      </div>
                      <p className="mt-2 break-words text-xs font-medium leading-5 text-[#80939d]">
                        {new Intl.DateTimeFormat("ja-JP", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Tokyo" }).format(event.eventDate)}
                        {event.venue ? ` ・ ${event.venue}` : ""}
                      </p>
                      <p className="mt-1 text-xs font-bold text-[#607783]">{event._count.eventCompanies}社 / {event._count.eventPeople}名</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:justify-end">
                      <Link href={`/admin/events/${event.id}/edit`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#dce8ed] bg-white px-3.5 py-2 text-xs font-extrabold text-[#57717e]">
                        <Icon name="pencil" className="h-4 w-4" />
                        編集
                      </Link>
                      <Link href={`/admin/events/${event.id}/qr`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#cfe8f3] bg-[#edf9ff] px-3.5 py-2 text-xs font-extrabold text-[#258fbd]">
                        <Icon name="qr" className="h-4 w-4" />
                        会場QR
                      </Link>
                      <Link href={`/admin/events/${event.id}/transfer`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#d7e6df] bg-[#f3fbf6] px-3.5 py-2 text-xs font-extrabold text-[#4b805d]">
                        <Icon name="swap" className="h-4 w-4" />
                        参加者移行
                      </Link>
                      {event.isActive ? (
                        <Link href={`/events/${event.id}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#eee1a8] bg-[#fff8d8] px-3.5 py-2 text-xs font-extrabold text-[#76641f]">
                          <Icon name="eye" className="h-4 w-4" />
                          公開画面
                        </Link>
                      ) : null}
                      <AdminEventActions eventId={event.id} isActive={event.isActive} />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#e8f1f5] bg-white px-4 py-3 sm:px-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[11px] font-extrabold tracking-[0.08em] text-[#7b919d]">CSV出力</p>
                    <div className="grid grid-cols-2 gap-2 sm:flex">
                      <a href={`/api/admin/events/${event.id}/export/companies`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#d7e9f1] bg-[#f7fcfe] px-3.5 py-2 text-xs font-extrabold text-[#397f9d]">
                        <Icon name="download" className="h-4 w-4" />
                        企業CSV
                      </a>
                      <a href={`/api/admin/events/${event.id}/export/participants`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#eadfae] bg-[#fffaf0] px-3.5 py-2 text-xs font-extrabold text-[#7d681f]">
                        <Icon name="download" className="h-4 w-4" />
                        参加者CSV
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {events.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-[#d7e8ef] py-8 text-center text-sm font-bold text-[#7e919b]">
                イベントがまだありません。
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
