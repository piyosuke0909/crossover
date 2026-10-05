import Link from "next/link";
import prisma from "@/lib/prisma";
import AppShell from "@/components/app-shell";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function Home() {
  const events = await prisma.event.findMany({
    where: { isActive: true },
    orderBy: { eventDate: "desc" },
    take: 10,
    include: { _count: { select: { eventCompanies: true, eventPeople: true } } },
  });

  return (
    <AppShell showBottomNav={false}>
      <main className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        <section className="relative overflow-hidden rounded-[32px] bg-[#4db7e5] px-6 py-7 text-white shadow-[0_18px_45px_rgba(55,151,194,0.24)] sm:px-9 sm:py-9">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#fff0a8] opacity-95" />
          <div className="absolute -bottom-16 right-20 h-36 w-36 rounded-full border-[22px] border-white/15" />
          <div className="relative max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/18 px-3 py-1.5 text-xs font-bold backdrop-blur">
              <Icon name="sparkles" className="h-4 w-4" />
              交流のきっかけを、もっと簡単に
            </div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              会いたい企業と人を、<br className="sm:hidden" />すぐ見つける。
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/90 sm:text-base">
              参加企業の事業内容や担当者プロフィールを見て、話したい相手を探せます。
            </p>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[#4aaed9]">EVENTS</p>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight">開催中の交流会</h2>
            </div>
            <span className="text-xs font-semibold text-[#7a8e99]">{events.length}件</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {events.map((event, index) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group rounded-[26px] border border-[#e2eef4] bg-white p-5 shadow-[0_10px_28px_rgba(50,99,121,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(50,99,121,0.13)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${index % 2 === 0 ? "bg-[#e5f7ff] text-[#279fd1]" : "bg-[#fff4bf] text-[#9c7a13]"}`}>
                    <Icon name="calendar" className="h-6 w-6" />
                  </span>
                  <Icon name="chevron" className="mt-2 h-5 w-5 text-[#9ab0bb] transition group-hover:translate-x-1" />
                </div>
                <h3 className="mt-5 text-lg font-extrabold leading-snug">{event.name}</h3>
                <div className="mt-3 space-y-2 text-sm text-[#6f8490]">
                  <p className="flex items-center gap-2">
                    <Icon name="calendar" className="h-4 w-4 text-[#4db7e5]" />
                    {new Intl.DateTimeFormat("ja-JP", { dateStyle: "long" }).format(event.eventDate)}
                  </p>
                  {event.venue ? (
                    <p className="flex items-center gap-2">
                      <Icon name="pin" className="h-4 w-4 text-[#4db7e5]" />
                      {event.venue}
                    </p>
                  ) : null}
                </div>
                <div className="mt-5 flex gap-2 border-t border-[#edf3f6] pt-4 text-xs font-bold text-[#58707d]">
                  <span>{event._count.eventCompanies}社</span>
                  <span className="text-[#c6d4da]">•</span>
                  <span>{event._count.eventPeople}名</span>
                </div>
              </Link>
            ))}
            {events.length === 0 ? (
              <div className="rounded-[26px] border border-dashed border-[#cfe3ec] bg-white p-8 text-center text-sm text-[#718792] sm:col-span-2">
                現在公開中の交流会はありません。
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
