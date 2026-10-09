import Link from "next/link";
import prisma from "@/lib/prisma";
import { Icon } from "@/components/icons";
import { getPrimaryEvent } from "@/lib/single-event";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const event = await getPrimaryEvent();
  const [companyCount, personCount] = await Promise.all([
    prisma.company.count({ where: { isHidden: false } }),
    prisma.person.count({ where: { isHidden: false } }),
  ]);
  return (
    <div className="min-h-screen bg-[#f5fbfe] text-[#173042]">
      <header className="border-b border-[#e1eef4] bg-white">
        <div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <h1 className="min-w-0 break-words text-lg font-extrabold">Crossover 管理画面</h1>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-xl border border-[#dcebf2] bg-white px-3 py-2 text-sm font-bold">ログアウト</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h2 className="text-2xl font-extrabold">運営ダッシュボード</h2>
        <p className="mt-2 break-words text-sm text-[#728792]">
          ひとつの交流ページを継続利用します。イベント作成や参加者移行は不要です。
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            { label: "登録企業", value: companyCount },
            { label: "担当者", value: personCount },
          ].map((item) => (
            <section key={item.label} className="min-w-0 rounded-2xl border border-[#e1eef4] bg-white p-5">
              <p className="text-sm font-bold text-[#607783]">{item.label}</p>
              <p className="mt-2 text-3xl font-extrabold">{item.value}</p>
            </section>
          ))}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link href="/admin/companies" className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#dcebf2] bg-white p-5 font-extrabold">
            <Icon name="building" className="h-6 w-6 shrink-0 text-[#249ed1]" /> 企業管理
          </Link>
          <Link href="/admin/people" className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#dcebf2] bg-white p-5 font-extrabold">
            <Icon name="users" className="h-6 w-6 shrink-0 text-[#249ed1]" /> 担当者管理
          </Link>
        </div>
        {event ? (
          <section className="mt-6 min-w-0 rounded-[26px] border border-[#e1eef4] bg-white p-5 sm:p-7">
            <p className="text-xs font-bold tracking-widest text-[#4aaed9]">PERMANENT SPACE</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <h2 className="min-w-0 break-words text-xl font-extrabold">{event.name}</h2>
              <span className="rounded-full bg-[#e8f8ee] px-3 py-1 text-xs font-bold text-[#47865d]">
                {event.isActive ? "公開中" : "非公開"}
              </span>
            </div>
            <p className="mt-2 text-xs font-semibold text-[#607783]">
              登録数：{event._count.eventCompanies}社 / {event._count.eventPeople}名
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Link href={`/admin/events/${event.id}/edit`} className="rounded-xl border border-[#dcebf2] px-3 py-3 text-center text-xs font-extrabold">ページ設定</Link>
              <Link href={`/admin/events/${event.id}/qr`} className="rounded-xl border border-[#dcebf2] px-3 py-3 text-center text-xs font-extrabold">会場QR</Link>
              {event.isActive ? <Link href="/" className="rounded-xl bg-[#4db7e5] px-3 py-3 text-center text-xs font-extrabold text-white">公開ページ</Link> : (
                <span className="rounded-xl bg-[#f3f5f6] px-3 py-3 text-center text-xs text-[#718792]">現在非公開</span>
              )}
              <a href={`/api/admin/events/${event.id}/export/companies`} className="rounded-xl border border-[#dcebf2] px-3 py-3 text-center text-xs font-extrabold">企業CSV</a>
              <a href={`/api/admin/events/${event.id}/export/participants`} className="rounded-xl border border-[#dcebf2] px-3 py-3 text-center text-xs font-extrabold">担当者CSV</a>
            </div>
          </section>
        ) : (
          <p className="mt-6 rounded-2xl border border-[#eadfae] bg-[#fffaf0] p-5 text-sm">
            交流ページのデータがありません。初期設定として npm run db:seed を実行してください。
          </p>
        )}
      </main>
    </div>
  );
}
