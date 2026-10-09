import Link from "next/link";
import prisma from "@/lib/prisma";
import { Icon } from "@/components/icons";
import AdminEventActions from "@/components/admin-event-actions";
import { getPrimaryEvent } from "@/lib/single-event";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [event, companyCount, personCount] = await Promise.all([
    getPrimaryEvent(),
    prisma.company.count({ where: { isHidden: false } }),
    prisma.person.count({ where: { isHidden: false } }),
  ]);
  const events = event ? [event] : [];

  const stats = [
    { label: "交流スペース", value: events.length, icon: "calendar" as const, color: "bg-[#e6f7ff] text-[#249ed1]" },
    { label: "登録企業", value: companyCount, icon: "building" as const, color: "bg-[#fff2ba] text-[#a18319]" },
    { label: "登録担当者", value: personCount, icon: "users" as const, color: "bg-[#e9f8f0] text-[#4b956b]" },
  ];

  const shortcuts = [
    { href: "/admin/companies", title: "企業管理", description: "企業情報の検索・編集・公開管理", icon: "building" as const, color: "bg-[#e6f7ff] text-[#249ed1]" },
    { href: "/admin/people", title: "担当者管理", description: "登録担当者の検索・編集・非表示", icon: "users" as const, color: "bg-[#fff3b8] text-[#947619]" },
    ...(event ? [
      { href: `/admin/events/${event.id}/qr`, title: "会場QR", description: "繰り返し使えるQRコード", icon: "qr" as const, color: "bg-[#e9f8f0] text-[#4b956b]" },
      { href: `/admin/events/${event.id}/edit`, title: "ページ設定", description: "紹介文・会場・公開設定", icon: "pencil" as const, color: "bg-[#f1ecff] text-[#8771b6]" },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-[#f5fbfe] text-[#173042]">
      <header className="border-b border-[#e4f0f5] bg-white">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#4db7e5] text-lg font-extrabold text-white shadow-sm">C</span>
            <span className="min-w-0">
              <span className="block text-[10px] font-extrabold tracking-[0.14em] text-[#56a8ca]">CROSSOVER</span>
              <span className="block truncate text-sm font-extrabold">管理者ポータル</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#dcebf2] bg-white px-3 text-xs font-extrabold text-[#367e9e]">
              <Icon name="eye" className="h-4 w-4" />
              <span className="hidden sm:inline">公開サイト</span>
              <span className="sm:hidden">サイト</span>
            </Link>
            <form action="/api/admin/logout" method="post">
              <button className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#f3f8fb] px-3 text-xs font-extrabold text-[#607783]">
                <Icon name="logout" className="h-4 w-4" />
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <section className="relative overflow-hidden rounded-[32px] bg-[#4db7e5] px-6 py-8 text-white shadow-[0_18px_45px_rgba(55,151,194,0.22)] sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-10 -top-12 h-48 w-48 rounded-full bg-[#fff0a8] opacity-95" />
          <div className="pointer-events-none absolute -bottom-16 right-20 h-40 w-40 rounded-full border-[24px] border-white/15" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-extrabold backdrop-blur">
              <Icon name="sparkles" className="h-4 w-4" />
              ADMIN DASHBOARD
            </span>
            <p className="mt-5 text-xs font-extrabold tracking-[0.15em] text-white/80">DASHBOARD</p>
            <h1 className="mt-1 break-words text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              今日も、つながりを育てよう。
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/95 sm:text-base">
              企業・担当者を管理し、ひとつの交流スペースを継続して運用できます。
            </p>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-0 rounded-[25px] border border-[#e1eef4] bg-white p-5 shadow-[0_9px_26px_rgba(50,99,121,0.06)]">
              <div className="flex items-start justify-between gap-2">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${stat.color}`}>
                  <Icon name={stat.icon} className="h-5 w-5" />
                </span>
                <span className="min-w-0 text-right text-3xl font-extrabold tabular-nums">{stat.value}</span>
              </div>
              <p className="mt-4 break-words text-xs font-extrabold text-[#788c96]">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="mt-9">
          <div>
            <p className="text-xs font-extrabold tracking-[0.16em] text-[#4aaed9]">QUICK ACTIONS</p>
            <h2 className="mt-1 text-xl font-extrabold">管理メニュー</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {shortcuts.map((item) => (
              <Link key={item.href} href={item.href} className="group flex min-w-0 items-center gap-4 rounded-[24px] border border-[#e1eef4] bg-white p-5 shadow-[0_9px_26px_rgba(50,99,121,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(50,99,121,0.11)]">
                <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-[19px] ${item.color}`}>
                  <Icon name={item.icon} className="h-7 w-7" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block break-words font-extrabold">{item.title}</span>
                  <span className="mt-1 block break-words text-xs leading-5 text-[#7b8f99]">{item.description}</span>
                </span>
                <Icon name="chevron" className="h-5 w-5 shrink-0 text-[#a5b6be] transition group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-9">
          <p className="text-xs font-extrabold tracking-[0.16em] text-[#4aaed9]">COMMUNITY</p>
          <h2 className="mt-1 text-xl font-extrabold">常設の交流ページ</h2>
          <div className="mt-4 grid gap-4">
            {events.map((event) => (
              <article key={event.id} className="min-w-0 overflow-hidden rounded-[28px] border border-[#e1eef4] bg-white shadow-[0_10px_28px_rgba(50,99,121,0.065)]">
                <div className="bg-gradient-to-br from-[#e6f7ff] via-white to-[#fffaf0] p-5 sm:p-7">
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold tracking-[0.12em] text-[#58abd0]">PERMANENT SPACE</span>
                      <h3 className="mt-1 break-words text-xl font-extrabold">{event.name}</h3>
                    </div>
                    <span className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${event.isActive ? "bg-[#e8f8ee] text-[#47865d]" : "bg-[#f2f4f5] text-[#7c8a91]"}`}>
                      {event.isActive ? "公開中" : "非公開"}
                    </span>
                  </div>
                  <p className="mt-3 break-words text-xs font-semibold text-[#728792]">{event.venue ? `会場：${event.venue}` : "いつでも使える交流スペース"}</p>
                  <p className="mt-2 text-sm font-extrabold text-[#607783]">
                    {event._count.eventCompanies}社 ・ {event._count.eventPeople}名
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link href={`/admin/events/${event.id}/edit`} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#d7e8ef] bg-white px-4 py-2 text-xs font-extrabold text-[#48758a]">
                      <Icon name="pencil" className="h-4 w-4" /> 編集
                    </Link>
                    <Link href={`/admin/events/${event.id}/qr`} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#4db7e5] px-4 py-2 text-xs font-extrabold text-white">
                      <Icon name="qr" className="h-4 w-4" /> 会場QR
                    </Link>
                    {event.isActive ? (
                      <Link href="/" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#eee1a8] bg-[#fff8d8] px-4 py-2 text-xs font-extrabold text-[#76641f]">
                        <Icon name="eye" className="h-4 w-4" /> 公開画面
                      </Link>
                    ) : null}
                    <AdminEventActions eventId={event.id} isActive={event.isActive} />
                  </div>
                </div>
                <div className="border-t border-[#e8f1f5] px-5 py-5 sm:px-7">
                  <p className="text-[11px] font-extrabold tracking-[0.08em] text-[#7b919d]">データ出力</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:flex">
                    <a href={`/api/admin/events/${event.id}/export/companies`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#d7e9f1] bg-[#f7fcfe] px-4 py-2 text-xs font-extrabold text-[#397f9d]">
                      <Icon name="download" className="h-4 w-4" /> 企業CSV
                    </a>
                    <a href={`/api/admin/events/${event.id}/export/participants`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#eadfae] bg-[#fffaf0] px-4 py-2 text-xs font-extrabold text-[#7d681f]">
                      <Icon name="download" className="h-4 w-4" /> 参加者CSV
                    </a>
                  </div>
                </div>
              </article>
            ))}
            {!event ? (
              <p className="rounded-[26px] border border-[#e1eef4] bg-white p-6 text-sm font-semibold text-[#748995]">
                交流ページが未設定です。初期データを投入してください。
              </p>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
